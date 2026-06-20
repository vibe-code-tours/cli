# Changelog

All notable changes to `vibe-code-tours` are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project uses [semantic versioning](https://semver.org/) plus dist-tags:

- `latest` — current stable release for the active cohort.
- `next` — pre-release candidates.
- `cohort-N` — pinned release shipped with cohort N; held forever so
  students of that cohort always get a reproducible build.

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
