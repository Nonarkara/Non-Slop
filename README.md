# Non-Slop

**Remove the defaults nobody chose. Keep the choices somebody made.**

Non-Slop is a set of rules, six skills and a small scanner that you point your AI coding agent at, so the pages it builds stop looking like every other AI-built page: the purple gradient, Inter everywhere, the centred hero with two buttons, three identical rounded cards, a shadow on every box, "seamlessly unlock". It works with Claude Code, Codex, Cursor, Copilot, Windsurf, Gemini and anything else that reads an `AGENTS.md`.

It also protects your style. A generic "anti-AI" pass will happily delete your serif, your warm paper, your em dashes and your jokes, because AI uses them too. Here, your `STYLE.md` wins over every rule, and the scanner reports your choices as **ALLOWED** instead of failing them.

## 30-second setup

In the root of any repo:

```bash
curl -fsSL https://raw.githubusercontent.com/Nonarkara/Non-Slop/main/install.sh | sh
```

or, if you prefer npx:

```bash
npx -y github:Nonarkara/Non-Slop init
```

That adds:

- `.non-slop/`: the rules, skills and scanner (a copy, so it works offline and pins a version).
- Pointers for each agent: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursor/rules/non-slop.mdc`, `.windsurf/rules/non-slop.md`, `.github/copilot-instructions.md`. Missing files are created. If you already have `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` or `copilot-instructions.md`, a short marked block is appended once; your text is never changed. An existing `.cursor/rules/non-slop.mdc` or `.windsurf/rules/non-slop.md` is left as you wrote it. Run with `--no-append` to skip appending. Symlinks are not followed.
- `STYLE.md`, from a template, only if you don't have one.
- A local `pre-commit` hook, only if you don't have one. It blocks a commit when the staged files score SLOP. No CI minutes. Skip once with `git commit --no-verify`.

Prefer a submodule? `git submodule add https://github.com/Nonarkara/Non-Slop .non-slop && node .non-slop/bin/non-slop.mjs init`. Update later with `init --update` (it only rewrites `.non-slop/`).

Needs Node 18 or newer. The scanner has no dependencies.

## Point your agent at it

Paste this to any agent, once per repo:

> Install Non-Slop in this repo (`curl -fsSL https://raw.githubusercontent.com/Nonarkara/Non-Slop/main/install.sh | sh`), fill in STYLE.md with what's deliberate here, then read `.non-slop/AGENTS.md` and follow it for every UI change. STYLE.md wins over its rules. A different agent reviews before merge.

No install allowed? This works too: *"Before any UI work, read and follow https://github.com/Nonarkara/Non-Slop/blob/main/AGENTS.md."*

## What the agent does

1. **Before coding:** a five-line brief (who, one job, what wins first, constraints, a direction taken from the subject's own world). Presets for civic dashboards, with the operational, map-first one as the default. Every region gets a job, or its space goes. → `skills/direction/`
2. **While coding:** tokens first, then subtract. Empty space is a decision; small things don't grow to fill it. On the words: quote a weak sentence and propose the smallest change that helps the reader; keep the voice; know which style rules hold and which are folklore. → `skills/writing/`, `skills/writing-laws/`
3. **After coding:** scan, render, look at the screenshots and the silhouette. → `skills/detect/`
4. **Before merge:** a different agent or person runs the review gate (task, access, states, languages, map rule, space, small interactions) and a real-task trial the scanner cannot judge, and lists what was kept on purpose. → `skills/review/`

## Two laws that finish the job

**The spatial law — Massacre Spatial Hallucination.** Space hallucination is when an interface invents a reason to occupy space instead of arranging around how people read, choose and act. *Why is this here, why this size, why this far from that?* "The grid put it there" is a failed answer. When you find SH, massacre. This is a render-layer law: the source scanner cannot prove it, so the reviewer collects the evidence — chrome cost, task visibility, geometry failures, hierarchy, preservation — at 390, 1024 and 1440 px. → `skills/spatial-hallucination/`

**The writing laws.** Prose exists to move a precise idea into another person's head. Four moves: **land it** (the idea arrives whole), **cut it** (nothing that is not load-bearing), **stage it** (you are the camera; the subject of a sentence is where the reader's attention lands first), **hold it** (one spotlight, given before new). Some famous rules are badly stated rather than forbidden, and a deliberate break is allowed when it is local, paid off, oriented first, and named — never on a first screen, a UI label, or safety copy. Grounded in Steven Pinker's *The Sense of Style* and *The Language Instinct*. → `skills/writing-laws/`

The whole contract is [AGENTS.md](AGENTS.md), about one page, short enough that agents actually follow it. The long catalog lives in the skills.

## The scanner

```bash
node .non-slop/bin/non-slop.mjs scan .                       # your source
node .non-slop/bin/non-slop.mjs scan https://your-site.org   # a live page's HTML + CSS
node .non-slop/bin/non-slop.mjs render http://localhost:3000 # the rendered page (needs Playwright)
node .non-slop/bin/non-slop.mjs rules                        # every rule
```

(Without installing: `npx -y github:Nonarkara/Non-Slop scan .`)

- **scan** finds what's certain from source: 47 rules for fonts, colour, depth, layout, motion, icons, copy, imagery, accessibility and languages (EN/TH/ZH). Each hit has a severity (P0 anyone notices, P1 a designer notices, P2 polish), a fix, and when it's fine to keep. It judges the stack, not the item: one hit is a question; a stack is SLOP. Three hits are listed as **REVIEW**: they quote the sentence, add no points, and do not rewrite it — an empty promise (`generic-promise`), a passive with no actor (`agentless-passive`), and a process noun hiding its verb (`zombie-noun`).
- **render** loads the page at 1440, 1024 and 390 (plus a 320px reflow check), saves screenshots and a black-and-white **silhouette**, and measures stretch-to-fill, void, map share, bars, shadows, radii, pills, contrast, tap targets and keyboard focus. Install Playwright once with `npm i -D playwright && npx playwright install chromium`.
- `--json` for tools, `--fail-on=P0|P1|slop|never` for gates, `--staged` for hooks. Files bigger than 8 MB, and binary files, are listed and not scored. Symlinks are followed; a link that resolves to `/`, `/proc`, `/sys`, `/dev`, or `/run` is named and not walked, including when that link is the path you scanned. `init` does not write through a symlink, or to a path that resolves outside the project (the hook included).

It is a screen, not a judge. Render it, look at it, and get a second reviewer.

**In Claude Code**, check every edit as it happens. Add to `.claude/settings.json`:

```json
{ "hooks": { "PostToolUse": [ { "matcher": "Edit|Write|MultiEdit", "hooks": [ { "type": "command", "command": "node .non-slop/bin/non-slop.mjs scan --hook" } ] } ] } }
```

**In CI:** public repos can copy `templates/non-slop.yml` to `.github/workflows/`. Private repos should rely on the pre-commit hook.

## Protect your own style

Fill in `STYLE.md`. The prose sections tell agents what's deliberate (type, colour, devices, layout, voice). `## Protected voice` lists phrases and markers the scanner must not flag (a historical line, a quotation, an unusual metaphor, the story of the project). The `## Allow` section tells the scanner:

```markdown
## Allow
- rule cream-terracotta: warm paper and brick red are the house colours
- rule void: essay pages are a single reading column; the margins are the point
- rule emoji-icons in src/kids/**: playful register for children
- font "Source Serif 4": display face, chosen
- colour #fbf7ef: warm paper
- phrase "unlock a vibrant world of colour": the poster line, kept on purpose
```

```markdown
## Protected voice
- phrase "the water came up the soi at four": opening of the field note
- marker "Sanzo Wada": this page is about his colour book
```

Or inline, in code: `/* non-slop-allow: glass -- legibility over live video */`.

A sentence that contains a listed phrase, or a Protected voice phrase or marker, is not flagged. A listed phrase does not hide a different sentence, and a marker does not hide the other sentences on its line. Listing the rule `generic-promise` still reports it as **ALLOWED**, and it is not scored.

Allowed hits show as **ALLOWED** and cost nothing. A `## Signature` section in `AGENTS.md` is read the same way, including when `STYLE.md` exists but its Allow section is still empty. A `STYLE.md` in a subfolder covers the files under it, and allows from parent folders still apply. `Style.md` and `STYLE.md` are the same file. Accessibility rules (contrast, focus, alt text, unnamed controls, lang, zoom, reduced motion) can't be allowed away: they show as **ASK-OWNER**, so the agent raises them with you instead of quietly changing your design. Before removing anything, the agent asks: *would removing this make the page more generic? Then keep it.*

To skip a whole file, put `non-slop-skip-file: <why>` on its first line. The scan names it under `not scanned:` with that reason, so an exclusion is always visible. Everything else it can't read — a binary, an oversized file, a symlink into `/proc`, a broken one — is named the same way.

## Credits

Built from Non Arkaraprasertkul's own anti-slop rules, Palette's slop-lint and a measured study of 31 citizen-built flood apps, plus ideas from funboy322/avoid-ai-design, Vanszs/Anti-AI-UI, Anthropic's frontend-design skill, Microsoft's frontend-design-review skill, kari-ai-lab's design principles, Ruttl's web-design practices, Peter Yang's no-ai-slop review workflow and Jakub Krehel's interface-detail checks. The writing principle comes from Rakesh Mahanti's Instagram carousel, credited as a link only. Details and licences: [CREDITS.md](CREDITS.md). MIT licence.

## Anti-spatial-hallucination

[The composition guide](ANTI-SPATIAL-HALLUCINATION.md) asks why each element is here, this size and this far from its neighbour. It covers image roles, narrative heroes, readable overlays, purposeful whitespace, action grouping and responsive evidence. Hero treatment is a choice to justify, not a new template.
