# Embedded shell scripts

These scripts are vendored from the upstream `bootcamp-tour-curriculum/vibecode-setup/`
directory. Source of truth lives in that repo; this directory ships read-only
copies that the CLI extracts to `~/.vct/scripts/` on first run.

## Files

| File                | Upstream path                                     | Purpose                                  |
|---------------------|---------------------------------------------------|------------------------------------------|
| `doctor.sh`         | `vibecode-setup/doctor.sh`                        | Chapter-aware environment diagnostic     |
| `student-setup.sh`  | `vibecode-setup/student-setup.sh`                 | Fork bootcamp repos + scaffold dotfiles  |
| `api-setup.sh`      | `vibecode-setup/api-setup.sh`                     | Wire Claude/opencode to bootcamp proxy   |
| `check-ch1.sh`      | `vibecode-setup/check-ch1.sh`                     | Back-compat shim → `doctor.sh ch-1`      |

## Sync policy

- Do **not** edit these files directly in this repo.
- Edit the upstream copy in `bootcamp-tour-curriculum/vibecode-setup/`, then re-run
  `pnpm run sync:scripts` (see repo root) to refresh.
- Each CLI release bakes the script SHA-256 into the bundle; the CLI refuses to
  run a stale extracted copy and re-extracts when the bundled checksum differs.

## License

Same MIT license as the rest of this repo. See `../LICENSE`.
