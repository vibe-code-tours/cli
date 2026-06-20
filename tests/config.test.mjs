import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { readConfig, writeConfig, getConfigPath, getVctDir, ensureVctDir, DEFAULT_CONFIG } from '../lib/config.js';

async function makeHome() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'vct-cfg-'));
  return dir;
}

test('readConfig returns defaults when missing', async () => {
  const home = await makeHome();
  const cfg = await readConfig(home);
  assert.equal(cfg.cohort, DEFAULT_CONFIG.cohort);
  assert.equal(cfg.lang, 'en');
  assert.equal(cfg.telemetry_optin, false);
});

test('writeConfig persists patch + timestamps', async () => {
  const home = await makeHome();
  const out = await writeConfig({ cohort: 2 }, home);
  assert.equal(out.cohort, 2);
  assert.ok(out.createdAt);
  assert.ok(out.updatedAt);
  const round = await readConfig(home);
  assert.equal(round.cohort, 2);
});

test('writeConfig merges, does not overwrite unrelated keys', async () => {
  const home = await makeHome();
  await writeConfig({ cohort: 1, lang: 'my' }, home);
  await writeConfig({ cohort: 3 }, home);
  const out = await readConfig(home);
  assert.equal(out.cohort, 3);
  assert.equal(out.lang, 'my');
});

test('ensureVctDir creates .vct and .vct/scripts', async () => {
  const home = await makeHome();
  await ensureVctDir(home);
  const stat = await fs.stat(path.join(home, '.vct'));
  assert.ok(stat.isDirectory());
  const scripts = await fs.stat(path.join(home, '.vct', 'scripts'));
  assert.ok(scripts.isDirectory());
});

test('getConfigPath resolves under .vct', () => {
  const p = getConfigPath('/tmp/xyz');
  assert.equal(p, '/tmp/xyz/.vct/config.json');
});

test('getVctDir resolves under home', () => {
  assert.equal(getVctDir('/home/u'), '/home/u/.vct');
});
