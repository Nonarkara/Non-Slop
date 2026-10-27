# Task geometry is part of the spatial law

Owner instruction: Non Arkaraprasertkul, 27 October 2026. This portable supplement belongs to the existing anti-slop and spatial-hallucination rules. Canonical source: [Non-Slop](https://github.com/Nonarkara/Non-Slop/blob/main/DECISION-GEOMETRY.md). Distributed copies preserve this text; project style and accessibility rules remain in force.

**A layout fails when unnecessary space makes a person reconstruct a decision that should be available in one coherent view.** Alignment, a pleasing palette, correct fonts and zero horizontal overflow cannot clear that failure.

## Diagnose the expansion chain

A region takes more space than its task needs → its parent or sibling stretches → useful content drops below the first screen → evidence and controls separate → the user scrolls to recover the relationship.

Trace that chain to its first unjustified expansion. In particular:

- A map, chart or canvas must not acquire its height merely because the neighboring evidence panel is long. Size it for its operating task; let unrelated explanatory content flow independently. Equal-height comparison is valid when comparison actually needs it and that reason is recorded.
- In a tool, a title identifies the task. An oversized slogan/hero that delays the task has no automatic right to that area. An editorial opening or a full-viewport artwork can have a different, explicit job.
- Repeated qualifications, duplicate headings and separate identity/status/title bands can enlarge the reading path. Keep the necessary fact at its decision point and keep its full source or explanation discoverable. Do not hide a qualification needed to interpret a number.
- Information, its controls and its next action form a decision group. Keep that relationship legible on phone, tablet, desktop and the user's actual working viewport. A desktop layout stacked unchanged on a phone is not a responsive composition.

## Repair in this order

1. Name the human task, the dominant element and the information/action pair that must be read together.
2. Identify the first unnecessary expansion and the descendants it displaces. Check the full reading path, not only the hero.
3. Regroup the decision, remove redundant chrome, set independent task-sized regions and move long supporting reading into a clearly labeled reading surface or disclosure where appropriate.
4. Preserve maps, charts, canvases, earned content, source qualifications, readable labels, useful targets, keyboard order and working controls. Do not force a fit by clipping, shrinking text, hiding controls, adding filler or trapping the task in nested scrolling.
5. Measure the repaired composition, falsify its budget with the original failure, and obtain independent review. A cleaner screenshot alone is not a stopping condition.

Palette's color field is its product; a real map needs an operating area; a long source text may earn scrolling. This law assigns no universal hero height, map percentage, whitespace quota or fixed number of cards. A project's chosen budget is justified by that task and content.

## Release evidence

For a UI change, capture 390×844, 1024 at a stated height, 1440×900, and the actual working viewport if it differs (for example 1280×720). Include relevant expanded/loading/empty/error/long-label states and breakpoint neighbors affected by the change.

Record before/after **combined chrome height**, **title/intro height**, **main working-region dimensions**, **repeated-row/section height** where relevant, **page width/height**, and the **distance and first-screen visibility of the information/action pair**. A compact task should fit its first screen; longer reading must earn its scroll with identifiable content. Keep complete qualifications and accessible interaction targets.

Choose content-specific regression budgets and preserve the measured cases. In an isolated fixture or local test, restore the oversized title, stretch or separated action and prove the same gate fails. Do not widen the budget just to accept the old failure. Never poison a live site to perform this test.

The portable [measurement capsule](tools/decision-geometry/README.md) records declared regions without changing the DOM. Its check fails on missing cases/selectors, wrong viewports/states, overflow, clipping, hidden targets, violated dimensions, excessive decision separation and first-screen obstruction. Its example numbers belong to its synthetic fixture; replace them when adopting it in a product.

`BUDGETS_PASS` means the declared measurements pass. It does not certify meaning, taste, accessibility, all pixels, all devices or an unobserved task. Never use a source scan, color/type check, green build or handwritten measurement file as a substitute for rendered evidence.

Documentation-only updates need a content/link/integration review and real tests of changed tools; they do not require pretending that an application was redesigned. Report missing rendering as **unverified**. Close every independent finding in writing with the final evidence and its disposition.

## Origin example, not universal dimensions

The Khao Lak pilot's first 1440px layout was 1,273px tall: a 193px introduction and a map stretched by a long evidence panel separated the useful actions. Regrouping the controls and making source/details deliberate reduced the page to 978px and the introduction to 103px, while preserving the live map and comparison. The next actions ended inside the first 900px. Those values describe that repair; they are not dimensions for another product. [Research project and verification record](https://github.com/Nonarkara/tsunami-evacuation/blob/main/docs/VERIFICATION.md).

Verification and independent review: [rollout evidence](https://github.com/Nonarkara/Non-Slop/blob/main/docs/decision-geometry/VERIFICATION.md). This verifies the shared instrument, not every consumer application.
