import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(__dirname, '..', 'bin', 'vibe-code-tours.mjs');

async function makeHome() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'vct-reset-'));
}

function runCli(args, env) {
  return spawnSync(process.execPath, [CLI, ...args, '--quiet'], {
    env: { ...process.env, ...env, NO_COLOR: '1' },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

test('reset --yes deletes ~/.vct/config.json', async () => {
  const home = await makeHome();
  // Seed a config first via --cohort, which persists.
  const seed = runCli(['--cohort', '1'], { HOME: home });
  assert.equal(seed.status, 0, `seed failed: ${seed.stderr}`);
  const cfgPath = path.join(home, '.vct', 'config.json');
  await fs.access(cfgPath); // exists

  const reset = runCli(['reset', '--yes'], { HOME: home });
  assert.equal(reset.status, 0, `reset failed: ${reset.stderr}`);
  await assert.rejects(() => fs.access(cfgPath), /ENOENT/);
});

test('reset --yes reports gracefully when no config exists', async () => {
  const home = await makeHome();
  const r = runCli(['reset', '--yes'], { HOME: home });
  assert.equal(r.status, 0, `reset failed: ${r.stderr}`);
  assert.match(r.stdout, /nothing to delete|No config file/);
});
