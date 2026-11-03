---
name: non-slop-kinetic-grid
description: >-
  Energy without slop: name one grid, snap to it, leave voids on purpose, let
  scale and colour carry the excitement. Use when a layout needs energy, or when
  someone reaches for rotation, overlap or diagonal type.
license: MIT
---
# Kinetic grids: dynamic by obeying a grid, not by drifting off one

**By Non Arkaraprasertkul. Distilled 3 November 2026. MIT.** Full law: [`KINETIC-GRIDS-FOR-AI.md`](../../KINETIC-GRIDS-FOR-AI.md).

Dynamic posters are not "broken" layouts. They are rigidly built on a named geometric system; scale, voids and colour do the excitement while every element snaps to the lines. Rotation and overlap are pay-to-play: **name the grid first, or stay orthogonal and quiet.**

## The one-sentence law

**Name a grid. Snap to it. Leave voids on purpose. Make the title unapologetically huge. Keep the palette quiet. Glance path still wins.**

## The four grids you may name

| Grid | Idea | Use |
|---|---|---|
| `radial` | rays from a focus, concentric circles | art direction, openers |
| `axial` | one or two strong axes / diagonals | marketing, a focal mark at the crossing |
| `column` | equal vertical columns; gutters breathe | the default for products |
| `modular` | equal modules; **a whole empty module is valid** | boards, dashboards, instruments |

Pick **one**. Do not mix two named grids on one first screen unless the brief says so.

## Hard rules

1. **Name the grid in the brief before you code** (`radial` | `axial` | `column` | `modular`). No name, no rotation, no diagonal, no overlap.
2. **Snap.** CSS Grid (or SVG/canvas guides) is the skeleton. Arbitrary `position: absolute` drift off the grid fails unless it is a deliberate mark on an axis intersection.
3. **Scale is the hierarchy gadget, not weight.** Take a real step (≥1.5–2×); never call 16px → 20px hierarchy. Prefer size over weight. ≤8 sizes unless `STYLE.md` unlocks more.
4. **Weaponise negative space.** An empty module, column or corner *pushes* the eye to the payload. Never plug a void with a card, a badge or a boxed logo. Logos sit on the surface.
5. **Quiet palette.** Ground + ink + at most one or two saturated accents, each with a job. A colour that already means something (flood, danger, go) spends an accent. No rainbow, no decorative gradient, no glass.
6. **Motion is snap.** Skeleton then content; hard cuts over dissolves; no floaty morphs. Honour `prefers-reduced-motion`.
7. **Glance path still overrides "cool".** The heaviest visual is the entry, the headline sits on its exit, and Tab order matches the eye. See the glance-path skill.

## Where wild grids are allowed

Marketing, chapter openers and locked art posters may use radial or axial. **Dense forms, tables, settings and map/ops dashboards stay `column` or `modular`**, with the map owning ≥60% of the first screen. A civic tool's first phone screen prefers a quiet column unless the owner asked otherwise.

## Record with the brief

```text
Licensed break? yes / no
Named grid: radial | axial | column | modular | none
Heaviest visual (entry):
Glance exit:
Intentional voids (which tracks/modules):
Accents (≤2) and their jobs:
Scale step (title vs body):
```

Auto-reject: rotation with no named grid · 16→20px "hierarchy" · every module filled · a boxed logo in a gap · rainbow or glass · a radial poster burying a dashboard.
