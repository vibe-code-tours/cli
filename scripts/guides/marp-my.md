# Marp — Markdown ကနေ Slide

Marp က ရိုးရိုး Markdown ဖိုင်တစ်ခုကို slide deck (HTML / PDF / PNG / PPTX) ဖြစ်အောင်
ပြောင်းပေးတယ်။ မှတ်စုရေးသလို slide ရေး၊ တကယ့် presentation ထွက်လာမယ်။

> 🇬🇧 English — `vibe-code-tours guides marp`

---

## ၁. Install

```bash
npm install -g @marp-team/marp-cli
# (သို့) install မလုပ်ဘဲ run —
npx @marp-team/marp-cli@latest slides.md -o slides.html
```

VS Code သုံးရင် **Marp for VS Code** extension တင်ပါ — live preview ရတယ်။

## ၂. အသေးဆုံး deck

Marp ဖိုင်က frontmatter သေးသေးနဲ့ Markdown ပါ။ စာကြောင်းတစ်ကြောင်းတည်း `---`
(အပေါ်မှာ blank line ထားပြီး) က slide အသစ် စတယ်။

```markdown
---
marp: true
paginate: true
---

# Slide တစ်

ပထမဆုံး slide။

---

# Slide နှစ်

- အချက်တစ်
- အချက်နှစ်
```

## ၃. Render လုပ်ပါ

```bash
marp slides.md -o slides.html     # HTML — link မျှဝေဖို့ အကောင်းဆုံး
marp slides.md -o slides.pdf      # PDF — print / attach ဖို့
marp slides.md --images png       # slide တစ်ခုစီ PNG (slides.001.png, ...)
marp slides.md -o deck.pptx       # PowerPoint
marp -s slides.md                 # live server — ပြင်ရင်း auto-reload
```

PDF/PNG/PPTX က Chromium browser လိုတယ်။ container ထဲ render တုံ့သွားရင်
browser ကို `--no-sandbox --disable-dev-shm-usage` ထည့်ပါ။

## ၄. ကိုယ်ပိုင်ဆန်အောင် — theme တစ် block

CSS ဖိုင် သီးသန့် မလိုပါ။ အပေါ်မှာ `<style>` block ထည့်ပြီး `section`
(slide တစ်ချပ်စီ) ကို style လုပ်ပါ —

```markdown
---
marp: true
paginate: true
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar:wght@400;700&display=swap');
section { font-family:'Pyidaungsu','Noto Sans Myanmar',sans-serif; background:#fffdf9; color:#292524; padding:56px 72px; }
h1 { color:#9a3412; }
code { background:#fff1e6; color:#be123c; padding:.05em .3em; border-radius:5px; }
</style>

# theme ပါတဲ့ slide
```

- **font** — Google Font ကို `@import` လုပ်ပြီး `font-family` သတ်မှတ်ပါ။ မြန်မာစာအတွက်
  `'Pyidaungsu','Noto Sans Myanmar'` သုံးပါ။
- **color** — `section` မှာ `background` + `color` ထည့်၊ `h1`/`strong`/`a` ကို accent ပေးပါ။
- **css** — CSS လုပ်နိုင်တာ slide မှာ လုပ်နိုင်တယ်။

## ၅. slide တစ်ချပ်ချင်း tricks

```markdown
<!-- _class: cover -->     # ဒီ slide ကို class ပေး (section.cover {...} style)
<!-- _backgroundColor: #000 -->   # တစ်ချပ်တည်း background
![bg](photo.jpg)           # full-bleed background ပုံ
![w:600](screenshot.png)   # ပုံ size (w: / h: px)
```

Speaker note — directive မဟုတ်တဲ့ HTML comment တိုင်း note ဖြစ်တယ်။

## ၆. Template (အစက မစပါနဲ့)

bootcamp မှာ အသင့်သုံး theme ၆ ခု ပါတယ် (terminal-dark, editorial-light, pitch-bold,
minimal-docs, product-demo, burmese-first)။ တစ်ခုစီ self-contained ဖိုင်တစ်ခု —
ကူး၊ စာ ပြောင်း၊ render။ curriculum repo ထဲ `slides/templates/deck-themes/`
(preview PNG တွေနဲ့) မှာ ကြည့်ပါ။

## ၇. Tips

- slide တစ်ချပ် အကြောင်းတစ်ခု။ whitespace ကို အသက်ရှူခွင့်ပေးပါ။
- code ကြီးကြီး၊ စာ နည်းနည်း။ narration က သင်ကိုယ်တိုင်။
- ပုံတွေကို repo **ထဲ** ထားပြီး relative path နဲ့ link လုပ်ပါ
  (`![](screenshots/01.png)`) — ဘယ်နေရာမဆို render ထွက်အောင်။
- **Chrome DevTools MCP** နဲ့ resolution သတ်မှတ်ပြီး screenshot သပ်သပ်ရပ်ရပ် ရိုက်ပါ။
- Claude ကို ပြောပါ — *"make this a 6-slide Marp deck with the terminal-dark theme."*

Docs: https://marp.app · CLI: https://github.com/marp-team/marp-cli
