# Kinetic grids — instructions for AI agents

**Owner:** Non Arkaraprasertkul · Distilled 3 Nov 2026  
**Source study:** kinetic-grid teaching clip — on-screen title **“Grid Systems every designer should know”** (instrumental; wireframe → poster pairs; no narrator).  
**Companion:** glance-path law in `GLANCE-PATH-FOR-AI.md` (same folder) and `ANTI-SPATIAL-HALLUCINATION.md` §6.  
**Canon:** skill `anti-slop-design` §6c; Non-Slop `AGENTS.md` review gate. Builder ≠ auditor.

This file tells an AI coding agent **exactly what to do** when a layout needs energy without becoming design slop. The clip’s lesson is the opposite of “break everything”: **dynamic layouts come from rigidly obeying a named geometric grid**, then letting scale, voids, and colour do the excitement.

---

## 0. One sentence law

**Name a grid. Snap to it. Leave voids on purpose. Make the title unapologetically huge. Keep the palette quiet. Glance path still wins.**

Squinting must still show: **biggest header → biggest visual → biggest text**. A first screen that is only “dynamic” fails.

---

## 1. What the study showed

The video opens on a light textured ground with a 5×7 square grid; solid red cells snap to the lines. Then it cycles **four** systems — each as a wireframe, then a finished poster that obeys that wireframe.

| Grid | Wireframe idea | Poster cue from the study | What to steal |
|---|---|---|---|
| **Radial** | Rays from a focus + concentric circles | STARGAZIN — blue/white; portraits in circles; type angled on rays; voids top-left / bottom-right | Content rides rays/arcs; voids push into the centre cluster |
| **Axial** | Asymmetrical X / strong diagonals | AXIAL — red/black/white; building on a diagonal; huge “AXIAL”; small copy on the other axis; red circle at the crossing | One or two axes own the page; intersection can hold a mark |
| **Column** | Equal vertical columns | ONEGIN — black/white ballet; left column = “ONEGIN” rotated 90°; centre+right = photo + bilingual credits | Columns are law; gutters breathe; rotation along a column spine |
| **Modular** | Equal modules (e.g. 2×3) | STEEP STE ST. — coral/white; **top-left module empty on purpose**; type locked to modules | Whole modules may stay blank; nothing floats between boxes |

Implied principles (no voiceover — read from the frames):

1. **Extreme scale contrast** beats font weight for hierarchy (display ~5–10× body in the posters).  
2. **≤2 accents + ground** (often one accent + ink + paper). No rainbow, no decorative gradients.  
3. **Intentional voids** — empty corners, empty modules, empty column tracks — are structural, not unfinished.  
4. **Rigid snap** — even diagonal or rotated type aligns to the invisible grid lines.

---

## 2. Hard rules (must pass)

### 2.1 Name the grid before you code

Allowed names for a licensed break:

- `radial`  
- `axial`  
- `column`  
- `modular`

Write the name in the brief. If you cannot name it, you do not get rotation, overlap, or diagonal type — stay orthogonal and quiet.

Do **not** mix two named grids on one first screen unless Non’s brief for that product says so.

### 2.2 Snap — no arbitrary float

- Use CSS Grid (or SVG/canvas guides for radial/axial) as the skeleton.  
- Major elements occupy tracks / modules / axes.  
- Arbitrary `position: absolute` drift off the grid is a fail unless it is a deliberate mark *on* an axis intersection.  
- Gutters (`gap`) are breathing room, not slots for filler chips.

### 2.3 Extreme scale (not timid type)

- Title vs body is a **real** step — posters in the study are often enormous display vs small credits.  
- In product UI stay inside house scale (≤8 sizes) unless `STYLE.md` unlocks more, but **never** treat 16px→20px as hierarchy.  
- Prefer **size** over weight for the win. Micro-copy may be tiny tracked texture.

### 2.4 Weaponised negative space

- Empty space **pushes** the eye toward the payload.  
- Leaving a whole **module**, **column**, or **corner** blank is valid and preferred over inventing a card.  
- Do **not** plug voids with badges, emoji icons, or a **boxed logo**. Logos sit on the surface (no chip/border/panel).

### 2.5 Colour constraint

- Quiet ground + ink + **at most one or two** saturated accents per view.  
- Each accent has a job. A data colour that already means flood / danger / go **spends** an accent — it does not earn a third decoration.  
- Study palettes to emulate in spirit: blue/black, red/black, black/white, coral/white.  
- No decorative gradients, gradient text, or glass blur.

### 2.6 Motion (when the UI moves)

The clip itself cuts hard between grids. For product UI:

- Steep ease / snap.  
- Skeleton, then content.  
- Hard cuts over dissolves.  
- No floaty morphs or slow crossfades.  
- Honour `prefers-reduced-motion`. One moment, or none.

### 2.7 Glance path still overrides “cool grid”

Even on radial/axial posters:

1. Heaviest visual is the **entry**.  
2. Headline + primary action sit on its **exit** (below / beside).  
3. No leapfrog of related copy across a huge visual.  
4. Tab order matches what the eye sees.

Full glance law: `GLANCE-PATH-FOR-AI.md`.

### 2.8 Where wild grids are allowed

| Context | Default |
|---|---|
| Marketing, chapter opener, locked art poster | Radial / axial / modular / column OK if brief names one |
| FloodDash / map / ops dashboard | **Column or modular instruments around the map**; map stays ≥60% first screen; no radial poster burying gauges |
| Dense forms, tables, settings | Column / modular only; no diagonal body text |
| First phone screen of a civic tool | Prefer quiet column; wild break only if Non asked |

---

## 3. Standing house limits (never relax for kinetic)

1. **MSH** — boxes fit content; compact first; scroll only for interesting detail.  
2. **Logos never boxed.**  
3. **No AI-slop fonts** as primary (Inter, Poppins, Montserrat, Roboto, Geist, …). Prefer Jost / product `STYLE.md`.  
4. **Readable measure** for body (~45–75ch / A4–A5 physical for Thai/Chinese). Display type may break measure; body may not.  
5. **Subtract before add** — ≤15 cards, ≤3 shadows, one radius (or none), ≤5 pills.  
6. **Light by default.**  
7. **Builder ≠ auditor.**

Canonical: [ANTI-SPATIAL-HALLUCINATION.md](https://github.com/Nonarkara/Non-Slop/blob/main/ANTI-SPATIAL-HALLUCINATION.md).

---

## 4. Procedure every agent must run

1. **Ask:** does this screen need a licensed break, or a quiet orthogonal layout? Default quiet.  
2. **If break:** name exactly one grid (`radial` | `axial` | `column` | `modular`).  
3. **Sketch relationships** — entry visual, exit for headline, intentional voids — before CSS.  
4. **Implement snap** with CSS Grid / guides; rotate only along the named system.  
5. **Apply colour & scale limits** (§2.3–2.5).  
6. **Squint** at 1440 / 1024 / 390×844 — biggest header, biggest visual, biggest text still win?  
7. **Glance + keyboard** checks from `GLANCE-PATH-FOR-AI.md`.  
8. **Different reviewer** signs off. Record: `grid: <name>` / `voids: intentional` / `accents: N` / `glance: pass|fail`.

### Brief fields

```text
Licensed break? yes / no
Named grid: radial | axial | column | modular | none
Heaviest visual (entry):
Glance exit:
Intentional voids (which tracks/modules):
Accents (≤2) and their jobs:
Scale step (title vs body):
Motion: none | snap skeleton | hard cut
Map-first override: n/a | map is entry
```

### Pre-ship checklist

- [ ] Grid named (or explicitly `none`).  
- [ ] Elements snap; no arbitrary float.  
- [ ] At least one intentional void (or documented why every track is full).  
- [ ] Title scale is a real step; body stays readable.  
- [ ] ≤2 saturated accents; quiet ground.  
- [ ] No boxed logo plugging space.  
- [ ] Glance path pass; Tab order matches.  
- [ ] Map/ops products: map still owns the first screen.  
- [ ] Screenshots 1440 / 1024 / 390; different reviewer.

---

## 5. Concrete frontend patterns

### Column (default product)

```css
.section {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--gap);
}
.display { grid-column: 1 / 4; writing-mode: vertical-rl; /* only if brief wants ONEGIN-style */ }
.figure  { grid-column: 4 / 9; }
.copy    { grid-column: 9 / 13; }
/* leave columns empty on purpose when balance needs a void */
```

### Modular

```css
.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: var(--gap);
}
.void { /* empty module — do not insert a card */ }
.title { font-size: clamp(2.5rem, 8vw, 6rem); }
```

### Axial (marketing / art direction only unless brief says)

```css
.axial {
  display: grid;
  /* diagonal is compositional: place figure on one axis, display type on the other */
}
.mark { /* focal at axis crossing — circle/dot, not a boxed logo */ }
.display { transform: rotate(-18deg); transform-origin: left center; /* angle = named axis */ }
```

### Radial (same restriction as axial)

Prefer SVG/CSS with a defined centre. Type and images sit on rays or arcs. Keep voids in opposite corners so the centre cluster wins at a glance.

### What not to generate

- Equal card grids with identical weight “for balance.”  
- Diagonal body paragraphs on a dashboard.  
- Three accent colours plus gradients “to match the energy.”  
- Filling every module because emptiness “looks broken.”  
- `order:` / visual tricks that disagree with Tab order.

---

## 6. Failures to auto-reject

| Symptom | Repair |
|---|---|
| Rotation / overlap with no named grid | Name a grid or remove the break |
| 16→20px “hierarchy” | Take a real type-scale step |
| Every module filled with chips | Delete fillers; leave voids |
| Boxed logo in a gap | Unbox; leave the push |
| Rainbow / glass / soft dissolve motion | Quiet palette; snap or hard cut |
| Radial poster layout on FloodDash first screen | Revert to map + column/modular instruments |
| Glance dead zone (headline above a heavier visual) | Move headline to the exit (`GLANCE-PATH-FOR-AI.md`) |

---

## 7. Provenance

Kinetic-grid study watched 3 Nov 2026 ICT: “Grid Systems every designer should know” — radial (STARGAZIN), axial (AXIAL), column (ONEGIN), modular (STEEP STE ST.); wireframe then poster; instrumental only. Distilled for agent use with Non’s house MSH / anti-slop / map-first constraints. No third-party poster artwork is reproduced. When this conflicts with a product `STYLE.md` or Non’s explicit brief, the product brief wins — then file the conflict.

Pair with `GLANCE-PATH-FOR-AI.md` in this folder for the full hierarchy pack.
