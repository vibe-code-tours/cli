import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sendEvent,
  buildPayload,
  isOptedIn,
  hasDecided,
  maybePromptForTelemetry,
  getEndpoint,
} from '../lib/telemetry.js';

// In-memory fake config reader/writer so we don't touch real ~/.vct.
function fakeConfig(initial = {}) {
  let cfg = { ...initial };
  return {
    read: async () => ({ ...cfg }),
    write: async (patch) => {
      cfg = { ...cfg, ...patch };
      return { ...cfg };
    },
    snapshot: () => ({ ...cfg }),
  };
}

test('isOptedIn / hasDecided truth table', () => {
  assert.equal(isOptedIn(null), false);
  assert.equal(isOptedIn({}), false);
  assert.equal(isOptedIn({ telemetry: true }), true);
  assert.equal(isOptedIn({ telemetry: false }), false);
  assert.equal(isOptedIn({ telemetry_optin: true }), true);
  assert.equal(isOptedIn({ telemetry_optin: false }), false);

  assert.equal(hasDecided(null), false);
  assert.equal(hasDecided({}), false);
  assert.equal(hasDecided({ telemetry: false }), true);
  assert.equal(hasDecided({ telemetry: true }), true);
  assert.equal(hasDecided({ telemetry_optin: true }), true);
});

test('buildPayload pins to exactly five keys', () => {
  const p = buildPayload({ command: 'doctor', exit_code: 0, cohort: 2, version: '0.3.0' });
  assert.deepEqual(Object.keys(p).sort(), ['cli_version', 'cohort', 'command', 'exit_code', 'ts']);
  assert.equal(p.cohort, 2);
  assert.equal(p.command, 'doctor');
  assert.equal(p.exit_code, 0);
  assert.equal(p.cli_version, '0.3.0');
  assert.equal(typeof p.ts, 'number');
});

test('buildPayload coerces bad values to safe defaults', () => {
  const p = buildPayload({ command: undefined, exit_code: 'nope', cohort: -1 });
  assert.equal(p.command, 'unknown');
  assert.equal(p.exit_code, 0);
  assert.equal(p.cohort, 0);
});

test('opt-out path: sendEvent NEVER fetches', async () => {
  const cfg = fakeConfig({ telemetry: false });
  let fetchCalled = false;
  const fetchImpl = async () => {
    fetchCalled = true;
    return new Response(null, { status: 204 });
  };
  const r = await sendEvent({
    command: 'doctor',
    exit_code: 0,
    configReader: cfg.read,
    fetchImpl,
  });
  assert.equal(r.sent, false);
  assert.equal(r.reason, 'opt-out');
  assert.equal(fetchCalled, false);
});

test('undecided config (no telemetry key) is treated as opt-out', async () => {
  const cfg = fakeConfig({});
  let fetchCalled = false;
  const fetchImpl = async () => {
    fetchCalled = true;
    return new Response(null, { status: 204 });
  };
  const r = await sendEvent({
    command: 'doctor',
    exit_code: 0,
    configReader: cfg.read,
    fetchImpl,
  });
  assert.equal(r.sent, false);
  assert.equal(fetchCalled, false);
});

test('opt-in path: sendEvent POSTs the event with correct payload', async () => {
  const cfg = fakeConfig({ telemetry: true, cohort: 2 });
  let captured;
  const fetchImpl = async (url, init) => {
    captured = { url, init };
    return new Response(null, { status: 204 });
  };
  const r = await sendEvent({
    command: 'setup',
    exit_code: 0,
    version: '0.3.0',
    configReader: cfg.read,
    fetchImpl,
  });
  assert.equal(r.sent, true);
  assert.equal(captured.url, getEndpoint());
  assert.equal(captured.init.method, 'POST');
  assert.match(captured.init.headers['User-Agent'], /^vibe-code-tours\//);
  const body = JSON.parse(captured.init.body);
  assert.equal(body.command, 'setup');
  assert.equal(body.cohort, 2);
  assert.equal(body.exit_code, 0);
  assert.equal(body.cli_version, '0.3.0');
  assert.equal(typeof body.ts, 'number');
});

test('fetch throwing is swallowed silently', async () => {
  const cfg = fakeConfig({ telemetry: true });
  const fetchImpl = async () => {
    throw new Error('network down');
  };
  const r = await sendEvent({
    command: 'doctor',
    exit_code: 1,
    configReader: cfg.read,
    fetchImpl,
  });
  assert.equal(r.sent, false);
  assert.equal(r.reason, 'network');
});

test('fetch hanging is aborted by timeout', async () => {
  const cfg = fakeConfig({ telemetry: true });
  const fetchImpl = (_url, init) =>
    new Promise((_resolve, reject) => {
      // Reject only when aborted.
      if (init && init.signal) {
        init.signal.addEventListener('abort', () => reject(new Error('aborted')));
      }
    });
  const start = Date.now();
  const r = await sendEvent({
    command: 'doctor',
    exit_code: 0,
    configReader: cfg.read,
    fetchImpl,
    timeoutMs: 50,
  });
  const elapsed = Date.now() - start;
  assert.equal(r.sent, false);
  assert.ok(elapsed < 500, `should abort fast, took ${elapsed}ms`);
});

test('maybePromptForTelemetry persists yes', async () => {
  const cfg = fakeConfig({});
  const ask = async () => 'y';
  const decision = await maybePromptForTelemetry({
    askImpl: ask,
    writer: cfg.write,
    configReader: cfg.read,
    isTty: true,
  });
  assert.equal(decision, true);
  assert.equal(cfg.snapshot().telemetry, true);
});

test('maybePromptForTelemetry persists no on empty / N', async () => {
  const cfg = fakeConfig({});
  const ask = async () => '';
  const decision = await maybePromptForTelemetry({
    askImpl: ask,
    writer: cfg.write,
    configReader: cfg.read,
    isTty: true,
  });
  assert.equal(decision, false);
  assert.equal(cfg.snapshot().telemetry, false);
});

test('maybePromptForTelemetry skips when already decided', async () => {
  const cfg = fakeConfig({ telemetry: true });
  let asked = false;
  const ask = async () => {
    asked = true;
    return 'y';
  };
  const decision = await maybePromptForTelemetry({
    askImpl: ask,
    writer: cfg.write,
    configReader: cfg.read,
    isTty: true,
  });
  assert.equal(decision, null);
  assert.equal(asked, false);
});

test('maybePromptForTelemetry skips on non-TTY', async () => {
  const cfg = fakeConfig({});
  let asked = false;
  const ask = async () => {
    asked = true;
    return 'y';
  };
  const decision = await maybePromptForTelemetry({
    askImpl: ask,
    writer: cfg.write,
    configReader: cfg.read,
    isTty: false,
  });
  assert.equal(decision, null);
  assert.equal(asked, false);
});

test('maybePromptForTelemetry skips when quiet', async () => {
  const cfg = fakeConfig({});
  let asked = false;
  const ask = async () => {
    asked = true;
    return 'y';
  };
  const decision = await maybePromptForTelemetry({
    askImpl: ask,
    writer: cfg.write,
    configReader: cfg.read,
    isTty: true,
    quiet: true,
  });
  assert.equal(decision, null);
  assert.equal(asked, false);
});
