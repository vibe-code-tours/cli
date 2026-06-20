// Read-only inspector for the user's AI / shell environment.
// Detects providers, model env vars, gh/git/bash presence. No writes.

import { spawnSync } from 'node:child_process';
import { promises as fs, statSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

function which(bin) {
  // Walk PATH manually — `command -v` is a shell builtin and `which` is
  // not guaranteed on every OS.
  const exts = process.platform === 'win32'
    ? (process.env.PATHEXT?.split(';') ?? ['.EXE', '.CMD', '.BAT'])
    : [''];
  const sep = process.platform === 'win32' ? ';' : ':';
  for (const dir of (process.env.PATH ?? '').split(sep)) {
    if (!dir) continue;
    for (const ext of exts) {
      const candidate = path.join(dir, bin + ext);
      try {
        const st = statSync(candidate);
        if (st.isFile()) return candidate;
      } catch {
        // ignore
      }
    }
  }
  return null;
}

function ver(bin, args = ['--version']) {
  const path_ = which(bin);
  if (!path_) return null;
  const r = spawnSync(path_, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  const out = (r.stdout?.toString() || r.stderr?.toString() || '').split('\n')[0].trim();
  return { path: path_, version: out || null };
}

function envSet(name) {
  return process.env[name] != null && String(process.env[name]).length > 0;
}

export async function collectEnv(home = os.homedir()) {
  const providers = [];
  if (envSet('ANTHROPIC_API_KEY')) providers.push({ id: 'anthropic', label: 'Claude API direct', via: 'ANTHROPIC_API_KEY' });
  if (envSet('ANTHROPIC_AUTH_TOKEN')) providers.push({ id: 'anthropic-oauth', label: 'Anthropic OAuth', via: 'ANTHROPIC_AUTH_TOKEN' });
  if (envSet('LITELLM_API_BASE') || envSet('LITELLM_PROXY_URL')) {
    providers.push({ id: 'litellm', label: 'Bootcamp LiteLLM proxy', via: 'LITELLM_API_BASE' });
  }
  if (envSet('OPENAI_API_KEY')) providers.push({ id: 'openai', label: 'OpenAI', via: 'OPENAI_API_KEY' });
  if (envSet('OPENROUTER_API_KEY')) providers.push({ id: 'openrouter', label: 'OpenRouter', via: 'OPENROUTER_API_KEY' });

  const models = {};
  for (const k of ['ANTHROPIC_MODEL', 'ANTHROPIC_SMALL_FAST_MODEL', 'CLAUDE_MODEL', 'OPENCODE_MODEL']) {
    if (envSet(k)) models[k] = process.env[k];
  }

  const tools = {};
  tools.bash = ver('bash');
  tools.node = ver('node');
  tools.git = ver('git');
  tools.gh = ver('gh');
  tools.claude = ver('claude');
  tools.opencode = ver('opencode');

  let vct = null;
  try {
    const raw = await fs.readFile(path.join(home, '.vct', 'config.json'), 'utf8');
    vct = JSON.parse(raw);
  } catch (err) {
    vct = err.code === 'ENOENT' ? null : { error: err.message };
  }

  let hasClaudeSettings = false;
  try {
    await fs.stat(path.join(home, '.claude', 'settings.json'));
    hasClaudeSettings = true;
  } catch {
    // ignore
  }

  return {
    providers,
    models,
    tools,
    vct,
    hasClaudeSettings,
    platform: { os: process.platform, arch: process.arch, node: process.version },
  };
}

export function formatEnv(snapshot, { c } = { c: null }) {
  const dim = (s) => (c?.dim ? c.dim(s) : s);
  const bold = (s) => (c?.bold ? c.bold(s) : s);
  const green = (s) => (c?.green ? c.green(s) : s);
  const red = (s) => (c?.red ? c.red(s) : s);
  const yellow = (s) => (c?.yellow ? c.yellow(s) : s);

  const L = [];
  L.push(bold('Platform') + dim(' — ') + `${snapshot.platform.os}/${snapshot.platform.arch} · node ${snapshot.platform.node}`);
  L.push('');
  L.push(bold('AI providers detected:'));
  if (snapshot.providers.length === 0) {
    L.push('  ' + red('none') + dim(' — run `vibe-code-tours api-setup` to wire one'));
  } else {
    for (const p of snapshot.providers) {
      L.push(`  ${green('✓')} ${p.label} ${dim('(' + p.via + ')')}`);
    }
  }
  L.push('');
  L.push(bold('Model env vars:'));
  const modelKeys = Object.keys(snapshot.models);
  if (modelKeys.length === 0) {
    L.push('  ' + dim('(none set)'));
  } else {
    for (const k of modelKeys) L.push(`  ${k}=${snapshot.models[k]}`);
  }
  L.push('');
  L.push(bold('Tools:'));
  for (const [k, v] of Object.entries(snapshot.tools)) {
    if (!v) L.push(`  ${red('✗')} ${k} ${dim('(missing)')}`);
    else L.push(`  ${green('✓')} ${k} ${dim(v.version || v.path || '')}`);
  }
  L.push('');
  L.push(bold('vibe-code-tours config:'));
  if (!snapshot.vct) L.push('  ' + dim('(no ~/.vct/config.json yet)'));
  else if (snapshot.vct.error) L.push('  ' + red('error: ') + snapshot.vct.error);
  else {
    L.push(`  cohort  ${snapshot.vct.cohort ?? dim('(unset)')}`);
    L.push(`  lang    ${snapshot.vct.lang ?? 'en'}`);
    L.push(`  github  ${snapshot.vct.github ?? dim('(unset)')}`);
    if (snapshot.vct.provider) L.push(`  provider ${snapshot.vct.provider}`);
  }
  L.push('');
  L.push(bold('Claude Code config:'));
  L.push(snapshot.hasClaudeSettings
    ? '  ' + green('✓') + ' ~/.claude/settings.json present'
    : '  ' + yellow('!') + ' ~/.claude/settings.json missing (run `claude` once to initialize)');
  return L.join('\n');
}
