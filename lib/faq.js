// FAQ search. Source assets bundled in lib/embedded.gen.js as EMBEDDED_FAQ.
// - FAQ.md: human-curated bilingual entries (top-level sections under ###).
// - qa-pairs.jsonl: real Discord Q&A pairs, one JSON object per line.
//
// Search strategy is intentionally simple: token-overlap + substring boost,
// case-insensitive. No deps, no fuzzy lib.

import { EMBEDDED_FAQ } from './embedded.gen.js';

const STOP = new Set(['the','a','an','to','of','for','and','or','is','are','in','on','at','i','my','me','do','does','it','this','that','can','how','what','why','when']);

function tokens(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[`*_~>#]/g, ' ')
    .split(/[^a-z0-9က-႟ហ-៿_-]+/u)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function parseFAQ(md) {
  const out = [];
  if (!md) return out;
  const blocks = md.split(/\n(?=### )/);
  for (const b of blocks) {
    const h = b.match(/^###\s+(.+)$/m);
    if (!h) continue;
    const title = h[1].trim();
    const body = b.slice(b.indexOf('\n') + 1).trim();
    out.push({ kind: 'faq', title, body });
  }
  return out;
}

function parseQAJsonl(jsonl) {
  const out = [];
  if (!jsonl) return out;
  for (const line of jsonl.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const o = JSON.parse(trimmed);
      out.push({
        kind: 'qa',
        title: o.q ? o.q.slice(0, 80) : '(no question)',
        body: `Q: ${o.q ?? ''}\nA: ${o.a ?? ''}`,
        meta: { ch: o.ch, link: o.q_link, resolved: o.resolved },
      });
    } catch {
      // skip malformed line
    }
  }
  return out;
}

let _index = null;
function buildIndex() {
  if (_index) return _index;
  const entries = [
    ...parseFAQ(EMBEDDED_FAQ['FAQ.md']),
    ...parseQAJsonl(EMBEDDED_FAQ['qa-pairs.jsonl']),
  ];
  const indexed = entries.map((e) => {
    const text = `${e.title}\n${e.body}`;
    return { ...e, _text: text.toLowerCase(), _tokens: new Set(tokens(text)) };
  });
  _index = indexed;
  return indexed;
}

export function searchFaq(query, { limit = 5 } = {}) {
  const q = String(query ?? '').trim();
  if (!q) return [];
  const qLower = q.toLowerCase();
  const qTokens = tokens(q);
  const idx = buildIndex();
  const scored = [];
  for (const e of idx) {
    let score = 0;
    if (e._text.includes(qLower)) score += 5;
    for (const t of qTokens) {
      if (e._tokens.has(t)) score += 2;
      else if (e._text.includes(t)) score += 1;
    }
    if (score > 0) scored.push({ score, entry: e });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ score, entry }) => ({
    score,
    kind: entry.kind,
    title: entry.title,
    body: entry.body,
    meta: entry.meta,
  }));
}

export function totalEntries() {
  return buildIndex().length;
}
