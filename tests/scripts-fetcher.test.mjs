import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import {
  fetchUpstream,
  refreshAll,
  getCachedPath,
  getMetaPath,
  ensureCacheDir,
  __setFetchImpl,
  __test__,
} from '../lib/scripts-fetcher.js';
import { SCRIPT_FILES, EMBEDDED } from '../lib/scripts.js';

async function makeHome() {
  return await fs.mkdtemp(path.join(os.tmpdir(), 'vct-fetch-'));
}

function stubFetcher({ status = 200, body = 'echo upstream', etag = 'W/"abc"', headers = {} } = {}, opts = {}) {
  const calls = [];
  const impl = async (url, { etag: ifNoneMatch } = {}) => {
    calls.push({ url, ifNoneMatch });
    if (opts.throw) throw new Error(opts.throw);
    const responseStatus =
      typeof opts.statusFn === 'function' ? opts.statusFn({ url, ifNoneMatch }) : status;
    return {
      status: responseStatus,
      headers: { etag, ...headers },
      body: Buffer.from(typeof opts.bodyFn === 'function' ? opts.bodyFn({ url }) : body, 'utf8'),
    };
  };
  __setFetchImpl(impl);
  return calls;
}

function restoreFetcher() {
  __setFetchImpl(null);
}

test.afterEach(() => restoreFetcher());

test('cold cache → fetches from upstream, writes body + meta', async () => {
  const home = await makeHome();
  const body = 'echo cold-cache-body';
  const calls = stubFetcher({ status: 200, body, etag: 'W/"v1"' });

  const r = await fetchUpstream('doctor.sh', { home });

  assert.equal(r.source, 'network');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].ifNoneMatch, null);

  const written = await fs.readFile(getCachedPath('doctor.sh', home), 'utf8');
  assert.equal(written, body);

  const meta = JSON.parse(await fs.readFile(getMetaPath('doctor.sh', home), 'utf8'));
  assert.equal(meta.etag, 'W/"v1"');
  assert.equal(meta.sha256, __test__.sha256(Buffer.from(body, 'utf8')));
});

test('fresh cache (< 24h) → returns cache, no network call', async () => {
  const home = await makeHome();
  const body = 'echo first';
  // Seed cache via initial fetch.
  stubFetcher({ status: 200, body, etag: 'W/"v1"' });
  await fetchUpstream('doctor.sh', { home });

  // Now stub something that would 200 with a different body; assert it's NOT called.
  const calls = stubFetcher({ status: 200, body: 'echo NEW', etag: 'W/"v2"' });
  const r = await fetchUpstream('doctor.sh', { home });

  assert.equal(r.source, 'cache');
  assert.equal(calls.length, 0);
  const onDisk = await fs.readFile(getCachedPath('doctor.sh', home), 'utf8');
  assert.equal(onDisk, body, 'cache body must not have been rewritten');
});

test('stale cache (> 24h) → revalidates; 304 keeps body and bumps fetched_at', async () => {
  const home = await makeHome();
  const body = 'echo first';
  stubFetcher({ status: 200, body, etag: 'W/"v1"' });
  const t0 = Date.parse('2026-01-01T00:00:00Z');
  await fetchUpstream('doctor.sh', { home, now: t0 });

  // Advance 25h; server returns 304.
  const t1 = t0 + 25 * 60 * 60 * 1000;
  const calls = stubFetcher({ status: 304, body: '', etag: 'W/"v1"' });
  const r = await fetchUpstream('doctor.sh', { home, now: t1 });

  assert.equal(r.source, 'cache');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].ifNoneMatch, 'W/"v1"');

  const meta = JSON.parse(await fs.readFile(getMetaPath('doctor.sh', home), 'utf8'));
  assert.equal(Date.parse(meta.fetched_at), t1, 'fetched_at must be bumped after 304');
  assert.equal(meta.sha256, __test__.sha256(Buffer.from(body, 'utf8')));
});

test('stale cache → 200 with different body rewrites cache', async () => {
  const home = await makeHome();
  stubFetcher({ status: 200, body: 'echo old', etag: 'W/"v1"' });
  const t0 = Date.parse('2026-01-01T00:00:00Z');
  await fetchUpstream('doctor.sh', { home, now: t0 });

  const t1 = t0 + 25 * 60 * 60 * 1000;
  stubFetcher({ status: 200, body: 'echo new', etag: 'W/"v2"' });
  const r = await fetchUpstream('doctor.sh', { home, now: t1 });

  assert.equal(r.source, 'network');
  const onDisk = await fs.readFile(getCachedPath('doctor.sh', home), 'utf8');
  assert.equal(onDisk, 'echo new');
  const meta = JSON.parse(await fs.readFile(getMetaPath('doctor.sh', home), 'utf8'));
  assert.equal(meta.etag, 'W/"v2"');
});

test('network failure on cold cache → embedded fallback path', async () => {
  const home = await makeHome();
  stubFetcher({}, { throw: 'ECONNREFUSED' });
  const r = await fetchUpstream('doctor.sh', { home });
  assert.equal(r.source, 'embedded');
  // Embedded path is ~/.vct/scripts/doctor.sh, not ~/.vct/cache/.
  assert.ok(r.path.includes('/.vct/scripts/doctor.sh'));
  // Embedded body must match what build-embed snapshotted.
  const onDisk = await fs.readFile(r.path);
  assert.equal(__test__.sha256(onDisk), EMBEDDED['doctor.sh'].sha256);
});

test('network failure with warm cache → keep stale cache, do not embed', async () => {
  const home = await makeHome();
  // Seed cache first.
  stubFetcher({ status: 200, body: 'echo stale', etag: 'W/"v1"' });
  await fetchUpstream('doctor.sh', { home });
  // Now go stale + network dies.
  stubFetcher({}, { throw: 'ETIMEDOUT' });
  const r = await fetchUpstream('doctor.sh', {
    home,
    now: Date.now() + 48 * 60 * 60 * 1000,
  });
  assert.equal(r.source, 'cache');
  const onDisk = await fs.readFile(r.path, 'utf8');
  assert.equal(onDisk, 'echo stale');
});

test('--offline forces embedded, never calls fetch', async () => {
  const home = await makeHome();
  const calls = stubFetcher({ status: 200, body: 'should not see' });
  const r = await fetchUpstream('doctor.sh', { home, offline: true });
  assert.equal(r.source, 'embedded');
  assert.equal(calls.length, 0);
});

test('--refresh clears cache then refetches', async () => {
  const home = await makeHome();
  stubFetcher({ status: 200, body: 'echo first', etag: 'W/"v1"' });
  await fetchUpstream('doctor.sh', { home });

  // Refresh should ignore fresh-cache shortcut AND send no If-None-Match
  // (cache was cleared, so meta is gone).
  const calls = stubFetcher({ status: 200, body: 'echo refreshed', etag: 'W/"v2"' });
  const r = await fetchUpstream('doctor.sh', { home, refresh: true });
  assert.equal(r.source, 'network');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].ifNoneMatch, null);
  const onDisk = await fs.readFile(getCachedPath('doctor.sh', home), 'utf8');
  assert.equal(onDisk, 'echo refreshed');
});

test('refreshAll iterates every embedded script', async () => {
  const home = await makeHome();
  stubFetcher({ status: 200, body: 'echo bulk', etag: 'W/"bulk"' });
  const results = await refreshAll({ home });
  assert.equal(results.length, SCRIPT_FILES.length);
  for (const r of results) {
    assert.equal(r.ok, true, `${r.name} should succeed`);
    assert.equal(r.source, 'network');
  }
});

test('refreshAll with offline returns embedded for each', async () => {
  const home = await makeHome();
  await ensureCacheDir(home);
  const results = await refreshAll({ home, offline: true });
  assert.equal(results.length, SCRIPT_FILES.length);
  for (const r of results) {
    assert.equal(r.source, 'embedded');
  }
});

test('unknown script name throws', async () => {
  const home = await makeHome();
  await assert.rejects(
    () => fetchUpstream('not-a-real-script.sh', { home }),
    /Unknown script/,
  );
});
