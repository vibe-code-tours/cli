import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit, bucketKey, clientIp, type KVLike } from '../src/rate-limit.ts';

function memoryKv(): KVLike & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    async get(key) {
      return store.get(key) ?? null;
    },
    async put(key, value) {
      store.set(key, value);
    },
  };
}

test('bucketKey rolls over per hour', () => {
  const a = bucketKey('1.2.3.4', 0);
  const b = bucketKey('1.2.3.4', 60 * 60 * 1000);
  assert.notEqual(a, b);
});

test('allows up to limit then blocks', async () => {
  const kv = memoryKv();
  const now = Date.UTC(2026, 5, 17, 12, 0, 0);
  for (let i = 0; i < 5; i++) {
    const r = await checkRateLimit(kv, '9.9.9.9', 5, now);
    assert.equal(r.allowed, true);
  }
  const blocked = await checkRateLimit(kv, '9.9.9.9', 5, now);
  assert.equal(blocked.allowed, false);
  if (!blocked.allowed) {
    assert.ok(blocked.retryAfter > 0);
    assert.ok(blocked.retryAfter <= 60 * 60);
  }
});

test('separate IPs have separate buckets', async () => {
  const kv = memoryKv();
  const now = Date.now();
  for (let i = 0; i < 3; i++) await checkRateLimit(kv, '1.1.1.1', 3, now);
  const fresh = await checkRateLimit(kv, '2.2.2.2', 3, now);
  assert.equal(fresh.allowed, true);
});

test('clientIp prefers CF-Connecting-IP', () => {
  const req = new Request('https://example.com', {
    headers: { 'CF-Connecting-IP': '5.5.5.5', 'X-Forwarded-For': '6.6.6.6' },
  });
  assert.equal(clientIp(req), '5.5.5.5');
});

test('clientIp falls back to XFF first hop', () => {
  const req = new Request('https://example.com', {
    headers: { 'X-Forwarded-For': '7.7.7.7, 8.8.8.8' },
  });
  assert.equal(clientIp(req), '7.7.7.7');
});

test('clientIp returns "unknown" when nothing set', () => {
  const req = new Request('https://example.com');
  assert.equal(clientIp(req), 'unknown');
});
