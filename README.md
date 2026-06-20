# vibe-code-tours

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

| Command                   | What it does                                                   |
|---------------------------|----------------------------------------------------------------|
| (no command)              | Print the amber banner + cohort status + menu                  |
| `doctor`                  | Chapter-aware environment diagnostic (`doctor.sh`)             |
| `setup`                   | Fork the bootcamp repos + scaffold your dev box                |
| `api-setup`               | Wire Claude Code / opencode to the bootcamp LLM proxy          |
| `check <ch-N>`            | Verify chapter readiness — alias for `doctor ch-N`             |
| `--cohort N --free`       | Persist cohort choice + open the free-seat apply URL           |

### Global flags

| Flag               | Meaning                                            |
|--------------------|----------------------------------------------------|
| `--cohort N`       | Select & persist cohort to `~/.vct/config.json`    |
| `--free`           | With `--cohort`, open `vibecode.tours/apply?...`   |
| `--lang en|my|kar` | UI language (en + my today; kar coming Phase 2)    |
| `--no-color`       | Disable ANSI; same as `NO_COLOR=1`                 |
| `--quiet` / `-q`   | Suppress banner + non-essential stderr             |
| `--version` / `-v` | Print version and exit                             |
| `--help` / `-h`    | Show help                                          |

Pass-through to the underlying bash script: anything after `--` is
forwarded verbatim. Example: `vibe-code-tours doctor -- --ci`.

## Where things live

```
~/.vct/
├── config.json        # { cohort, lang, github, telemetry_optin }
└── scripts/
    ├── doctor.sh
    ├── student-setup.sh
    ├── api-setup.sh
    └── check-ch1.sh
```

Scripts are vendored from the curriculum repo (see
`scripts/NOTICE.md`), bundled into the CLI, and re-extracted whenever
the bundled SHA-256 differs from the on-disk copy.

## Cross-platform

| Platform              | Status                                                    |
|-----------------------|-----------------------------------------------------------|
| Linux                 | Tier-1                                                    |
| macOS                 | Tier-1                                                    |
| Windows + WSL         | Tier-1 (run from inside Ubuntu)                           |
| Native Windows        | Detects missing `bash`, prints WSL install instructions   |

## Develop

```bash
# Generate lib/embedded.gen.js from scripts/*.sh (commit-friendly).
npm run embed

# Bundle to dist/cli.mjs (used by npm publish).
npm run build

# Run the unbundled CLI for quick iteration.
node bin/vibe-code-tours.mjs --help

# Test
npm test
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

MIT. See [`LICENSE`](./LICENSE). Curriculum content is licensed
separately — see the [curriculum repo](https://github.com/vibe-code-tours/curriculum).
