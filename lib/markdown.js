// Tiny markdown → ANSI renderer. Zero deps. Handles a deliberately small
// subset that matters for terminal docs:
//   - ATX headings (#, ##, ### …)
//   - Fenced code blocks (```lang … ```)
//   - Inline `code`
//   - **bold**, *italic*, _italic_
//   - Bullet lists (-, *)
//   - Numbered lists (1.)
//   - Blockquotes (>)
//   - Horizontal rule (---)
//   - Bare URLs (autolinked / dimmed)
//
// Anything not recognized is passed through. Output is line-oriented; we
// don't reflow paragraphs to keep Burmese line metrics intact.

import { c, isEnabled } from './colors.js';

const HR = '────────────────────────────────────────';

function inline(text) {
  // inline code first so other patterns don't eat backticks
  let out = text.replace(/`([^`]+)`/g, (_, code) => c.cyan(code));
  out = out.replace(/\*\*([^*]+)\*\*/g, (_, x) => c.bold(x));
  out = out.replace(/(?<!\*)\*([^*\s][^*]*?)\*(?!\*)/g, (_, x) => c.italic(x));
  out = out.replace(/(?<!_)_([^_\s][^_]*?)_(?!_)/g, (_, x) => c.italic(x));
  // Markdown links [label](url) → label (url)
  out = out.replace(/\[([^\]]+)\]\((https?:[^\s)]+)\)/g, (_, label, url) => `${c.amber(label)} ${c.dim('(' + url + ')')}`);
  // Bare URLs (best-effort, no over-matching).
  out = out.replace(/(^|\s)(https?:\/\/[^\s)]+)/g, (m, lead, url) => `${lead}${c.underline(url)}`);
  return out;
}

export function renderMarkdown(src) {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let inFence = false;
  let fenceLang = '';
  let buf = [];
  const flushFence = () => {
    if (buf.length === 0) return;
    const indent = '    ';
    if (isEnabled()) out.push(c.dim(`${indent}┌─ ${fenceLang || 'code'} ─`));
    for (const ln of buf) out.push(c.gray(indent + ln));
    if (isEnabled()) out.push(c.dim(`${indent}└──`));
    else out.push('');
    buf = [];
  };

  for (const raw of lines) {
    if (inFence) {
      if (/^\s*```/.test(raw)) {
        inFence = false;
        flushFence();
        fenceLang = '';
      } else {
        buf.push(raw);
      }
      continue;
    }
    const fenceOpen = raw.match(/^\s*```(\w*)\s*$/);
    if (fenceOpen) {
      inFence = true;
      fenceLang = fenceOpen[1] || '';
      continue;
    }
    if (/^\s*---+\s*$/.test(raw)) {
      out.push(c.dim(HR));
      continue;
    }
    const h = raw.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (h) {
      const level = h[1].length;
      const text = inline(h[2]);
      if (level === 1) out.push('');
      const prefix = '#'.repeat(level);
      out.push(c.amberBright(c.bold(`${prefix} ${text}`)));
      if (level <= 2) out.push('');
      continue;
    }
    const q = raw.match(/^>\s?(.*)$/);
    if (q) {
      out.push(c.dim('  │ ') + inline(q[1]));
      continue;
    }
    const ul = raw.match(/^(\s*)[-*]\s+(.*)$/);
    if (ul) {
      out.push(`${ul[1]}${c.amber('•')} ${inline(ul[2])}`);
      continue;
    }
    const ol = raw.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (ol) {
      out.push(`${ol[1]}${c.amber(ol[2] + '.')} ${inline(ol[3])}`);
      continue;
    }
    out.push(inline(raw));
  }
  if (inFence) flushFence();
  return out.join('\n');
}
