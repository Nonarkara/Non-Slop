# Worked examples

Who this is for: a developer opening the GitHub README, in English, on a laptop.
The one job: see one slop pattern, then the fix.
What wins: the two screens, then the name of the pattern, then the score.
Constraints: static HTML, fonts on disk, light ground, one accent, screenshots from Playwright.
Direction: a canal staff gauge and the FloodDash press brief of 19 Oct 2026, 07:06 ICT.

The clean pages use Jost for Latin and Prompt for Thai. Prompt is the non-looped Thai face named in AGENTS.md. Chinese is not set here: the house note names two families and does not name a Chinese face. The Thai lines were not checked by a fluent reader.

The before pages are the slop on purpose. Inter, the card kit, the dark command centre and the centred hero stay in those files so the scanner has a stack to catch. Do not copy them into a product.

Regenerate the PNGs in `docs/img/` after a visual change:

```bash
node examples/shoot.mjs
```

Playwright and Chromium have to be installed (`npx playwright install chromium`). They are not a dependency of the scanner. `shoot.mjs` imports Playwright from `PLAYWRIGHT_PATH` or `/tmp/node_modules/playwright/index.js`.

Score a page:

```bash
node bin/non-slop.mjs scan examples/canal/after.html --fail-on=never
node bin/non-slop.mjs render examples/canal/after.html --settle 400
```

Static scan and render use different scales. Scan is SLOP at 8 or more points. Render, which uses the palette slop-lint weights, is SLOP at 6 or more, REVIEW at 3 to 5, and OK under 3.

The press-brief figures (22 gauges over the bank, 53 at high water, 134 mm in Satun) are from the FloodDash brief at 07:06 ICT on 19 Oct 2026. The canal centimetres are the gauge fixture in `test/fixtures/gauge/`, labelled on the board as not live. The bar chart quotes palette `ANTI-SLOP.md` and adds no new study numbers.

Searched this repo, its history and its issues for material Perplexity curated. Nothing in this repo is Perplexity-sourced. Mentions in other Nonarkara repos were left there.
