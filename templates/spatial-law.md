# Spatial law — <Project>

> Mount this in the project contract (`AGENTS.md` / `CLAUDE.md`). The full law
> is `ANTI-SPATIAL-HALLUCINATION.md` (also packaged as
> `skills/spatial-hallucination/SKILL.md`). If this file and that one
> disagree, that one wins.

**Spatial hallucination is when an interface invents a reason to occupy space instead of arranging things around how people read, choose and act.** The rectangles may line up perfectly while their relationships make no sense.

The test for every region:

> Why is this here, why this size, and why this far from that?

"The grid put it there" is not an answer.

## The laws

1. **Space must have a job** — reading, grouping, comparison, orientation, interaction or deliberate emphasis. No job, no geometry.
2. **Chrome earns its pixels** — bars fit their useful contents; do not stack identity, title, status and controls into separate bands when they are one group. Measure the combined footprint.
3. **Content determines size; the task determines the composition** — controls fit their labels, reading columns fit a comfortable measure, maps and charts get the space to operate.
4. **Compose the first screen before extending the page** — make the task composition work at 390 × 844 and 1440 × 900, check 1024 too. Never force a fit by clipping, shrinking readable text or nesting scroll areas.
5. **Hierarchy must survive the viewport** — one thing wins, then a second, then a third, obvious when squinting.
6. **Relationships determine distance** — related controls together; less space within a group than between groups; the grid serves the relationships, it does not dictate them.
7. **Whitespace is allowed; unexplained space is not** — space that asks the reader to supply an intention the designer never had is spatial hallucination.
8. **Give every image a role** — decide the role before the size. An image with no role beyond filling the second column goes.

## The procedure

State the scene and the task. Map relationships before rectangles. Use real content. Compose at actual sizes. Challenge each gap: what relationship does it communicate? Exercise the page — real language, narrow width, enlarged text, keyboard. Repair causes before cosmetics. Get an independent reviewer.

Do not solve it by adding another spacer, panel, badge, slogan, stock image or row of identical cards.

## Evidence

Capture at 390, 1024 and 1440 px. For each viewport record: **chrome cost** (band height and its share of the viewport), **task visibility**, **geometry failures**, **hierarchy**, **preservation**.

A large footprint is a prompt to investigate, not a numeric failure. Source scans and green builds cannot prove a visual pass. If rendering was unavailable, report **unverified**.

## The report

```
Verdict: PASS / REVISE / BLOCKED
Reviewer (different from builder):
Checked widths, languages, states and task:
Kept on purpose:
Finding: element → unexplained relationship → evidence → smallest repair
Keyboard and task trial:
Not verified:
```

**When you find SH, massacre.** Remove the invented need for space. Restore the useful picture. Make the screen help the human read, choose and act.