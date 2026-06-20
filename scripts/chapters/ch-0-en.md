# Chapter 0 — Setup

**Async pre-class guide — complete before Chapter 1**

**Chapter outcome**: Environment ready, channel joined, first artifact posted

**Pre-requisite**: None — this is the starting point.

---

<!--
Chapter 0 is different from all other chapters. It's async — no instructor, no
live session. Students complete this on their own before the first class.

Structure: step-by-step setup guide with OS-specific instructions, verification
commands, and troubleshooting. Not block-by-block like live chapters.

Estimated time: 45-60 minutes.
-->

# Before You Begin

Welcome to the AI & Vibe Coding Tour. Before our first live session (Chapter 1), you need a working development environment. This guide walks you through every step.

**What you'll have when done**:
- A code editor (VS Code or Cursor)
- Node.js and Python runtimes
- Git configured with a GitHub account
- A Claude account with API key
- Access to the class channel
- Your first "hello world" post

**How long this takes**: 45-60 minutes for most people. Budget 90 minutes if you've never done any of this.

**If you get stuck**: Try the troubleshooting section for each tool first. Then ask in the class channel — someone has hit the same problem.

> **Aside.** "It works on my machine" is the oldest excuse in software. Today we're going to make it true for *your* machine — which is the hardest version of the problem.

---

# Step 1 — Code Editor (5 min)

Install **one** of these. You can switch later.

## Option A: VS Code (recommended for beginners)

**macOS**:
1. Go to https://code.visualstudio.com/
2. Download the macOS version
3. Drag to Applications
4. Open VS Code, confirm it launches

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install -y code
```
Or download the `.deb` from https://code.visualstudio.com/ and install:
```bash
sudo dpkg -i code_*.deb
```

**Windows**:
1. Download from https://code.visualstudio.com/
2. Run the installer — check "Add to PATH" during installation
3. Open VS Code from the Start menu

## Option B: Cursor (AI-native editor)

1. Go to https://www.cursor.com/
2. Download for your OS
3. Install and open — it looks like VS Code with AI features built in

## Verification

Open your editor. If you see the welcome tab, you're done.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| VS Code won't open on macOS | Right-click → Open (first time Gatekeeper block) |
| `code` command not found in terminal | VS Code → Command Palette → "Install 'code' command in PATH" |
| Linux package conflict | Try the Snap install: `sudo snap install --classic code` |

<!-- BURMESE-PROVERB-HOOK: a proverb about patience or preparing tools before the work begins -- fits the "setup is a one-time tax" framing of Chapter 0 -->

---

# Step 2 — Node.js (10 min)

We recommend installing via **nvm** (Node Version Manager) — it lets you switch Node versions easily.

## macOS / Linux

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Restart your terminal (close and reopen), then:
nvm install --lts
nvm use --lts
```

## Windows (via WSL recommended)

If you're on Windows, we strongly recommend using WSL (Windows Subsystem for Linux). It gives you a real Linux terminal inside Windows.

**Install WSL first** (if not already):
```powershell
wsl --install
```
Restart your computer, then open the Ubuntu terminal from the Start menu. From there, follow the macOS/Linux instructions above.

**Without WSL** (native Windows):
1. Go to https://nodejs.org/
2. Download the LTS version
3. Run the installer, accept defaults

## Verification

```bash
node --version
# Should show: v20.x.x or v22.x.x (LTS)

npm --version
# Should show: 10.x.x or higher
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `nvm: command not found` | Restart your terminal. If still missing, check `~/.bashrc` or `~/.zshrc` for the nvm lines |
| Old Node version | `nvm install --lts && nvm alias default node` |
| `npm` permission errors on Linux | Never use `sudo npm`. Use nvm instead — it installs to your home directory |
| Windows: `node` not recognized | Restart terminal. If still missing, reinstall with "Add to PATH" checked |

> **Aside.** Ninety percent of "command not found" errors are solved by closing the terminal and opening a new one. The other ten percent are solved by closing it twice.

---

# Step 3 — Python (10 min)

Most macOS and Linux systems have Python pre-installed, but check the version.

## macOS

```bash
# Check if Python 3 exists
python3 --version
```

If missing or old (below 3.10):
```bash
# Install via Homebrew (install Homebrew first if needed: https://brew.sh)
brew install python
```

## Linux (Ubuntu/Debian)

```bash
python3 --version
```

If missing:
```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv
```

## Windows (WSL)

Follow the Linux instructions inside your WSL terminal.

**Without WSL**:
1. Go to https://www.python.org/downloads/
2. Download Python 3.12+
3. Run installer — **check "Add Python to PATH"** (critical step)

## Verification

```bash
python3 --version
# Should show: Python 3.10+ (3.12 or 3.13 ideal)

pip3 --version
# Should show pip version + Python path
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `python3: command not found` (macOS) | Install via Homebrew: `brew install python` |
| `pip3: command not found` | Linux: `sudo apt install python3-pip`. macOS: comes with Homebrew Python |
| Windows: `python` works but `python3` doesn't | Windows uses `python` not `python3`. Both are fine — just be consistent |
| Multiple Python versions | Use `python3` explicitly, never bare `python` (which may be Python 2) |

---

# Step 4 — Git + GitHub (15 min)

This is the longest step. Take it slow.

## Install Git

**macOS**:
```bash
# Usually pre-installed. Check:
git --version

# If missing, install Xcode command line tools:
xcode-select --install
```

**Linux**:
```bash
sudo apt update
sudo apt install -y git
```

**Windows (WSL)**: Git comes with Ubuntu in WSL. If not: `sudo apt install git`

## Configure Git

```bash
git config --global user.name "Your Full Name"
git config --global user.email "you@example.com"
```

Use the same email you'll use for GitHub.

## Create a GitHub Account

1. Go to https://github.com/
2. Sign up (free account is fine)
3. Verify your email

## Set Up SSH Key

This lets you push code to GitHub without typing your password every time.

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "you@example.com"
# Press Enter to accept the default file location
# Enter a passphrase (optional but recommended) or press Enter for none

# Start the SSH agent
eval "$(ssh-agent -s)"

# Add your key to the agent
ssh-add ~/.ssh/id_ed25519

# Display the public key (copy this entire output)
cat ~/.ssh/id_ed25519.pub
```

Now add the key to GitHub:
1. Go to https://github.com/settings/keys
2. Click "New SSH key"
3. Paste the public key
4. Give it a name (e.g., "My Laptop")
5. Click "Add SSH key"

## Verification

```bash
git --version
# Should show: git version 2.x.x

ssh -T git@github.com
# Should show: Hi username! You've successfully authenticated...
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Permission denied (publickey)` | Key not added to GitHub, or wrong key. Re-run `cat ~/.ssh/id_ed25519.pub` and paste to GitHub |
| `ssh-keygen: command not found` | Windows without WSL: install Git for Windows (includes ssh tools) |
| `Could not open a connection to your authentication agent` | Run `eval "$(ssh-agent -s)"` first |
| GitHub asks for password on push | You cloned with HTTPS, not SSH. Re-clone with the SSH URL |

> **Aside.** SSH key setup is the closest thing software has to a secret handshake. Once GitHub says "Hi username!" back, you're in the club for life — or until you get a new laptop.

---

# Step 5 — Claude Account + API Key (5 min)

## Create a Claude Account

1. Go to https://claude.ai/
2. Sign up for a free account
3. Verify your email

## Get an API Key

1. Go to https://console.anthropic.com/
2. Sign in (same account, or create a new one)
3. Navigate to "API Keys"
4. Click "Create Key"
5. Name it (e.g., "AI Tour")
6. **Copy the key immediately** — you won't see it again
7. Store it securely (password manager, or a local file NOT in any git repo)

## Install Claude Code (CLI)

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Set your API key:
```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, or ~/.profile)
export ANTHROPIC_API_KEY="your-key-here"

# Reload your shell
source ~/.bashrc   # or source ~/.zshrc
```

## Verification

```bash
claude --version
# Should show a version number

# Quick test (uses API credits):
claude "Say hello in one sentence"
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `claude: command not found` (after install) | Restart your terminal. If still missing, ensure `~/.local/bin` (or wherever the installer placed the binary — check the install script's final output) is on your `PATH`. |
| Installer fails with permission denied | Re-run **without** `sudo`. The script installs into your home directory, not system paths. |
| Installer fails with network/curl errors | Check your firewall or proxy. Re-run `curl -fsSL https://claude.ai/install.sh \| bash` once the network is clear. If `curl` itself is missing, install it first (`brew install curl` / `apt install curl`). |
| API key errors | Verify the key at https://console.anthropic.com/ — regenerate if needed |
| Rate limit errors | Free tier has limits. Wait a few minutes and try again |

---

# Step 6 — Join the Class Channel (2 min)

1. Click the invite link shared by your instructor (Discord or Telegram)
2. Join the channel
3. Read the pinned message for channel rules

That's it. Don't overthink this one.

---

<!-- BURMESE-PROVERB-HOOK: a proverb about watching and learning before doing, or about the eye teaching the hand -- fits the "exposure, not mastery" goal of the terminal video -->

# Step 7 — Terminal Crash Course Video (30 min)

Watch this before Chapter 1:

- **Recommended**: [MissingSemester (MIT) — Lecture 1: The Shell](https://missing.csail.mit.edu/2020/course-shell/) (30 min)
- **Alternative**: Any beginner terminal tutorial on YouTube (search "terminal basics for beginners")

You don't need to memorize anything. The goal is exposure — so the terminal isn't completely foreign when we start Chapter 1.

---

# Step 8 — "Hello World" Channel Post (3 min)

Post your first message in the class channel. Use this template:

```
Hello! I'm [your name].
Background: [beginner / some coding / experienced developer]
Interested in: [what you hope to build or learn]
Setup status: [complete / in progress / stuck on ___]
```

Example:
```
Hello! I'm Thura.
Background: beginner, learned some HTML
Interested in: building a tool for my small business
Setup status: complete
```

This confirms you've joined the channel and the instructor knows you're ready.

> **Aside.** Your first "hello world" in a new community is a tiny act of courage. Nobody remembers theirs being elegant. Just post it.

---

# Step 9 — Verification Screenshots (5 min)

Take screenshots of these commands and their output:

```bash
git --version
node --version
python3 --version
claude --version
```

Post the screenshots in the class channel (or wherever the instructor specifies). This is how we confirm everyone's setup before Chapter 1.

**How to take a screenshot**:
- **macOS**: Cmd + Shift + 4, then drag to select
- **Linux**: Use the Screenshot tool, or `gnome-screenshot -a`
- **Windows**: Win + Shift + S (Snipping Tool)

---

# Full Verification Checklist

Run all of these. Every line should produce output (not an error):

```bash
# Editor
code --version    # or cursor --version

# Node.js
node --version
npm --version

# Python
python3 --version
pip3 --version

# Git
git --version
git config --global user.name
git config --global user.email

# GitHub SSH
ssh -T git@github.com

# Claude Code
claude --version
```

If any command fails, go back to that step's troubleshooting section.

---

# Pre-class Resources (Optional)

These are not required, but they'll give you a head start.

## Anthropic Academy: Introduction to Claude

https://docs.anthropic.com/en/docs/welcome

Covers what Claude is, how to use it effectively, and basic prompting. 30 minutes of reading.

## GitHub: Introduction to GitHub

https://docs.github.com/en/get-started/start-your-journey/hello-world

GitHub's own tutorial — create a repo, make a branch, open a pull request. 15 minutes.

## MissingSemester (MIT): First 2 Lectures

https://missing.csail.mit.edu/

Lecture 1: The Shell. Lecture 2: Shell Tools and Scripting. These are the "stuff they don't teach in class" lectures from MIT. Watch at 1.5x if you want.

---

# You're Ready

If you've completed all 9 steps:
- Editor installed and opens
- Node.js and Python verified
- Git configured, SSH key on GitHub
- Claude account with API key working
- Channel joined, hello world posted
- Verification screenshots shared

**You're ready for Chapter 1.** See you in the first live session.

If your setup is incomplete, reach out in the channel before class. We'll sort it out in office hours.

---

# Timing Estimate

| Step | Task | Time |
|------|------|------|
| 1 | Code editor | 5 min |
| 2 | Node.js | 10 min |
| 3 | Python | 10 min |
| 4 | Git + GitHub + SSH | 15 min |
| 5 | Claude account + API key | 5 min |
| 6 | Join channel | 2 min |
| 7 | Terminal video | 30 min |
| 8 | Hello world post | 3 min |
| 9 | Verification screenshots | 5 min |
| | **Total** | **~85 min** |

The video is the biggest chunk. If you've already watched a terminal intro, skip it and you're down to ~55 minutes.
