// Live upstream fetch for vendored bash scripts.
//
// Vendored scripts in scripts/*.sh are snapshots of
//   https://github.com/vibe-code-tours/vibecode-setup
// and drift within days. This module fetches the latest source at runtime,
// caches under ~/.vct/cache, and falls back to the embedded snapshot when
// offline or rate-limited.
//
// Cache layout:
//   ~/.vct/cache/<scriptName>            ← script body (mode 0644)
//   ~/.vct/cache/<scriptName>.meta.json  ← { etag, fetched_at, sha256 }
//
// Strategy:
//   1. --offline → embedded fallback path (no network).
//   2. cache exists, fresh (< 24h) → return cached path.
//   3. else HEAD/GET upstream with If-None-Match → 304 = touch + return cache;
//                                                  200 = sha-256 differs ⇒ rewrite cache.
//   4. any network error / non-2xx-non-304 → embedded fallback path.
//
// Zero deps. Uses node:https + node:fs/promises. 5s per-fetch timeout.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import https from 'node:https';
import crypto from 'node:crypto';
import { getVctDir, ensureVctDir } from './config.js';
import { materializeScripts, getScriptPath, hasScript, SCRIPT_FILES } from './scripts.js';

const UPSTREAM_BASE =
  'https://raw.githubusercontent.com/vibe-code-tours/vibecode-setup/main/';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const FETCH_TIMEOUT_MS = 5_000;
const USER_AGENT = 'vibe-code-tours-cli/scripts-fetcher';

export function getCacheDir(home = os.homedir()) {
  return path.join(getVctDir(home), 'cache');
}

export function getCachedPath(scriptName, home = os.homedir()) {
  return path.join(getCacheDir(home), scriptName);
}

export function getMetaPath(scriptName, home = os.homedir()) {
  return path.join(getCacheDir(home), `${scriptName}.meta.json`);
}

export async function ensureCacheDir(home = os.homedir()) {
  await ensureVctDir(home);
  const dir = getCacheDir(home);
  await fs.mkdir(dir, { recursive: true, mode: 0o755 });
  return dir;
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

async function readMeta(scriptName, home) {
  try {
    const raw = await fs.readFile(getMetaPath(scriptName, home), 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err && err.code === 'ENOENT') return null;
    return null; // corrupt meta → treat as cold cache
  }
}

async function writeMeta(scriptName, meta, home) {
  const file = getMetaPath(scriptName, home);
  const tmp = `${file}.tmp-${process.pid}`;
  await fs.writeFile(tmp, JSON.stringify(meta, null, 2) + '\n', { mode: 0o644 });
  await fs.rename(tmp, file);
}

async function writeCacheBody(scriptName, body, home) {
  const file = getCachedPath(scriptName, home);
  const tmp = `${file}.tmp-${process.pid}`;
  await fs.writeFile(tmp, body, { mode: 0o644 });
  await fs.rename(tmp, file);
}

async function clearCache(scriptName, home) {
  await Promise.all(
    [getCachedPath(scriptName, home), getMetaPath(scriptName, home)].map(async (p) => {
      try {
        await fs.unlink(p);
      } catch (err) {
        if (err && err.code !== 'ENOENT') throw err;
      }
    }),
  );
}

// Wraps https.get in a 5s-bounded promise; resolves { status, headers, body }
// on any HTTP completion, rejects on transport error / timeout.
export function httpsGet(url, { etag = null, timeoutMs = FETCH_TIMEOUT_MS } = {}) {
  return new Promise((resolve, reject) => {
    const headers = { 'User-Agent': USER_AGENT, Accept: 'text/plain, */*' };
    if (etag) headers['If-None-Match'] = etag;

    const req = https.get(url, { headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        resolve({
          status: res.statusCode || 0,
          headers: res.headers || {},
          body: Buffer.concat(chunks),
        });
      });
      res.on('error', reject);
    });

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`fetch timeout after ${timeoutMs}ms`));
    });
  });
}

// Test seam — override the underlying fetcher for unit tests.
let _fetchImpl = httpsGet;
export function __setFetchImpl(fn) {
  _fetchImpl = fn || httpsGet;
}

async function embeddedFallback(scriptName, home) {
  // The materialize step writes embedded scripts into ~/.vct/scripts/<name>
  // with mode 0755. Ensure that exists, then return that path.
  await materializeScripts(home);
  return getScriptPath(scriptName, home);
}

/**
 * Fetch a script from upstream, falling back to embedded.
 *
 * @param {string} scriptName e.g. 'doctor.sh'
 * @param {object} opts
 * @param {boolean} [opts.offline]  Force embedded fallback (no network).
 * @param {boolean} [opts.refresh]  Clear cache then refetch.
 * @param {string}  [opts.home]     Override $HOME (tests).
 * @param {number}  [opts.now]      Override Date.now() (tests).
 * @param {number}  [opts.ttlMs]    Override CACHE_TTL_MS (tests).
 * @returns {Promise<{ path: string, source: 'cache'|'network'|'embedded', sha256?: string }>}
 */
export async function fetchUpstream(scriptName, opts = {}) {
  const home = opts.home || os.homedir();
  const now = typeof opts.now === 'number' ? opts.now : Date.now();
  const ttlMs = typeof opts.ttlMs === 'number' ? opts.ttlMs : CACHE_TTL_MS;
  const offline = !!opts.offline;
  const refresh = !!opts.refresh;

  if (!hasScript(scriptName)) {
    throw new Error(`Unknown script: ${scriptName}`);
  }

  if (offline) {
    const p = await embeddedFallback(scriptName, home);
    return { path: p, source: 'embedded' };
  }

  await ensureCacheDir(home);

  if (refresh) {
    await clearCache(scriptName, home);
  }

  const cachedPath = getCachedPath(scriptName, home);
  const metaPath = getMetaPath(scriptName, home);
  const meta = await readMeta(scriptName, home);

  // Fresh cache → return immediately, no network.
  if (!refresh && meta && meta.fetched_at) {
    const fetchedAt = Date.parse(meta.fetched_at);
    if (Number.isFinite(fetchedAt) && now - fetchedAt < ttlMs) {
      try {
        await fs.access(cachedPath);
        return { path: cachedPath, source: 'cache', sha256: meta.sha256 };
      } catch {
        // body missing → fall through to network
      }
    }
  }

  // Stale or cold → try upstream.
  const url = UPSTREAM_BASE + scriptName;
  let res;
  try {
    res = await _fetchImpl(url, { etag: meta?.etag || null });
  } catch (err) {
    // Network failure → embedded fallback.
    // If we have a stale cache body, prefer it over embedded.
    try {
      await fs.access(cachedPath);
      // Refresh fetched_at minimally so we don't pin-spin retries.
      const stale = meta || {};
      await writeMeta(
        scriptName,
        {
          etag: stale.etag || null,
          fetched_at: new Date(now).toISOString(),
          sha256: stale.sha256 || null,
          stale: true,
          last_error: String(err.message || err),
        },
        home,
      );
      return { path: cachedPath, source: 'cache', sha256: stale.sha256 };
    } catch {
      const p = await embeddedFallback(scriptName, home);
      return { path: p, source: 'embedded' };
    }
  }

  if (res.status === 304) {
    // Body unchanged. Touch fetched_at.
    const next = {
      etag: meta?.etag || res.headers.etag || null,
      fetched_at: new Date(now).toISOString(),
      sha256: meta?.sha256 || null,
    };
    await writeMeta(scriptName, next, home);
    try {
      await fs.access(cachedPath);
      return { path: cachedPath, source: 'cache', sha256: next.sha256 };
    } catch {
      // Server said 304 but we have no body → treat as fallback.
      const p = await embeddedFallback(scriptName, home);
      return { path: p, source: 'embedded' };
    }
  }

  if (res.status >= 200 && res.status < 300) {
    const body = res.body;
    const hash = sha256(body);
    // Only rewrite if hash differs (or cold cache).
    let rewrote = true;
    if (meta && meta.sha256 === hash) {
      // Body identical, but ETag may have changed.
      rewrote = false;
    }
    if (rewrote) {
      await writeCacheBody(scriptName, body, home);
    }
    await writeMeta(
      scriptName,
      {
        etag: res.headers.etag || null,
        fetched_at: new Date(now).toISOString(),
        sha256: hash,
      },
      home,
    );
    return { path: cachedPath, source: 'network', sha256: hash };
  }

  // Non-success → fallback.
  try {
    await fs.access(cachedPath);
    return { path: cachedPath, source: 'cache', sha256: meta?.sha256 };
  } catch {
    const p = await embeddedFallback(scriptName, home);
    return { path: p, source: 'embedded' };
  }
}

/**
 * Force-refresh every embedded script. Returns per-script result list,
 * suitable for the `vct sync` command.
 */
export async function refreshAll(opts = {}) {
  const home = opts.home || os.homedir();
  const results = [];
  for (const name of SCRIPT_FILES) {
    const before = (await readMeta(name, home))?.sha256 || null;
    let result;
    try {
      result = await fetchUpstream(name, { ...opts, refresh: true, home });
    } catch (err) {
      results.push({ name, ok: false, error: err.message });
      continue;
    }
    const after = result.sha256 || null;
    results.push({
      name,
      ok: true,
      source: result.source,
      before,
      after,
      // For offline runs, embedded is the desired source ⇒ unchanged.
      changed: result.source !== 'embedded' && before !== after,
    });
  }
  return results;
}

export const __test__ = {
  UPSTREAM_BASE,
  CACHE_TTL_MS,
  FETCH_TIMEOUT_MS,
  sha256,
  readMeta,
  writeMeta,
  writeCacheBody,
  clearCache,
};
