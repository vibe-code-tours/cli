#!/usr/bin/env node
// vibe-code-tours CLI — Phase 2 entry.
// Hand-rolled arg parser, no deps. Spawns the embedded bash scripts and
// renders bundled docs / FAQ / chapter content directly.

import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

import { parse } from '../lib/parser.js';
import { setColorEnabled, detectColorSupport, c } from '../lib/colors.js';
import { setLang, t, listLangs, hasNative } from '../lib/i18n.js';
import { readConfig, writeConfig } from '../lib/config.js';
import { materializeScripts, getScriptPath, hasScript, SCRIPT_FILES } from '../lib/scripts.js';
import { renderBanner, renderHelp } from '../lib/banner.js';
import { openUrl } from '../lib/open.js';
import { renderMarkdown } from '../lib/markdown.js';
import { getGuide, listGuides, categorize } from '../lib/guides.js';
import { normalizeChapter, listChapters, getChapter } from '../lib/chapters.js';
import { searchFaq, totalEntries as faqTotal } from '../lib/faq.js';
import { collectEnv, formatEnv } from '../lib/env.js';
import { ask, choose } from '../lib/prompt.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');
const VERSION = pkg.version;
const APPLY_BASE = 'https://vibecode.tours/apply';

async function main() {
  const argv = process.argv.slice(2);
  const parsed = parse(argv);

  setColorEnabled(detectColorSupport({ noColorFlag: !!parsed.flags.noColor }));

  let config = await readConfig();
  // Apply persisted lang first, then CLI override.
  if (config.lang) setLang(config.lang);
  if (parsed.flags.lang) setLang(parsed.flags.lang);

  if (parsed.flags.version) {
    process.stdout.write(`${VERSION}\n`);
    return 0;
  }

  if (parsed.flags.help && !parsed.command) {
    process.stdout.write(renderHelp({ version: VERSION }) + '\n');
    return 0;
  }

  if (parsed.flags.cohort != null) {
    const n = Number(parsed.flags.cohort);
    if (!Number.isFinite(n) || n < 1) {
      process.stderr.write(`${c.red('error')}: --cohort must be a positive integer\n`);
      return 2;
    }
    config = await writeConfig({ cohort: n });
  }

  let materialized;
  try {
    materialized = await materializeScripts();
  } catch (err) {
    process.stderr.write(`${c.red('error')}: failed to extract scripts: ${err.message}\n`);
    return 1;
  }
  if (!parsed.flags.quiet && materialized.written.length > 0) {
    process.stderr.write(
      `${c.dim(`extracted ${materialized.written.length} script(s) to ${materialized.dir}`)}\n`,
    );
  }

  // --free with --cohort opens apply URL and returns.
  if (parsed.flags.free) {
    const n = config.cohort;
    if (n == null) {
      process.stderr.write(`${c.red('error')}: --free requires --cohort N\n`);
      return 2;
    }
    const url = `${APPLY_BASE}?cohort=${encodeURIComponent(n)}`;
    const result = openUrl(url, { dryRun: !!process.env.VCT_DRY_RUN });
    if (result.spawned) {
      if (!parsed.flags.quiet) process.stdout.write(`${t('free.opening', { n })}\n`);
    } else {
      process.stdout.write(`${t('free.fallback', { n })}\n  ${c.underline(url)}\n`);
    }
    return 0;
  }

  if (!parsed.command) {
    if (parsed.errors.length) {
      for (const e of parsed.errors) process.stderr.write(`${c.red('error')}: ${e}\n`);
      return 2;
    }
    if (!parsed.flags.quiet) {
      process.stdout.write(renderBanner({ version: VERSION, cohort: config.cohort }) + '\n');
    }
    return 0;
  }

  return dispatch(parsed, config);
}

async function dispatch(parsed, config) {
  const { command, subcommand, positional, flags, rest } = parsed;

  // Surface parse-time errors before dispatching anything.
  if (parsed.errors.length) {
    for (const e of parsed.errors) process.stderr.write(`${c.red('error')}: ${e}\n`);
    return 2;
  }

  switch (command) {
    case 'doctor':
      if (!hasBash()) return failNoBash();
      return runScript('doctor.sh', [...positional, ...rest], { flags });
    case 'setup':
      return cmdSetup(positional, rest, flags);
    case 'api-setup':
      return cmdApiSetup(positional, rest, flags);
    case 'check': {
      if (!hasBash()) return failNoBash();
      const chapter = positional[0];
      if (!chapter) {
        process.stderr.write(`${c.red('error')}: ${t('check.missingArg')}\n`);
        return 2;
      }
      return runScript('doctor.sh', [chapter, ...positional.slice(1), ...rest], { flags });
    }
    case 'guide':
      return cmdGuide(positional, flags);
    case 'verify':
      return cmdVerify(positional, rest, flags);
    case 'guides':
      return cmdGuides(subcommand, positional, flags);
    case 'faq':
      return cmdFaq(positional, flags);
    case 'env':
      return cmdEnv(flags);
    case 'submit':
      return cmdSubmit(positional, flags, config);
    case 'lang':
      return cmdLang(subcommand);
    case 'skill':
    case 'agent':
    case 'mcp':
      return cmdPlaceholder(command, subcommand, positional);
    default:
      process.stderr.write(`${c.red('error')}: unknown command: ${command}\n`);
      process.stderr.write(renderHelp({ version: VERSION }) + '\n');
      return 2;
  }
}

async function cmdSetup(positional, rest, flags) {
  if (flags.dryRun) {
    const args = [...positional, ...rest];
    process.stdout.write(`${t('setup.dryRun', { args: args.length ? args.join(' ') : '(none)' })}\n`);
    return 0;
  }
  if (!hasBash()) return failNoBash();
  return runScript('student-setup.sh', [...positional, ...rest], { flags });
}

async function cmdApiSetup(positional, rest, flags) {
  // Interactive provider selection at the top, persisted to ~/.vct/config.json.
  // --quiet or non-TTY skips the prompt and falls through to the script.
  let provider = null;
  if (process.stdin.isTTY && !flags.quiet) {
    provider = await choose(t('apiSetup.providerPrompt'), [
      { label: t('apiSetup.provider.claude'), value: 'claude' },
      { label: t('apiSetup.provider.oauth'), value: 'oauth' },
      { label: t('apiSetup.provider.litellm'), value: 'litellm' },
      { label: t('apiSetup.provider.skip'), value: 'skip' },
    ]);
    if (provider) await writeConfig({ provider });
    if (provider === 'skip') {
      process.stdout.write(c.dim('Skipping api-setup. Re-run anytime.') + '\n');
      return 0;
    }
  }
  if (flags.dryRun) {
    process.stdout.write(`${t('apiSetup.dryRun', { p: provider ?? '(unset)' })}\n`);
    return 0;
  }
  if (!hasBash()) return failNoBash();
  const env = provider ? { VCT_PROVIDER: provider } : {};
  return runScript('api-setup.sh', [...positional, ...rest], { flags, env });
}

async function cmdGuide(positional, flags) {
  const arg = positional[0];
  if (!arg) {
    process.stderr.write(`${c.red('error')}: ${t('guide.missingArg')}\n`);
    return 2;
  }
  const norm = normalizeChapter(arg);
  if (!norm) {
    process.stderr.write(`${c.red('error')}: ${t('guide.missingArg')}\n`);
    return 2;
  }
  const lang = (flags.lang || 'en');
  const guide = getChapter(norm.id, lang);
  if (!guide) {
    const list = listChapters().map((ch) => ch.id).join(', ') || '(none)';
    process.stderr.write(`${c.red('error')}: ${t('guide.notFound', { id: norm.id, list })}\n`);
    return 1;
  }
  process.stdout.write(c.dim(t('guide.header', { id: norm.id, lang })) + '\n\n');
  process.stdout.write(renderMarkdown(guide.body) + '\n');
  return 0;
}

async function cmdVerify(positional, rest, flags) {
  const arg = positional[0];
  if (!arg) {
    process.stderr.write(`${c.red('error')}: ${t('verify.missingArg')}\n`);
    return 2;
  }
  const norm = normalizeChapter(arg);
  if (!norm) {
    process.stderr.write(`${c.red('error')}: ${t('verify.missingArg')}\n`);
    return 2;
  }
  if (!hasBash()) return failNoBash();
  const specific = `check-ch${norm.n}.sh`;
  if (hasScript(specific)) {
    return runScript(specific, [...positional.slice(1), ...rest], { flags });
  }
  // Fall back to doctor.sh ch-N for chapters without a dedicated script.
  if (!flags.quiet) process.stderr.write(`${c.yellow('note')}: ${t('check.notVendored', { id: norm.id })}\n`);
  return runScript('doctor.sh', [norm.id, ...positional.slice(1), ...rest], { flags });
}

async function cmdGuides(subcommand, positional, flags) {
  const all = listGuides();
  if (all.length === 0) {
    process.stdout.write(`${c.yellow(t('guides.empty'))}\n`);
    return 0;
  }
  // `guides` (no sub) or `guides ls` → list grouped by category.
  if (!subcommand || subcommand === 'ls') {
    const groups = new Map();
    for (const g of all) {
      const cat = categorize(g.slug);
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(g);
    }
    process.stdout.write(`${c.bold(t('guides.heading'))}\n\n`);
    for (const [cat, items] of [...groups.entries()].sort()) {
      process.stdout.write(`  ${c.amber(cat)}\n`);
      for (const item of items) {
        process.stdout.write(`    ${item.slug}  ${c.dim('(' + item.langs.join('/') + ')')}\n`);
      }
      process.stdout.write('\n');
    }
    return 0;
  }
  // `guides <slug>` → render markdown.
  const slug = subcommand;
  const lang = (flags.lang || 'en');
  const guide = getGuide(slug, lang);
  if (!guide) {
    process.stderr.write(`${c.red('error')}: ${t('guides.notFound', { slug })}\n`);
    return 1;
  }
  process.stdout.write(c.dim(`── ${slug} — ${lang} ──`) + '\n\n');
  process.stdout.write(renderMarkdown(guide.body) + '\n');
  return 0;
}

async function cmdFaq(positional, _flags) {
  const total = faqTotal();
  if (total === 0) {
    process.stdout.write(`${c.yellow(t('faq.empty'))}\n`);
    return 0;
  }
  const query = positional.join(' ').trim();
  if (query) return printFaqResults(query);

  // Interactive: read one line, answer top 3.
  if (!process.stdin.isTTY) {
    process.stderr.write(`${c.red('error')}: faq with no query requires a TTY\n`);
    return 2;
  }
  const q = await ask(t('faq.prompt'));
  if (!q) return 0;
  return printFaqResults(q, 3);
}

function printFaqResults(query, limit = 5) {
  const hits = searchFaq(query, { limit });
  if (hits.length === 0) {
    process.stdout.write(`${c.yellow(t('faq.noHits', { q: query }))}\n`);
    return 0;
  }
  process.stdout.write(`${c.bold(t('faq.results', { n: hits.length }))}\n\n`);
  for (const h of hits) {
    const kindTag = h.kind === 'qa' ? c.dim('[discord]') : c.amber('[faq]');
    process.stdout.write(`${kindTag} ${c.bold(h.title)} ${c.dim('(score ' + h.score + ')')}\n`);
    const body = h.body.length > 600 ? h.body.slice(0, 600) + '…' : h.body;
    process.stdout.write(body + '\n');
    if (h.meta?.link) process.stdout.write(c.dim('  → ' + h.meta.link) + '\n');
    process.stdout.write('\n');
  }
  return 0;
}

async function cmdEnv(_flags) {
  const snap = await collectEnv();
  process.stdout.write(`${c.bold(t('env.heading'))}\n\n`);
  process.stdout.write(formatEnv(snap, { c }) + '\n');
  return 0;
}

async function cmdSubmit(positional, flags, config) {
  const arg = positional[0];
  const chapter = arg ? normalizeChapter(arg) : null;
  if (!chapter) {
    process.stderr.write(`${c.red('error')}: submit requires a chapter id, e.g. \`submit ch-1\`\n`);
    return 2;
  }
  // gh installed?
  const ghCheck = spawnSync('gh', ['--version'], { stdio: 'ignore' });
  if (ghCheck.status !== 0) {
    process.stderr.write(`${c.red('error')}: ${t('submit.noGh')}\n`);
    return 127;
  }
  // Inside a git repo?
  const insideGit = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: ['ignore', 'pipe', 'ignore'] });
  if (insideGit.status !== 0) {
    process.stderr.write(`${c.red('error')}: ${t('submit.notRepo')}\n`);
    return 1;
  }
  const branchR = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { stdio: ['ignore', 'pipe', 'pipe'] });
  const branch = branchR.stdout?.toString().trim() || 'HEAD';
  const cohort = config.cohort ?? '(unset)';
  const github = config.github ?? '(unknown)';
  const body = `Cohort: ${cohort}\nChapter: ${chapter.id}\nBuilder: ${github}`;
  const title = `${chapter.id}: ${branch}`;

  // Push current branch (best-effort).
  if (!flags.quiet) process.stdout.write(c.dim(`Pushing ${branch}…`) + '\n');
  const pushR = spawnSync('git', ['push', '-u', 'origin', branch], { stdio: 'inherit' });
  if (pushR.status !== 0) {
    process.stderr.write(`${c.red('error')}: git push failed\n`);
    return pushR.status ?? 1;
  }
  const ghR = spawnSync('gh', ['pr', 'create', '--fill', '--title', title, '--body', body], {
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  if (ghR.status !== 0) {
    process.stderr.write(`${c.red('error')}: ${t('submit.failed', { msg: ghR.stderr?.toString().trim() || ('exit ' + ghR.status) })}\n`);
    return ghR.status ?? 1;
  }
  const url = ghR.stdout?.toString().trim();
  process.stdout.write(`${c.green(t('submit.created', { url }))}\n`);
  return 0;
}

async function cmdLang(subcommand) {
  const target = subcommand;
  if (!target || !listLangs().includes(target)) {
    process.stderr.write(`${c.red('error')}: lang requires one of: ${listLangs().join(', ')}\n`);
    return 2;
  }
  await writeConfig({ lang: target });
  setLang(target);
  process.stdout.write(`${c.green(t('lang.switched', { lang: target }))}\n`);
  // Warn if the chosen locale doesn't fully cover the common strings.
  if (target === 'kar' && !hasNative('banner.menu.doctor', 'kar')) {
    process.stdout.write(`${c.yellow(t('lang.scaffold'))}\n`);
  }
  return 0;
}

function cmdPlaceholder(cmd, subcommand, positional) {
  const sub = subcommand ? ` ${subcommand}` : '';
  const args = positional.length ? ` ${positional.join(' ')}` : '';
  process.stdout.write(`${c.bold(t('placeholder.title', { cmd: `${cmd}${sub}${args}` }))}\n`);
  process.stdout.write(`${c.dim(t('placeholder.body'))}\n`);
  return 0;
}

function runScript(name, args, { flags, env = {} }) {
  const scriptPath = getScriptPath(name);
  if (flags.help) {
    process.stdout.write(`${c.bold(`vibe-code-tours ${name.replace(/\.sh$/, '')}`)} — spawns ${name}\n`);
    process.stdout.write(`Underlying script: ${c.dim(scriptPath)}\n`);
    process.stdout.write(`Forwarded args: ${args.length ? args.join(' ') : c.dim('(none)')}\n`);
    process.stdout.write(`Pass --help after the command (or directly to the script) for script-level usage.\n`);
    return 0;
  }
  return new Promise((resolve) => {
    const child = spawn('bash', [scriptPath, ...args], {
      stdio: 'inherit',
      env: { ...process.env, VCT_VERSION: VERSION, ...env },
    });
    child.on('exit', (code, signal) => {
      if (signal) {
        process.stderr.write(`${c.red('error')}: ${name} killed by signal ${signal}\n`);
        resolve(128);
        return;
      }
      resolve(code ?? 0);
    });
    child.on('error', (err) => {
      process.stderr.write(`${c.red('error')}: failed to spawn ${name}: ${err.message}\n`);
      resolve(127);
    });
  });
}

function hasBash() {
  if (process.platform === 'win32') {
    const r = spawnSync('bash', ['--version'], { stdio: 'ignore' });
    return r.status === 0;
  }
  return true;
}

function failNoBash() {
  process.stderr.write(`${c.red('error')}: ${t('windows.noBash')}\n`);
  return 127;
}

main()
  .then((code) => process.exit(code ?? 0))
  .catch((err) => {
    process.stderr.write(`${c.red('fatal')}: ${err.stack ?? err.message}\n`);
    process.exit(1);
  });
