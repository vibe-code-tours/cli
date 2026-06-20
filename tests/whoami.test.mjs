import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { renderWhoami } from '../lib/whoami.js';
import { writeConfig } from '../lib/config.js';

async function makeHome() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'vct-whoami-'));
}

function stripAnsi(s) {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}

test('whoami renders unconfigured state gracefully', async () => {
  const home = await makeHome();
  const out = stripAnsi(await renderWhoami({ version: '0.3.0', configHome: home }));
  assert.match(out, /Vibe Code Tours/);
  assert.match(out, /Not configured/);
  assert.match(out, /Cohort/);
  assert.match(out, /v0\.3\.0/);
});

test('whoami surfaces stored cohort / github / provider', async () => {
  const home = await makeHome();
  await writeConfig({ cohort: 2, lang: 'my', github: 'octocat', provider: 'oauth', telemetry_optin: true }, home);
  const out = stripAnsi(await renderWhoami({ version: '0.3.0', configHome: home }));
  assert.match(out, /Cohort\s+2/);
  assert.match(out, /octocat/);
  assert.match(out, /oauth/);
  // Telemetry yes label is locale-bound; just verify the row appears.
  assert.match(out, /Telemetry/);
  // Should NOT show the "not configured" banner once any field is set.
  assert.doesNotMatch(out, /Not configured/);
});
