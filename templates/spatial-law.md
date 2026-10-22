# Spatial law — <Project>

> Mount this in the project contract (`AGENTS.md` / `CLAUDE.md`). The full law
> is `skills/spatial-hallucination/SKILL.md`. If this file and that file
> disagree, that file wins.

**When you find SH, massacre.**

## The definition

**Spatial hallucination (SH) is when an interface invents a reason for things to occupy space, instead of arranging them around how people read, choose, and act.**

The test for every region:

> Why is this here? Why this size? Why this far from that?

"The grid put it there," "the container had room," and "it looks balanced" without a reading or task purpose are failed answers.

## The laws

1. **Space must have a job.** Every region supports reading, grouping, comparison, orientation, interaction, or deliberate emphasis. Name the job or remove the geometry.
2. **Chrome earns its pixels.** Bars fit their useful contents. Do not stack identity, title, status and controls into separate bands when they are one group. Measure the combined footprint.
3. **Content determines size; the task determines the composition.** Controls fit their labels. Reading columns fit a comfortable measure. Maps, charts, canvases and tables get the space to operate.
4. **Compose the first screen before extending the page.** Make the task composition work at 390 × 844 and 1440 × 900. Check 1024 too. Never force a fit by clipping, shrinking text, or nesting scroll areas.
5. **Hierarchy must survive the viewport.** One thing wins, then a second, then a third — obvious when squinting.
6. **Relationships determine distance.** Related controls stay together. Less space within a group than between groups. The grid serves the relationships; it does not dictate them.
7. **Responsive layout is a composition decision.** Choose what stays together and how navigation adapts. Fix accidental wrapping without truncating what is needed to act.
8. **Whitespace is allowed; unexplained space is not.** Space that asks the reader to supply an intention the designer never had is SH.

## The repair procedure

1. Read the current instructions and inspect the existing product.
2. State the user's task in one sentence. Choose the dominant element.
3. Inspect the rendered geometry. Start at the top bar and the first point where useful content leaves the viewport.
4. Name each failure precisely: element, viewport, wasted space, reading or interaction cost.
5. Repair the cause, not the consequences.
6. Preserve the product: maps, charts, canvases, tickers, earned content, keyboard access, readable type, usable targets.
7. Render again with real content, open menus, error states and keyboard focus.
8. Record evidence.

Do not solve SH by adding another spacer, panel, badge, slogan, stock image, or row of identical cards.

## Evidence before a pass is declared

Capture at 390, 1024 and 1440 px. For each viewport record: **chrome cost** (band height and its share of the viewport), **task visibility**, **geometry failures**, **hierarchy**, **preservation**.

A large footprint is a prompt to investigate, not a numeric failure. Source scans and green builds cannot prove a visual pass. If rendering was unavailable, report **unverified**.

## The report

- **Found:** element, viewport, the task cost of its geometry.
- **Changed:** the invented spatial demand removed.
- **Verified:** screenshots, measured before/after, exercised interactions, independent review.
- **Remaining:** unresolved SH or unverified states. Never claim a clean pass while these remain.