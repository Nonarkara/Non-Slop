import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { scanTarget } from "../lib/scan.mjs";
import { parseStyle, inlineAllows } from "../lib/style.mjs";
import { init, adapters } from "../lib/init.mjs";
import { catalogMarkdown } from "../lib/catalog.mjs";
import { contrast, parseColour } from "../lib/colour.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FX = path.join(ROOT, "test/fixtures");
const CLI = path.join(ROOT, "bin/non-slop.mjs");
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "non-slop-"));
const ids = (res, status = "FAIL") => new Set(res.findings.filter((f) => f.status === status).map((f) => f.id));

test("a generic AI landing page is SLOP and the CLI exits 2", async () => {
  const res = await scanTarget(path.join(FX, "slop"));
  assert.equal(res.summary.verdict, "SLOP");
  for (const id of ["purple-gradient", "gradient-text", "default-font", "glass", "centered-hero", "card-grid-3", "emoji-icons", "fake-proof", "hype-copy", "focus-removed", "img-alt", "low-contrast", "reduced-motion"]) assert.ok(ids(res).has(id), "missing " + id);
  const r = spawnSync("node", [CLI, "scan", path.join(FX, "slop")], { encoding: "utf8" });
  assert.equal(r.status, 2);
});

test("style guarantee: a deliberate essay is OK; STYLE.md choices are ALLOWED, voice is never flagged", async () => {
  const res = await scanTarget(path.join(FX, "essay"));
  assert.equal(res.summary.verdict, "OK");
  assert.equal(res.summary.points, 0);
  assert.ok(ids(res, "ALLOWED").has("cream-terracotta"));
  // em dashes, semicolons, a serif, an ornament and emoji in a playful list are not findings at all
  for (const id of ["emoji-icons", "default-font", "tasteful-font", "hype-copy"]) assert.ok(!res.findings.some((f) => f.id === id), id + " should not fire");
});

test("without STYLE.md the same palette is a question (FAIL), not silently passed", async () => {
  const d = tmp(); fs.copyFileSync(path.join(FX, "essay/index.html"), path.join(d, "index.html"));
  const res = await scanTarget(d);
  assert.ok(ids(res).has("cream-terracotta"));
  assert.notEqual(res.summary.verdict, "SLOP"); // one choice alone is never SLOP
});

test("access rules can't be allowed away: they become ASK-OWNER and cost no points", async () => {
  const d = tmp();
  fs.writeFileSync(path.join(d, "a.css"), ".x { color: #aaaaaa; background: #ffffff; }\n");
  fs.writeFileSync(path.join(d, "STYLE.md"), "## Allow\n- rule low-contrast: pale grey is the brand\n");
  const res = await scanTarget(d);
  const f = res.findings.find((x) => x.id === "low-contrast");
  assert.equal(f.status, "ASK-OWNER");
  assert.equal(res.summary.points, 0);
});

test("inline allow and glob-scoped allow", async () => {
  const d = tmp(); fs.mkdirSync(path.join(d, "kids"));
  fs.writeFileSync(path.join(d, "a.css"), "/* non-slop-allow: glass -- legibility over live video */\n.v { backdrop-filter: blur(4px); }\n");
  fs.writeFileSync(path.join(d, "kids/b.html"), "<html lang=\"en\"><body><button>🎈 Play</button><button>🧸 Toys</button></body></html>");
  fs.writeFileSync(path.join(d, "STYLE.md"), "## Allow\n- rule emoji-icons in kids/**: playful register for children\n");
  const res = await scanTarget(d);
  assert.equal(res.findings.find((f) => f.id === "glass").status, "ALLOWED");
  assert.equal(res.findings.find((f) => f.id === "emoji-icons").status, "ALLOWED");
  assert.equal(inlineAllows("x /* non-slop-allow-file */").wholeFile, true);
});

test("STYLE.md parser reads only the Allow section and warns on missing reasons", () => {
  const s = parseStyle("# STYLE\n- rule glass: not in allow\n## Allow\n- rule void: essays\n- font \"Jost\": chosen\n- colour #FBF7EF: paper\n- rule gradients\n## Voice\n- rule hype-copy: no\n");
  assert.deepEqual(s.rules.map((r) => r.id), ["void", "gradients"]);
  assert.ok(s.fonts.has("jost")); assert.ok(s.colours.has("#fbf7ef"));
  assert.equal(s.warnings.length, 1);
});

test("init never overwrites: appends one pointer block, keeps STYLE.md, is idempotent, installs a hook", () => {
  const d = tmp(); execFileSync("git", ["init", "-q"], { cwd: d });
  fs.writeFileSync(path.join(d, "AGENTS.md"), "# Mine\nMy own rules.\n");
  fs.writeFileSync(path.join(d, "STYLE.md"), "# my style\n");
  fs.mkdirSync(path.join(d, ".cursor/rules"), { recursive: true }); fs.writeFileSync(path.join(d, ".cursor/rules/non-slop.mdc"), "custom");
  init(d); init(d);
  const agents = fs.readFileSync(path.join(d, "AGENTS.md"), "utf8");
  assert.ok(agents.startsWith("# Mine\nMy own rules.\n"));
  assert.equal(agents.split("<!-- non-slop:start -->").length, 2);
  assert.equal(fs.readFileSync(path.join(d, "STYLE.md"), "utf8"), "# my style\n");
  assert.equal(fs.readFileSync(path.join(d, ".cursor/rules/non-slop.mdc"), "utf8"), "custom");
  assert.ok(fs.readFileSync(path.join(d, "CLAUDE.md"), "utf8").includes("@.non-slop/AGENTS.md"));
  for (const f of ["AGENTS.md", "bin/non-slop.mjs", "skills/review/SKILL.md", "templates/STYLE.md"]) assert.ok(fs.existsSync(path.join(d, ".non-slop", f)), f);
  assert.ok(fs.readFileSync(path.join(d, ".git/hooks/pre-commit"), "utf8").includes("non-slop"));
});

test("init leaves an existing pre-commit hook alone", () => {
  const d = tmp(); execFileSync("git", ["init", "-q"], { cwd: d });
  fs.writeFileSync(path.join(d, ".git/hooks/pre-commit"), "#!/bin/sh\necho mine\n");
  const log = init(d);
  assert.equal(fs.readFileSync(path.join(d, ".git/hooks/pre-commit"), "utf8"), "#!/bin/sh\necho mine\n");
  assert.ok(log.some((l) => l.startsWith("hook: skipped")));
});

test("pre-commit gate blocks a SLOP commit and passes a clean one", () => {
  const d = tmp(); const git = (...a) => spawnSync("git", a, { cwd: d, encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" } });
  git("init", "-q"); init(d);
  fs.copyFileSync(path.join(FX, "essay/index.html"), path.join(d, "essay.html")); git("add", "-A");
  assert.equal(git("commit", "-qm", "clean").status, 0);
  fs.copyFileSync(path.join(FX, "slop/index.html"), path.join(d, "landing.html")); git("add", "landing.html");
  const r = git("commit", "-qm", "slop");
  assert.notEqual(r.status, 0);
});

test("generated catalog is in sync with the rules", () => {
  assert.equal(fs.readFileSync(path.join(ROOT, "skills/detect/CATALOG.md"), "utf8"), catalogMarkdown());
});

test("repo adapters point at the same core as the installer's", () => {
  const a = adapters("AGENTS.md");
  for (const rel of [".github/copilot-instructions.md", ".cursor/rules/non-slop.mdc", ".windsurf/rules/non-slop.md", "GEMINI.md"]) assert.equal(fs.readFileSync(path.join(ROOT, rel), "utf8"), a[rel].create, rel);
});

test("contrast maths matches WCAG", () => {
  assert.equal(contrast(parseColour("#000"), parseColour("#fff")).toFixed(1), "21.0");
  assert.equal(contrast(parseColour("#767676"), parseColour("#fff")).toFixed(2), "4.54");
});

test("render: reading column is not void (skipped without Playwright)", async (t) => {
  let ok = true; try { await import("playwright"); } catch { ok = false; }
  if (!ok) return t.skip("playwright not installed");
  const { renderUrl } = await import("../lib/render.mjs");
  const r = await renderUrl(path.join(FX, "essay/index.html"), { out: tmp(), settleMs: 500 });
  assert.equal(r.status, "OK");
  assert.ok(r.desktop.readingColumn, "essay should read as a reading column");
  assert.ok(!r.hits.some((h) => h.id === "void" && h.status === "FAIL"));
  assert.ok(!r.hits.some((h) => h.id === "emoji-icons"));
  assert.ok(fs.existsSync(r.silhouette));
});
