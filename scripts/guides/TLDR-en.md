---
lang: en
---

# Claude Code — TL;DR Cheatsheet

*Condensed from [claude-guides.com](https://claude-guides.com/) (Paul Larionov). The most useful 20%.*

## Mental model

Treat Claude Code as an **autonomous system, not a chatbot**. Power comes from automation, agents, and parallel work — not from typing more.

Core loop for any real task: **Research → Plan → Execute → Review → Ship.**

## Keyboard shortcuts (learn these 6 first)

| Key | Action |
|-----|--------|
| `Ctrl+C` | Cancel input / generation |
| `Ctrl+G` | Open prompt in external editor |
| `Shift+Tab` | Cycle permission modes |
| `Alt+P` | Switch model |
| `Alt+T` | Toggle thinking |
| `Esc Esc` | Rewind file edits |

Prefixes: `/` slash command · `!` run bash · `@` mention a file.

## Slash commands you'll use daily

| Command | Use |
|---------|-----|
| `/clear` · `/compact [focus]` | Reset / shrink context |
| `/plan` | Read-only plan before big changes |
| `/review` | Multi-agent code review |
| `/debug` | Debug from an error log |
| `/simplify` | Clean up code just written |
| `/context` · `/cost` | See context + token usage |
| `/btw <q>` | Side question, no context cost |
| `/loop [interval]` | Recurring task, local, up to 3 days |
| `/schedule` | Recurring task, cloud, machine offline OK |

## Permission modes

`default` (prompts) · `acceptEdits` (auto-accept edits) · `plan` (read-only) · `dontAsk` (deny if not pre-approved) · `bypassPermissions` (skip all — trusted/isolated only).

## Agents (parallel work)

- **Explore** — fast read-only codebase search (Haiku)
- **Plan** — research for plan mode
- **General** — all tools, complex multi-step tasks
- Each agent can run in its own **git worktree** → true parallel dev, no merge conflicts.
- Custom agents live in `.claude/agents/`.

## Memory: 3 ways to inject knowledge

1. **Commands** — quick repeatable prompt templates (`/commit`, `/simplify`).
2. **Skills** — configurable, auto-discoverable, can fork context. Live in `.claude/skills/<name>/` or `~/.claude/skills/`.
3. **Memory** — `CLAUDE.md` for rules/conventions across sessions.
   - `./CLAUDE.md` project · `~/.claude/CLAUDE.md` personal · `/etc/claude-code/` org.
   - Import files with `@path`. Keep under ~5K tokens.

## MCP servers

Extend Claude Code with external tools (GitHub, Slack, Postgres, …). Configure in `.mcp.json`:

```json
{ "mcpServers": { "github": { "command": "mcp-github" } } }
```

Manage with `/mcp` or `claude mcp list`. Transports: `http` (recommended), `stdio` (local), `sse`.

## CLI essentials

```bash
claude                 # interactive
claude -p "prompt"     # headless / scriptable
claude -c              # continue last
claude -r "name"       # resume by name
```

Key flags: `--model` · `-w` worktree · `--add-dir` · `--agent` · `--output-format json` · `--max-turns` · `--max-budget-usd` · `--effort low|med|high|max` · `--permission-mode` · `--dangerously-skip-permissions` ⚠.

## Environment variables

`ANTHROPIC_API_KEY` · `ANTHROPIC_MODEL` · `CLAUDE_CODE_EFFORT_LEVEL` (low/med/high) · `MAX_THINKING_TOKENS` (0=off) · `CLAUDE_CODE_MAX_OUTPUT_TOKENS` (default 32K).

## Best practices (top 6)

1. Memorize 3–4 shortcuts — saves typing every day.
2. Use **plan mode** for anything multi-step before touching code.
3. **Be specific** in prompts: "Add pagination to the user list" beats "improve this".
4. Reference files with `@filename` instead of pasting.
5. Commit small and often (`/commit`); worktrees sandbox experiments.
6. Pick the model deliberately: **Haiku** cheap/fast, **Sonnet** general coding, **Opus** deep reasoning.

## Common pitfalls

Skipping shortcuts · skipping plan mode · overloading context · ignoring error messages · approving every change manually · giant rare commits.
