# Claude Code Architectural Patterns & Advanced Workflows — Complete Guide

> Source: https://claude-guides.com/blog/claude-code-architectural-patterns.html
> Crawled: 2026-06-17

Master the convergent Research → Plan → Execute pattern, autonomous agents, subagents, and production-ready AI development strategies that power enterprise workflows.

## 1. Core Architectural Pattern: Research → Plan → Execute → Review → Ship

The convergent pattern across all major Claude Code workflows is a five-stage process that ensures systematic, high-quality outcomes:

1. **Research:** Gather information, explore codebase, understand requirements
2. **Plan:** Design architecture, identify critical files, outline implementation strategy
3. **Execute:** Implement changes, write code, update files systematically
4. **Review:** Check quality, test functionality, verify correctness
5. **Ship:** Commit, push, and deploy to production

**💡 Pro Tip:** This pattern scales from single-file edits to enterprise multi-agent deployments. Use it consistently for predictable, reliable outcomes.

## 2. Autonomous Agents & Subagents

Agents are the foundation of autonomous AI workflows in Claude Code. A subagent is:

> "Autonomous actor in fresh isolated context — custom tools, permissions, model, memory, and persistent identity"

### Key Characteristics:

- **Fresh Context:** Each subagent starts with a clean slate, no history bloat
- **Custom Tools:** Configure exactly which tools (filesystem, git, API access) each agent can use
- **Isolated Permissions:** Fine-grained control over what each agent can access
- **Persistent Identity:** Agents maintain identity across tasks, enabling multi-step workflows
- **Shared Coordination:** Multiple agents work in parallel on the same codebase with shared task tracking

### Agent Teams for Parallel Development:

Launch multiple agents simultaneously, each with its own worktree (isolated git branch). This enables true parallelization without conflicts:

```
# Agent A works on feature/auth
# Agent B works on feature/database
# Agent C works on feature/api
# All merge back to main when ready
```

**💡 Pro Tip:** Use agent teams for features that can be developed independently. Each agent gets a dedicated git worktree, eliminating merge conflicts during development.

## 3. Auto Mode: Safety Without Prompts

By default, Claude Code asks for permission before executing sensitive operations. **Auto Mode** replaces manual permission prompts with a background safety classifier:

```
claude --enable-auto-mode
```

This allows agents to work autonomously while maintaining safety guardrails. The classifier evaluates risk and auto-approves safe operations, blocking suspicious ones.

## 4. Organization & Context Management

### Commands vs. Skills vs. Memory

Claude Code has three ways to inject knowledge into existing context:

#### Commands

"Knowledge injected into existing context — simple user-invoked prompt templates for workflow orchestration."

Use when: You need a quick, repeatable workflow. Examples: `/batch`, `/simplify`, `/commit`

#### Skills

"Knowledge injected into existing context — configurable, preloadable, auto-discoverable, with context forking."

Use when: You need more complexity and customization than commands. Skills can be triggered automatically based on conditions.

#### Memory (CLAUDE.md Files & @path Imports)

Persistent context via CLAUDE.md files and @path imports with auto-memory and rules organization.

Use when: You need rules, conventions, or project-specific knowledge that applies across all sessions.

### Memory Best Practices:

- Create `CLAUDE.md` in your project root with project conventions, style guides, and rules
- Use `@path imports` to inject context from specific files without bloating memory
- Organize memory hierarchically: project-level, team-level, personal preferences
- Keep memory under 5K tokens for optimal context efficiency

## 5. Execution & Scaling: From Local to Cloud

### Scheduled Tasks: /loop vs. /schedule

- **/loop:** Runs prompts locally on your machine, up to 3 days of persistence. Perfect for polling, monitoring, and recurring tasks that don't require continuous uptime
- **/schedule:** Runs tasks in the cloud even when your machine is offline. For workflows that must run continuously regardless of your local session state

**Example:** Use `/loop 5m "check deployment status"` to poll status every 5 minutes for the next 3 days.

### Parallel Development with Git Worktrees

Claude Code automatically creates isolated git worktrees for each agent, enabling truly parallel development:

```
# Each agent gets its own worktree
agent-1: .git/worktrees/feature-auth
agent-2: .git/worktrees/feature-database
agent-3: .git/worktrees/feature-api

# All changes merge cleanly back to main
```

### Remote Control: Continue From Any Device

Resume sessions from any device without loss of context:

```
/remote-control
# or
/rc
```

Useful for picking up work on the go, switching between desktop/laptop, or handing off work to teammates.

## 6. Hot Features & Advanced Capabilities

### Multi-Agent Code Review

Leverage Claude Code's code review feature to have multiple agents analyze PRs simultaneously, catching:

- Logic bugs and edge case failures
- Security vulnerabilities (SQL injection, XSS, etc.)
- Performance regressions and memory leaks
- Style violations and architectural drift

### Ultraplan: Cloud-Based Planning

Draft implementation plans in the cloud with:

- Browser-based review interface
- Inline comments and suggestions
- Real-time collaboration with teammates
- Version history and approval workflows

### Claude Code Web

Run tasks on cloud infrastructure with:

- Scheduled tasks that execute without your machine running
- Parallel sessions for independent workflows
- Higher resource limits than local execution
- Persistent logs and audit trails

### Agent SDK (Python/TypeScript)

Build production AI agents using Claude Code as a library. Integrate autonomous agents directly into your applications with:

- Full control over agent behavior and permissions
- Custom tool definitions and integrations
- Embedded model selection and inference parameters
- Event streaming and real-time monitoring

### Channels: Push Events Into Running Sessions

Integrate Telegram, Discord, and other chat platforms to push events directly into Claude Code sessions. Claude reacts autonomously to incoming messages, making your workflow context-aware and responsive.

### Computer Use (Beta)

Let Claude control your screen on macOS for end-to-end automation of GUI-based workflows. Useful for testing, browser automation, and workflows that require visual feedback.

## 7. MCP Servers: Extend Claude Code Capabilities

MCP (Model Context Protocol) servers connect Claude Code to external tools, databases, and APIs. Configure them in `.mcp.json`:

```json
{
  "mcpServers": {
    "github": { "command": "mcp-github" },
    "slack": { "command": "mcp-slack" },
    "postgres": { "command": "mcp-postgres" }
  }
}
```

**Common integrations:**

- Version control (GitHub, GitLab)
- Communication (Slack, Discord, Email)
- Databases (PostgreSQL, MongoDB, Firebase)
- Cloud platforms (AWS, GCP, Azure)
- Project management (Jira, Linear, Asana)
- APIs and webhooks

## 8. Configuration & Settings

### Hierarchical Settings in .claude/settings.json

Configure Claude Code behavior globally or per-project:

- **Permissions:** Which operations require approval
- **Model Config:** Default model, temperature, max tokens
- **Output Styles:** Formatting, colors, verbosity
- **Keyboard Bindings:** Custom shortcuts for frequent actions
- **Auto-Behaviors:** Hooks that run before/after operations

## 9. Pro Tips for Production Excellence

### Tip 1: Simplify Code Quality with /simplify

Review changed code for reuse, quality, and efficiency, then fix issues automatically. Use this after implementing features to ensure clean, maintainable code.

### Tip 2: Batch Operations with /batch

Apply the same transformation across multiple files. Great for refactoring variable names, updating imports, or applying consistent formatting.

### Tip 3: Checkpointing for Safety

Use `/rewind` or press `Esc Esc` to track and rewind file edits automatically. This gives you a safety net for exploratory changes without committing them.

### Tip 4: Voice Dictation

Enable voice input with `/voice`. Supports 20+ languages and rebindable keys for hands-free control during complex problem-solving sessions.

### Tip 5: Strategic Model Selection

Different models have different costs and capabilities:

- **Haiku:** Fast, lightweight work (queries, summaries, simple edits)
- **Sonnet:** General-purpose (coding, analysis, detailed writing)
- **Opus:** Deep reasoning required (complex architecture, novel problems)

Switch models deliberately at the start of sessions to optimize for cost vs. capability.

## 10. Workflow Intelligence Across Teams

Different teams emphasize distinct approaches to Claude Code workflows:

#### Everything Claude Code (148k references)

Focus: Instinct scoring, AgentShield safety, multi-language rules. Best for: Large teams with diverse tech stacks.

#### Superpowers (143k references)

Focus: TDD-first, Iron Laws, whole-plan review. Best for: Quality-obsessed teams, large refactors, greenfield projects.

#### Get Shit Done (50k references)

Focus: Fresh 200K contexts, wave execution, XML plans. Best for: Speed-first teams, MVPs, rapid iteration.

#### BMAD-METHOD (44k references)

Focus: Full SDLC, agent personas, 22+ platforms. Best for: Enterprise teams, compliance-heavy projects, complex workflows.

## Conclusion: Building for Scale

Mastering Claude Code's architectural patterns enables you to:

- Build autonomous workflows that scale from single features to enterprise systems
- Leverage agents and subagents for true parallel development
- Integrate external systems and data sources seamlessly via MCP servers
- Maintain code quality and safety while accelerating development speed
- Adopt the Research → Plan → Execute → Review → Ship pattern for predictable outcomes

**🚀 Next Steps:** Start with a single agent on a small feature, master the Research → Plan → Execute pattern, then scale to multi-agent teams and cloud-based workflows. Each step is a natural progression that builds on the previous one.

**Last updated:** April 12, 2026
