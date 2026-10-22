# Credits and licences

Non-Slop is MIT-licensed (see LICENSE). It stands on the sources below. Unless a row says **code reused**, nothing was copied: the ideas were read, merged and rewritten in our own words, and every rule id, regex and sentence here is original. All sources were read on 19 October 2026 at the commit shown.

## Code reused

| Source | Licence | What was reused |
|---|---|---|
| [Nonarkara/palette](https://github.com/Nonarkara/palette) `tools/slop-lint.mjs` @ `bc82e15`, © 2026 Non Arkaraprasertkul | MIT | The in-page DOM metrics and rule weights in `lib/render.mjs`, changed so that a reading column isn't void, emoji count as icons only in UI slots, STYLE.md allowlists apply, and the PNG maths runs in the browser (no `pngjs`). The same file ships in Nonarkara/dr-non-vibecoding-skills @ `c39dc2e`. |

## Rules and method (paraphrased, not copied)

| Source | Licence | What we took |
|---|---|---|
| Non Arkaraprasertkul: the `anti-slop-design` skill, `ANTI-SLOP.md` (shared by palette, dr-non-vibecoding-skills, nonarkara.org and 11 more repos), and the Oct 2026 style-protection audit | MIT (own work) | The hard limits, map-first "surgical table" rule, "empty space is a decision", "subtract before you add", the A4/A5 line-length rule, house type starting point, and the whole style-protection section (STYLE.md wins; "would removing this make it more generic?"). |
| Citizen-built flood apps listed on [FloodDash](https://flood.nonarkara.org) (*About → Citizen-built apps*), measured 18 Oct 2026 | — | The evidence behind the limits. Render weights use the 31-app measurement cited in `skills/detect` (in-sample precision 0.95, recall 0.91 at REVIEW). The study is about visual patterns only. Thanks to every builder; clean exceptions worth learning from: Thailand Flooder, พิกัดน้ำท่วมสมุทรปราการ (paddypure), น้ำคลอง (namkhlong), Floodboard, น้ำบนถนน บางมด (taokaetech), Floraville Flood Forecast, Meanam. |
| [Nonarkara/dr-non-vibecoding-skills](https://github.com/Nonarkara/dr-non-vibecoding-skills) @ `c39dc2e`, plus open PR #25 (Ruttl composition map) and PR #13 (foundation gate: scale the gate to the stakes, SHA-pinned Actions) | MIT (own work) | Reviewer-first rule (never self-review), "judge the stack", "minimal is the floor", fonts "banned as default, allowed with a reason", the Ruttl topic-to-practice mapping. |
| [funboy322/avoid-ai-design](https://github.com/funboy322/avoid-ai-design) @ `2b7c718`, © 2026 ungspirit | MIT | The idea of a zero-dependency source scanner with P0/P1/P2 "who notices" severity, ignore comments, second-order defaults (cream + terracotta, near-black + acid, template chrome), the silhouette test, and "a tell is evidence of a default, never proof a model made it". |
| [Vanszs/Anti-AI-UI](https://github.com/Vanszs/Anti-AI-UI) @ `fd2a142`, © 2025 Vanszs | MIT | Deciding each design axis explicitly (colour, type, layout, copy, motion), per-component "never generate" lists, the "swap the logo with a competitor" test. |
| [anthropics/skills `frontend-design`](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) @ `dbd4588` | Apache-2.0 (see its LICENSE.txt) | Ground the design in the subject; plan as a compact token system, then review the plan against the defaults before building; spend boldness in one place; structure must encode meaning (01/02/03 only for sequences). Paraphrased; no text reproduced. |
| [microsoft/skills `frontend-design-review`](https://github.com/microsoft/skills/blob/main/.github/skills/frontend-design-review/SKILL.md) @ `8850874`, © Microsoft Corporation; pillar framework by [@Quirinevwm](https://github.com/Quirinevwm) | MIT | The three review pillars (frictionless insight to action, quality craft, trustworthy building) and blocking/major/minor triage, adapted in `skills/review/`. |
| [kari-ai-lab/agent-skills-public `frontend-design-principles`](https://github.com/kari-ai-lab/agent-skills-public/blob/main/skills/engineering/frontend-design-principles.md) @ `8525883`, © 2026 northernfried | MIT | "The hero is a thesis, not a slot to fill"; make every visible decision accountable to subject, audience and task. |
| Harsh Vijay, [11 Website Design Best Practices To Follow In 2026](https://www.ruttl.com/blog/web-design-best-practices), ruttl.com, 9 Aug 2026 | All rights reserved (no licence) | Topic list only, paraphrased as eleven practices in `skills/direction/`. No text, images or statistics copied; its conversion framing was not adopted. No endorsement. |
| [shannhk/avoid-slop](https://github.com/shannhk/avoid-slop) @ `5e71c43` | No licence file | Used as a directory to find the sources above. Nothing copied. |
| [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | W3C | Contrast thresholds (1.4.3), reflow (1.4.10), target size (2.5.8; we hold a stricter 44px house line), focus visible (2.4.7). |
| [petergyang/no-ai-slop](https://github.com/petergyang/no-ai-slop) @ `000650b`, © 2026 Peter Yang | MIT | The detect-without-rewriting workflow in `skills/writing/`: quote the sentence, say what is wrong with it, propose the smallest fix, and do not rewrite or score the draft on a review pass. Making a generic sentence specific to this subject, while leaving the writer's voice. Paraphrased; no rule text copied. Not taken: the banned-word list, the em-dash quota, and the instruction to flatten contrastive or unusual sentences. Those fight an owner's style. |
| [jakubkrehel/make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) @ `35545ea`, © 2026 Jakub Krehel | MIT | The idea of a small-interactions checklist a reviewer walks, in `skills/review/`: labels a person can read, optical alignment of an icon with its label, visible focus on the small controls, a loading state, and a second press that must not fire the action again. Paraphrased; no rule text copied. Not taken: concentric corner radii, shadow recipes, image-outline colours, and the fixed press-scale. Those belong to the owner. |
| Rakesh Mahanti, Instagram carousel ["Anti-AI-Slop Writing"](https://www.instagram.com/p/DeHgoP8kxyV/) | All rights reserved (link only) | The idea that an edit should help a reader do something or understand the subject, and that meaningful choices stay while generic ones are questioned. Link only. No caption or slide text was copied. The sentence in `AGENTS.md` is the wording the owner approved. |
| Steven Pinker, [*The Sense of Style: The Thinking Person's Guide to Writing in the 21st Century*](https://en.wikipedia.org/wiki/The_Sense_of_Style) (Viking, 2014) and [*The Language Instinct: How the Mind Creates Language*](https://en.wikipedia.org/wiki/The_Language_Instinct) (Penguin, 1994) | Copyrighted books; read in full on 22 Oct 2026 from copies supplied by the owner | The writing-law layer in `skills/writing-laws/`: language as the transfer of precise ideas into another mind, and a vocabulary that lacks a word making the thought unthinkable; the passive as a camera angle that puts the actor or the affected party in the spotlight, and the agentless passive as the writer forgetting to stage an event; given before new; one topic string per passage; spelling out abbreviations and glossing jargon on first use; the zombie noun; and the distinction between real errors (which confuse) and style rules (which are the author's business), including why "never use the passive", "never use a fancy word", "avoid alliteration" and "murder your darlings" are badly stated rather than forbidden. Also the four-move structure (land it, cut it, stage it, hold it) and the conditions for a licensed break: local, paid off, oriented first, and named — never on a first screen, a UI label, an error message, or safety copy. **Paraphrased and restructured; no sentence, table row or heading of either book is reproduced.** The two detector rules `agentless-passive` and `zombie-noun` are original regexes written for this repo from the ideas above; the rule text, the fix text and the reasons are ours. |

## Not used

`LaylaStone180/avoid-ai-design` (@ `78d8727`, 16 Oct 2026) was recommended as a source, but on inspection its README is a copy of funboy322's and its code is a one-line stub padded with filler comments; the scanner it describes isn't there. We credit and link the original (funboy322) instead and took nothing from the copy.

## Own work

The **spatial law** — spatial hallucination, and its standing form the owner calls Massacre Spatial Hallucination — is the owner's own design law (Non Arkaraprasertkul, 2026), written across his repos. On 20 October 2026 Codex consolidated it with him into `ANTI-SPATIAL-HALLUCINATION.md`; on 22 October 2026 the geometry half was folded into that same guide from the owner's standing law, and the packaged skill reference was regenerated from it so the two stay identical as the guide's own maintenance rule requires. Nothing in it is borrowed. `skills/spatial-hallucination/SKILL.md` and `templates/spatial-law.md` are its packaged forms.

## Refused

These were considered and are not rules here.

- An AI-likeness percentage, or any score that claims to measure how much of a text is "AI". There is no verified basis for that meter. A sentence a person can point at is evidence. A percentage is not.
- Planting typos, errors, or roughness so writing looks human.
- A banned-word list, an em-dash quota, and rules that flatten an unusual sentence. Peter Yang's skill contains these; they were not adopted.
- Fixed corner radii, shadow recipes, and a required press-scale. Jakub Krehel's skill contains these; they were not adopted. An owner's radius and shadow live in `STYLE.md`.

Nobody listed here endorses Non-Slop.

## Spatial hallucination

The term, governing question and composition method come from Non Arkaraprasertkul’s design reviews, consolidated with Codex on 20 October 2026. The original [guide](ANTI-SPATIAL-HALLUCINATION.md) is MIT; its accessibility references link to W3C guidance rather than reproducing that guidance. No private reference image is included.
