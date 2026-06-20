// Aggregate counters maintained in KV. Cheap, eventually-consistent.
// All counters are best-effort; we do not block event ingest on counter
// failures.

import type { KVLike } from './rate-limit.js';
import type { TelemetryEvent } from './validate.js';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function weekBucket(now = Date.now()): string {
  return String(Math.floor(now / WEEK_MS));
}

export async function incrementCounters(
  kv: KVLike,
  ev: TelemetryEvent,
  now = Date.now(),
): Promise<void> {
  const week = weekBucket(now);
  const updates: Promise<unknown>[] = [];

  // Per-command counter.
  updates.push(bump(kv, `cnt:cmd:${ev.command}`));

  // Setups-this-week (only count `setup` with exit 0).
  if (ev.command === 'setup' && ev.exit_code === 0) {
    updates.push(bump(kv, `cnt:week:${week}:setups`));
  }

  // Per-cohort total runs.
  updates.push(bump(kv, `cnt:cohort:${ev.cohort}:runs`));

  await Promise.allSettled(updates);
}

async function bump(kv: KVLike, key: string): Promise<void> {
  const raw = await kv.get(key);
  const n = raw ? Number.parseInt(raw, 10) || 0 : 0;
  // No TTL — keep aggregate counters indefinitely. Weekly buckets are
  // already time-scoped via the key.
  await kv.put(key, String(n + 1));
}

export type StatsResponse = {
  setups_this_week: number;
  top_commands: Array<{ command: string; count: number }>;
  total_cohort_2_runs: number;
};

const KNOWN_COMMANDS = [
  'doctor',
  'setup',
  'api-setup',
  'check',
  'guide',
  'verify',
  'guides',
  'faq',
  'env',
  'submit',
  'lang',
  'skill',
  'agent',
  'mcp',
  'whoami',
  'reset',
  'first-run',
];

export async function loadStats(kv: KVLike, now = Date.now()): Promise<StatsResponse> {
  const week = weekBucket(now);
  const [setupsRaw, cohort2Raw, ...cmdRaws] = await Promise.all([
    kv.get(`cnt:week:${week}:setups`),
    kv.get('cnt:cohort:2:runs'),
    ...KNOWN_COMMANDS.map((c) => kv.get(`cnt:cmd:${c}`)),
  ]);
  const pairs: Array<{ command: string; count: number }> = [];
  KNOWN_COMMANDS.forEach((cmd, i) => {
    const v = cmdRaws[i];
    const n = v ? Number.parseInt(v, 10) || 0 : 0;
    if (n > 0) pairs.push({ command: cmd, count: n });
  });
  pairs.sort((a, b) => b.count - a.count);
  return {
    setups_this_week: setupsRaw ? Number.parseInt(setupsRaw, 10) || 0 : 0,
    top_commands: pairs.slice(0, 10),
    total_cohort_2_runs: cohort2Raw ? Number.parseInt(cohort2Raw, 10) || 0 : 0,
  };
}
