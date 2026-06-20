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

test('normalizes --dry-run to dryRun', () => {
  const r = parse(['setup', '--dry-run']);
  assert.equal(r.flags.dryRun, true);
  assert.equal(r.command, 'setup');
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

// --- Phase 2 commands ----------------------------------------------------

test('recognizes new top-level commands', () => {
  for (const cmd of ['guide', 'verify', 'guides', 'faq', 'env', 'submit', 'lang', 'skill', 'agent', 'mcp']) {
    const r = parse([cmd]);
    assert.equal(r.command, cmd, `${cmd} should be a known command`);
    assert.deepEqual(r.errors, [], `${cmd} should not produce an error`);
  }
});

test('skill add <name> pulls out subcommand', () => {
  const r = parse(['skill', 'add', 'foo']);
  assert.equal(r.command, 'skill');
  assert.equal(r.subcommand, 'add');
  assert.deepEqual(r.positional, ['foo']);
});

test('agent list pulls out subcommand', () => {
  const r = parse(['agent', 'list']);
  assert.equal(r.command, 'agent');
  assert.equal(r.subcommand, 'list');
  assert.deepEqual(r.positional, []);
});

test('mcp add <name> pulls out subcommand', () => {
  const r = parse(['mcp', 'add', 'context7']);
  assert.equal(r.command, 'mcp');
  assert.equal(r.subcommand, 'add');
  assert.deepEqual(r.positional, ['context7']);
});

test('guides ls treats ls as subcommand', () => {
  const r = parse(['guides', 'ls']);
  assert.equal(r.command, 'guides');
  assert.equal(r.subcommand, 'ls');
});

test('guides <slug> treats slug as subcommand', () => {
  const r = parse(['guides', 'TLDR']);
  assert.equal(r.command, 'guides');
  assert.equal(r.subcommand, 'TLDR');
});

test('lang kar treats kar as subcommand', () => {
  const r = parse(['lang', 'kar']);
  assert.equal(r.command, 'lang');
  assert.equal(r.subcommand, 'kar');
});

test('guide ch-1 keeps ch-1 as positional (no subcommand namespace)', () => {
  const r = parse(['guide', 'ch-1']);
  assert.equal(r.command, 'guide');
  assert.equal(r.subcommand, null);
  assert.deepEqual(r.positional, ['ch-1']);
});

test('verify 1 keeps 1 as positional', () => {
  const r = parse(['verify', '1']);
  assert.equal(r.command, 'verify');
  assert.deepEqual(r.positional, ['1']);
});
