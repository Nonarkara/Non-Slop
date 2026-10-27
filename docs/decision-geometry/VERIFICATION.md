# Decision geometry rollout verification — 27 October 2026

## Scope

The existing spatial law now names the expansion chain from an oversized region to displaced content and separated controls. The shared supplement and measurement capsule are distributed to Non-Slop, Dr Non's Vibe Coding Stack, Palette, Axiom Design Core, MoMA Rules and Rams × NYCTA Design Core. No consumer application was restyled and no existing map/chart/colour field was replaced.

## Executable evidence

- All six capsule copies are byte-identical and verified by SOURCE.json hashes.
- Each copy passes 15 unit, CLI and path-with-spaces tests. Invalid/incomplete measurements and missing viewport/state cases fail.
- A real in-app browser exercised the separate synthetic fixture at 1440×900, 1024×768, 390×844 and 1280×720. All four task compositions passed their declared budgets. Captures are in captures.json.
- The same browser selected eight actual layout faults: oversized intro, sibling-stretched map, separated action, hidden map, offscreen map, horizontal bleed, clipped action and an obstruction. All eight failed. Exact code outcomes are in checks.json. These are fixture tests, not a claim that every production application was audited.
- A final formatted-source browser check again passed the default desktop and rejected the offscreen map.
- CI runs the capsule tests in every framework. Non-Slop additionally runs the real rendered fixture through isolated Playwright tooling. Existing host gates remain intact.

## Independent review and disposition

A separate read-only verifier reviewed source, screenshots and adversarial reports. Final verdict: PASS for the shared guidance and capsule; all findings closed.

| Finding | Disposition |
|---|---|
| Minimum dimensions accepted a map translated offscreen | Added optional per-region firstScreen preservation, rectangle-containment and centre-obstruction checks. The fixture map declares it. Real offscreen fault fails. Long reading regions need not opt in. |
| Zero-area action / zero document width could pass malformed reports | Positive-area target checks and positive document-width validation added; regression tests fail both cases. First-screen flags are checked against rectangles. |
| A file URL pathname double-encoded spaces in browser test navigation | Navigate with URL.href. |
| CLI test also treated URL.pathname as a filesystem path | Use fileURLToPath; an isolated real directory containing spaces is tested. |
| Capsule hashes became stale during edits | Regenerated after final source edits and verified in every copy. |

## Existing host checks and limits

- Non-Slop: 59 tests, 58 passed and one pre-existing optional Playwright render test skipped locally.
- Skills collection: repository validation passes, with 184 skills and all local links intact. No new skill was added. Relevant installed skill entry points validate.
- Axiom: strict audit passes with one pre-existing warning; all 16 audit tests pass.
- MoMA: scale/prose/check reconciliation and strict example lint pass. The pre-existing origin-mechanism gap remains explicitly declared in its own law checker.
- Palette: 109 tests, 87 passed and 22 browser-dependent checks skipped locally after installing its existing MCP dependencies. The full local check requires unavailable Playwright tooling; the normal GitHub publication workflow supplies it. No exhibition UI files changed.
- Rams: existing strict audit reports 28 errors. An isolated archive of unmodified origin/main reports the same 28. Its existing tokens/components were not changed or waived to clear them. The new capsule's 15 tests pass independently.

This verifies declared geometry invariants and the rule's installation, not taste, complete pixel occlusion, all devices, all languages or every consumer application. Product teams must choose honest task budgets and obtain independent rendered task review. Existing unrelated working-copy edits were preserved by using isolated Git worktrees.

## Consumer installation proof

A separate regression installs Non-Slop into a fresh project whose filesystem path contains spaces. The installed CLI accepts its valid capture and rejects an offscreen preserved map, proving that the installer carries both the policy and the executable gate.
