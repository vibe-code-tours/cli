// vibe-code-tours CLI telemetry worker.
// Routes:
//   POST /api/cli-telemetry/event  → 204 on accept (always silent body)
//   GET  /api/cli-telemetry/stats  → aggregate counters as JSON
//
// CORS: locked to the marketing origin OR npx user-agent. The event
// endpoint NEVER leaks rate-limit state in the body — only headers.

import { validateEvent } from './validate.js';
import { checkRateLimit, clientIp, type KVLike } from './rate-limit.js';
import { incrementCounters, loadStats } from './stats.js';

export interface Env {
  CLI_TELEMETRY_KV: KVNamespace;
  ALLOWED_ORIGIN?: string;
  RATE_LIMIT_PER_HOUR?: string;
}

const DEFAULT_ORIGIN = 'https://vibecode.tours';
const DEFAULT_RATE = 100;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return preflight(request, env);
    }

    if (url.pathname === '/api/cli-telemetry/event' && request.method === 'POST') {
      return handleEvent(request, env, ctx);
    }
    if (url.pathname === '/api/cli-telemetry/stats' && request.method === 'GET') {
      return handleStats(request, env);
    }

    return new Response('not found', { status: 404, headers: corsHeaders(request, env) });
  },
};

function allowedOrigin(env: Env): string {
  return env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
}

function isAllowedCaller(request: Request, env: Env): boolean {
  const origin = request.headers.get('Origin');
  if (origin && origin === allowedOrigin(env)) return true;
  const ua = request.headers.get('User-Agent') || '';
  // npx and the bundled CLI both ship with a recognizable UA.
  if (/^vibe-code-tours\//.test(ua)) return true;
  if (/\bnpm\/[0-9]/.test(ua) && /\bnode\//.test(ua)) return true;
  return false;
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin');
  const allow = origin === allowedOrigin(env) ? origin : allowedOrigin(env);
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, User-Agent',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function preflight(request: Request, env: Env): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request, env) });
}

async function handleEvent(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const headers = corsHeaders(request, env);

  if (!isAllowedCaller(request, env)) {
    // Silent 204 to avoid leaking that we filter on origin/UA.
    return new Response(null, { status: 204, headers });
  }

  const limit = Number.parseInt(env.RATE_LIMIT_PER_HOUR || '', 10) || DEFAULT_RATE;
  const ip = clientIp(request);
  const rl = await checkRateLimit(env.CLI_TELEMETRY_KV as unknown as KVLike, ip, limit);
  if (!rl.allowed) {
    return new Response(null, {
      status: 429,
      headers: {
        ...headers,
        'Retry-After': String(rl.retryAfter),
      },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    // Silent 204 — malformed JSON should not give attackers signal.
    return new Response(null, { status: 204, headers });
  }
  const result = validateEvent(body);
  if (!result.ok) {
    return new Response(null, { status: 204, headers });
  }

  // Best-effort: bump counters in background so we return 204 fast.
  ctx.waitUntil(
    incrementCounters(env.CLI_TELEMETRY_KV as unknown as KVLike, result.value).catch(() => {}),
  );

  return new Response(null, { status: 204, headers });
}

async function handleStats(request: Request, env: Env): Promise<Response> {
  const headers = corsHeaders(request, env);
  const stats = await loadStats(env.CLI_TELEMETRY_KV as unknown as KVLike);
  return new Response(JSON.stringify(stats), {
    status: 200,
    headers: {
      ...headers,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
    },
  });
}
