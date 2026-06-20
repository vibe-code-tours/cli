#!/usr/bin/env node
// Extract a single version's section from CHANGELOG.md (Keep a Changelog format).
//
// Usage:   node scripts/extract-changelog.mjs <version> [path/to/CHANGELOG.md]
// Example: node scripts/extract-changelog.mjs 0.2.0
//
// Exit codes:
//   0 — section found, body written to stdout (without the heading line)
//   1 — version not found, usage error, or file not readable

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CHANGELOG = path.resolve(HERE, '..', 'CHANGELOG.md');

/**
 * Extract the body of the section for `version` from `text`.
 *
 * Recognized heading shapes (case-insensitive on the version):
 *   ## [0.2.0] — 2026-06-20
 *   ## [0.2.0] - 2026-06-20
 *   ## 0.2.0 — 2026-06-20
 *   ## [v0.2.0]
 *   ## 0.2.0
 *
 * Returns the body between this section's heading and the next `## ` heading
 * (or EOF), trimmed of leading/trailing blank lines. Returns `null` when the
 * version is not present.
 */
export function extractChangelogSection(text, version) {
  if (typeof text !== 'string' || typeof version !== 'string' || !version) {
    return null;
  }
  // Accept v-prefixed input ('v0.2.0') but match against the bare version.
  const wanted = version.replace(/^v/i, '').trim();
  if (!wanted) return null;

  const lines = text.split(/\r?\n/);
  const headingRe = /^##\s+(.*\S)\s*$/;

  let start = -1;
  let end = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(headingRe);
    if (!m) continue;

    if (start === -1) {
      if (headingMatchesVersion(m[1], wanted)) {
        start = i + 1;
      }
    } else {
      // First `## ` heading after our section — boundary.
      end = i;
      break;
    }
  }

  if (start === -1) return null;

  const body = lines.slice(start, end).join('\n');
  return trimBlankEdges(body);
}

function headingMatchesVersion(headingText, wanted) {
  // Pull the first bracketed token or the first whitespace-delimited token.
  // '[0.2.0] — 2026-06-20'  → '0.2.0'
  // '0.2.0 — 2026-06-20'    → '0.2.0'
  // '[v0.2.0]'              → 'v0.2.0' → '0.2.0'
  const bracket = headingText.match(/^\[([^\]]+)\]/);
  const token = (bracket ? bracket[1] : headingText.split(/\s+/)[0] || '').trim();
  const normalized = token.replace(/^v/i, '');
  return normalized.toLowerCase() === wanted.toLowerCase();
}

function trimBlankEdges(text) {
  return text.replace(/^(?:[ \t]*\r?\n)+/, '').replace(/(?:\r?\n[ \t]*)+$/, '');
}

async function main(argv) {
  const args = argv.slice(2);
  if (args.length < 1 || args[0] === '--help' || args[0] === '-h') {
    process.stderr.write(
      'Usage: extract-changelog.mjs <version> [changelog-path]\n' +
        'Example: extract-changelog.mjs 0.2.0\n',
    );
    process.exit(args.length < 1 ? 1 : 0);
  }
  const [version, changelogPath] = args;
  const file = changelogPath ? path.resolve(changelogPath) : DEFAULT_CHANGELOG;

  let text;
  try {
    text = await fs.readFile(file, 'utf8');
  } catch (err) {
    process.stderr.write(`extract-changelog: cannot read ${file}: ${err.message}\n`);
    process.exit(1);
  }

  const body = extractChangelogSection(text, version);
  if (body === null) {
    process.stderr.write(
      `extract-changelog: no section for version "${version}" in ${file}\n`,
    );
    process.exit(1);
  }

  // Newline terminator so the output composes cleanly with `>` redirection.
  process.stdout.write(body + '\n');
}

// Run when invoked directly (`node scripts/extract-changelog.mjs ...`).
const isDirect = (() => {
  try {
    return fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '');
  } catch {
    return false;
  }
})();

if (isDirect) {
  main(process.argv).catch((err) => {
    process.stderr.write(`extract-changelog: ${err.stack || err.message}\n`);
    process.exit(1);
  });
}
