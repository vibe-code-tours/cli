# cli-telemetry worker

Cloudflare Worker that accepts **opt-in** telemetry from the
`vibe-code-tours` CLI and exposes a tiny aggregate stats endpoint for
the marketing site to brag responsibly.

This package is **deployed separately** from the npm CLI. It is NOT
bundled into the npm tarball (excluded via `.npmignore`).

## What ships in an event

The CLI POSTs exactly these five fields and nothing else:

```json
{
  "cohort": 2,
  "command": "setup",
  "exit_code": 0,
  "ts": 1750000000000,
  "cli_version": "0.3.0"
}
```

The worker **does not retain IPs**. IPs are only used to bump an
in-memory KV counter inside a rolling one-hour rate-limit window
(default 100 events/IP/hour). The counter key is `rl:<ip>:<hourBucket>`
with a 2h TTL and is never read back into the stats endpoint.

## Routes

| Method | Path                          | Body              | Response                      |
|--------|-------------------------------|-------------------|-------------------------------|
| POST   | `/api/cli-telemetry/event`    | event JSON        | `204 No Content` (always)     |
| GET    | `/api/cli-telemetry/stats`    | (none)            | `200 OK` JSON aggregate       |

The event endpoint **always** returns `204` — even on bad JSON, blocked
origin, or rate-limit hit. The CLI is best-effort; we do not want to
give the client any signal it can use to retry abusively.

Rate-limit hits do return `Retry-After` header so well-behaved clients
back off. The CLI does not read it (1-second timeout swallows the
response).

## CORS

- `Access-Control-Allow-Origin: https://vibecode.tours`
- The npx CLI sends `User-Agent: vibe-code-tours/<version>` and is
  allowed through; browsers from other origins are not.

## Stats payload

```json
{
  "setups_this_week": 47,
  "top_commands": [
    { "command": "doctor", "count": 312 },
    { "command": "setup",  "count": 47  }
  ],
  "total_cohort_2_runs": 891
}
```

## Local dev

```bash
cd worker
npm install
npm run dev              # wrangler dev — local HTTP server + KV stub
npm test                 # unit tests for validator + rate limiter
```

## One-time setup before first deploy

```bash
# 1. Log in & confirm account.
npx wrangler login
npx wrangler whoami

# 2. Create the KV namespace and paste the id into wrangler.toml.
npx wrangler kv:namespace create CLI_TELEMETRY_KV
# → copy the printed `id = "..."` into wrangler.toml

# 3. (Optional) Configure Workers Logpush in the Cloudflare dashboard
#    if you want raw request logs shipped to R2/Splunk/etc.
```

## Deploy

```bash
cd worker
npx wrangler deploy
```

Deployment URL placeholder:

```
https://vibecode.tours/api/cli-telemetry/event
https://vibecode.tours/api/cli-telemetry/stats
```

(Or `https://telemetry.vibecode.tours/*` if you switch to the
commented `custom_domain` route in `wrangler.toml`.)

## Rotate / disable

- To temporarily stop accepting events, redeploy with the routes
  removed from `wrangler.toml` — the marketing site keeps serving;
  CLI fetches will time out silently after 1s.
- To rotate the KV namespace, create a new one, swap the id, redeploy.
  The old namespace can be deleted from the dashboard.
