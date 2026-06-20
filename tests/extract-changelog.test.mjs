import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import os from 'node:os';

import { extractChangelogSection } from '../scripts/extract-changelog.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');
const SCRIPT = path.join(REPO, 'scripts', 'extract-changelog.mjs');
const REAL_CHANGELOG = path.join(REPO, 'CHANGELOG.md');

const FIXTURE = `# Changelog

Intro prose that lives above the first version section.

## [0.2.0] — 2026-06-20

### Added

- thing one
- thing two

### Changed

- thing three

## [0.1.0] — 2026-06-20

### Added

- initial release

## [0.0.1] — 2026-06-19

### Added

- scaffold
`;

test('extractChangelogSection returns the section body without the heading', () => {
  const body = extractChangelogSection(FIXTURE, '0.2.0');
  assert.ok(body, 'expected a body');
  assert.ok(body.startsWith('### Added'), 'should start at the first subsection');
  assert.ok(body.includes('- thing one'));
  assert.ok(body.includes('- thing three'));
  // Stops before the next version heading.
  assert.ok(!body.includes('## [0.1.0]'));
  assert.ok(!body.includes('initial release'));
});

test('extractChangelogSection trims blank edges', () => {
  const body = extractChangelogSection(FIXTURE, '0.1.0');
  assert.ok(body);
  assert.ok(!body.startsWith('\n'));
  assert.ok(!body.endsWith('\n'));
});

test('extractChangelogSection returns null when version is missing', () => {
  assert.equal(extractChangelogSection(FIXTURE, '9.9.9'), null);
});

test('extractChangelogSection tolerates a leading v', () => {
  const a = extractChangelogSection(FIXTURE, '0.2.0');
  const b = extractChangelogSection(FIXTURE, 'v0.2.0');
  assert.equal(a, b);
});

test('extractChangelogSection finds the last section (no following heading)', () => {
  const body = extractChangelogSection(FIXTURE, '0.0.1');
  assert.ok(body);
  assert.ok(body.includes('- scaffold'));
});

test('extractChangelogSection handles ASCII-dash heading style', () => {
  const dashed = FIXTURE.replace('## [0.2.0] — 2026-06-20', '## [0.2.0] - 2026-06-20');
  const body = extractChangelogSection(dashed, '0.2.0');
  assert.ok(body);
  assert.ok(body.includes('- thing one'));
});

test('extractChangelogSection handles bare (un-bracketed) version headings', () => {
  const bare = FIXTURE.replace('## [0.2.0] — 2026-06-20', '## 0.2.0 — 2026-06-20');
  const body = extractChangelogSection(bare, '0.2.0');
  assert.ok(body);
  assert.ok(body.includes('- thing one'));
});

test('extractChangelogSection rejects non-string / empty inputs', () => {
  assert.equal(extractChangelogSection(null, '0.2.0'), null);
  assert.equal(extractChangelogSection(FIXTURE, ''), null);
  assert.equal(extractChangelogSection(FIXTURE, null), null);
});

test('CLI prints the requested section to stdout and exits 0', async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'vct-extract-'));
  const file = path.join(tmp, 'CHANGELOG.md');
  await fs.writeFile(file, FIXTURE);

  const res = spawnSync(process.execPath, [SCRIPT, '0.2.0', file], { encoding: 'utf8' });
  assert.equal(res.status, 0, `stderr: ${res.stderr}`);
  assert.ok(res.stdout.includes('- thing one'));
  assert.ok(res.stdout.includes('### Changed'));
  assert.ok(!res.stdout.includes('## [0.1.0]'));

  await fs.rm(tmp, { recursive: true, force: true });
});

test('CLI exits 1 with a useful message when version is missing', async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'vct-extract-'));
  const file = path.join(tmp, 'CHANGELOG.md');
  await fs.writeFile(file, FIXTURE);

  const res = spawnSync(process.execPath, [SCRIPT, '9.9.9', file], { encoding: 'utf8' });
  assert.equal(res.status, 1);
  assert.ok(res.stderr.includes('no section for version "9.9.9"'));

  await fs.rm(tmp, { recursive: true, force: true });
});

test('CLI exits 1 when no args are given', () => {
  const res = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
  assert.equal(res.status, 1);
  assert.ok(res.stderr.toLowerCase().includes('usage'));
});

test('CLI works against the real repo CHANGELOG.md for the current version', async () => {
  const pkg = JSON.parse(
    await fs.readFile(path.join(REPO, 'package.json'), 'utf8'),
  );
  const res = spawnSync(process.execPath, [SCRIPT, pkg.version, REAL_CHANGELOG], {
    encoding: 'utf8',
  });
  assert.equal(res.status, 0, `stderr: ${res.stderr}`);
  assert.ok(res.stdout.trim().length > 0, 'real changelog section should not be empty');
});
