# vibe-code-tours

[![CI](https://github.com/vibe-code-tours/cli/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/vibe-code-tours/cli/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/vibe-code-tours.svg)](https://www.npmjs.com/package/vibe-code-tours)
[![license: MIT](https://img.shields.io/npm/l/vibe-code-tours.svg)](./LICENSE)

`npx vibe-code-tours` — the official student + instructor CLI for the
[Vibe Code Tours](https://vibecode.tours) AI-paired coding bootcamp.

Zero runtime deps. ESM. Node 22+. Bash required (WSL on Windows).

## Install / run

```bash
# One-shot
npx vibe-code-tours

# Persistent
npm i -g vibe-code-tours
vibe-code-tours --help
```

## Commands

| Command                       | What it does                                                   |
|-------------------------------|----------------------------------------------------------------|
| (no command)                  | Print the amber banner + cohort status + menu                  |
| `doctor`                      | Chapter-aware environment diagnostic (`doctor.sh`)             |
| `setup [--dry-run]`           | Fork the bootcamp repos + scaffold your dev box                |
| `api-setup [--dry-run]`       | Interactive provider picker → wire Claude / opencode           |
| `check <ch-N>`                | Verify chapter readiness — alias for `doctor ch-N`             |
| `guide <ch-N\|N>`             | Render the bundled bilingual chapter guide in the terminal     |
| `verify <ch-N\|N>`            | Run the per-chapter `check-chN.sh` (falls back to `doctor.sh`) |
| `guides ls`                   | List bundled docs grouped by category (blog / cheatsheet / TLDR) |
| `guides <slug>`               | Render a bundled doc (locale-aware via `--lang`)               |
| `faq [query]`                 | Search the bundled FAQ + Discord Q&A; prompts when no query    |
| `env`                         | Read-only snapshot: providers, model env vars, tool versions   |
| `submit <ch-N>`               | `git push` + `gh pr create` with a chapter-aware PR body       |
| `lang my\|en\|kar`            | Switch + persist the CLI language                              |
| `skill add\|list <name>`      | Phase 3 scaffold — prints the wiring TODO                      |
| `agent add\|list <name>`      | Phase 3 scaffold — prints the wiring TODO                      |
| `mcp add\|list <name>`        | Phase 3 scaffold — prints the wiring TODO                      |
| `--cohort N --free`           | Persist cohort choice + open the free-seat apply URL           |

### Global flags

| Flag                  | Meaning                                              |
|-----------------------|------------------------------------------------------|
| `--cohort N`          | Select & persist cohort to `~/.vct/config.json`      |
| `--free`              | With `--cohort`, open `vibecode.tours/apply?...`     |
| `--lang en\|my\|kar`  | UI language (en + my are mentor-reviewed; kar is a scaffold) |
| `--dry-run`           | On `setup` / `api-setup`: show what would happen, no spawn |
| `--no-color`          | Disable ANSI; same as `NO_COLOR=1`                   |
| `--quiet` / `-q`      | Suppress banner + non-essential stderr               |
| `--version` / `-v`    | Print version and exit                               |
| `--help` / `-h`       | Show help                                            |

Pass-through to the underlying bash script: anything after `--` is
forwarded verbatim. Example: `vibe-code-tours doctor -- --ci`.

### Examples

```bash
# Sanity-check tools + providers detected on this machine.
vibe-code-tours env

# Read chapter 1 in your terminal.
vibe-code-tours guide ch-1

# Run the chapter 1 checker (`check-ch1.sh`).
vibe-code-tours verify 1

# Ask the FAQ a question.
vibe-code-tours faq "claude code login"

# Switch the UI to Burmese.
vibe-code-tours lang my

# Open a PR for your chapter-1 submission.
vibe-code-tours submit ch-1
```

## Where things live

```
~/.vct/
├── config.json        # { cohort, lang, github, provider, telemetry_optin }
└── scripts/
    ├── doctor.sh
    ├── student-setup.sh
    ├── api-setup.sh
    └── check-chN.sh
```

Bundled docs (`guides/`, `chapters/`, `faq/`) live **inside the npm
package** and are read straight out of `lib/embedded.gen.js` — no
network needed.

Scripts are vendored from the curriculum repo (see
`scripts/NOTICE.md`), bundled into the CLI, and re-extracted whenever
the bundled SHA-256 differs from the on-disk copy.

## Localization

| Locale | Status                                                         |
|--------|----------------------------------------------------------------|
| `en`   | Canonical — every key                                          |
| `my`   | Mentor-reviewed for every CLI surface key                      |
| `kar`  | Scaffolded — most strings fall back to `en` until reviewed     |

Switching to `kar` prints a one-line scaffold warning. PRs welcome
in `lib/i18n.js`.

## Cross-platform

| Platform              | Status                                                    |
|-----------------------|-----------------------------------------------------------|
| Linux                 | Tier-1                                                    |
| macOS                 | Tier-1                                                    |
| Windows + WSL         | Tier-1 (run from inside Ubuntu)                           |
| Native Windows        | Detects missing `bash`, prints WSL install instructions   |

## Develop

```bash
# Generate lib/embedded.gen.js from scripts/{*.sh,guides,chapters,faq}.
npm run embed

# Bundle to dist/cli.mjs (used by npm publish).
npm run build

# Run the unbundled CLI for quick iteration.
node bin/vibe-code-tours.mjs --help

# Test
npm test
```

Bundle target: **< 250 KiB** for `dist/cli.mjs`. Most of that is
bundled docs / FAQ; if you add a large markdown file under `scripts/`,
re-run `npm run build` and check the printed size.

## Publishing

Releases are automated by [`.github/workflows/release.yml`](./.github/workflows/release.yml).
Tag-push the right version and CI does the rest.

### One-time setup (repo admin)

1. Mint an npm **automation** token with publish access to
   `vibe-code-tours` (npm → *Access Tokens* → *Generate New Token* →
   *Automation*). Org tokens scoped to the package work too.
2. Add it to the repo as a secret:
   - GitHub → **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `NPM_TOKEN`
   - Value: the token from step 1
3. (Already configured) `id-token: write` permission is enabled in
   the release workflow so `npm publish --provenance` can mint a
   sigstore attestation.

> Never commit the token. The workflow reads it from `secrets.NPM_TOKEN`
> only; nothing else needs it.

### Cutting a release

```bash
# 1. Bump version + add a CHANGELOG section.
#    The CHANGELOG heading must use Keep-a-Changelog style:
#      ## [X.Y.Z] — YYYY-MM-DD
npm version <patch|minor|major>   # also creates the vX.Y.Z git tag

# 2. Push commit + tag.
git push origin main --follow-tags
```

When the `vX.Y.Z` tag lands on GitHub:

1. CI runs tests + build (see [`ci.yml`](./.github/workflows/ci.yml)).
2. `release.yml` verifies tag ↔ `package.json` agree, checks npm for
   an existing release (skips publish if already there — idempotent),
   runs `npm publish --provenance --access public`, then opens a
   GitHub Release with the matching CHANGELOG section as the body
   (extracted by [`scripts/extract-changelog.mjs`](./scripts/extract-changelog.mjs)).

To re-extract release notes locally for a given version:

```bash
node scripts/extract-changelog.mjs 0.2.0
```

## Versioning + dist-tags

Semver. Three npm dist-tags:

- `latest` — stable release for the active cohort.
- `next` — pre-release.
- `cohort-N` — **frozen** build for cohort N; never moved, so a
  cohort-2 student who runs `npm i -g vibe-code-tours@cohort-2` next
  year still gets the exact build their cohort shipped with.

Release tags in git mirror dist-tags: `v0.1.0`, `cohort-2`, etc.

## License

MIT. See [`LICENSE`](./LICENSE).
