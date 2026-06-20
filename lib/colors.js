// Tiny ANSI helper. Respects NO_COLOR env, --no-color flag, and non-TTY stdout.
// Zero deps. Amber-leaning palette to match Vibe Code Tours brand.

const ESC = '\x1b[';

const CODES = {
  reset: 0,
  bold: 1,
  dim: 2,
  italic: 3,
  underline: 4,
  // 256-color amber palette (close to brand orange)
  amber: '38;5;214',
  amberDim: '38;5;172',
  amberBright: '38;5;220',
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  gray: 90,
};

let enabled = true;

export function setColorEnabled(value) {
  enabled = Boolean(value);
}

export function detectColorSupport({ noColorFlag = false, stream = process.stdout } = {}) {
  if (noColorFlag) return false;
  // https://no-color.org
  if (process.env.NO_COLOR && process.env.NO_COLOR !== '') return false;
  if (process.env.FORCE_COLOR === '0') return false;
  if (process.env.FORCE_COLOR && process.env.FORCE_COLOR !== '') return true;
  if (process.env.TERM === 'dumb') return false;
  if (stream && typeof stream.isTTY === 'boolean') return stream.isTTY;
  return false;
}

function wrap(code, text) {
  if (!enabled) return text;
  return `${ESC}${code}m${text}${ESC}${CODES.reset}m`;
}

export const c = {
  reset: (t) => wrap(CODES.reset, t),
  bold: (t) => wrap(CODES.bold, t),
  dim: (t) => wrap(CODES.dim, t),
  italic: (t) => wrap(CODES.italic, t),
  underline: (t) => wrap(CODES.underline, t),
  amber: (t) => wrap(CODES.amber, t),
  amberDim: (t) => wrap(CODES.amberDim, t),
  amberBright: (t) => wrap(CODES.amberBright, t),
  red: (t) => wrap(CODES.red, t),
  green: (t) => wrap(CODES.green, t),
  yellow: (t) => wrap(CODES.yellow, t),
  blue: (t) => wrap(CODES.blue, t),
  magenta: (t) => wrap(CODES.magenta, t),
  cyan: (t) => wrap(CODES.cyan, t),
  gray: (t) => wrap(CODES.gray, t),
};

export function isEnabled() {
  return enabled;
}
