// Read/write ~/.vct/config.json. Atomic-ish writes via rename. Zero deps.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const DEFAULT_CONFIG = Object.freeze({
  cohort: null,
  lang: 'en',
  github: null,
  telemetry_optin: false,
  createdAt: null,
  updatedAt: null,
});

export function getVctDir(home = os.homedir()) {
  return path.join(home, '.vct');
}

export function getConfigPath(home = os.homedir()) {
  return path.join(getVctDir(home), 'config.json');
}

export async function ensureVctDir(home = os.homedir()) {
  const dir = getVctDir(home);
  await fs.mkdir(dir, { recursive: true, mode: 0o755 });
  await fs.mkdir(path.join(dir, 'scripts'), { recursive: true, mode: 0o755 });
  return dir;
}

export async function readConfig(home = os.homedir()) {
  const file = getConfigPath(home);
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return { ...DEFAULT_CONFIG };
    }
    throw err;
  }
}

export async function writeConfig(patch, home = os.homedir()) {
  await ensureVctDir(home);
  const current = await readConfig(home);
  const now = new Date().toISOString();
  const next = {
    ...current,
    ...patch,
    createdAt: current.createdAt ?? now,
    updatedAt: now,
  };
  const file = getConfigPath(home);
  const tmp = `${file}.tmp-${process.pid}`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2) + '\n', { mode: 0o644 });
  await fs.rename(tmp, file);
  return next;
}

export { DEFAULT_CONFIG };
