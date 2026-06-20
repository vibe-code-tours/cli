#!/usr/bin/env node
// vibe-code-tours CLI — Phase 2 entry.
// Hand-rolled arg parser, no deps. Spawns the embedded bash scripts and
// renders bundled docs / FAQ / chapter content directly.

import { spawn, spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { createRequire } from 'node:module';

import { parse } from '../lib/parser.js';
import { setColorEnabled, detectColorSupport, c } from '../lib/colors.js';
import { setLang, t, listLangs, hasNative } from '../lib/i18n.js';
import { readConfig, writeConfig, getConfigPath } from '../lib/config.js';
import { materializeScripts, getScriptPath, hasScript, SCRIPT_FILES, materialize } from '../lib/scripts.js';
import { refreshAll } from '../lib/scripts-fetcher.js';
import { renderBanner, renderHelp } from '../lib/banner.js';
import { openUrl } from '../lib/open.js';
import { renderMarkdown } from '../lib/markdown.js';
import { getGuide, listGuides, categorize } from '../lib/guides.js';
import { normalizeChapter, listChapters, getChapter } from '../lib/chapters.js';
import { searchFaq, totalEntries as faqTotal } from '../lib/faq.js';
import { collectEnv, formatEnv } from '../lib/env.js';
import { ask, choose } from '../lib/prompt.js';
import { renderWhoami } from '../lib/whoami.js';
import { parseDoctorOutput, buildDoctorReport } from '../lib/doctor-json.js';
import { sendEvent, maybePromptForTelemetry } from '../lib/telemetry.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');
const VERSION = pkg.version;
const APPLY_BASE = 'https://vibecode.tours/apply';
const SPONSORS_URL = 'https://vibecode.tours/sponsors';

async function main() {
  const argv = process.argv.slice(2);
  const parsed = parse(argv);

  // doctor --json must emit ONLY JSON to stdout; suppress ANSI everywhere.
  const jsonMode = parsed.command === 'doctor' && !!parsed.flags.json;
  setColorEnabled(
    !jsonMode && detectColorSupport({ noColorFlag: !!parsed.flags.noColor }),
  );

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

  // doctor --json: skip script materialization noise; we still materialize
  // because doctor.sh needs to exist on disk, but suppress the dim notice.
  const suppressMaterializeNote = parsed.flags.quiet || jsonMode;

  let materialized;
  try {
    materialized = await materializeScripts();
  } catch (err) {
    process.stderr.write(`${c.red('error')}: failed to extract scripts: ${err.message}\n`);
    return 1;
  }
  if (!suppressMaterializeNote && materialized.written.length > 0) {
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
      if (flags.json) return cmdDoctorJson([...positional, ...rest], flags);
      if (!hasBash()) return failNoBash();
      return runScriptResolved('doctor.sh', [...positional, ...rest], { flags });
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
      return runScriptResolved('doctor.sh', [chapter, ...positional.slice(1), ...rest], { flags });
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
    case 'whoami':
      return cmdWhoami(flags);
    case 'sponsor':
      return cmdSponsor(flags);
    case 'reset':
      return cmdReset(flags);
    case 'sync':
      return cmdSync(flags);
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
  const code = await runScriptResolved('student-setup.sh', [...positional, ...rest], { flags });
  // First-run flow: on successful setup, ask once about telemetry. Silent on
  // non-TTY / --quiet. Errors are swallowed inside maybePromptForTelemetry.
  if (code === 0) {
    const decision = await maybePromptForTelemetry({
      askImpl: ask,
      quiet: !!flags.quiet,
    });
    if (decision === true && !flags.quiet) {
      process.stdout.write(`${c.dim(t('telemetry.optedIn'))}\n`);
    } else if (decision === false && !flags.quiet) {
      process.stdout.write(`${c.dim(t('telemetry.optedOut'))}\n`);
    }
  }
  return code;
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
  return runScriptResolved('api-setup.sh', [...positional, ...rest], { flags, env });
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
    return runScriptResolved(specific, [...positional.slice(1), ...rest], { flags });
  }
  // Fall back to doctor.sh ch-N for chapters without a dedicated script.
  if (!flags.quiet) process.stderr.write(`${c.yellow('note')}: ${t('check.notVendored', { id: norm.id })}\n`);
  return runScriptResolved('doctor.sh', [norm.id, ...positional.slice(1), ...rest], { flags });
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

async function cmdWhoami(_flags) {
  const text = await renderWhoami({ version: VERSION });
  process.stdout.write(text);
  return 0;
}

async function cmdSponsor(flags) {
  const result = openUrl(SPONSORS_URL, { dryRun: !!process.env.VCT_DRY_RUN });
  if (result.spawned) {
    if (!flags.quiet) process.stdout.write(`${t('sponsor.opening')}\n  ${c.underline(SPONSORS_URL)}\n`);
  } else {
    process.stdout.write(`${t('sponsor.fallback')}\n  ${c.underline(SPONSORS_URL)}\n`);
  }
  return 0;
}

async function cmdReset(flags) {
  const path = getConfigPath();
  // `--yes` skips the confirmation prompt (for CI / scripted teardown).
  if (!flags.yes) {
    const answer = await ask(t('reset.prompt', { path }), { defaultValue: 'N' });
    if (!answer || !/^y(es)?$/i.test(answer.trim())) {
      process.stdout.write(`${c.dim(t('reset.kept'))}\n`);
      return 0;
    }
  }
  try {
    await fs.unlink(path);
    process.stdout.write(`${c.green(t('reset.deleted', { path }))}\n`);
    return 0;
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      process.stdout.write(`${c.dim(t('reset.missing', { path }))}\n`);
      return 0;
    }
    process.stderr.write(`${c.red('error')}: ${t('reset.failed', { path, msg: err.message })}\n`);
    return 1;
  }
}

async function cmdDoctorJson(args, flags) {
  if (!hasBash()) {
    // For --json, emit a structured error rather than the EN-only fail message.
    process.stdout.write(
      JSON.stringify(
        { schema: 'vibe-code-tours/doctor@1', error: t('doctor.jsonNoBash'), exitCode: 127 },
        null,
        2,
      ) + '\n',
    );
    return 127;
  }
  // Force plain mode + skip self-update so the parser sees deterministic
  // output. The script also reacts to NO_COLOR=1 and non-TTY stdout.
  const scriptArgs = ['--plain', '--no-update', '--non-interactive', ...args];
  const captured = await captureScript('doctor.sh', scriptArgs, {
    env: { NO_COLOR: '1', DOCTOR_SKIP_UPDATE: '1' },
  });
  try {
    const parsed = parseDoctorOutput(captured.output);
    const report = buildDoctorReport({ exitCode: captured.code, parsed });
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    return captured.code;
  } catch (err) {
    process.stdout.write(
      JSON.stringify(
        {
          schema: 'vibe-code-tours/doctor@1',
          error: t('doctor.jsonFailed', { msg: err.message }),
          exitCode: captured.code,
        },
        null,
        2,
      ) + '\n',
    );
    return captured.code || 1;
  }
}

function cmdPlaceholder(cmd, subcommand, positional) {
  const sub = subcommand ? ` ${subcommand}` : '';
  const args = positional.length ? ` ${positional.join(' ')}` : '';
  process.stdout.write(`${c.bold(t('placeholder.title', { cmd: `${cmd}${sub}${args}` }))}\n`);
  process.stdout.write(`${c.dim(t('placeholder.body'))}\n`);
  return 0;
}

async function captureScript(name, args, { env = {} } = {}) {
  let scriptPath;
  try {
    const resolved = await materialize(name, {});
    scriptPath = resolved.path;
  } catch {
    scriptPath = getScriptPath(name);
  }
  return new Promise((resolve) => {
    let out = '';
    const child = spawn('bash', [scriptPath, ...args], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, VCT_VERSION: VERSION, ...env },
    });
    child.stdout.on('data', (b) => (out += b.toString('utf8')));
    child.stderr.on('data', (b) => (out += b.toString('utf8')));
    child.on('exit', (code) => resolve({ output: out, code: code ?? 0 }));
    child.on('error', (err) => resolve({ output: out + `\n[spawn-error] ${err.message}\n`, code: 127 }));
  });
}

async function cmdSync(flags) {
  process.stdout.write(`${c.dim(t('sync.starting'))}\n`);
  let results;
  try {
    results = await refreshAll({ offline: !!flags.offline });
  } catch (err) {
    process.stderr.write(`${c.red('error')}: ${t('sync.failed', { msg: err.message })}\n`);
    return 1;
  }
  for (const r of results) {
    if (!r.ok) {
      process.stdout.write(`  ${c.red('x')} ${r.name} — ${r.error || r.source}\n`);
      continue;
    }
    if (r.source === 'embedded') {
      // Offline run / upstream unreachable — embedded is the desired output.
      process.stdout.write(`  ${c.dim('·')} ${r.name} (embedded)\n`);
      continue;
    }
    if (r.changed) {
      const before = (r.before || '(cold)').slice(0, 12);
      const after = (r.after || '?').slice(0, 12);
      process.stdout.write(`  ${c.green('+')} ${t('sync.fresh', { name: r.name, before, after })}\n`);
    } else {
      process.stdout.write(`  ${c.dim('·')} ${t('sync.unchanged', { name: r.name })}\n`);
    }
  }
  return results.some((r) => !r.ok) ? 1 : 0;
}

// Resolve a script path via materialize() (fetches upstream, falls back to embedded),
// then spawn it. Single wrapper used by every command that runs a bash script.
async function runScriptResolved(name, args, opts) {
  const flags = opts?.flags || {};
  let resolved;
  try {
    resolved = await materialize(name, { offline: !!flags.offline, refresh: !!flags.refresh });
  } catch (err) {
    process.stderr.write(`${c.red('error')}: ${t('script.missing', { name })} (${err.message})\n`);
    return 127;
  }
  return runScript(name, args, { ...opts, scriptPath: resolved.path });
}

function runScript(name, args, { flags, env = {}, scriptPath }) {
  scriptPath = scriptPath || getScriptPath(name);
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

async function runWithTelemetry() {
  const argv = process.argv.slice(2);
  // Parse once just to pluck command name for the telemetry event. main()
  // re-parses internally. This is intentional to keep main() simple.
  let cmdName = 'banner';
  try {
    const peek = (await import('../lib/parser.js')).parse(argv);
    if (peek && peek.command) cmdName = peek.command;
  } catch {}

  let code = 0;
  try {
    code = await main();
  } catch (err) {
    process.stderr.write(`${c.red('fatal')}: ${err.stack ?? err.message}\n`);
    code = 1;
  }

  // Best-effort: fire opt-in telemetry. NEVER blocks > 1s, NEVER throws.
  try {
    await sendEvent({ command: cmdName, exit_code: code }).catch(() => {});
  } catch {}

  process.exit(code ?? 0);
}

runWithTelemetry();
