// Cross-platform URL opener. Zero deps.

import { spawn } from 'node:child_process';

export function openUrl(url, { dryRun = false } = {}) {
  if (dryRun) return { spawned: false, reason: 'dry-run', url };
  const platform = process.platform;
  let cmd, args;
  if (platform === 'darwin') {
    cmd = 'open';
    args = [url];
  } else if (platform === 'win32') {
    cmd = 'cmd';
    args = ['/c', 'start', '""', url];
  } else {
    // linux / freebsd / etc — prefer xdg-open, fall back to other openers
    if (!process.env.DISPLAY && !process.env.WAYLAND_DISPLAY) {
      return { spawned: false, reason: 'no-display', url };
    }
    cmd = 'xdg-open';
    args = [url];
  }
  try {
    const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
    child.unref();
    return { spawned: true, cmd, args, url };
  } catch (err) {
    return { spawned: false, reason: 'spawn-error', error: err.message, url };
  }
}
