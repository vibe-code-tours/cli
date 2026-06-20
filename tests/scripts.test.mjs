import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { materializeScripts, verifyScript, EMBEDDED, SCRIPT_FILES, hasScript } from '../lib/scripts.js';

async function makeHome() {
  return await fs.mkdtemp(path.join(os.tmpdir(), 'vct-scr-'));
}

test('EMBEDDED has at least the four core scripts with checksums', () => {
  const required = ['doctor.sh', 'student-setup.sh', 'api-setup.sh', 'check-ch1.sh'];
  for (const name of required) {
    assert.ok(SCRIPT_FILES.includes(name), `core script ${name} should be embedded`);
    assert.ok(EMBEDDED[name], `missing embedded entry for ${name}`);
    assert.match(EMBEDDED[name].sha256, /^[0-9a-f]{64}$/);
    assert.ok(EMBEDDED[name].body.length > 0);
  }
});

test('materializeScripts writes every embedded script with exec bit', async () => {
  const home = await makeHome();
  const r = await materializeScripts(home);
  assert.equal(r.written.length, SCRIPT_FILES.length);
  for (const name of SCRIPT_FILES) {
    const stat = await fs.stat(path.join(home, '.vct', 'scripts', name));
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

test('hasScript returns true/false appropriately', () => {
  assert.equal(hasScript('doctor.sh'), true);
  assert.equal(hasScript('check-ch1.sh'), true);
  assert.equal(hasScript('does-not-exist.sh'), false);
});
