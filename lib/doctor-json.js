// Parse doctor.sh output → structured JSON for `doctor --json`.

const KNOWN_TOOLS = new Set(['node','npm','python','git','gh','claude','pnpm','ffmpeg']);
const STATUS_PATTERNS = [
  { glyph: '✅', status: 'ok' },
  { glyph: '⚠', status: 'warn' },
  { glyph: '❌', status: 'fail' },
];
const SECTION_RE = /^[A-Z][\w /]{0,40}$/;

function stripAnsi(line) {
  return line.replace(/\x1b\[[0-9;]*m/g, '');
}

function classifyLine(line) {
  for (const { glyph, status } of STATUS_PATTERNS) {
    const idx = line.indexOf(glyph);
    if (idx >= 0) return { status, rest: line.slice(idx + glyph.length).trim() };
  }
  return null;
}

function splitNameDetail(rest) {
  const m = rest.match(/^([^\s:]+(?:\s+[^\s:]+)?):\s*(.*)$/);
  if (m) return { name: m[1].trim().toLowerCase(), detail: m[2].trim() };
  return { name: rest.split(/\s+/)[0]?.toLowerCase() ?? rest, detail: rest };
}

export function parseDoctorOutput(raw) {
  const lines = raw.split(/\r?\n/).map(stripAnsi);
  const tools = {};
  const sections = {};
  let section = 'general';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (line.length === trimmed.length && SECTION_RE.test(trimmed)) {
      section = trimmed.toLowerCase().replace(/\s+/g, '_');
      sections[section] = sections[section] || {};
      continue;
    }
    const classified = classifyLine(line);
    if (!classified) continue;
    const { status, rest } = classified;
    const { name, detail } = splitNameDetail(rest);
    const entry = { status, detail };
    if (KNOWN_TOOLS.has(name)) tools[name] = entry;
    else {
      sections[section] = sections[section] || {};
      sections[section][name] = entry;
    }
  }
  return { tools, sections };
}

export function buildDoctorReport({ exitCode, parsed }) {
  const flat = {};
  for (const tool of KNOWN_TOOLS) {
    flat[tool] = parsed.tools[tool] ?? { status: 'unknown', detail: 'not reported by doctor.sh' };
  }
  return { schema: 'vibe-code-tours/doctor@1', exitCode, ...flat, sections: parsed.sections };
}
