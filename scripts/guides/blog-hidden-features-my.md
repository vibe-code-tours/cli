---
lang: my
---

# Claude Code ထဲက ဖုံးကွယ်နေပြီး အသုံးနည်းနေတဲ့ Features များ — အဆင့်မြင့် လမ်းညွှန်

> ရင်းမြစ်: https://claude-guides.com/blog/hidden-features.html
> Crawled: 2026-06-17

## ခြုံငုံသုံးသပ်ချက်

Anthropic မှ Boris Cherny ရေးသားသော ဆောင်းပါးအရ "လူအများစုသည် Claude Code ကို ရိုးရှင်းသော coding assistant တစ်ခုအဖြစ်သာ အသုံးပြုကြသည်" ဟုဆိုသော်လည်း ၎င်းကို မဟာဗျူဟာကျကျ အသုံးချနိုင်သူများအတွက် အစွမ်းထက်သော စွမ်းရည်များစွာ ပါဝင်ပါသည်။

## အဓိက မီးမောင်းထိုးပြထားသော Features များ

ဤလမ်းညွှန်တွင် အဆင့်မြင့် feature ၁၅ ခုကို ဖော်ပြထားသည်-

1. **Mobile App Coding** — iOS သို့မဟုတ် Android မှ နေ၍ code ကို ရေးသားပြင်ဆင်နိုင်ခြင်း
2. **Cross-Device Sessions** — `claude --teleport` သို့မဟုတ် `/teleport` ကို အသုံးပြု၍ device တစ်ခုမှ တစ်ခုသို့ ရွှေ့ပြောင်းနိုင်ခြင်း
3. **Automation Commands** — `/loop` နှင့် `/schedule` တို့သည် အလုပ်များကို ထပ်ခါတလဲလဲ အလိုအလျောက် လုပ်ဆောင်စေနိုင်ခြင်း
4. **Hooks** — observability နှင့် ထိန်းချုပ်မှုအတွက် agent ၏ lifecycle ထဲသို့ logic ထည့်သွင်းနိုင်ခြင်း
5. **Cowork Dispatch** — ဖုန်းများ သို့မဟုတ် browser များမှ နေ၍ အဝေးထိန်း (remote) လုပ်ဆောင်ခြင်း
6. **Chrome Extension** — frontend debugging အတွက် browser နှင့် တိုက်ရိုက် ပေါင်းစပ်အသုံးပြုခြင်း
7. **Auto Web Server Testing** — server ကို အလိုအလျောက် စတင်ပြီး testing ပြုလုပ်ခြင်း
8. **Session Forking** — `/branch` သို့မဟုတ် `claude --resume --fork-session` ကို အသုံးပြု၍ အလုပ်ကို branch ခွဲထုတ်ခြင်း
9. **Side Queries** — အဓိက အလုပ်များကို မဖျက်ဆီးဘဲ အမြန် ရှင်းလင်းမေးမြန်းရန် `/btw` ကို အသုံးပြုခြင်း
10. **Git Worktrees** — တစ်ပြိုင်နက်တည်း development environment များအတွက် ထောက်ပံ့ပေးခြင်း
11. **Batch Processing** — `/batch` သည် အလုပ်များကို agent များစွာအကြား ဖြန့်ဝေပေးခြင်း
12. **Bare Mode** — `--bare` flag သည် လုပ်ဆောင်မှုကို ပိုမိုမြန်ဆန်စေခြင်း
13. **Multi-Repo Context** — `--add-dir` သည် repository များစွာအကြား ဖြတ်ကျော် ဝင်ရောက်အသုံးပြုနိုင်မှုကို ပေးခြင်း
14. **Custom Agents** — `.claude/agents` မှတစ်ဆင့် အထူးပြု agent များကို သတ်မှတ်ဖန်တီးခြင်း
15. **Voice Input** — `/voice` သို့မဟုတ် desktop/iOS feature များကို အသုံးပြု၍ စကားပြောဆို၍ code ရေးသားနိုင်ခြင်း

## အဓိက ထိုးထွင်းအမြင်

ဆောင်းပါးက Claude Code ကို "chatbot တစ်ခုထက် autonomous system တစ်ခုအဖြစ်" သဘောထားရန် အလေးပေးထောက်ပြထားပြီး၊ automation နှင့် တစ်ပြိုင်နက်တည်း (parallel) လုပ်ဆောင်မှုတို့သည် power user များကို သာမန်အသုံးပြုသူများနှင့် ခွဲခြားပေးသည်ဟု ဆိုသည်။
