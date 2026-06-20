import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { materializeScripts, verifyScript, EMBEDDED, SCRIPT_FILES } from '../lib/scripts.js';

async function makeHome() {
  return await fs.mkdtemp(path.join(os.tmpdir(), 'vct-scr-'));
}

test('EMBEDDED has all four scripts with checksums', () => {
  for (const name of SCRIPT_FILES) {
    assert.ok(EMBEDDED[name], `missing embedded entry for ${name}`);
    assert.match(EMBEDDED[name].sha256, /^[0-9a-f]{64}$/);
    assert.ok(EMBEDDED[name].body.length > 0);
  }
});

test('materializeScripts writes all four with mode 0755', async () => {
  const home = await makeHome();
  const r = await materializeScripts(home);
  assert.equal(r.written.length, 4);
  for (const name of SCRIPT_FILES) {
    const stat = await fs.stat(path.join(home, '.vct', 'scripts', name));
    // 0o100755 (regular file + 0755) or similar — check exec bits.
    assert.ok((stat.mode & 0o100) !== 0, `${name} not executable`);
  }
});

test('second materialize is a no-op', async () => {
  const home = await makeHome();
  await materializeScripts(home);
  const r2 = await materializeScripts(home);
  assert.deepEqual(r2.written, []);
});

test('verifyScript passes for fresh extraction', async () => {
  const home = await makeHome();
  await materializeScripts(home);
  for (const name of SCRIPT_FILES) {
    assert.equal(await verifyScript(name, home), true);
  }
});

test('verifyScript fails when on-disk drifts', async () => {
  const home = await makeHome();
  await materializeScripts(home);
  const target = path.join(home, '.vct', 'scripts', 'doctor.sh');
  await fs.appendFile(target, '\n# drift\n');
  await assert.rejects(() => verifyScript('doctor.sh', home), /Checksum mismatch/);
});
