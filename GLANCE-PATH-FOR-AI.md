# Glance path & visual hierarchy — instructions for AI agents

**Owner:** Non Arkaraprasertkul · Distilled 3 Nov 2026  
**Source studies:** (1) poster-hierarchy clip (“The rule every poster should follow”) — Omega watch ad (fail) vs Ford Mustang ad (pass); (2) kinetic grids clip (“Grid Systems every designer should know”) — radial / axial / column / modular.  
**Canon companions:** `ANTI-SPATIAL-HALLUCINATION.md` (Non-Slop), skill `anti-slop-design` §§6 / 6b / 6c, `AGENTS.md` review gate. Builder ≠ auditor.

This file tells an AI coding agent **exactly what to do** when laying out heroes, cards, posters, dashboards, and any block that pairs a heavy visual with words. Language AI slop is largely cured; **design AI slop** still wins when the eye’s path is ignored. Follow these rules before shipping UI.

---

## 0. One sentence law

**The eye enters on visual weight, not DOM order. Put the message where the eye goes next — or the best copy in the world is worthless.**

Quoted from the study: *“The best message in the world is worthless if you put it where the eye never goes.”* And: *“We haven't rewritten anything; we've just put the words where someone might actually read them.”*

---

## 1. What the study showed (do / don’t)

### Don’t — Headline → huge image → copy (Omega ad)

1. Headline sits at the top.  
2. A big photograph sits under it.  
3. Body copy sits under the photograph.

**What happens:** the eye goes **straight to the photograph**. Then it must climb **back up** for the headline, then **leapfrog** the picture again to reach the rest. That is more work than a glance will give you.

### Do — Image → headline → copy (Mustang ad)

1. Dominant photograph at the top.  
2. Headline **immediately under** it.  
3. Body copy continues downward from the headline.

**What happens:** the eye lands on the picture, drifts down, hits the headline, and keeps reading. No upward climb. No leapfrog.

**AI takeaway:** do not rewrite the words first. **Reorder.** Put the words on the natural exit of the heavy visual.

---

## 2. Hard rules (must pass)

### 2.1 Visual gravity picks the entry

- The entry is the heaviest thing on the first screen: large image, video, saturated card, or (on map products) the **map**.  
- It is **not** “whatever is first in the HTML” unless that thing is also the heaviest visually.  
- Assume **one glance**. Catch with weight; deliver the payload where the eye lands next.

### 2.2 Payload sits on the exit

- Headline, key number, and primary action sit on the **natural exit** of that visual — usually **immediately below** or **beside** it.  
- Never force the eye to climb back up over a heavy hero to find meaning.  
- Reading band under / beside an image is sized to the words and the action. It is **not** stretched into a second hero.

### 2.3 No leapfrog

- Do not split a headline from its related copy with a massive visual the eye must jump over.  
- Headline + copy stay on the **same side** of the dominant visual.

### 2.4 Reject the stack that fights the eye

Flag and fix any layout that does:

```text
Title
████████  huge image / video / saturated card  ████████
copy / CTA
```

when the image outweighs the title. Prefer visual order:

```text
████████  image / video / map  ████████
Headline
copy / CTA
```

Keep **semantic** heading structure for accessibility; if an `h1` must stay first in the DOM, place it **visually** on the exit and verify Tab order matches what the eye sees. CSS that shows one order and tabs another **fails**.

### 2.5 Map / data products are not posters

On FloodDash-class and other operational UIs:

- The **map (or primary data surface)** is the heavy visual and the entry (≥60% of the first desktop and phone screen when the product is map-first).  
- Readouts and next actions sit on its **edge**, not in a dead band above it.  
- Do not steal the first screen with a decorative hero.

### 2.6 Exception — when the headline may lead

A headline may sit at the top **only when it is itself the dominant visual**: unapologetically large display type, no competing full-bleed image/video/saturated card that outweighs it. Timid scale (16px body next to 20px title) does **not** qualify.

---

## 3. Scale, space, colour, motion (licensed break)

These gate whether you may “break” a quiet orthogonal layout. Squinting must still show: **biggest header → biggest visual → biggest text**.

The companion clip (“Grid Systems every designer should know”) teaches by showing a wireframe grid, then a polished poster that **obeys** it. Dynamic layouts come from **rigidly following** a named geometric system — not from floating elements off-grid.

| Constraint | Rule |
|---|---|
| **Scale** | Title vs body is a real step (≥ ~1.5–2×; posters in the study often ~5–10×). Micro-copy may be tiny tracked texture. ≤8 sizes unless `STYLE.md` says otherwise. Prefer size over weight for hierarchy. |
| **Named grid** | Rotated type / overlap only on a grid you can name (below). Name it in the brief. “The grid put it there” fails when equal tracks get unequal content. |
| **Active negative space** | Empty space **pushes** the eye toward the payload. Whole modules or columns may stay blank on purpose. Do not fill the push with cards, badges, or a **boxed logo**. Boxes still fit their content; panels stay compact (MSH). |
| **Colour** | Quiet near-monochrome ground + **at most 1–2** saturated accents per view, each with a job. Study posters: blue/black, red/black, black/white, coral/white — never a rainbow. A data colour that already means something **spends** an accent. |
| **Motion** (when UI animates) | Steep ease / snap. Skeleton, then content. Hard cuts. No floaty morphs, slow crossfades, or PowerPoint dissolves. Honour `prefers-reduced-motion`. |

### 3.1 The four grids you may name

Pick **one**. Snap every major element to its lines. Do not mix two named grids on one first screen unless the brief says so.

#### Radial
Lines radiate from a focal point (often with concentric circles). Type and images sit on those rays / arcs.  
**Study cue:** STARGAZIN poster — blue/white duotone portraits in circles; angled type follows radiating lines; large voids top-left / bottom-right push into the centre cluster.

#### Axial
One or more strong axes (often an asymmetrical X or a single diagonal). Content bisects or rides the axis; a mark may sit at the intersection.  
**Study cue:** AXIAL poster — tall building along a diagonal; huge “AXIAL” on one axis; small “Design with intent” / “Create Balance and Hierarchy” on the other; red circle at the crossing.

#### Column
Classic equal vertical columns. Text and images stay inside column bounds; gutters are breathing room, not decoration slots.  
**Study cue:** ONEGIN ballet poster — left column fully consumed by “ONEGIN” rotated 90°; centre+right hold the photo and bilingual credits; black/white only.

#### Modular
Rows × columns of equal modules (e.g. 2×3). Every element lives inside a module’s box; **leaving a whole module empty** is a valid, intentional void.  
**Study cue:** STEEP STE ST. poster — coral/white; top-left module empty on purpose; heavy type locked to its modules.

### 3.2 Agent rules when using a named grid

1. State the grid name in the brief before coding (`radial` / `axial` / `column` / `modular`).  
2. Implement with CSS Grid (or SVG/canvas guides for radial/axial). Elements snap; no arbitrary absolute drift.  
3. Rotation (`transform: rotate(...)`) is allowed **only** when the angle matches the named grid (column spine, axial diagonal, radial ray).  
4. Leave intentional voids — empty tracks / modules — instead of inventing filler cards.  
5. Glance path still wins: even on a wild grid, the heaviest visual is the entry and the headline sits on its exit.  
6. Operational / map products default to **column or modular** instruments around the map. Radial/axial posters are for marketing, chapter openers, or locked art direction — not for burying FloodDash gauges.

---

## 4. Standing house limits (never relax for glance path)

Glance path does **not** override these:

1. **MSH / boxes fit content** — no page-bleed voids; no text much smaller than its box; scroll only for interesting detail.  
2. **Logos are never boxed** — no border, chip, tile, or backing panel around a logo.  
3. **No AI-slop fonts** as primary (Inter, Poppins, Montserrat, Roboto, Geist, …). Prefer Jost / house `STYLE.md`.  
4. **Readable measure** — ~45–75 characters (or physical A4/A5 measure for Thai/Chinese).  
5. **Subtract before add** — ≤15 cards, ≤3 shadows, one radius (or none), ≤5 pills, no emoji-as-icons.  
6. **Light by default** — no navy+neon “command centre” unless the product is used in the dark.  
7. **Builder ≠ auditor** — a different agent runs the review checklist before merge.

Canonical layout law: [ANTI-SPATIAL-HALLUCINATION.md](https://github.com/Nonarkara/Non-Slop/blob/main/ANTI-SPATIAL-HALLUCINATION.md).

---

## 5. Procedure every agent must run

1. **Name the reader and the one job.** Attention order: 1 / 2 / 3.  
2. **Name the heaviest visual** on the first screen and **where the eye exits it**.  
3. **Put headline + primary action on that exit.** Join copy to the headline (no leapfrog).  
4. **Choose image pattern** (shared scene / editorial spread / reading band under image / task-first instrument). One sentence why. Do not pick “hero” by habit.  
5. **Compose with real content** — longest real headings, Thai/EN/ZH if promised, missing-media state.  
6. **Squint test** at 1440, 1024, and 390×844. If nothing wins, or the eye climbs up over a heavy visual, fail.  
7. **Keyboard follows the glance.** Tab order matches visual order.  
8. **Independent review** by a different agent/person. Record glance path: `exit holds headline` / `leapfrog` / `stack fights the eye` / `n/a`.

### Brief fields to fill before coding

```text
Reader and task:
Attention order: 1 / 2 / 3
Heaviest visual (entry):
Glance exit (headline / action location):
Image role:
Why this position and scale:
What the empty space does:
Action groups:
Responsive / language / zoom:
Overlay gate (if used): pass / fail / n/a
```

### Pre-ship checklist (agent)

- [ ] Heaviest visual captures first glance (or map does, on map products).  
- [ ] Headline + CTA sit below or beside that visual’s exit — not in a dead zone above it.  
- [ ] No leapfrog of related copy across a huge visual.  
- [ ] No Title → huge image → copy when the image dwarfs the title.  
- [ ] Title vs body is a real scale step.  
- [ ] Empty space pushes; logo is not boxed to fill it.  
- [ ] Quiet ground + ≤2 accents; motion is snap / skeleton / hard cut if any.  
- [ ] Tab order matches the glance path.  
- [ ] Screenshots at 1440 / 1024 / 390; different reviewer signed off.

---

## 6. Concrete frontend patterns

### Card / article preview (default)

```html
<article class="card">
  <img … alt="…" />          <!-- 1. heavy visual -->
  <h2>…</h2>                 <!-- 2. headline on the exit -->
  <p>…</p>                   <!-- 3. copy -->
  <a class="action">…</a>    <!-- action with the copy -->
</article>
```

Use column flex/grid so visual order = source order. Prefer **not** to `order:`-shuffle unless you also fix focus order.

### Hero with reading band (when image owns the frame)

```text
[ full-bleed image / video ]
[ compact band: headline + one line + primary action ]
```

Band belongs to the image. If contrast over the image fails the overlay gate, put the band **under** the image instead of forcing a scrim.

### Map / dashboard first screen

```text
┌─────────────────────────────────────────────┐
│ map / primary surface (majority of viewport)│
│                              ┌ instruments ┐│
│                              │ readout     ││
│                              │ next action ││
│                              └─────────────┘│
└─────────────────────────────────────────────┘
```

Instruments dock the exit of the map. Do not park the only useful action under a decorative hero above the fold.

### When data arrives “title first”

If an API gives `{ title, image, body }`, **still render** image → title → body unless the title is the dominant visual (§2.6). Reordering for glance is a layout decision, not a content rewrite.

---

## 7. Failures to auto-reject in review

| Symptom | Repair |
|---|---|
| Headline / CTA above a full-bleed image that outweighs it | Move them to the exit (below / beside) |
| Headline and copy split by a huge visual | Join them on one side |
| Title 16–20px beside body 14–16px | Take a real type-scale step |
| Cards / badges / boxed logo filling empty space | Leave the push; unbox the logo |
| CSS visual order ≠ Tab order | Align them |
| Decorative hero pushes the only action below the first phone screen | Shrink, relocate, or kill the hero; keep map/data primary |
| Equal-weight card grid, nothing wins when squinted | Pick one winner; demote the rest |

---

## 8. Provenance

Poster-hierarchy study (glance path: visual gravity, no upward climb, no leapfrog, one glance — Omega fail / Mustang pass; banner “The rule every poster should follow”) watched and distilled 3 Nov 2026 ICT. Companion kinetic-grid study the same day (“Grid Systems every designer should know”: radial / axial / column / modular wireframe → poster; extreme scale; intentional voids; ≤2 accents; snap alignment). Wording here is for agent use; it does not relax accessibility, map-first, or product `STYLE.md`. Short study quotes only; no third-party poster artwork is reproduced.

When this conflicts with a product’s locked `STYLE.md` or Non’s explicit brief for that product, the product brief wins — then file the conflict. Do not silently invent a third rule.
