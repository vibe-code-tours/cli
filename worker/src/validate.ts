// Pure validator for telemetry event payloads.
// No I/O, no env — easy to unit-test.

export type TelemetryEvent = {
  cohort: number;
  command: string;
  exit_code: number;
  ts: number;
  cli_version: string;
};

export type ValidateResult =
  | { ok: true; value: TelemetryEvent }
  | { ok: false; error: string };

// Whitelist of commands we accept. Anything else is dropped silently to
// avoid free-text injection into KV keys / log lines.
export const ALLOWED_COMMANDS = new Set([
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
]);

const MAX_VERSION_LEN = 32;
// Loose semver-ish: digits + dots + optional -prerelease.
const VERSION_RE = /^[0-9]+(\.[0-9]+){0,3}(-[0-9A-Za-z.-]+)?$/;

export function validateEvent(input: unknown): ValidateResult {
  if (input == null || typeof input !== 'object') {
    return { ok: false, error: 'body must be a JSON object' };
  }
  const obj = input as Record<string, unknown>;

  const cohort = obj.cohort;
  if (typeof cohort !== 'number' || !Number.isInteger(cohort) || cohort < 0 || cohort > 9999) {
    return { ok: false, error: 'cohort must be a non-negative integer' };
  }

  const command = obj.command;
  if (typeof command !== 'string' || !ALLOWED_COMMANDS.has(command)) {
    return { ok: false, error: 'command not in allowlist' };
  }

  const exit_code = obj.exit_code;
  if (typeof exit_code !== 'number' || !Number.isInteger(exit_code) || exit_code < 0 || exit_code > 255) {
    return { ok: false, error: 'exit_code must be an integer 0..255' };
  }

  const ts = obj.ts;
  if (typeof ts !== 'number' || !Number.isFinite(ts) || ts < 0) {
    return { ok: false, error: 'ts must be a positive number (ms since epoch)' };
  }

  const cli_version = obj.cli_version;
  if (typeof cli_version !== 'string' || cli_version.length === 0 || cli_version.length > MAX_VERSION_LEN) {
    return { ok: false, error: 'cli_version missing or too long' };
  }
  if (!VERSION_RE.test(cli_version)) {
    return { ok: false, error: 'cli_version not semver-ish' };
  }

  return {
    ok: true,
    value: { cohort, command, exit_code, ts, cli_version },
  };
}
