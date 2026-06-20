// Tiny prompt helper (single-line readline). Zero deps. Honors TTY/quiet.
// Falls back to defaults / errors on non-TTY.

import readline from 'node:readline';

export async function ask(question, { defaultValue = null } = {}) {
  if (!process.stdin.isTTY) {
    return defaultValue;
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const suffix = defaultValue == null ? '' : ` [${defaultValue}]`;
    const answer = await new Promise((resolve) => rl.question(`${question}${suffix} `, resolve));
    const trimmed = answer.trim();
    return trimmed.length === 0 ? defaultValue : trimmed;
  } finally {
    rl.close();
  }
}

export async function choose(question, options) {
  if (!process.stdin.isTTY) return options[0]?.value ?? null;
  process.stdout.write(`${question}\n`);
  for (let i = 0; i < options.length; i++) {
    process.stdout.write(`  ${i + 1}) ${options[i].label}\n`);
  }
  const ans = await ask('Choose [1]:', { defaultValue: '1' });
  const n = Number(ans);
  if (Number.isInteger(n) && n >= 1 && n <= options.length) {
    return options[n - 1].value;
  }
  return options[0].value;
}
