# Adopting the spatial gate in a project

The instrument in `bin/` is **shared and byte-identical everywhere**. A number
that means one thing in one project must mean the same thing in the next, so
never edit it. Every project-specific need is met with a *project-side helper*
next to it, never by changing the instrument.

Check the copies against the shared package before you commit them:

```sh
shasum -a 256 scripts/spatial/spatial-*.mjs scripts/spatial/spatial-probe.js
# must equal the hashes of the shared package's bin/
```

---

## 1. Vendor, wire, baseline, read

```sh
mkdir -p scripts/spatial
cp <shared>/spatial-gate/bin/* scripts/spatial/
```

Wire the gate into the **release chain** and into **CI**, and wire in the
falsifier too — a gate that has never failed proves nothing:

```json
{
  "scripts": {
    "spatial:gate": "node scripts/spatial/spatial-check.mjs --dir dist --baseline design/spatial-baseline.json",
    "spatial:falsify": "node scripts/spatial/spatial-falsify.mjs dist",
    "spatial:verify": "npm run spatial:gate && npm run spatial:falsify"
  }
}
```

Then generate the baseline and **read it**:

```sh
node scripts/spatial/spatial-check.mjs --dir dist --update
```

`--update` writes every finding with a blank reason and exits non-zero. That
is the point: the first baseline is a *review*, not a recording. Write a reason
for every finding, then re-run the gate until it is green.

**Never re-baseline blind.** The diff is the artefact.

---

## 2. The traps, and what to do about them

These are the things that silently make the gate measure the wrong thing. Each
one was found by a reviewer, not by reading the code.

### 2.1 The gate may not find your stylesheet

The instrument looks for CSS at `<dir>/_next/static/css` — a Next.js
convention. If your build emits somewhere else, the sweep falls back to six
default widths and **says so in its output**. Read that line. If it says the
stylesheet was not found, mirror your built CSS into
`<dir>/_next/static/css/` before you trust the sweep.

### 2.2 Your breakpoints may be invisible to it

The CSS scanner reads `(min-width: …)` and `(max-width: …)`. A build that
minifies to the modern range syntax — `@media (width>=880px)` — is **invisible
to the scanner**, and the sweep silently covers only the default widths. The
layout changes at 880 and the gate never looks there.

Write the widths your own stylesheet declares into
`<dir>/_next/static/css/breakpoints.css`. It is never loaded by any page, so
it cannot change a measured pixel; it only tells the gate where the cliffs
are. Derive it from the **built** stylesheet, not from the source.

### 2.3 A single-page app renders after `load`

The gate measures at `load`. An SPA that fetches its data and renders 400ms
later will have its **boot placeholder** measured, and the gate will pass a
page with a hole in it.

Two fixes, and the second is the honest one:

- **Preload the data** so the boot state is shorter than the gate's settle
  window. A boot placeholder that lasts longer than the settle window will be
  measured as the page.
- **Prerender the measurement copy**: visit each route in a headless browser,
  wait for it to settle, strip the app's own scripts, and write the resulting
  DOM into that route's `index.html`. The document that arrives *is* the page,
  so `load` means something. The snapshot is the app's own DOM, from the app's
  own data, in the app's own stylesheets.

### 2.4 `display: contents` hides content from the probe

The probe walks a container's **element children**. A wrapper with
`display: contents` has no box of its own, so the content inside it is not
among the container's children — and the space that content occupies reads as
a **hole**. You will get a finding that says "80px of empty space" where there
is a paragraph.

Give the wrapper a real box (`display: block`) and the content becomes
measurable again. Check the rendered page before you believe a hole.

### 2.5 A `1fr` track keeps its content's minimum

`grid-template-columns: 1fr` means `minmax(auto, 1fr)`, and `auto` is the
content's *minimum* size. One long URL in a definition row therefore widens
the whole page. Use `minmax(0, 1fr)` and let the content wrap. Same for a
flex child: `min-width: 0`.

### 2.6 A table with `width: 100%` still overflows

`width: 100%` sets the table's *preferred* width; the browser will still
widen it to fit its content's minimum. A six-column data table in a phone's
width will push the page sideways.

Put the table in a scroll wrapper (`overflow-x: auto`) and give the table a
`min-width` large enough for its columns to be readable. The reader scrolls
the *table*; the page never scrolls sideways.

### 2.7 An inline element's box is the union of its line boxes

An inline `<a>` whose text breaks over two lines has a bounding box as wide as
its **widest line**, not as wide as its container. Judging an inline by its
own box will call a perfectly readable link "crushed". Judge it by its
containing block's width. `find-crushed.mjs` does this.

### 2.8 The probe's own false positives

A measurement is a question, not a verdict. Two that will cost you time if you
do not know them:

- **Sticky is not chrome unless it is on the edge.** A `position: sticky`
  element 1200px below the fold still reports a box.
- **A closed `<details>` still has a layout box.** Check `contentVisibility`
  on the element and its ancestors before believing that a collapsed form is
  visible.

---

## 3. The companion: `find-crushed.mjs`

The gate asks whether a row has a hole in it. It does not ask whether a
heading has been crushed to one word per line — that is not a hole, it is a
box that is too narrow, and the text still "fits" it.

`find-crushed.mjs` asks the direct question: is there a text element whose box
is far narrower than the text it holds, so the reader gets one or two words on
every line?

```sh
node scripts/spatial/find-crushed.mjs --base http://localhost:8080 --width 359
node scripts/spatial/find-crushed.mjs --base http://localhost:8080 --width 359 --dir dist
```

It is a companion, not a gate: it reports, and a person decides. Run it at
every phone width after the gate is green.

---

## 4. CI

`spatial-law.yml` in this template measures the **deployed** site. That is the
right default when CI cannot build your site — which is the usual case when
the build depends on files that are deliberately not vendored.

If CI *can* build, measure the build instead and keep the deployed-site check
as a second job.

---

## 5. The report a pass ends with

The law requires the evidence, not a green tick. A pass reports:

- **Found** — every element, the viewport, the task cost.
- **Changed** — the demand that was removed.
- **Verified** — the screenshots, the before/after numbers, who reviewed them.
- **Remaining** — anything unresolved. Never a clean pass with something left
  in it.

And the receipts stay in the repository: `design/spatial-baseline.json` is the
record of what every page looked like, with a reason for every hole. It is
what makes "this was deliberate" an argument someone can have.
