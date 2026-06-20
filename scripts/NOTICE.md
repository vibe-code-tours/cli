# Embedded shell scripts + bundled docs

These assets are vendored from the upstream
`bootcamp-tour-curriculum/` working tree. Source of truth lives there;
this directory ships read-only copies that the CLI either extracts to
`~/.vct/scripts/` (shell scripts) or reads in-memory (docs / FAQ).

## Shell scripts (extracted to `~/.vct/scripts/`)

| File                | Upstream path                                     | Purpose                                  |
|---------------------|---------------------------------------------------|------------------------------------------|
| `doctor.sh`         | `vibecode-setup/doctor.sh`                        | Chapter-aware environment diagnostic     |
| `student-setup.sh`  | `vibecode-setup/student-setup.sh`                 | Fork bootcamp repos + scaffold dotfiles  |
| `api-setup.sh`      | `vibecode-setup/api-setup.sh`                     | Wire Claude/opencode to bootcamp proxy   |
| `check-ch1.sh`      | `vibecode-setup/check-ch1.sh`                     | Back-compat shim → `doctor.sh ch-1`      |

Future `check-ch2.sh`, `check-ch3.sh` … dropped into this directory
are auto-picked-up by `scripts/build-embed.mjs` — no code change
needed.

## Bundled docs (read in-memory)

| Path                | Upstream path                                            | Used by             |
|---------------------|----------------------------------------------------------|---------------------|
| `guides/*.md`       | `claude-guides/*.md`                                     | `guides` command    |
| `chapters/ch-N-en.md` | `bootcamp-tour-curriculum/02-curriculum/detailed/chapter-N/content.md` | `guide` command |
| `faq/FAQ.md`        | `support-bot/FAQ.md`                                     | `faq` command       |
| `faq/qa-pairs.jsonl`| `support-bot/qa-pairs.jsonl` (resolved entries only)     | `faq` command       |

## Sync policy

- Do **not** edit these files directly in this repo.
- Edit the upstream copy in `bootcamp-tour-curriculum/`, then re-vendor.
- Each CLI release bakes the script SHA-256 into the bundle; the CLI
  refuses to run a stale extracted copy and re-extracts when the
  bundled checksum differs.

## License

Same MIT license as the rest of this repo. See `../LICENSE`.
