// Hand-rolled arg parser. No deps. Supports:
//   - positional command + sub-args (rest preserved for forwarding)
//   - --long, --long=value, --long value, -short, -short value
//   - boolean and string flags
//
// Returns { command, subcommand, positional, flags, rest, errors }.

const FLAG_SPEC = {
  cohort: { type: 'string' },
  free: { type: 'boolean' },
  lang: { type: 'string' },
  version: { type: 'boolean' },
  help: { type: 'boolean' },
  'no-color': { type: 'boolean' },
  quiet: { type: 'boolean' },
  'dry-run': { type: 'boolean' },
};

const ALIASES = {
  v: 'version',
  h: 'help',
  q: 'quiet',
};

// Commands that take a subcommand as their first positional.
// (For these we capture parsed.subcommand and shift it out of positional.)
const SUBCOMMAND_COMMANDS = new Set(['skill', 'agent', 'mcp', 'guides', 'lang']);

const KNOWN_COMMANDS = new Set([
  'doctor',
  'setup',
  'api-setup',
  'check',
  'guide',
  'verify',
  'guides',
  'faq',
  'env',
  'submit',
  'lang',
  'skill',
  'agent',
  'mcp',
]);

export function parse(argv) {
  const errors = [];
  const flags = {};
  const positional = [];
  let command = null;
  let rest = [];

  let i = 0;
  while (i < argv.length) {
    const tok = argv[i];
    if (tok === '--') {
      rest = argv.slice(i + 1);
      break;
    }
    if (tok.startsWith('--')) {
      const eq = tok.indexOf('=');
      let key, val;
      if (eq >= 0) {
        key = tok.slice(2, eq);
        val = tok.slice(eq + 1);
      } else {
        key = tok.slice(2);
        val = null;
      }
      const spec = FLAG_SPEC[key];
      if (!spec) {
        errors.push(`unknown flag: --${key}`);
        i += 1;
        continue;
      }
      if (spec.type === 'boolean') {
        flags[normalize(key)] = val == null ? true : val !== 'false' && val !== '0';
        i += 1;
      } else {
        if (val == null) {
          val = argv[i + 1];
          if (val == null || val.startsWith('-')) {
            errors.push(`flag --${key} requires a value`);
            i += 1;
            continue;
          }
          i += 2;
        } else {
          i += 1;
        }
        flags[normalize(key)] = val;
      }
      continue;
    }
    if (tok.startsWith('-') && tok.length > 1) {
      const short = tok.slice(1);
      const key = ALIASES[short];
      if (!key) {
        errors.push(`unknown flag: -${short}`);
        i += 1;
        continue;
      }
      const spec = FLAG_SPEC[key];
      if (spec.type === 'boolean') {
        flags[normalize(key)] = true;
        i += 1;
      } else {
        const val = argv[i + 1];
        if (val == null || val.startsWith('-')) {
          errors.push(`flag -${short} requires a value`);
          i += 1;
          continue;
        }
        flags[normalize(key)] = val;
        i += 2;
      }
      continue;
    }
    // Positional
    if (command == null) {
      if (KNOWN_COMMANDS.has(tok)) {
        command = tok;
      } else {
        // Unknown leading positional → treat as command, surface error later
        command = tok;
        errors.push(`unknown command: ${tok}`);
      }
    } else {
      positional.push(tok);
    }
    i += 1;
  }

  // Pull subcommand off the front of positional for namespaces like
  // `skill add <name>`, `agent list`, `guides ls|<slug>`, `lang en|my|kar`.
  let subcommand = null;
  if (command && SUBCOMMAND_COMMANDS.has(command) && positional.length > 0) {
    subcommand = positional.shift();
  }

  return { command, subcommand, positional, flags, rest, errors };
}

function normalize(key) {
  // --no-color → noColor; --dry-run → dryRun
  return key.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
}

export const __test__ = { FLAG_SPEC, ALIASES, KNOWN_COMMANDS, SUBCOMMAND_COMMANDS };
