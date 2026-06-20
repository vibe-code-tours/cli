# Chapter 1 — Detailed Content

**Foundation + Mental Model**

**Chapter outcome**: AI/vibe coding ဆိုတာ ဘာလဲ နားလည် + setup confirmed + first GitHub contribution + Tour Repo PR merged

**Pre-requisite**: Chapter 0 setup verified. Anyone with incomplete setup gets office hour before Session 1.

> **Aside.** First-day jitters are a feature, not a bug. Everyone in this room -- including the one running the demo -- has at some point stared at a terminal cursor and wondered if it was judging them. It is not. Probably.

---

# SESSION 1 — Mental Model

**Duration**: 2 hours (120 min)
**Energy goal**: Curiosity > anxiety. Beginners shouldn't feel overwhelmed; developers shouldn't feel bored.

---

## Block A — Opening (15 min)

**Tier**: A (human ceremony) + brief C demo
**Outcome**: Students understand what the Tour is, feel welcomed, and see AI used once before any teaching begins.

### Pre-block state

Students have completed Chapter 0 setup. They've posted a "hello world" in the channel. They don't know each other yet. They may be nervous (beginners) or skeptical (experienced devs).

### Talking points

- Welcome. Introduce yourself briefly — your background, why you built this Tour.
- This is a **Tour, not a bootcamp**. Say it explicitly:
  - "We're not here to transform you in 8 weeks."
  - "We're here to show you the AI coding landscape and give you a map."
  - "You leave with awareness and a community, not a certificate."
- Expectations:
  - Free, weekend sessions, ~6 hours/week including homework
  - Team-based — you'll be in a team of 3 from Chapter 3
  - The project is a vehicle — it's practice, not the point
- Code of conduct: brief, human. Respect, curiosity, no question is stupid.
- Channel etiquette: ask in channel, help others, share wins.

### Demo steps (closing 2 min)

This is the first taste of AI in the Tour. Keep it light.

1. Open Claude Code (or Claude Desktop) on screen
2. Type: "Generate 3 friendly icebreaker questions for a coding class with mixed experience levels"
3. Show the output
4. Say: "That's the smallest possible example of what we'll do all class. The AI is a partner, not a vending machine. We'll learn to work *with* it."

### Transition

"Before we touch any tools, let's get the mental model right. What even *is* this AI we're going to be working with?"

---

## Block B — AI/LLM Mental Model (30 min)

**Tier**: B (concept foundation)
**Outcome**: Students can explain context window, tokens, and hallucination in their own words.

### Pre-block state

Students have used ChatGPT or Claude casually, maybe. They likely have misconceptions — "AI knows everything," "AI is always right," "AI thinks like a person."

### Talking points

**What is an LLM (5 min)** — no math.
- An LLM is a very advanced pattern-completion system trained on enormous text.
- It predicts what text should come next, given what came before.
- It's not a database, not a search engine, not a person. It's a prediction engine.
- Analogy: "Imagine someone who has read most of the internet but remembers none of it precisely — they've absorbed the *patterns* of how things are written."

**Context window (8 min)** — "AI's short-term memory."
- The context window is everything the AI can "see" right now — your messages, its responses, files you've shared.
- It's limited. When it fills up, early content falls out of view.
- Analogy: "A desk. You can spread out only so many papers. Add a new one, an old one falls off."
- This is *the* problem Chapter 4 solves. Plant the seed here.

**Tokens (5 min)** — units of text.
- Text is broken into tokens — roughly word-pieces. "Hello" is 1 token; "unbelievable" might be 3.
- Both input and output cost tokens.
- Cost and context limits are measured in tokens.

**Hallucination (7 min)** — when AI confidently invents.
- Because it predicts plausible text, it sometimes produces plausible-but-wrong text.
- Most common: specific facts, API details, library versions, citations.
- It's not lying — it has no concept of truth, only plausibility.
- The skill: knowing *when* to verify. Chapter 2 covers "AI struggle signals."

> **Aside.** A hallucinating AI is the most confident colleague you'll ever have: it will cite a function that doesn't exist, in a library that doesn't exist, with a version number that almost makes sense. Treat fluency and correctness as two different variables.

### Demo steps (interspersed, ~5 min total within the above)

- **Context overflow demo**: In Claude Desktop, have a long-ish conversation, then ask about something said early. Show it getting fuzzy.
- **Hallucination demo**: Ask Claude for a specific, obscure API method that doesn't exist. Watch it confidently invent one. Then say: "See? Plausible. Wrong. This is why we verify."

### Transition

"So that's what the AI *is*. Now — how does coding *with* it actually feel different from coding without it?"

---

## Block C — Vibe Coding Mindset (25 min)

**Tier**: B (mindset shift)
**Outcome**: Students can articulate the difference between manual coding and vibe coding, and when each is appropriate.

### Pre-block state

Students think of coding as "typing code." Beginners find that intimidating; experienced devs find it normal. Both need reframing.

### Talking points

**Definition (5 min)**
- "Vibe coding" — describing what you want in natural language and letting AI generate the code, then reviewing and steering.
- The developer's job shifts: from *typing* to *directing and judging*.
- The term comes from the idea of coding by intent and feel rather than by manual syntax.

**Workflow comparison (10 min)**

Walk through the same task two ways. Use a concrete example — "add a contact form to a webpage."

Manual workflow:
- Search Google → find Stack Overflow answer → copy → adapt to your code → debug the mismatch → test → repeat
- Maybe 10-15 minutes, lots of context-switching

Vibe coding workflow:
- Describe the form to Claude → review what it generates → ask for adjustments → test
- Maybe 2-3 minutes, stay in flow

**When each is right (10 min)** — this is the nuance, don't skip it.
- Vibe coding shines: boilerplate, unfamiliar libraries, exploration, first drafts, repetitive work.
- Manual still matters: when you need to *understand* deeply, when the AI is stuck (Chapter 2), when the change is tiny and specific.
- The Tour's stance: **AI is the default partner, manual is the exception** — but you must still understand what's produced.
- This connects to the Tier framework: some skills (Tier B) you learn manually first, *then* let AI accelerate.

<!-- BURMESE-PROVERB-HOOK: a proverb about judgment over busywork, or about the wise person steering versus the busy person rowing -- fits the "typing → directing and judging" reframe -->

### Transition

"Enough talking about it. Let me show you the actual difference. Same task, two tools."

---

## Block D — Live Demo: Claude Desktop vs Claude Code (30 min)

**Tier**: C (AI demonstration)
**Outcome**: Students have seen both surfaces and understand when each fits.

### Pre-block state

Students have heard "Claude Code" and "Claude Desktop" but don't know the difference. Some have used chat-based AI; few have used a CLI AI tool.

### Demo steps

**Setup**: Have a small task ready — e.g., "build a simple webpage that shows a profile card."

**Demo A — Claude Desktop / chat (12 min)**
1. Open Claude Desktop (or claude.ai)
2. Ask: "Write HTML and CSS for a profile card with a name, photo placeholder, and bio."
3. Show the response — code in a block
4. Point out the workflow: "I copy this. I paste it into a file. I open the file. If I want changes, I come back, ask, copy, paste again."
5. Make one change request, show the copy-paste loop
6. Verdict: "Great for quick things, asking questions, exploring. But notice the friction — the AI can't see my files, can't run anything."

**Demo B — Claude Code / CLI (15 min)**
1. Open a terminal, navigate to an empty folder
2. Run `claude`
3. Ask the *same thing*: "Build a profile card webpage with name, photo placeholder, and bio."
4. Show Claude Code creating the file directly (with approval)
5. Show it can open the file, run a local server, see the result
6. Make the same change request — show it editing the file in place, no copy-paste
7. Verdict: "Claude Code lives *in* your project. It sees files, runs commands, makes changes directly. This is what we go deep on in Chapter 2."

**Comparison (3 min)**
- Chat: quick questions, exploration, no project context
- Claude Code: real building, project-aware, our primary tool

### Important notes for instructor

- **Recording backup mandatory.** Live demos fail — network, account, API hiccups. Have a recording of this exact demo ready to play if live fails.
- Don't rush Demo B — it's the "aha" moment. The contrast does the teaching.

### Transition

"You'll be deep in Claude Code from Chapter 2 on. But first — one skill that quietly changed in the AI age: how we read documentation."

---

## Block E — Reading Skills for the AI Age (15 min)

**Tier**: B (core skill) + C (AI-mediated)
**Outcome**: Students know both traditional and AI-assisted ways to understand an unfamiliar tool.

### Pre-block state

Beginners are scared of documentation. Experienced devs read docs but may not have thought about AI-mediated reading.

### Talking points

**Traditional documentation (5 min)**
- Every tool has a manual. Three universal entry points:
  - `--help` flag — quick reference, almost every CLI tool
  - `man [command]` — fuller manual (Unix tools)
  - README — project overview, usually on GitHub
- Demo: run `git --help`, then `git commit --help`. Show the structure.
- "You don't memorize tools. You learn to *find* what you need."

**AI-assisted onboarding (10 min)**
- The new layer: AI can read docs *for* you and explain in context.
- Patterns:
  - "Claude, what does this tool do?" — quick orientation
  - "Claude, explain what `git rebase` does, with a simple example" — concept on demand
  - "Claude, I ran [command] and got [error] — what does it mean?" — error interpretation
- Demo: ask Claude to explain a flag from the `git commit --help` output you just showed
- The judgment: "Use `--help` for a quick flag check. Ask Claude when you need the *concept* explained, or when the docs are dense."
- This is the workflow you'll use for the rest of class — and after.

### Transition

"That's the mental model. Next session we get our hands dirty — terminal and git, the ground floor every developer stands on."

---

## Block F — Wrap (5 min)

**Tier**: A
**Outcome**: Students know what's next and what to do before Session 2.

### Talking points

- Quick Q&A — take 2-3 questions.
- Homework brief:
  - Watch the terminal/git video if not done (Chapter 0 resource)
  - Come to Session 2 with the setup working
- Preview: "Next session — terminal, git, and your first real GitHub contribution. You'll make a pull request to the Tour's own repository."
- Reminder: "Stuck on anything? Channel first — try Claude, then ask the channel."

---

# SESSION 2 — Terminal + Git Fluency

**Duration**: 2 hours (122 min — 2 min over, acceptable)
**Energy goal**: Confidence building. "I can navigate this" feeling.

---

## Block A — Recap + Markdown + Idea Brainstorm (17 min)

**Tier**: B (markdown core) + C (idea brainstorm)
**Outcome**: Students understand markdown basics and have started thinking about project ideas.

### Pre-block state

Session 1 covered concepts. Now students need practical ground. They haven't thought about what they'll build.

### Talking points

**Recap (3 min)**
- Quick recall: context window, vibe coding, the two Claude surfaces.

**Markdown intro via StackEdit (3-5 min)**
- "Markdown is plain text with simple symbols that become formatting."
- Open StackEdit.io — show the split pane (text left, rendered right)
- Type live: a heading (`#`), a list (`-`), bold (`**text**`), a code block, a link
- "That's 90% of what you'll ever use. You'll see markdown everywhere — README files, this Tour's docs, CLAUDE.md in Chapter 2."
- "You can keep practicing in StackEdit on your own. We won't drill it."

> **Aside.** Markdown looks innocent until you discover the difference between three backticks and four, or accidentally turn a whole document into an `<h1>` because you held shift one extra time. The preview pane is your friend; trust it more than your eyes.

**Idea brainstorm intro (5 min)**
- "Starting Chapter 2, I want you posting project ideas — 1 to 3 of them."
- What makes a good idea: a real user (name a person), something AI can meaningfully help build, shippable in 8 chapters.
- What to avoid: todo apps, weather apps, note apps — tutorial territory.

> **Aside.** Project ideas inflate fast: "a small thing for my cousin's shop" rarely survives first contact with a blank editor before becoming a multi-tenant, AI-native, blockchain-adjacent super-app. Reverse the gravity. Aim small on purpose -- the cousin's shop is the better idea.

**Claude-driven brainstorm demo (3 min)**
- Show it: "Claude, I want to build something but I have no idea what. I'm interested in [hobby/local context]. Suggest 3 project ideas with a real user in mind."
- "If you're stuck for ideas, this is a legitimate way to start."

**Idea pool examples (the remaining ~3 min)**
- Show 4-5 Myanmar-context example ideas to prime thinking.

### Transition

"Ideas can simmer. Right now — the terminal. The text-based way to talk to your computer."

---

## Block B — Terminal Essentials (30 min)

**Tier**: B (core navigation) + C (complex commands)
**Outcome**: Students can navigate the filesystem and create/move files using core commands, and know to ask Claude for complex ones.

### Pre-block state

Beginners may have never opened a terminal. Experienced devs know this. Manage both — give beginners safety, give experienced devs the "AI extension" angle as new.

### Talking points

**Mental model (10 min)**
- The terminal is a text way to do what you do with clicks in a file explorer.
- Filesystem = nested folders. A "path" is an address: `/home/charlie/projects/myapp`.
- Two reference points: where you *are* (working directory), and where things *are* relative to that.
- Analogy: "The terminal is standing in a room. `ls` is looking around. `cd` is walking through a door."

**Core commands — hands-on (15 min)**

Have students type each one. Don't just show — make them do it.

- Navigation: `pwd` (where am I), `ls` (what's here), `cd` (go somewhere)
- Create: `mkdir` (new folder), `touch` (new empty file)
- Manipulate: `cp` (copy), `mv` (move/rename), `cat` (show contents)
- "That's 8 commands. That's your daily kit. You don't need more to start."

Exercise: have everyone create a folder `tour-practice`, cd into it, create a file, list it, rename it.

**AI partner extension (5 min)**
- "When you need something beyond the daily 8 — ask Claude."
- Example: "Claude, what's the command to find all files larger than 1MB in this folder?"
- "Daily commands: muscle memory. Complex commands: ask. Don't memorize the obscure stuff."

### Common pitfalls (watch for)

- Beginners typing into the wrong window
- Path confusion — relative vs absolute
- Case sensitivity (Linux/Mac)
- See `chapter-1-facilitation.md` for handling these

### Transition

"You can move around now. Next — git. How code gets saved, versioned, and shared."

---

## Block C — Git Setup + Basics (35 min)

**Tier**: B (foundation) + C (Claude-mediated workflow)
**Outcome**: Students have git configured, understand the core workflow, and can use Claude for commit messages.

### Pre-block state

Beginners find git intimidating — it has a reputation. Experienced devs know basics but maybe not the AI-mediated angle.

### Talking points

**Git mental model (5 min)**
- Git is a save system for code — but smarter than Ctrl+S.
- A **commit** is a labeled save point. You can return to any of them.
- A **branch** is a parallel timeline — work without disturbing the main line.
- Analogy: "Video game save points. Commit = save. Branch = a separate save slot to try something risky."

**First-time setup (10 min)** — manual, one-time. Tier A really.
- `git config --global user.name "..."` and `user.email "..."`
- SSH key generation — walk through it. This is the hardest part for beginners.
  - Generate key, add to GitHub, test connection
  - Windows users will struggle most — pair them, slow down
- GPG signing — mention only, 1 minute: "This verifies commits are really from you. You don't need it now. Just know it exists."

**Core workflow — hands-on (10 min)**
- The daily six: `git clone`, `git status`, `git add`, `git commit`, `git push`, `git pull`
- Walk through the cycle: clone a repo, make a change, status, add, commit, push.
- "These six. That's the daily git kit."

**AI partner extension (10 min)**
- Claude Code is git-aware. Show it.
- Commit messages: "Claude, write a commit message for these changes" — it reads the diff, suggests a message.
- Status interpretation: paste a confusing `git status` output, ask Claude what it means.
- Conflicts: "When git confuses you — and it will — paste the situation to Claude."
- `git lgb` (a pretty log) — show it as a bonus, mention it's homework to set up.

> **Aside.** "Just push to main" is the developer equivalent of "hold my drink." Branches exist so that future-you doesn't have to apologize to present-you. We'll use them on purpose, starting now.

### Common pitfalls (watch for)

- SSH key setup failures, especially Windows
- Confusing `git add` (stage) vs `git commit` (save)
- Forgetting to `git pull` before `git push`
- See facilitation guide for handling

### Transition

"Code saved and shareable. Now — where do you actually write it? Editors."

---

## Block D — Editor & Workflow Choice (15 min)

**Tier**: B (awareness)
**Outcome**: Students understand editor options and know editor choice isn't permanent.

### Talking points

- Two categories:
  - **GUI editors**: VS Code, Cursor — visual, familiar, mouse + keyboard
  - **TUI / terminal**: Claude Code itself (Chapter 2 deep dive), plus OpenCode, Aider — keyboard-driven, in-terminal
- "Pick one to start. You can switch. This isn't a marriage."
- Quick VS Code / Cursor tour: file explorer, the editor pane, the built-in terminal panel, extensions.
- AI extensions exist — mention briefly, "Chapter 2 we go deep on the AI side."
- Don't oversell any one editor. Awareness, not prescription.

### Transition

"You can navigate, save code, and you have an editor. Time to make it real — your first contributions on GitHub."

---

## Block E — Hands-on: First Contributions (20 min)

**Tier**: B (Git mechanics) + C (Claude drafts README)
**Outcome**: Students have a personal repo and have opened a PR to the Tour Repo.

<!-- BURMESE-PROVERB-HOOK: a proverb about the first step of a long journey, or about the small thing that becomes a habit -- fits the moment of opening a first-ever pull request -->

### Hands-on instructions

**Part 1 — Personal repo (10 min)**
1. On GitHub (web): create a new public repo, name it freely
2. Clone it locally via SSH: `git clone git@github.com:...`
3. Open in editor
4. Create the README with Claude's help: in Claude Code, "Draft a README for a repo where I'll be building projects during an AI coding tour. I want to ship [their interest]."
5. Student reviews the draft, edits it — applies the markdown they saw in Block A
6. `git add`, `git commit` (let Claude draft the message), `git push`
7. Refresh GitHub — see it live

**Part 2 — Tour Repo PR (10 min)**

> **Note for instructor**: The Tour Repo invite link is shared at Class 1 (look for it in the channel). If the Tour Repo is not yet live at your cohort start, walk students through the steps below as a preview — they'll do the actual PR once the invite drops. Either way, narrate the same workflow.

1. Open the Tour Repo invite shared by your instructor (GitHub link in the class channel)
2. Fork it (button, top right)
3. Clone the fork locally
4. Create a branch: `git checkout -b intro/[username]`
5. Copy the intro template into `cohort-1/students/[username]/intro.md`
6. Fill it in — Claude can scaffold, student personalizes
7. Commit, push to the fork
8. Open a Pull Request to the Tour Repo
9. "This is a real PR — the workflow open source runs on. You just did it (or will, the moment the invite drops)."

### Important notes

- This is many students' first-ever PR. Celebrate it.
- Instructor merges PRs as they come in (or shortly after).
- Fork vs branch confusion is common — see facilitation guide.

### Transition

"You just contributed to a real repository. That's not a small thing. Let's wrap."

---

## Block F — Wrap (5 min)

**Tier**: A
**Outcome**: Students know homework and feel a sense of progress.

### Talking points

- Acknowledge: "Today you went from terminal basics to an actual pull request. That's real progress."
- Homework brief (see homework section below)
- Resource pointers: markdown guide, GitHub's own git course, MissingSemester
- Preview: "Chapter 2 — we go deep on Claude Code. The one tool we truly master. Come with your setup working and your project ideas posted."
- "Channel is open all week. Claude first, then channel."

---

# Chapter 1 Homework

## Mandatory (before Chapter 2)

- Idea 1-3 posted in channel
- Tour Repo intro PR merged
- Personal repo with markdown README

## Optional Reading

- Anthropic Academy: Claude in Action
- GitHub: Introduction to GitHub
- MissingSemester (MIT): Shell tools and scripting — first 2 lectures
- Markdown Guide (markdownguide.org): Basic Syntax page

## Optional Setup

- `tldr` install (friendlier `man`)
- Custom shell aliases (`.bashrc` / `.zshrc`)
- `git lgb` alias for pretty logs
- Try a TUI editor (OpenCode or Aider) for 10 minutes

---

# Chapter 1 Materials Checklist

**Instructor prep before Chapter 1**:

- Slide decks for both sessions (see `chapter-1-slides-outline.md`)
- Live demo project pre-built — profile card webpage
- Recording backup of the Block D demo (Session 1)
- Idea pool — 10-15 Myanmar-context example ideas
- Terminal + Git cheatsheet handout (see `chapter-1-commands.md`)
- SSH key generation guide, OS-specific
- Tour Repo created with intro template in place
- StackEdit.io open in a tab, ready

**Student deliverables**:

- Session 1 end: terminal/git video confirmed watched
- Session 2 end: personal repo + Tour Repo PR merged
- Chapter end: ideas posted

---

# Timing Summary

**Session 1** (120 min):
- A: 15 / B: 30 / C: 25 / D: 30 / E: 15 / F: 5

**Session 2** (122 min):
- A: 17 / B: 30 / C: 35 / D: 15 / E: 20 / F: 5

Session 2 runs 2 min over — acceptable. If running tighter, trim Block D editor tour by 2 min.
