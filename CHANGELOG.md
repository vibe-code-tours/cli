# Changelog

All notable changes to `vibe-code-tours` are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project uses [semantic versioning](https://semver.org/) plus dist-tags:

- `latest` — current stable release for the active cohort.
- `next` — pre-release candidates.
- `cohort-N` — pinned release shipped with cohort N; held forever so
  students of that cohort always get a reproducible build.

## [Unreleased]

### Added

- **Live upstream sync for vendored scripts** — `doctor.sh`, `student-setup.sh`,
  `api-setup.sh`, and `check-ch1.sh` are now fetched at runtime from
  `vibe-code-tours/vibecode-setup@main` and cached for 24h under
  `~/.vct/cache/`. The embedded snapshot in the npm package is the
  fallback when offline / upstream is unreachable.
- New top-level command `sync` — force-refreshes the cache for all four
  scripts and prints the before/after sha-256 prefix per file.
- New global flags:
  - `--offline` — skip the network and use the embedded fallback.
  - `--refresh` — clear `~/.vct/cache/<name>` then refetch on the next run.
- New module `lib/scripts-fetcher.js` (zero deps) — implements ETag-aware
  fetch with 5s timeout per file, atomic cache writes, and a stale-cache
  preference over embedded when upstream momentarily fails.
- GitHub Action `.github/workflows/sync-upstream.yml` — nightly check
  that opens a PR when upstream scripts diverge from the embedded snapshot.

### Tests

- `tests/scripts-fetcher.test.mjs` — cold cache fetch, fresh cache hit,
  stale revalidate (304 + 200), network failure → embedded fallback,
  warm-cache + network failure → keep stale, `--offline` short circuit,
  `--refresh` cache clear.
- `tests/parser.test.mjs` — recognizes `--offline`, `--refresh`, and
  the `sync` command.

## [0.5.0]

### Added

- **ch-5 + ch-6 self-checks** — `doctor.sh ch-5` (Skill + Subagent in the personal
  repo, a tech-stack slide deck, one feedback file, live URL) and `doctor.sh ch-6`
  (closed-issue links, LICENSE, README, analytics, >=3 updated screenshots, public
  live URL, gallery slides). Vendored `doctor.sh` re-synced to `vibecode-setup`.

## [0.4.0]

### Added

- **ch-4 self-check** — `doctor.sh ch-4` validates the chapter-4 personal
  project: team-repo `ch-4/<you>/report.md` (committed by you), personal repo
  owner + `LICENSE` file, a live/download URL, >=3 screenshots that exist in
  the repo, and a product-intro slide deck. Vendored `doctor.sh` synced to
  `vibecode-setup` `2026-06-23a`.

## [0.3.0] — 2026-06-20

### Added

- New commands:
  - `whoami` — print the saved `~/.vct/config.json` (cohort, lang,
    GitHub handle, AI provider, telemetry opt-in) along with the
    embedded scripts bundle id and CLI version. Exits 0 even when
    no config has been written yet.
  - `sponsor` — open https://vibecode.tours/sponsors via the
    cross-platform URL opener; in headless / no-DISPLAY environments,
    falls back to printing the URL.
  - `reset [--yes]` — interactively confirms then wipes
    `~/.vct/config.json`. `--yes` skips the prompt for CI use.
- New flags:
  - `--json` on `doctor` — captures `doctor.sh` output, parses well-
    known tool status lines and section headers, and emits a
    `vibe-code-tours/doctor@1` JSON payload to stdout (no ANSI).
  - `--yes` / `-y` — used by `reset` to bypass the confirmation prompt.
- `lib/whoami.js`, `lib/doctor-json.js` — new helpers behind the
  `whoami` and `doctor --json` commands. Zero new dependencies.
- Bilingual labels (EN + MY) for the new commands; `kar` falls back
  to EN until the locale is filled in.
- **Opt-in telemetry pipeline** — separate Cloudflare Worker
  (`worker/`) accepts `POST /api/cli-telemetry/event` and exposes
  `GET /api/cli-telemetry/stats`. CLI side (`lib/telemetry.js`) is
  fully opt-in, best-effort, 1s timeout, errors swallowed.
  Payload is exactly `{ cohort, command, exit_code, ts, cli_version }`.
  No PII, no IPs retained server-side. First-run prompt fires once
  after a successful `setup`. Disable anytime via `reset` or by
  editing `~/.vct/config.json`.

### Changed

- `npm run build` now passes `--minify` to esbuild so the bundled
  CLI stays under 260 KiB despite the new commands + locale strings.
  Source maps unchanged; runtime behavior is byte-for-byte identical.

### Tests

- `tests/parser.test.mjs` — recognizes `whoami`, `sponsor`, `reset`,
  `--json`, and `--yes` / `-y`.
- `tests/whoami.test.mjs` — renders gracefully with no config and
  with a fully populated config (stubs `$HOME`).
- `tests/reset.test.mjs` — `reset --yes` deletes `~/.vct/config.json`
  and exits cleanly when the file is missing.
- `tests/telemetry.test.mjs` — opt-out path is silent; opt-in path
  POSTs the event; all errors (timeouts, network) are swallowed.
- `worker/tests/{validate,rate-limit}.test.ts` — validator allowlist,
  out-of-range rejects, KV-backed hourly rate limiter behaviour.

## [0.2.0] — 2026-06-20

### Added

- New commands:
  - `guide <ch-N|N>` — render the bundled bilingual chapter guide in
    the terminal (in-house markdown→ANSI renderer, no `marked` dep).
  - `verify <ch-N|N>` — run the per-chapter `check-chN.sh`. Falls back
    to `doctor.sh ch-N` when the dedicated checker is not yet vendored.
  - `guides ls | <slug>` — list or render bundled docs by category
    (blog, cheatsheet, TLDR). Locale-aware: prefers `<slug>-<lang>.md`.
  - `faq [query]` — case-insensitive token-overlap search over
    `FAQ.md` + curated `qa-pairs.jsonl`. Interactive prompt when no
    query is given.
  - `env` — read-only snapshot of detected AI providers, model env
    vars, tool versions, and `~/.vct/config.json` state.
  - `submit <ch-N>` — `git push` + `gh pr create` with a
    chapter-aware PR body (`Cohort / Chapter / Builder`).
  - `lang my|en|kar` — persist the CLI language to `~/.vct/config.json`.
  - `skill add|list`, `agent add|list`, `mcp add|list` — Phase 3
    scaffolds; print a clear "wiring in Phase 3" message and exit 0.
- New flags:
  - `--dry-run` — on `setup` / `api-setup`, prints what would happen
    without spawning the shell scripts.
- `api-setup` now starts with an interactive provider picker
  (Claude direct / Anthropic OAuth / LiteLLM proxy / Skip) and
  persists the choice as `provider` in `~/.vct/config.json`. Skipped
  on `--quiet` or non-TTY.
- Bundled docs:
  - 8 guides under `scripts/guides/` (TLDR, cheatsheet, three blog
    posts; EN always, MY for the smaller items).
  - 2 chapter content files under `scripts/chapters/` (ch-0, ch-1
    English; later chapters fall through to the curriculum URL).
  - `FAQ.md` + resolved `qa-pairs.jsonl` (69 entries) under
    `scripts/faq/`.
- Karen S'gaw (`kar`) locale scaffold in `lib/i18n.js`. Most keys
  still English-fallback; covered keys are marked `TODO(kar)` for
  mentor review. `lang.scaffold` warning surfaces on switch.
- `lib/markdown.js` — terminal markdown renderer (headings,
  fenced code, lists, blockquotes, inline code/bold/italic, links).
- `lib/env.js` — provider + tool detection (walks `PATH` manually so
  no dependency on `command -v` or `which`).
- `lib/prompt.js` — tiny TTY-aware single-line prompt helper.
- Parser now extracts a `subcommand` slot for `skill / agent / mcp /
  guides / lang` namespaces.

### Changed

- `lib/scripts.js` now derives `SCRIPT_FILES` dynamically from
  `EMBEDDED_SOURCES`, so vendoring a new `check-chN.sh` only requires
  dropping the file into `scripts/` and re-running `build-embed.mjs`.
- `scripts/build-embed.mjs` now also embeds `guides/`, `chapters/`,
  and `faq/` directories.
- Banner + `--help` updated to advertise every new command.

### Tests

- `tests/faq.test.mjs` — substring + ranking smoke tests against
  bundled assets.
- `tests/i18n.test.mjs` — coverage check: every important key resolves
  in en/my/kar (kar falls back to en when un-translated).
- `tests/parser.test.mjs` — new commands + subcommand namespaces +
  `--dry-run`.
- `tests/scripts.test.mjs` — relaxed to the dynamic `SCRIPT_FILES`
  length so future `check-chN.sh` additions don't break the suite.

### Bundle

- `dist/cli.mjs` ≈ 248 KiB (was 92 KiB) — growth is bundled content,
  not code.

## [0.1.0] — 2026-06-20

### Added

- Hand-rolled arg parser (`lib/parser.js`) — zero deps, supports
  `--flag`, `--flag=value`, `--flag value`, short aliases (`-v`, `-h`, `-q`),
  positional commands, and `--` pass-through.
- Commands: `doctor`, `setup`, `api-setup`, `check <ch-N>`.
- Flags: `--cohort N`, `--free`, `--lang en|my|kar`, `--no-color`,
  `--quiet`, `--version`, `--help`.
- ASCII amber banner with cohort status (`lib/banner.js`).
- ANSI color helper (`lib/colors.js`) respecting `NO_COLOR`, `FORCE_COLOR`,
  `--no-color`, and TTY detection.
- Bilingual CLI strings — EN + MY (`lib/i18n.js`); KAR + others
  follow in a later release.
- Config persisted to `~/.vct/config.json` (`lib/config.js`) with
  atomic-rename writes.
- Embedded `doctor.sh`, `student-setup.sh`, `api-setup.sh`,
  `check-ch1.sh` — extracted to `~/.vct/scripts/` on first run and
  SHA-256-verified on every call (`lib/scripts.js`).
- Cross-platform URL opener (`lib/open.js`) — `xdg-open` / `open` /
  `start`, with no-DISPLAY fallback to printing the URL.
- Native Windows guard — prints WSL recommendation when `bash` is absent.
- esbuild bundle (`dist/cli.mjs`) wired through `prepack`.
- Tests (`node --test`) for parser, config, and script materialization.

### Upstream sync

- Vendored from `bootcamp-tour-curriculum/vibecode-setup/` at the
  curriculum repo state on 2026-06-20. See `scripts/NOTICE.md`.

## [0.0.1] — 2026-06-19

### Added

- Repository scaffold + `bin/vibe-code-tours.mjs` placeholder.
- `PLAN.md` describing the Phase 1–5 roadmap.
- npm package name reserved.
