// `whoami` — prints saved config + tooling versions.

import { readConfig, getConfigPath } from './config.js';
import { EMBEDDED, SCRIPT_FILES } from './scripts.js';
import { c } from './colors.js';
import { t } from './i18n.js';

function scriptsBundleId() {
  if (SCRIPT_FILES.length === 0) return 'none';
  let h = 0x811c9dc5;
  for (const name of SCRIPT_FILES) {
    const sig = `${name}:${EMBEDDED[name].sha256}`;
    for (let i = 0; i < sig.length; i++) {
      h ^= sig.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
  }
  return h.toString(16).padStart(8, '0');
}

export async function renderWhoami({ version, configHome }) {
  const cfg = await readConfig(configHome);
  const path = getConfigPath(configHome);
  const fmtVal = (v) => v == null || v === '' ? c.dim(t('whoami.value.unset')) : String(v);
  const fmtBool = (b) => b ? c.green(t('whoami.value.yes')) : c.dim(t('whoami.value.no'));
  const rows = [
    [t('whoami.label.cohort'), fmtVal(cfg.cohort)],
    [t('whoami.label.lang'), fmtVal(cfg.lang)],
    [t('whoami.label.github'), fmtVal(cfg.github)],
    [t('whoami.label.provider'), fmtVal(cfg.provider)],
    [t('whoami.label.telemetry'), fmtBool(cfg.telemetry === true || cfg.telemetry_optin === true)],
    [t('whoami.label.scripts'), c.dim(scriptsBundleId())],
    [t('whoami.label.cli'), c.dim('v' + version)],
    [t('whoami.label.configPath'), c.dim(path)],
  ];
  const labelW = rows.reduce((m, [k]) => Math.max(m, stripAnsi(k).length), 0);
  const lines = [c.bold(t('whoami.heading')), ''];
  if (cfg.cohort == null && !cfg.github && !cfg.provider) {
    lines.push('  ' + c.yellow(t('whoami.unconfigured')));
    lines.push('');
  }
  for (const [k, v] of rows) {
    const pad = ' '.repeat(labelW - stripAnsi(k).length);
    lines.push(`  ${k}${pad}  ${v}`);
  }
  return lines.join('\n') + '\n';
}

function stripAnsi(s) {
  return String(s).replace(/\x1b\[[0-9;]*m/g, '');
}
