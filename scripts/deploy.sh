#!/bin/sh
# Usage: pnpm run deploy <stage>
# Exports .env.deploy.<stage> (if present) so SST and its providers see the same settings, then deploys.
set -eu
stage="${1:-dev}"
if [ -f ".env.deploy.$stage" ]; then
  set -a
  . "./.env.deploy.$stage"
  set +a
fi
exec npx sst deploy --stage "$stage"
