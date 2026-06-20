#!/usr/bin/env bash
# Backward-compat shim — old name kept for docs/old students.
# Forwards to the unified chapter doctor.
exec bash "$(dirname "$0")/doctor.sh" ch-1 "$@"
