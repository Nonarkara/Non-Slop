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
| The 46 citizen-built flood apps listed on FloodDash (flood.nonarkara.org, *About → Citizen-built apps*), measured 18 Oct 2026 | — | The evidence behind the limits and render weights. The study is about visual patterns only. Thanks to every builder; clean exceptions worth learning from: Thailand Flooder, พิกัดน้ำท่วมสมุทรปราการ (paddypure), น้ำคลอง (namkhlong), Floodboard, น้ำบนถนน บางมด (taokaetech), Floraville Flood Forecast, Meanam. |
| [Nonarkara/dr-non-vibecoding-skills](https://github.com/Nonarkara/dr-non-vibecoding-skills) @ `c39dc2e`, plus open PR #25 (Ruttl composition map) and PR #13 (foundation gate: scale the gate to the stakes, SHA-pinned Actions) | MIT (own work) | Reviewer-first rule (never self-review), "judge the stack", "minimal is the floor", fonts "banned as default, allowed with a reason", the Ruttl topic-to-practice mapping. |
| [funboy322/avoid-ai-design](https://github.com/funboy322/avoid-ai-design) @ `2b7c718`, © 2026 ungspirit | MIT | The idea of a zero-dependency source scanner with P0/P1/P2 "who notices" severity, ignore comments, second-order defaults (cream + terracotta, near-black + acid, template chrome), the silhouette test, and "a tell is evidence of a default, never proof a model made it". |
| [Vanszs/Anti-AI-UI](https://github.com/Vanszs/Anti-AI-UI) @ `fd2a142`, © 2025 Vanszs | MIT | Deciding each design axis explicitly (colour, type, layout, copy, motion), per-component "never generate" lists, the "swap the logo with a competitor" test. |
| [anthropics/skills `frontend-design`](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) @ `dbd4588` | Apache-2.0 (see its LICENSE.txt) | Ground the design in the subject; plan as a compact token system, then review the plan against the defaults before building; spend boldness in one place; structure must encode meaning (01/02/03 only for sequences). Paraphrased; no text reproduced. |
| [microsoft/skills `frontend-design-review`](https://github.com/microsoft/skills/blob/main/.github/skills/frontend-design-review/SKILL.md) @ `8850874`, © Microsoft Corporation; pillar framework by [@Quirinevwm](https://github.com/Quirinevwm) | MIT | The three review pillars (frictionless insight to action, quality craft, trustworthy building) and blocking/major/minor triage, adapted in `skills/review/`. |
| [kari-ai-lab/agent-skills-public `frontend-design-principles`](https://github.com/kari-ai-lab/agent-skills-public/blob/main/skills/engineering/frontend-design-principles.md) @ `8525883`, © 2026 northernfried | MIT | "The hero is a thesis, not a slot to fill"; make every visible decision accountable to subject, audience and task. |
| Harsh Vijay, [11 Website Design Best Practices To Follow In 2026](https://www.ruttl.com/blog/web-design-best-practices), ruttl.com, 9 Aug 2026 | All rights reserved (no licence) | Topic list only, paraphrased as eleven practices in `skills/direction/`. No text, images or statistics copied; its conversion framing was not adopted. No endorsement. |
| [shannhk/avoid-slop](https://github.com/shannhk/avoid-slop) @ `5e71c43` | No licence file | Used as a directory to find the sources above. Nothing copied. |
| [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | W3C | Contrast thresholds (1.4.3), reflow (1.4.10), target size (2.5.8; we hold a stricter 44px house line), focus visible (2.4.7). |

## Not used

`LaylaStone180/avoid-ai-design` (@ `78d8727`, 16 Oct 2026) was recommended as a source, but on inspection its README is a copy of funboy322's and its code is a one-line stub padded with filler comments; the scanner it describes isn't there. We credit and link the original (funboy322) instead and took nothing from the copy.

Nobody listed here endorses Non-Slop.
