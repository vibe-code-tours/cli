# Plan — `vibe-code-tours` package

## Phases
- **Phase 1 (3d)**: skeleton + doctor + setup + api-setup + cohort intent + publish 0.1.0
- **Phase 2 (3d)**: guides reader + faq search + submit + lang
- **Phase 3 (1w)**: instructor pack (slides, narrate, record, scan-gaps, score, publish, mosaic)
- **Phase 4 (2w)**: monorepo consolidation under one pnpm workspace
- **Phase 5 (ongoing)**: per-chapter checks, cohort-3 readiness

## Commands (Phase 1)
| Command | Wraps | Effect |
|---|---|---|
| `npx vibe-code-tours` | — | Banner + cohort + menu |
| `--cohort N --free` | — | Persist + open apply URL |
| `doctor` | vibecode-setup/doctor.sh | Env checklist |
| `setup` | vibecode-setup/student-setup.sh | Repo fork + scaffold |
| `api-setup` | vibecode-setup/api-setup.sh | Key wizard |
| `check ch-N` | vibecode-setup/check-chN.sh | Chapter readiness |

## Architecture
- ESM single file via esbuild; `bin/vibe-code-tours.mjs`
- Shell scripts embedded as resources, copied to `~/.vct/scripts/` on first run, checksum-verified
- Hand-rolled arg parser; no commander dep
- Config: `~/.vct/config.json` { cohort, lang, github, telemetry_optin }
- Bilingual via i18n JSON from site (en/my/kar)
- ANSI colors (manual amber); skip on NO_COLOR
- Cross-platform: bash detect, WSL recommendation on Windows (Phase 5 PowerShell port)

## Distribution
1. npm primary
2. github.io mirror `npx https://vibecode.tours/cli/latest.tgz` (blocked-npm regions)
3. Docker secondary

## Telemetry (opt-in)
{ cohort, command, exit_code, ts } only. No PII. Prompted first run.

## Versioning
- semver via changesets
- `latest`, `next`, `cohort-N` tags
- Cohort-pinned releases held forever (cohort 2 students always get cohort-2 build)

## Open
- Repo: vibe-code-tours/cli (this)
- License: MIT
- npm placeholder 0.0.1 ASAP to reserve name
