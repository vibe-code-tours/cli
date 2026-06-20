// Bundled per-chapter content reader. Accepts chapter id as "ch-N" or "N".

import { EMBEDDED_CHAPTERS } from './embedded.gen.js';

export function normalizeChapter(input) {
  if (input == null) return null;
  const s = String(input).trim().toLowerCase();
  const m = s.match(/^(?:ch-?)?(\d+)$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isInteger(n) || n < 0) return null;
  return { id: `ch-${n}`, n };
}

export function listChapters() {
  const map = new Map(); // ch-N → Set(langs)
  for (const name of Object.keys(EMBEDDED_CHAPTERS)) {
    const m = name.match(/^(ch-\d+)-(en|my|kar)\.md$/);
    if (m) {
      const id = m[1];
      if (!map.has(id)) map.set(id, new Set());
      map.get(id).add(m[2]);
    }
  }
  return [...map.entries()]
    .map(([id, langs]) => ({ id, langs: [...langs].sort() }))
    .sort((a, b) => Number(a.id.slice(3)) - Number(b.id.slice(3)));
}

export function getChapter(id, lang = 'en') {
  const tries = [`${id}-${lang}.md`, `${id}-en.md`];
  for (const name of tries) {
    if (EMBEDDED_CHAPTERS[name] != null) {
      return { name, body: EMBEDDED_CHAPTERS[name] };
    }
  }
  return null;
}
