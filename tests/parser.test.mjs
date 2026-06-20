import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../lib/parser.js';

test('parses --version', () => {
  const r = parse(['--version']);
  assert.equal(r.flags.version, true);
  assert.equal(r.command, null);
  assert.deepEqual(r.errors, []);
});

test('parses short -v', () => {
  const r = parse(['-v']);
  assert.equal(r.flags.version, true);
});

test('parses command + positional', () => {
  const r = parse(['check', 'ch-1']);
  assert.equal(r.command, 'check');
  assert.deepEqual(r.positional, ['ch-1']);
});

test('parses --cohort with value', () => {
  const r = parse(['--cohort', '2', '--free']);
  assert.equal(r.flags.cohort, '2');
  assert.equal(r.flags.free, true);
});

test('parses --cohort=N inline', () => {
  const r = parse(['--cohort=3']);
  assert.equal(r.flags.cohort, '3');
});

test('normalizes --no-color to noColor', () => {
  const r = parse(['--no-color']);
  assert.equal(r.flags.noColor, true);
});

test('captures rest after --', () => {
  const r = parse(['doctor', '--', '--script-flag', 'arg']);
  assert.equal(r.command, 'doctor');
  assert.deepEqual(r.rest, ['--script-flag', 'arg']);
});

test('unknown command surfaces error', () => {
  const r = parse(['nope']);
  assert.equal(r.command, 'nope');
  assert.ok(r.errors.some((e) => e.includes('unknown command')));
});

test('unknown flag surfaces error but continues', () => {
  const r = parse(['--bogus']);
  assert.ok(r.errors.some((e) => e.includes('unknown flag')));
});

test('flag requiring value rejects when missing', () => {
  const r = parse(['--cohort']);
  assert.ok(r.errors.some((e) => e.includes('requires a value')));
});

test('multiple flags + command + rest mix', () => {
  const r = parse(['--lang', 'my', 'setup', '--quiet', '--', 'extra']);
  assert.equal(r.flags.lang, 'my');
  assert.equal(r.command, 'setup');
  assert.equal(r.flags.quiet, true);
  assert.deepEqual(r.rest, ['extra']);
});
