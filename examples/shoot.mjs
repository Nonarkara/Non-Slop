// Screenshots of the worked examples. Re-run after a visual change:
//   NODE_PATH=/tmp/node_modules node examples/shoot.mjs
// Needs Playwright and Chromium (npx playwright install chromium). Not a package dependency.
const playwrightMod = await import(process.env.PLAYWRIGHT_PATH || "/tmp/node_modules/playwright/index.js");
const { chromium } = playwrightMod.chromium ? playwrightMod : playwrightMod.default;
import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "docs/img");
fs.mkdirSync(out, { recursive: true });

const shots = [
  ["cards/before.html", "cards-before.png", 1100, 420],
  ["cards/after.html", "cards-after.png", 980, 480],
  ["command/before.html", "command-before.png", 1100, 540],
  ["command/after.html", "command-after.png", 860, 680],
  ["type/before.html", "type-before.png", 920, 560],
  ["type/after.html", "type-after.png", 860, 500],
  ["centre/before.html", "centre-before.png", 1040, 600],
  ["centre/after.html", "centre-after.png", 920, 540],
  ["canal/before.html", "canal-before.png", 1100, 700],
  ["canal/after.html", "canal-after.png", 1200, 760],
  ["hero/frame.html", "hero.png", 1440, 820],
  ["charts/study.html", "study.png", 1040, 860],
  ["charts/scores.html", "scores.png", 980, 1000],
  ["diagrams/flow.html", "flow.png", 1100, 560],
  ["diagrams/plug.html", "plug.png", 860, 800],
];

const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
for (const [file, name, w, h] of shots) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(path.join(root, "examples", file)).href, { waitUntil: "load" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const frames = [...document.querySelectorAll("iframe")];
    await Promise.all(frames.map((f) => f.contentDocument?.fonts?.ready));
  });
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.join(out, name), type: "png" });
  await page.close();
  console.log(name);
}
await browser.close();
