import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEvent } from '../src/validate.ts';

const valid = {
  cohort: 2,
  command: 'setup',
  exit_code: 0,
  ts: Date.now(),
  cli_version: '0.3.0',
};

test('accepts a well-formed event', () => {
  const r = validateEvent(valid);
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.value.cohort, 2);
});

test('rejects non-object body', () => {
  for (const bad of [null, undefined, 'x', 42, []]) {
    const r = validateEvent(bad);
    assert.equal(r.ok, false);
  }
});

test('rejects unknown command', () => {
  const r = validateEvent({ ...valid, command: 'rm-rf-slash' });
  assert.equal(r.ok, false);
});

test('rejects non-integer cohort', () => {
  const r = validateEvent({ ...valid, cohort: 2.5 });
  assert.equal(r.ok, false);
});

test('rejects out-of-range exit_code', () => {
  const r = validateEvent({ ...valid, exit_code: 999 });
  assert.equal(r.ok, false);
});

test('rejects non-semverish cli_version', () => {
  const r = validateEvent({ ...valid, cli_version: 'totally not a version' });
  assert.equal(r.ok, false);
});

test('accepts prerelease cli_version', () => {
  const r = validateEvent({ ...valid, cli_version: '0.3.0-next.4' });
  assert.equal(r.ok, true);
});

test('rejects oversized cli_version', () => {
  const r = validateEvent({ ...valid, cli_version: '1'.repeat(100) });
  assert.equal(r.ok, false);
});
