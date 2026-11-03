---
name: non-slop-glance-path
description: >-
  Put the payload where the eye actually lands. Use when composing or reviewing
  a hero, card, poster, dashboard or any block pairing a heavy visual with words,
  or when a headline, number or primary action feels buried.
license: MIT
---
# Glance path: the eye enters on weight, not on DOM order

**By Non Arkaraprasertkul. Distilled 3 November 2026. MIT.** Full law: [`GLANCE-PATH-FOR-AI.md`](../../GLANCE-PATH-FOR-AI.md).

The best message in the world is worthless if you put it where the eye never goes. The eye lands on the heaviest thing on the screen — a big image, a saturated card, a video, or the map on a map product. Then it drifts down and to the side. **Put the headline, the key number and the primary action on that exit.** Never make it climb back up or leapfrog a heavy visual to find them.

## The failure to catch

```text
Title
████████  huge image / saturated card  ████████
copy / CTA
```

The image outweighs the title, so the eye skips the words, then has to climb back up for them and jump the picture again to reach the copy. That is more work than a glance gives you. The repair is not a rewrite — it is a reorder:

```text
████████  image / video / map  ████████
Headline
copy / CTA
```

## Rules that must hold

1. **Weight picks the entry.** The heaviest thing is the entry, not whatever is first in the HTML.
2. **Payload on the exit.** Headline, key number and primary action sit immediately below or beside that visual, sized to their words. The band is not stretched into a second hero.
3. **No leapfrog.** Headline and its copy stay on one side of the heavy visual.
4. **Map and data products are not posters.** The map (or the primary data surface) is the entry — ≥60% of the first desktop and phone screen when the product is map-first — and readouts and next actions dock its edge, never a dead band above it.
5. **A headline may lead at the top only when it is itself the dominant visual** — unapologetically large display type with nothing heavier beside it. 16px next to 20px does not qualify.
6. **Semantics keep their order; the eye does not get cheated.** Keep a real heading structure for accessibility; if the `h1` must stay first in the DOM, place it visually on the exit and prove the Tab order matches what the eye sees.

## Procedure

1. Name the reader and the one job; write the attention order 1 / 2 / 3.
2. Name the heaviest visual and where the eye exits it.
3. Put the headline and primary action on that exit; keep the copy with the headline.
4. Squint at 1440, 1024 and 390×844: does the biggest thing still win, and does the eye flow down without climbing?
5. Tab through it. Keyboard order must equal visual order.
6. Record `exit holds headline` / `leapfrog` / `stack fights the eye` and get a different agent to sign off.

Standing limits still apply (MSH box fit, logos never boxed, ≤2 accents, readable measure, light by default, builder ≠ auditor).
