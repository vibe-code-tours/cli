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
  lines.push(`    ${c.amber('guide ch-N')}          ${c.dim(t('banner.menu.guide'))}`);
  lines.push(`    ${c.amber('verify ch-N')}         ${c.dim(t('banner.menu.verify'))}`);
  lines.push(`    ${c.amber('faq <query>')}         ${c.dim(t('banner.menu.faq'))}`);
  lines.push(`    ${c.amber('guides ls|<slug>')}    ${c.dim(t('banner.menu.guides'))}`);
  lines.push(`    ${c.amber('env')}                 ${c.dim(t('banner.menu.env'))}`);
  lines.push(`    ${c.amber('submit ch-N')}         ${c.dim(t('banner.menu.submit'))}`);
  lines.push(`    ${c.amber('lang my|en|kar')}      ${c.dim(t('banner.menu.lang'))}`);
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
  L.push(`  doctor                       ${t('banner.menu.doctor')}`);
  L.push(`  setup [--dry-run]            ${t('banner.menu.setup')}`);
  L.push(`  api-setup                    ${t('banner.menu.apiSetup')}`);
  L.push(`  check <ch-N>                 ${t('banner.menu.check')}`);
  L.push(`  guide <ch-N|N>               ${t('banner.menu.guide')}`);
  L.push(`  verify <ch-N|N>              ${t('banner.menu.verify')}`);
  L.push(`  faq [query]                  ${t('banner.menu.faq')}`);
  L.push(`  guides ls | <slug>           ${t('banner.menu.guides')}`);
  L.push(`  env                          ${t('banner.menu.env')}`);
  L.push(`  submit <ch-N>                ${t('banner.menu.submit')}`);
  L.push(`  lang my|en|kar               ${t('banner.menu.lang')}`);
  L.push(`  skill add|list <name>        ${c.dim('(Phase 3 scaffold)')}`);
  L.push(`  agent add|list <name>        ${c.dim('(Phase 3 scaffold)')}`);
  L.push(`  mcp   add|list <name>        ${c.dim('(Phase 3 scaffold)')}`);
  L.push('');
  L.push(c.bold(t('help.flags')) + ':');
  L.push('  --cohort N          select cohort (persists to ~/.vct/config.json)');
  L.push('  --free              with --cohort, open apply URL');
  L.push('  --lang en|my|kar    UI language');
  L.push('  --dry-run           on setup/api-setup: show what would happen');
  L.push('  --no-color          disable ANSI colors');
  L.push('  --quiet             suppress banner / non-essential output');
  L.push('  --version           print version and exit');
  L.push('  --help              show this help');
  L.push('');
  L.push(c.bold(t('help.examples')) + ':');
  L.push('  vibe-code-tours');
  L.push('  vibe-code-tours doctor');
  L.push('  vibe-code-tours setup --lang my --dry-run');
  L.push('  vibe-code-tours --cohort 2 --free');
  L.push('  vibe-code-tours guide ch-1');
  L.push('  vibe-code-tours verify ch-1');
  L.push('  vibe-code-tours faq "claude code login"');
  L.push('  vibe-code-tours env');
  L.push('  vibe-code-tours lang kar');
  L.push('');
  return L.join('\n');
}
