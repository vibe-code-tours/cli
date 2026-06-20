// Bundled guides reader. Locale-aware: prefer <slug>-<lang>.md, fall back
// to <slug>-en.md, then <slug>.md.

import { EMBEDDED_GUIDES } from './embedded.gen.js';

export function listGuides() {
  const map = new Map(); // slug → Set(langs)
  for (const name of Object.keys(EMBEDDED_GUIDES)) {
    const m = name.match(/^(.+?)-(en|my|kar)\.md$/);
    if (m) {
      const slug = m[1];
      if (!map.has(slug)) map.set(slug, new Set());
      map.get(slug).add(m[2]);
    } else if (name.endsWith('.md')) {
      const slug = name.slice(0, -3);
      if (!map.has(slug)) map.set(slug, new Set());
      map.get(slug).add('any');
    }
  }
  return [...map.entries()]
    .map(([slug, langs]) => ({ slug, langs: [...langs].sort() }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function categorize(slug) {
  if (slug.startsWith('blog-')) return 'blog';
  if (slug.startsWith('cheatsheet')) return 'cheatsheet';
  if (slug === 'TLDR') return 'TLDR';
  return 'misc';
}

export function getGuide(slug, lang = 'en') {
  // Some guide slugs were copied verbatim like 'TLDR'. Try in order:
  const tries = [
    `${slug}-${lang}.md`,
    `${slug}-en.md`,
    `${slug}.md`,
  ];
  for (const name of tries) {
    if (EMBEDDED_GUIDES[name] != null) {
      return { name, body: EMBEDDED_GUIDES[name] };
    }
  }
  return null;
}

export function findGuide(query) {
  // Loose slug match — returns first guide whose slug contains query.
  const q = query.toLowerCase();
  const matches = listGuides().filter((g) => g.slug.toLowerCase().includes(q));
  return matches;
}
