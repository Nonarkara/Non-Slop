# Anti-spatial-hallucination: compose relationships, not rectangles

**By Non Arkaraprasertkul. Version 1.0 · 20 October 2026. MIT.**

Spatial hallucination is a layout that invents a reason for things to occupy space instead of arranging them around how people read, choose and act. Its rectangles may line up perfectly while their relationships make no sense.

The test is simple: **Why is this here, why this size, and why this far from that?** “The grid put it there” is not an answer.

This guide grew from Dr Non's reviews of real interfaces, including a Shanghai travel guide: a small cartoon beside an introduction passed alignment checks but still felt pasted on. Making the picture and words occupy a shared narrative scene was a possible repair. Shrinking the gap alone could not establish that relationship.

Use this guide when designing or reviewing composition, image placement, responsive hierarchy, navigation or information density. It supplements the project's design contract. It does not replace the owner's voice, chosen style, map-first rules, accessibility requirements or image permissions. It does not require hero images, overlays, minimalism or a particular palette on every page.

## Contents

1. [The spatial contract](#1-the-spatial-contract)
2. [Recognise the failure](#2-recognise-the-failure)
3. [Give every image a role](#3-give-every-image-a-role)
4. [Compose a narrative image](#4-compose-a-narrative-image)
5. [Text over images: the acceptance gate](#5-text-over-images-the-acceptance-gate)
6. [Space, hierarchy and controls](#6-space-hierarchy-and-controls)
7. [Responsive composition](#7-responsive-composition)
8. [A working procedure](#8-a-working-procedure)
9. [Evidence and independent review](#9-evidence-and-independent-review)
10. [Reusable brief and report](#10-reusable-brief-and-report)

## 1. The spatial contract

Before choosing columns, write the page's reader, task and sequence of attention. Identify the thing that must win: a map, a photograph, a question, a letter, an actionable warning or a specific choice.

For each major group, decide:

| Decision | Required answer | A weak substitute |
|---|---|---|
| Position | What should the reader encounter immediately before and after this? | “It belongs in the sidebar.” |
| Scale | What must be seen, understood or operated at this size? | “It balances the other column.” |
| Proximity | Which elements must be read or acted on together? | “The gap token is 32.” |
| Empty space | Does it separate groups, protect a subject, establish pace, support reading or reserve a real state? | “It makes the page clean.” |
| Boundary | Does the container communicate a meaningful group, state or interaction? | “Cards look organised.” |
| Behaviour | What happens with longer text, another language, missing media or a narrow viewport? | “It wraps.” |

Spacing tokens implement decisions; they do not make decisions. A semantic grid follows relationships. It does not assign equal territory to unequal content simply because two columns are available.

## 2. Recognise the failure

Spatial hallucination is not a synonym for whitespace, asymmetry or a large image. The failure is an unexplained relationship.

| Symptom | What is wrong | Smallest useful repair |
|---|---|---|
| A small illustration sits beside a short introduction with a vacant rectangle beneath one side. | The image has no role beyond occupying the second column. | Decide its role first: integrate it into the opening scene, bind it tightly to a specific note, or remove it from this composition. |
| A primary action occupies its own row while Previous and Next are pushed to opposite edges below. | One decision group has been split into three apparent destinations. | Group the related actions; use a common size and small, consistent gaps. Wrap the pager together when needed. |
| A portrait photograph sits under a list, with a caption wider than the image. | The document and its explanation are detached; the remaining column is accidental. | Give the photograph a coherent evidence spread, bound its caption to it, or move it beside the passage it supports. |
| Every route or story gets a long, equally weighted paragraph. | A choice has become a reading assignment. | Offer a concise index and one meaningful preview, a map-led selection or distinct editorial entries appropriate to the content. |
| A header's final two links spill onto a sparse second line. | Available width, rather than navigation priority, chose the grouping. | Define primary navigation and an intentional contents/menu treatment. Preserve discoverability and keyboard access. |
| A decorative hero pushes the only useful action below the first phone screen. | Scale serves the template instead of the task. | Reduce, relocate or replace it. In an operational product, let the map/data remain primary. |
| Text flows beside a thumbnail, then a single link breaks halfway across two reading widths. | Float geometry interrupts a semantic unit. | Clear the image before the link group, or use a composition that keeps the unit together. |
| All empty space is filled with icons, badges or extra pictures. | Decoration hides the unanswered spatial decision. | Remove the fillers and explain the remaining space. |

A small picture can be exactly right. It must have a specific relationship to nearby content, a readable subject at its rendered size and a caption/credit proportionate to its role. Small is not the defect; arbitrary is.

## 3. Give every image a role

Choose a role before choosing dimensions. A picture may have more than one role, but each claimed role must be visible in the experience.

- **Subject:** the image is what the reader came to inspect. Preserve useful detail and give it sufficient space.
- **Evidence:** the photograph, map or document supports a factual claim. Keep its date, source, licence and necessary margins available. Do not obscure labels or crop away contrary evidence.
- **Narrative scene:** the illustration establishes a place, action or mood that the words inhabit. Compose words and scene together; neither should look dropped onto the other afterwards.
- **Memory cue:** a character, landmark or visual motif helps the reader distinguish and recall sections. Associate it with a concrete idea rather than repeating one mascot beside unrelated topics.
- **Navigation:** choosing the image leads to a clearly named place, route or story. Its target and selected state must be understandable without recognising the artwork.
- **Instruction:** the picture explains an operation, orientation or comparison that text alone makes harder to understand. Labels and diagrams must remain legible at their actual size.

If an image has no role except “brightens the page”, it has not earned this particular placement. The repair may be to give it a better role, not to delete all personality.

For a travel preparation page, a character packing, checking a phone or studying a route can connect to the task. A character in an unrelated setting may still work as a quiet memory cue, but enlarging it does not automatically make it a narrative.

## 4. Compose a narrative image

A hero is a relationship, not a size setting. `width: 100%` does not turn a patched-in cartoon into authored design.

Consider these patterns and choose the one that serves this page:

### A. A shared scene with a text-safe region

Use when the setting and action are part of the opening narrative. Designate the subject, the text-safe region and the reader's next action before positioning them. Light sky, unmarked paper or a quiet wall may provide space for a short heading or introduction if contrast actually passes.

For newly commissioned or explicitly authorised generated artwork, brief the composition with real text requirements: the subject's position, required landmarks, a calm region of adequate dimensions, crop limits and a separate mobile composition where needed. Keep text as HTML; do not ask the image generator to draw interface text.

For existing artwork, inspect it before declaring a text-safe region. Do not erase meaningful scenery or wash out archival evidence to manufacture space. If there is no safe region, choose another pattern.

### B. An editorial spread

Use when both image and text deserve their own clear surface. Their proportions, shared alignment, sequence and captions establish the relationship. An unequal spread is often appropriate. Match semantic weight, not rectangle heights.

On a phone, decide which appears first and why. An evidence image may precede the claim; an orientation sentence may precede the image. Do not preserve a desktop sidebar merely because it exists in the markup.

### C. A full image with an attached reading band

Use when the image needs its entire frame or cannot support an overlay. Put the short introduction or caption immediately before or after it, in a reading band that visibly belongs to the image. This is a composed alternative, not a failed overlay.

### D. An operational instrument with an illustrated entry point

Use for maps, monitoring, civic services or other task-first products. The operational surface wins. A story or illustration can introduce the task or live in a separate reading view; it must not displace useful data, hide controls or imply observations that do not exist.

A chosen empty colour field can itself be the subject. In Palette, for example, the colour relationship owns the viewport; this guide does not authorise covering it with a travel-style hero or extra chrome.

## 5. Text over images: the acceptance gate

“Light area” does not mean “readable area”. A pale but busy drawing can be harder to read than a dark uniform surface. Test the actual artwork with the actual words.

Ship an overlay only when all of these hold:

1. **The scene and text belong together.** The overlay explains or participates in the scene; it is not an unrelated slogan covering a picture.
2. **The text stays live.** Use semantic HTML, selectable text, a sensible heading order and a reading order that survives image failure. Essential words cannot exist only inside a bitmap.
3. **Every local background passes contrast.** Use WCAG AA text contrast: at least 4.5:1 for normal text and 3:1 for qualifying large text. Check the least favourable pixels behind the glyphs, not the image's average colour or an empty sample beside the text. Large-text qualification depends on size and weight, not the CSS class name “hero”.
4. **Texture does not interfere.** Inspect letter edges, Thai marks, Chinese strokes, line breaks and focus rings at actual size. Passing a luminance ratio does not prove comfortable reading over detailed art.
5. **The composition survives language and zoom.** Test the longest real translation, font fallback, 200% text enlargement and a 320px viewport. Text must not escape its safe region or hide the subject.
6. **The crop is intentional.** At every breakpoint, the important face, gesture, landmark and evidence remain visible. `object-fit: cover` is a crop decision, not a universal fix. Record safe bounds or provide an art-directed source when needed.
7. **States remain readable.** Test delayed/failed images and, where used, loading frames, changing slides or video frames. Motion behind text requires its own accessibility and attention decision; a still scene is often sufficient.
8. **A fallback is designed.** If any language, viewport or state fails, place the text in its own adjacent reading surface or switch to another approved composition. Do not shrink words, conceal the subject or apply an ever-stronger effect to force the overlay to survive.

A solid backing or local scrim can have a real legibility job where the project's style permits it. It is not automatic permission to add gradients, shadows, glass or panels to a project that forbids them. In that project, change the composition or image instead. No effect substitutes for checking the final pixels.

Keep alt text purposeful. If adjacent live text already says everything an image communicates and the image is genuinely decorative, empty alt may be appropriate. If the scene adds narrative, instructional or factual meaning, provide concise equivalent information. Avoid making assistive-technology users hear the same paragraph twice.

## 6. Space, hierarchy and controls

### Whitespace must perform a job

A margin can protect reading measure, distinguish sections, hold a subject's gaze or create a pause. It need not be filled or numerically symmetrical. Explain its purpose in the brief; then check whether it still performs that purpose on a phone and with short content.

Do not use forced equal heights, `min-height`, `space-between` or centring as a substitute for composition. These tools are valid when their behaviour is intended: touch targets need minimum dimensions, a genuine loading state may reserve media space, and a toolbar may deliberately separate navigation from account controls.

### Group actions by decision

Controls that answer one question should read as one group. Give the primary action a clear priority. Put Previous and Next beside each other when their relationship is paging; align them with the associated open/read action when that improves the decision. They need not occupy the far left and far right of a large container.

Keep labels readable and targets usable. If a group cannot fit, wrap a meaningful subgroup, change the labels without losing meaning, or use another explicit arrangement. Do not squeeze eight controls into a phone by making them tiny.

A one-line sequence may scroll inside its own labelled container when preserving sequence is genuinely useful. Make the continuation discoverable, keep focus visible and ensure keyboard focus brings the selected item into view. Horizontal scrolling is a chosen tradeoff, not proof that every item is visible simultaneously.

### Make information worth its spatial cost

A page does not become usable merely because all its information is valuable. Give a reader appropriate entry points: a map, a concise index, one preview, a summary, a separate detail page or a disclosure. Preserve searchability, direct links and a route back where the task needs them.

Do not hide urgent instructions, critical errors, the current state or the sole primary action just to shorten a screenshot. Disclosure is for optional depth, not for concealing what the task requires now.

## 7. Responsive composition

A breakpoint is an editorial decision about relationships, not a command to stack every box.

At each target width, decide what must remain together, what may change order, what may be cropped, what may scroll internally and what must move to a separate reading surface. Preserve coherent units: a name, image credit, action group or location should not split between incompatible reading columns.

Check at least 1440, 1024, 390 and 320 CSS pixels, plus the product's actual device constraints. Check every promised language and text enlargement. A finite set of screenshots is evidence about those cases, not a guarantee of all devices.

The page itself must not acquire accidental horizontal overflow. A map, table or deliberate sequence can have a bounded internal scroll area with usable controls. Keep DOM reading/focus order meaningful; do not repair the visual order with CSS while leaving keyboard users to visit an unrelated sequence.

## 8. A working procedure

1. **State the scene and task.** Name the reader, one job, first/second/third attention, constraints and subject-specific direction. Read the existing style contract.
2. **Map relationships before rectangles.** Mark the semantic groups, action groups, image roles and necessary whitespace. A rough annotated sketch is enough.
3. **Use real content.** Put in the longest actual headings, translations, captions and source credits. Include sparse content, long content and missing media where applicable.
4. **Choose the image pattern.** Shared scene, spread, attached reading band or task-first instrument. Explain the choice in one sentence. Do not pick hero by habit.
5. **Compose at actual sizes.** Set subject scale, reading measure, text-safe bounds where relevant, and crop behaviour. Use existing tokens to implement those choices.
6. **Challenge the geometry.** Ask of each gap, boundary and alignment: what relationship does it communicate? Remove filler; preserve expressive choices that have a job.
7. **Exercise the page.** Read it, complete the task, change language, resize, enlarge text, fail the image and traverse it by keyboard. If an overlay is used, run the full overlay gate.
8. **Repair causes before cosmetics.** A wrong image role will not be repaired by a smaller gap. A laundry list will not become a choice through alternating background colours. A crop cannot fix the wrong asset.
9. **Get independent review.** A different person or agent reviews the actual render and performs the task without hints. Record what remains unverified. Documentation-only changes need a content/link/integration review; they do not require pretending a UI was rendered.

## 9. Evidence and independent review

A source scanner can identify suspicious geometry, overflow, missing semantics or contrast candidates. It cannot establish narrative meaning, judge optical balance reliably or prove an overlay safe from an average colour sample.

Do not turn this guide into a universal whitespace quota, hero-height percentage, image-to-text ratio or “AI-likeness” score. Such measures can expose a case worth inspecting; they cannot decide whether the composition is authored.

For a UI change, retain a small evidence set:

- Before/after views of the affected composition, at the widths and languages checked.
- The declared image role and the reason for its placement and size.
- Crop/failure/zoom checks appropriate to the chosen pattern.
- Contrast evidence for overlays, including the least favourable background region.
- The task trial and keyboard route, with a named independent reviewer.
- What was kept deliberately and any limits of the verification.

For documentary assets, preserve credit and licensing information; never present an illustration as a historical photograph, a drawn map as surveyed geography, or two different scenes as a matched before/after pair. Owner permission to use a personal reference does not by itself permit publishing that photo or uploading it elsewhere. Do not generate new visual assets unless the user has authorised generation and the project's rules permit it.

## 10. Reusable brief and report

### Brief

```text
Reader and task:
Attention order: 1 / 2 / 3
Image role and narrative connection:
Why this position and scale:
What the empty space does:
Action groups and next step:
Responsive/language/zoom behaviour:
Overlay safe region and fallback, if used:
Source, permission and credit requirements:
```

### Review

```text
Verdict: PASS / REVISE / BLOCKED
Reviewer (different from builder):
Affected page or documentation:
Checked widths, languages, states and task:
Kept on purpose:
Finding: element → unexplained relationship → evidence → smallest repair
Overlay gate: passed with evidence / failed / not applicable
Keyboard and task trial:
Not verified:
```

A screenshot looking neater is not the stopping condition. The stopping condition is that the composition's relationships are legible, the intended task works, the selected visual treatment survives its real constraints, and an independent reviewer can explain what belongs together without being coached.

## Provenance and maintenance

“Spatial hallucination” and the governing question come from Non Arkaraprasertkul's iterative design reviews, consolidated with Codex on 20 October 2026. The Shanghai example is described without publishing private reference photos or screenshots. Accessibility checks follow the established WCAG contrast and reflow concepts; see the [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

The same version is distributed in Non-Slop, Palette and Dr Non's Vibe Coding Stack. When editing a root guide and its packaged skill reference together, keep their contents identical. Preserve project-specific constraints in each integration rather than weakening this guide or silently overriding the host product.
