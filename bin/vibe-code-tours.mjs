#!/usr/bin/env node
// vibe-code-tours CLI — Phase 1 entry.
// Hand-rolled arg parser, no deps. Spawns the embedded bash scripts.

import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

import { parse } from '../lib/parser.js';
import { setColorEnabled, detectColorSupport, c } from '../lib/colors.js';
import { setLang, t } from '../lib/i18n.js';
import { readConfig, writeConfig } from '../lib/config.js';
import { materializeScripts, getScriptPath } from '../lib/scripts.js';
import { renderBanner, renderHelp } from '../lib/banner.js';
import { openUrl } from '../lib/open.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');
const VERSION = pkg.version;
const APPLY_BASE = 'https://vibecode.tours/apply';

async function main() {
  const argv = process.argv.slice(2);
  const parsed = parse(argv);

  // Wire color + lang ASAP.
  setColorEnabled(detectColorSupport({ noColorFlag: !!parsed.flags.noColor }));
  if (parsed.flags.lang) setLang(parsed.flags.lang);

  if (parsed.flags.version) {
    process.stdout.write(`${VERSION}\n`);
    return 0;
  }

  if (parsed.flags.help && !parsed.command) {
    process.stdout.write(renderHelp({ version: VERSION }) + '\n');
    return 0;
  }

  // Persist cohort change up-front so subsequent commands see it.
  let config = await readConfig();
  if (parsed.flags.cohort != null) {
    const n = Number(parsed.flags.cohort);
    if (!Number.isFinite(n) || n < 1) {
      process.stderr.write(`${c.red('error')}: --cohort must be a positive integer\n`);
      return 2;
    }
    config = await writeConfig({ cohort: n });
  }

  // First-run + every-run: materialize scripts to ~/.vct/scripts/.
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

  // No command → banner.
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

  // Command help: `<cmd> --help` → describe the script and pass-through.
  const code = await dispatch(parsed, config);
  return code;
}

async function dispatch(parsed) {
  const { command, positional, flags, rest } = parsed;

  // Validate bash availability cross-platform.
  if (!hasBash()) {
    process.stderr.write(`${c.red('error')}: ${t('windows.noBash')}\n`);
    return 127;
  }

  switch (command) {
    case 'doctor':
      return runScript('doctor.sh', [...positional, ...rest], { flags });
    case 'setup':
      return runScript('student-setup.sh', [...positional, ...rest], { flags });
    case 'api-setup':
      return runScript('api-setup.sh', [...positional, ...rest], { flags });
    case 'check': {
      const chapter = positional[0];
      if (!chapter) {
        process.stderr.write(`${c.red('error')}: ${t('check.missingArg')}\n`);
        return 2;
      }
      // `check ch-1` historically routed via check-ch1.sh shim, but the unified
      // doctor.sh accepts the chapter id directly. Prefer that.
      return runScript('doctor.sh', [chapter, ...positional.slice(1), ...rest], { flags });
    }
    default:
      process.stderr.write(`${c.red('error')}: unknown command: ${command}\n`);
      process.stderr.write(renderHelp({ version: VERSION }) + '\n');
      return 2;
  }
}

function runScript(name, args, { flags }) {
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
      env: { ...process.env, VCT_VERSION: VERSION },
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

main()
  .then((code) => process.exit(code ?? 0))
  .catch((err) => {
    process.stderr.write(`${c.red('fatal')}: ${err.stack ?? err.message}\n`);
    process.exit(1);
  });
