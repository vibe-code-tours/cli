// Opt-in, best-effort telemetry client.
//
// Promises:
//   - sendEvent() NEVER throws and NEVER blocks the command longer than 1s.
//   - Nothing is sent unless ~/.vct/config.json has telemetry: true.
//   - Payload is exactly the five whitelisted fields. No PII. No paths.
//
// Test seam: pass `{ fetchImpl, configReader, home }` to inject stubs.

import { readConfig, writeConfig } from './config.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const ENDPOINT = 'https://vibecode.tours/api/cli-telemetry/event';
const TIMEOUT_MS = 1000;

export function getEndpoint() {
  return process.env.VCT_TELEMETRY_ENDPOINT || ENDPOINT;
}

// Truth table:
//   telemetry === true   → opted in
//   telemetry === false  → opted out (explicit)
//   telemetry == null    → undecided (first-run prompt should fire)
//
// Legacy: telemetry_optin (boolean) is still honored for forward-compat
// with configs written by older CLI versions.
export function isOptedIn(config) {
  if (!config) return false;
  if (config.telemetry === true) return true;
  if (config.telemetry === false) return false;
  if (config.telemetry_optin === true) return true;
  return false;
}

export function hasDecided(config) {
  if (!config) return false;
  if (typeof config.telemetry === 'boolean') return true;
  if (typeof config.telemetry_optin === 'boolean' && config.telemetry_optin === true) return true;
  return false;
}

export function buildPayload({ command, exit_code, cohort, version }) {
  return {
    cohort: Number.isInteger(cohort) && cohort >= 0 ? cohort : 0,
    command: String(command || 'unknown'),
    exit_code: Number.isInteger(exit_code) ? exit_code : 0,
    ts: Date.now(),
    cli_version: String(version || pkg.version),
  };
}

// Fire-and-forget. Resolves on success OR failure with no throw.
// Awaiting it is safe (max ~1s thanks to AbortController).
export async function sendEvent(
  { command, exit_code, cohort, version, fetchImpl, configReader, home, timeoutMs = TIMEOUT_MS } = {},
) {
  try {
    const reader = configReader || readConfig;
    const cfg = await reader(home);
    if (!isOptedIn(cfg)) return { sent: false, reason: 'opt-out' };

    const fetcher = fetchImpl || globalThis.fetch;
    if (typeof fetcher !== 'function') return { sent: false, reason: 'no-fetch' };

    const payload = buildPayload({
      command,
      exit_code,
      cohort: cohort ?? cfg.cohort ?? 0,
      version,
    });

    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeout = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
    try {
      await fetcher(getEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `vibe-code-tours/${pkg.version}`,
        },
        body: JSON.stringify(payload),
        signal: ctrl ? ctrl.signal : undefined,
      });
      return { sent: true };
    } catch {
      return { sent: false, reason: 'network' };
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  } catch {
    // Defensive: any thrown error is swallowed. Telemetry MUST NOT break
    // the CLI for the user.
    return { sent: false, reason: 'error' };
  }
}

// One-time first-run prompt. Returns the resolved decision (true/false) or
// `null` if we couldn't ask (non-TTY, quiet, error). Persists to config.
export async function maybePromptForTelemetry(
  { askImpl, writer, configReader, home, quiet = false, isTty = process.stdin.isTTY } = {},
) {
  try {
    const reader = configReader || readConfig;
    const cfg = await reader(home);
    if (hasDecided(cfg)) return null;
    if (!isTty || quiet || typeof askImpl !== 'function') return null;
    const answer = await askImpl(
      'Help improve VCT? Send anonymous command stats? (y/N)',
      { defaultValue: 'N' },
    );
    const yes = !!(answer && /^y(es)?$/i.test(String(answer).trim()));
    const persist = writer || writeConfig;
    await persist({ telemetry: yes }, home);
    return yes;
  } catch {
    return null;
  }
}
