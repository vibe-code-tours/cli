// ASCII banner + cohort menu. Manual ANSI, no figlet dep.

import { c } from './colors.js';
import { t } from './i18n.js';

const ASCII = [
  '  __     ___ _              ___          _    ',
  '  \\ \\   / (_) |__   ___    / __\\___   __| | ___',
  '   \\ \\ / /| | \'_ \\ / _ \\  / /  / _ \\ / _` |/ _ \\',
  '    \\ V / | | |_) |  __/ / /__| (_) | (_| |  __/',
  '     \\_/  |_|_.__/ \\___| \\____/\\___/ \\__,_|\\___|',
  '                                                ',
  '                T O U R S                       ',
];

export function renderBanner({ version, cohort }) {
  const lines = [];
  for (const row of ASCII) lines.push(c.amber(row));
  lines.push('');
  lines.push(`  ${c.amberDim('v' + version)}  ${c.dim(t('banner.tagline'))}`);
  lines.push('');
  if (cohort == null) {
    lines.push(`  ${c.yellow('•')} ${t('cohort.unset')}`);
  } else {
    lines.push(`  ${c.green('•')} ${t('cohort.set', { n: cohort })}`);
  }
  lines.push('');
  lines.push(`  ${c.bold(t('banner.menu'))}:`);
  lines.push(`    ${c.amber('doctor')}              ${c.dim(t('banner.menu.doctor'))}`);
  lines.push(`    ${c.amber('setup')}               ${c.dim(t('banner.menu.setup'))}`);
  lines.push(`    ${c.amber('api-setup')}           ${c.dim(t('banner.menu.apiSetup'))}`);
  lines.push(`    ${c.amber('check ch-N')}          ${c.dim(t('banner.menu.check'))}`);
  lines.push(`    ${c.amber('--cohort N --free')}   ${c.dim(t('banner.menu.cohortFree'))}`);
  lines.push('');
  lines.push(`  ${c.dim('https://vibecode.tours')}`);
  lines.push('');
  return lines.join('\n');
}

export function renderHelp({ version }) {
  const L = [];
  L.push(c.bold(t('help.title')) + ' ' + c.dim('v' + version));
  L.push('');
  L.push(t('help.usage'));
  L.push('');
  L.push(c.bold(t('help.commands')) + ':');
  L.push(`  doctor              ${t('banner.menu.doctor')}`);
  L.push(`  setup               ${t('banner.menu.setup')}`);
  L.push(`  api-setup           ${t('banner.menu.apiSetup')}`);
  L.push(`  check <ch-N>        ${t('banner.menu.check')}`);
  L.push('');
  L.push(c.bold(t('help.flags')) + ':');
  L.push('  --cohort N          select cohort (persists to ~/.vct/config.json)');
  L.push('  --free              with --cohort, open apply URL');
  L.push('  --lang en|my|kar    UI language');
  L.push('  --no-color          disable ANSI colors');
  L.push('  --quiet             suppress banner / non-essential output');
  L.push('  --version           print version and exit');
  L.push('  --help              show this help');
  L.push('');
  L.push(c.bold(t('help.examples')) + ':');
  L.push('  vibe-code-tours');
  L.push('  vibe-code-tours doctor');
  L.push('  vibe-code-tours setup --lang my');
  L.push('  vibe-code-tours --cohort 2 --free');
  L.push('  vibe-code-tours check ch-1');
  L.push('');
  return L.join('\n');
}
