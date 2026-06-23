# Marp — slides from Markdown

Marp turns a plain Markdown file into a slide deck (HTML / PDF / PNG / PPTX).
Write slides the way you write notes; get a real presentation out.

> 🇲🇲 မြန်မာ — `vibe-code-tours guides marp --lang my`

---

## 1. Install

```bash
npm install -g @marp-team/marp-cli
# or run without installing:
npx @marp-team/marp-cli@latest slides.md -o slides.html
```

VS Code users: install the **Marp for VS Code** extension for live preview.

## 2. The smallest deck

A Marp file is Markdown with a small frontmatter block. `---` on its own line
(after a blank line) starts a new slide.

```markdown
---
marp: true
paginate: true
---

# Slide one

My first slide.

---

# Slide two

- a point
- another point
```

## 3. Render it

```bash
marp slides.md -o slides.html     # HTML — best for sharing a link
marp slides.md -o slides.pdf      # PDF — best for printing / attaching
marp slides.md --images png       # one PNG per slide (slides.001.png, ...)
marp slides.md -o deck.pptx       # PowerPoint
marp -s slides.md                 # live server, auto-reload while you edit
```

PDF/PNG/PPTX need a Chromium browser. If render hangs in a container, the usual
fix is `--no-sandbox --disable-dev-shm-usage` on the browser.

## 4. Make it yours — theme in one block

You don't need an external CSS file. Put a `<style>` block at the top and style
the `section` (each slide):

```markdown
---
marp: true
paginate: true
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
section { font-family:'Inter',sans-serif; background:#0d1117; color:#e6edf3; padding:56px 72px; }
h1 { color:#3fb950; }
code { background:#161b22; color:#3fb950; padding:.05em .3em; border-radius:5px; }
</style>

# Themed slide
```

- **fonts** — `@import` a Google Font, then set `font-family`. For Myanmar text use
  `'Pyidaungsu','Noto Sans Myanmar'`.
- **color** — set `background` and `color` on `section`; accent your `h1`/`strong`/`a`.
- **css** — anything CSS can do, a slide can do.

## 5. Handy per-slide tricks

```markdown
<!-- _class: cover -->     # give THIS slide a class (style section.cover {...})
<!-- _backgroundColor: #000 -->   # one-off background
![bg](photo.jpg)           # full-bleed background image
![w:600](screenshot.png)   # size an image (w: / h: in px)
```

Speaker notes: any HTML comment that isn't a directive is a note.

## 6. Templates (don't start from zero)

The bootcamp ships six ready themes (terminal-dark, editorial-light, pitch-bold,
minimal-docs, product-demo, burmese-first). Each is one self-contained file —
copy it, replace the text, render. See `slides/templates/deck-themes/` (with
preview PNGs) in the curriculum repo.

## 7. Tips

- One idea per slide. Let whitespace breathe.
- Big code, few words. You are the narration.
- Keep images **in your repo** and link them with a relative path
  (`![](screenshots/01.png)`) so the deck renders anywhere.
- Capture clean screenshots with **Chrome DevTools MCP** at a fixed resolution.
- Ask Claude: *"make this a 6-slide Marp deck with the terminal-dark theme."*

Docs: https://marp.app · CLI: https://github.com/marp-team/marp-cli
