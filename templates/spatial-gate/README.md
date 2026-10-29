# Spatial gate — adoption template

Everything a project needs to adopt the shared spatial gate: the instrument
(the same bytes every project uses), the companion that finds text crushed
into a column too narrow to read, a CI workflow, and the checklist that
records the traps that make the gate measure the wrong thing.

**Read `ADOPT.md` first.** It is the short version of everything below, and
it is the part that will save you a day.

| File | What it is |
|---|---|
| `bin/spatial-check.mjs` | The gate. Measures every route at every layout-changing width and fails on any finding without a written reason. |
| `bin/spatial-probe.js` | The measurement probe injected into the page. |
| `bin/spatial-falsify.mjs` | The proof: injects one real defect per mode and requires the gate to catch each one. |
| `find-crushed.mjs` | The companion. Finds headings and paragraphs squeezed into a column too narrow to read — a failure the gate cannot see, because a crushed column has no hole in it. |
| `spatial-law.yml` | A CI workflow that measures the deployed site. |
| `ADOPT.md` | The checklist, and the traps. |

## The instrument is shared

`bin/` must stay byte-identical to the shared package. A number that means
one thing in one project has to mean the same thing in the next, or the
receipts cannot be compared and the law becomes a local superstition.

Every project-specific need is met with a **project-side helper** next to the
instrument — never by editing it. A helper that mirrors your build's CSS where
the instrument expects to find it, a helper that prerenders your SPA for
measurement, a helper that writes your breakpoint manifest: all of those are
yours to write, and all of them belong beside the instrument, not inside it.

## Why the law exists

Spatial hallucination is when an interface invents a reason for things to
occupy space, instead of arranging them around how people read, choose and act.

The test for every region of every page:

> **Why is this here, why this size, and why this far from that?**

If the answer is *"the grid put it there"*, the layout has failed.

The owner's canonical statement of the law — **MSH, Massacre Spatial
Hallucination** — is `skills/spatial-hallucination/SKILL.md` in this
repository, and the human-facing guide is `ANTI-SPATIAL-HALLUCINATION.md`.

**When you find SH, massacre.**
