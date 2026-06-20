---
lang: my
---

# Claude Code — အကျဉ်းချုပ် Cheatsheet

*[claude-guides.com](https://claude-guides.com/) (Paul Larionov) မှ ချုပ်ထားသည်။ အသုံးဝင်ဆုံး ၂၀% ကိုသာ ရွေးထုတ်ထားသည်။*

## အခြေခံ စိတ်ကူး

Claude Code ကို **chatbot မဟုတ်ဘဲ ကိုယ်တိုင်လုပ်ဆောင်နိုင်သော စနစ် (autonomous system)** အဖြစ် မြင်ပါ။ စွမ်းအားက စာပိုရိုက်ခြင်းမှ မဟုတ်ဘဲ automation, agents နှင့် တစ်ပြိုင်နက် (parallel) အလုပ်လုပ်ခြင်းမှ လာသည်။

အလုပ်တိုင်းအတွက် အခြေခံ လုပ်ငန်းစဉ်: **Research → Plan → Execute → Review → Ship** (လေ့လာ → စီစဉ် → လုပ်ဆောင် → စစ်ဆေး → ပို့ဆောင်)။

## Keyboard shortcut (ဒီ ၆ ခုကို အရင်မှတ်ပါ)

| Key | လုပ်ဆောင်ချက် |
|-----|--------|
| `Ctrl+C` | input / generation ကို ရပ်တန့်ရန် |
| `Ctrl+G` | prompt ကို ပြင်ပ editor တွင် ဖွင့်ရန် |
| `Shift+Tab` | permission mode များ လှည့်ပြောင်းရန် |
| `Alt+P` | model ပြောင်းရန် |
| `Alt+T` | thinking ဖွင့်/ပိတ်ရန် |
| `Esc Esc` | ဖိုင်တည်းဖြတ်မှုများ ပြန်ရုပ်သိမ်းရန် |

ရှေ့ဆက်များ (prefix): `/` slash command · `!` bash command · `@` ဖိုင်တစ်ခုကို ရည်ညွှန်းရန်။

## နေ့စဉ်သုံး Slash command များ

| Command | အသုံးပြုပုံ |
|---------|-----|
| `/clear` · `/compact [focus]` | context ကို ရှင်းရန် / ချုံ့ရန် |
| `/plan` | ပြောင်းလဲမှုကြီးမလုပ်ခင် read-only အစီအစဉ်ရေးရန် |
| `/review` | agent များစွာဖြင့် code စစ်ဆေးရန် |
| `/debug` | error log မှ အမှားရှာရန် |
| `/simplify` | အခုရေးပြီးသား code ကို သန့်ရှင်းရန် |
| `/context` · `/cost` | context နှင့် token သုံးစွဲမှု ကြည့်ရန် |
| `/btw <q>` | context မကုန်ဘဲ ဘေးထွက်မေးခွန်း မေးရန် |
| `/loop [interval]` | ထပ်ခါထပ်ခါ အလုပ်၊ စက်ပေါ်တွင် ၃ ရက်အထိ |
| `/schedule` | ထပ်ခါထပ်ခါ အလုပ်၊ cloud ပေါ်တွင် စက်ပိတ်ထားလည်း ရ |

## Permission mode များ

`default` (အမြဲမေး) · `acceptEdits` (edit များ အလိုအလျောက်လက်ခံ) · `plan` (read-only) · `dontAsk` (ကြိုခွင့်မပြုထားလျှင် ငြင်း) · `bypassPermissions` (အားလုံးကျော် — ယုံကြည်ရ/သီးခြားပတ်ဝန်းကျင်တွင်သာ)။

## Agents (တစ်ပြိုင်နက် အလုပ်)

- **Explore** — မြန်ဆန်သော read-only code ရှာဖွေမှု (Haiku)
- **Plan** — plan mode အတွက် သုတေသန
- **General** — tool အားလုံး၊ ရှုပ်ထွေးသော multi-step အလုပ်များ
- agent တစ်ခုစီကို သီးခြား **git worktree** တွင် run နိုင် → တကယ့် parallel ဖွံ့ဖြိုးမှု၊ merge conflict မရှိ။
- စိတ်ကြိုက် agent များကို `.claude/agents/` တွင် ထားသည်။

## Memory: အသိပညာထည့်သွင်းရန် နည်းလမ်း ၃ မျိုး

1. **Commands** — ထပ်ခါသုံးနိုင်သော prompt template တိုများ (`/commit`, `/simplify`)။
2. **Skills** — ချိန်ညှိနိုင်၊ အလိုအလျောက်ရှာဖွေတွေ့၊ context ခွဲနိုင်။ `.claude/skills/<name>/` သို့မဟုတ် `~/.claude/skills/` တွင်။
3. **Memory** — session များတစ်လျှောက် စည်းမျဉ်း/သတ်မှတ်ချက်အတွက် `CLAUDE.md`။
   - `./CLAUDE.md` project · `~/.claude/CLAUDE.md` ကိုယ်ပိုင် · `/etc/claude-code/` အဖွဲ့အစည်း။
   - ဖိုင်များကို `@path` ဖြင့် ထည့်သွင်းပါ။ token ၅၀၀၀ အောက် ထားပါ။

## MCP servers

ပြင်ပ tool များ (GitHub, Slack, Postgres, …) ဖြင့် Claude Code ကို တိုးချဲ့သည်။ `.mcp.json` တွင် ပြင်ဆင်ပါ:

```json
{ "mcpServers": { "github": { "command": "mcp-github" } } }
```

`/mcp` သို့မဟုတ် `claude mcp list` ဖြင့် စီမံပါ။ Transport များ: `http` (အကြံပြု), `stdio` (local), `sse`။

## CLI အခြေခံများ

```bash
claude                 # interactive
claude -p "prompt"     # headless / script ရေးနိုင်
claude -c              # နောက်ဆုံးအလုပ် ဆက်လုပ်
claude -r "name"       # နာမည်ဖြင့် ပြန်ဆက်
```

အဓိက flag များ: `--model` · `-w` worktree · `--add-dir` · `--agent` · `--output-format json` · `--max-turns` · `--max-budget-usd` · `--effort low|med|high|max` · `--permission-mode` · `--dangerously-skip-permissions` ⚠။

## Environment variable များ

`ANTHROPIC_API_KEY` · `ANTHROPIC_MODEL` · `CLAUDE_CODE_EFFORT_LEVEL` (low/med/high) · `MAX_THINKING_TOKENS` (0=ပိတ်) · `CLAUDE_CODE_MAX_OUTPUT_TOKENS` (default 32K)။

## အကောင်းဆုံး အလေ့အကျင့် (ထိပ်တန်း ၆ ခု)

1. shortcut ၃–၄ ခု အာဂုံဆောင်ပါ — နေ့စဉ် စာရိုက်ချိန် သက်သာသည်။
2. multi-step အလုပ်တိုင်းကို code မထိခင် **plan mode** သုံးပါ။
3. prompt တွင် **တိကျပါ**: "user list တွင် pagination ထည့်ပါ" သည် "ဒါကို ပိုကောင်းအောင်လုပ်ပါ" ထက် ကောင်းသည်။
4. paste မလုပ်ဘဲ `@filename` ဖြင့် ဖိုင်ကို ရည်ညွှန်းပါ။
5. သေးငယ်၍ မကြာခဏ commit လုပ်ပါ (`/commit`); worktree က စမ်းသပ်မှုများကို သီးခြားထားသည်။
6. model ကို သတိထား ရွေးပါ: **Haiku** ဈေးသက်သာ/မြန် · **Sonnet** ယေဘုယျ coding · **Opus** နက်ရှိုင်းသော တွေးခေါ်မှု။

## အဖြစ်များသော အမှားများ

shortcut မသုံးခြင်း · plan mode ကျော်ခြင်း · context အလွန်အကျွံဖြည့်ခြင်း · error message များ လျစ်လျူရှုခြင်း · ပြောင်းလဲမှုတိုင်း လက်ဖြင့်ခွင့်ပြုခြင်း · ကြီးမားပြီး ရှားရှားပါးပါး commit လုပ်ခြင်း။
