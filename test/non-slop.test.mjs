import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { scanTarget, MAX_SCAN_BYTES } from "../lib/scan.mjs";
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

test("--min trims the listing, never the verdict", async () => {
  const full = await scanTarget(path.join(FX, "slop"));
  const trimmed = await scanTarget(path.join(FX, "slop"), { min: "P0" });
  assert.deepEqual(trimmed.summary, full.summary);
  assert.ok(trimmed.findings.every((f) => f.sev === "P0"));
});

test("init into an existing CLAUDE.md adds the imports inside the marked block", () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "ns-claude-"));
  fs.writeFileSync(path.join(d, "CLAUDE.md"), "# Mine\nUse pnpm.\n");
  init(d, { hook: false });
  const t = fs.readFileSync(path.join(d, "CLAUDE.md"), "utf8");
  assert.ok(t.startsWith("# Mine\nUse pnpm.\n"));
  assert.match(t, /<!-- non-slop:start -->[\s\S]*@\.non-slop\/AGENTS\.md[\s\S]*<!-- non-slop:end -->/);
});

test("Signature (any case) suppresses findings, and an empty STYLE.md does not hide it", async () => {
  const d = tmp();
  fs.writeFileSync(path.join(d, "a.css"), "body{background:#fbf7ef;color:#1f1a17} h1{color:#a23a26}\n");
  fs.writeFileSync(path.join(d, "AGENTS.md"), "# Mine\r\n## signature\r\n- rule cream-terracotta: house paper\r\n");
  let res = await scanTarget(d);
  assert.equal(res.findings.find((f) => f.id === "cream-terracotta").status, "ALLOWED");
  fs.writeFileSync(path.join(d, "STYLE.md"), "# prose only\n\nNo allow section yet.\n");
  res = await scanTarget(d);
  assert.equal(res.findings.find((f) => f.id === "cream-terracotta").status, "ALLOWED");
  assert.equal(res.summary.points, 0);
});

test("Style.md in any case is the style file, including under a subfolder", async () => {
  const d = tmp();
  fs.mkdirSync(path.join(d, "apps/web"), { recursive: true });
  fs.mkdirSync(path.join(d, "apps/other"), { recursive: true });
  const css = ".v{backdrop-filter:blur(8px)}\n";
  fs.writeFileSync(path.join(d, "apps/web/a.css"), css);
  fs.writeFileSync(path.join(d, "apps/other/b.css"), css);
  fs.writeFileSync(path.join(d, "apps/web/Style.md"), "## Allow\n- rule glass: nested blur over a photo\n");
  fs.writeFileSync(path.join(d, "Style.md"), "# Owner notes\n\nNo allow section.\n");
  const res = await scanTarget(d);
  const glass = res.findings.filter((f) => f.id === "glass");
  assert.equal(glass.find((f) => f.rel.startsWith("apps/web/")).status, "ALLOWED");
  assert.equal(glass.find((f) => f.rel.startsWith("apps/other/")).status, "FAIL");
  const owned = fs.readFileSync(path.join(d, "Style.md"), "utf8");
  const log = init(d, { hook: false });
  // Not existsSync(d/STYLE.md): on a case-insensitive filesystem (macOS default)
  // that answers `true` for the pre-existing Style.md, so the assertion could not
  // tell "init created nothing" from "init overwrote it" — it failed on macOS while
  // the behaviour was correct. readdir returns the real on-disk name, so this
  // observes what actually happened on either filesystem.
  const styleEntries = fs.readdirSync(d).filter((f) => /^style\.md$/i.test(f));
  assert.deepEqual(styleEntries, ["Style.md"], "init created or renamed a style file");
  assert.ok(log.some((l) => l.startsWith("Style.md: exists")));
  assert.equal(fs.readFileSync(path.join(d, "Style.md"), "utf8"), owned);
  assert.ok(fs.readFileSync(path.join(d, "apps/web/Style.md"), "utf8").includes("nested blur"));
});

test("scanning a parent still honours a nested STYLE.md", async () => {
  const res = await scanTarget(FX);
  const cream = res.findings.filter((f) => f.id === "cream-terracotta");
  assert.ok(cream.length >= 1);
  assert.ok(cream.every((f) => f.status === "ALLOWED"));
});

test("a place-items centred hero with a 3-card grid and SaaS copy is SLOP", async () => {
  const d = tmp();
  fs.writeFileSync(path.join(d, "index.html"), `<html lang="en">
<head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body>
<section class="grid place-items-center min-h-screen">
  <h1>Supercharge your workflow</h1>
  <p>Seamlessly unlock your team's potential with our cutting-edge platform.</p>
  <button class="rounded-xl">Get Started</button>
  <button class="rounded-xl">Learn More</button>
</section>
<section class="grid grid-cols-3">
  <div class="rounded-xl shadow-md p-6 bg-white">One</div>
  <div class="rounded-xl shadow-md p-6 bg-white">Two</div>
  <div class="rounded-xl shadow-md p-6 bg-white">Three</div>
</section>
</body></html>`);
  const res = await scanTarget(d);
  assert.ok(ids(res).has("centered-hero"));
  assert.ok(ids(res).has("card-grid-3"));
  assert.ok(ids(res).has("hype-copy"));
  assert.equal(res.summary.verdict, "SLOP");
  const r = spawnSync(process.execPath, [CLI, "scan", d], { encoding: "utf8" });
  assert.equal(r.status, 2);
});

test("a deliberate gauge board is not slop, and a lone Inter link is only a question", async () => {
  const res = await scanTarget(path.join(FX, "gauge"));
  assert.equal(res.summary.verdict, "OK");
  assert.equal(res.summary.points, 0);
  const d = tmp();
  fs.writeFileSync(path.join(d, "index.html"), '<html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap" rel="stylesheet"></head><body><p>Hello</p></body></html>');
  const one = await scanTarget(d);
  assert.ok(ids(one).has("default-font"));
  assert.equal(one.summary.verdict, "OK");
});

test("ai-visual still matches a host and a file name", async () => {
  const d = tmp();
  fs.writeFileSync(path.join(d, "a.html"), '<html lang="en"><head><meta name="viewport" content="width=device-width"></head><body><img alt="" src="shots/hero-midjourney-v6.png"><img alt="" src="https://cdn.midjourney.com/a.png"></body></html>\n');
  const res = await scanTarget(d);
  assert.ok(ids(res).has("ai-visual"));
});

test("one P0 is REVIEW (exit 0); --fail-on=P0 exits 2; --fail-on=never exits 0", () => {
  const d = tmp();
  fs.writeFileSync(path.join(d, "a.css"), "h1{background:#222;-webkit-background-clip:text;color:transparent}\n");
  const review = spawnSync(process.execPath, [CLI, "scan", d], { encoding: "utf8" });
  assert.equal(review.status, 0);
  assert.match(review.stdout, /Verdict: REVIEW/);
  assert.equal(spawnSync(process.execPath, [CLI, "scan", d, "--fail-on=P0"], { encoding: "utf8" }).status, 2);
  assert.equal(spawnSync(process.execPath, [CLI, "scan", d, "--fail-on=never"], { encoding: "utf8" }).status, 0);
});

test("access rules listed by the owner are ASK-OWNER and add no points", async () => {
  const d = tmp();
  fs.writeFileSync(path.join(d, "a.css"), "button{outline:none}\n.x{color:#aaaaaa;background:#ffffff}\n@keyframes a{from{opacity:0}to{opacity:1}}\n");
  fs.writeFileSync(path.join(d, "a.html"), '<html><head></head><body><img src="a.png"><button><svg></svg></button></body></html>\n');
  fs.writeFileSync(path.join(d, "STYLE.md"), "## Allow\n" + ["low-contrast", "reduced-motion", "img-alt", "unnamed-button", "focus-removed", "html-lang", "viewport"].map((id) => `- rule ${id}: the owner knows`).join("\n") + "\n");
  const res = await scanTarget(d);
  const access = res.findings.filter((f) => ["low-contrast", "reduced-motion", "img-alt", "unnamed-button", "focus-removed", "html-lang", "viewport"].includes(f.id));
  assert.ok(access.length >= 6);
  assert.ok(access.every((f) => f.status === "ASK-OWNER"));
  assert.equal(res.summary.points, 0);
  assert.equal(res.summary.verdict, "OK");
});

test("symlinks are scanned once, cycles end, binary and oversized files are named and not scored", async () => {
  const d = tmp();
  const real = path.join(d, "real");
  fs.mkdirSync(real);
  fs.writeFileSync(path.join(real, "a.css"), "body{background:linear-gradient(#6366f1,#a855f7)}\n");
  fs.symlinkSync("real", path.join(d, "linked"));
  fs.symlinkSync("..", path.join(real, "up"));
  const outside = tmp();
  fs.writeFileSync(path.join(outside, "slop.css"), "body{font-family:Inter,sans-serif}\n");
  fs.symlinkSync(path.join(outside, "slop.css"), path.join(d, "via.css"));
  fs.writeFileSync(path.join(d, "bin.css"), Buffer.concat([Buffer.from([0, 1, 2, 0]), Buffer.from("linear-gradient(#6366f1,#a855f7)")]));
  fs.writeFileSync(path.join(d, "big.css"), Buffer.concat([Buffer.from("body{background:linear-gradient(#6366f1,#a855f7)}\n"), Buffer.alloc(MAX_SCAN_BYTES, 0x61)]));
  const before = fs.readdirSync(d).sort();
  const res = await scanTarget(d);
  assert.deepEqual(fs.readdirSync(d).sort(), before);
  assert.ok(ids(res).has("purple-gradient"));
  assert.ok(ids(res).has("default-font"));
  assert.ok(!res.findings.some((f) => f.rel === "bin.css" || f.rel === "big.css"));
  assert.match(res.note.join("\n"), /bin\.css \(binary\)/);
  assert.match(res.note.join("\n"), /big\.css \(over 8 MB\)/);
  const mid = tmp();
  fs.writeFileSync(path.join(mid, "big.css"), "body{background:linear-gradient(#6366f1,#a855f7)}\n" + "a".repeat(2_000_000));
  const scanned = await scanTarget(mid);
  assert.ok(ids(scanned).has("purple-gradient"));
});

// A marked file used to vanish without a word, so a scan that read nothing still said "OK".
// Every exclusion is named, and a marked file is an exclusion like any other.
test("a file marked non-slop-skip-file is named, not silently dropped", async () => {
  const d = tmp();
  fs.writeFileSync(path.join(d, "a.css"), "body{background:linear-gradient(#6366f1,#a855f7)}\n");
  fs.writeFileSync(path.join(d, "marked.css"), "// non-slop-skip-file: not UI\nbody{font-family:Inter,sans-serif}\n");
  const res = await scanTarget(d);
  assert.equal(res.filesScanned, 1, "only the unmarked file is scanned");
  assert.ok(ids(res).has("purple-gradient"), "the real file is still judged");
  assert.ok(!ids(res).has("default-font"), "the marked file is not scored");
  assert.match(res.note.join("\n"), /marked\.css \(marked non-slop-skip-file\)/);
  // The marker hides a file from the report, never from the reader: including examples scans it.
  const prev = process.env.NON_SLOP_INCLUDE_EXAMPLES;
  process.env.NON_SLOP_INCLUDE_EXAMPLES = "1";
  try {
    const forced = await scanTarget(d);
    assert.equal(forced.filesScanned, 2, "the marked file is scanned when exclusions are lifted");
    assert.ok(ids(forced).has("default-font"), "its hit is still found, and was never hidden by the marker");
  } finally { if (prev === undefined) delete process.env.NON_SLOP_INCLUDE_EXAMPLES; else process.env.NON_SLOP_INCLUDE_EXAMPLES = prev; }
});

// Example fixtures stay silent: they are deliberate test data, not something the scan missed.
test("an example fixture is excluded quietly, and INCLUDE_EXAMPLES brings it back", async () => {
  const d = tmp();
  fs.writeFileSync(path.join(d, "e.html"), "<!-- non-slop-example --><html><body><h1>x</h1></body></html>\n");
  const res = await scanTarget(d);
  assert.equal(res.filesScanned, 0);
  assert.doesNotMatch(res.note.join("\n"), /e\.html/);
  const prev = process.env.NON_SLOP_INCLUDE_EXAMPLES;
  process.env.NON_SLOP_INCLUDE_EXAMPLES = "1";
  try {
    const forced = await scanTarget(d);
    assert.equal(forced.filesScanned, 1);
    assert.ok(ids(forced).has("html-lang"), "the fixture is scanned when examples are included");
  } finally { if (prev === undefined) delete process.env.NON_SLOP_INCLUDE_EXAMPLES; else process.env.NON_SLOP_INCLUDE_EXAMPLES = prev; }
});

test("a local scan does not call fetch", async () => {
  const orig = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = () => { calls++; throw new Error("network"); };
  try {
    const res = await scanTarget(path.join(FX, "essay"));
    assert.equal(calls, 0);
    assert.equal(res.summary.verdict, "OK");
  } finally { globalThis.fetch = orig; }
});

test("init appends to an existing GEMINI.md once, and does not follow symlinks", () => {
  const d = tmp();
  execFileSync("git", ["init", "-q"], { cwd: d });
  fs.writeFileSync(path.join(d, "GEMINI.md"), "# Gemini\nBe brief.\n");
  const outside = path.join(tmp(), "AGENTS.md");
  fs.writeFileSync(outside, "# outside\n");
  fs.symlinkSync(outside, path.join(d, "AGENTS.md"));
  init(d, { hook: false }); init(d, { hook: false });
  assert.equal(fs.readFileSync(path.join(d, ".non-slop/ANTI-SPATIAL-HALLUCINATION.md"), "utf8"), fs.readFileSync(path.join(ROOT, "ANTI-SPATIAL-HALLUCINATION.md"), "utf8"), "installed composition guidance must travel with its agent links");
  const gemini = fs.readFileSync(path.join(d, "GEMINI.md"), "utf8");
  assert.ok(gemini.startsWith("# Gemini\nBe brief.\n"));
  assert.equal(gemini.split("<!-- non-slop:start -->").length, 2);
  assert.equal(fs.readFileSync(outside, "utf8"), "# outside\n");
});

test("init does not write through a directory symlink or a broken hook symlink", () => {
  const d = tmp();
  execFileSync("git", ["init", "-q"], { cwd: d });
  const outside = tmp();
  const gh = path.join(outside, "gh");
  const cursor = path.join(outside, "cursor");
  fs.mkdirSync(gh);
  fs.mkdirSync(cursor);
  fs.symlinkSync(gh, path.join(d, ".github"));
  fs.symlinkSync(cursor, path.join(d, ".cursor"));
  fs.symlinkSync(path.join(outside, "missing-hook"), path.join(d, ".git/hooks/pre-commit"));
  const log = init(d);
  assert.deepEqual(fs.readdirSync(gh), []);
  assert.deepEqual(fs.readdirSync(cursor), []);
  assert.equal(fs.existsSync(path.join(outside, "missing-hook")), false);
  assert.equal(fs.lstatSync(path.join(d, ".git/hooks/pre-commit")).isSymbolicLink(), true);
  const text = log.join("\n");
  assert.match(text, /\.github\/copilot-instructions\.md: skipped \(symlink \.github -> /);
  assert.match(text, /\.cursor\/rules\/non-slop\.mdc: skipped \(symlink \.cursor -> /);
  assert.match(text, /hook: skipped \(symlink \.git\/hooks\/pre-commit -> /);
  assert.ok(fs.readFileSync(path.join(d, "AGENTS.md"), "utf8").includes("non-slop"));
});

test("init does not install a hook whose path resolves outside the project", () => {
  const d = tmp();
  const gitdir = path.join(tmp(), "gitdir");
  execFileSync("git", ["init", "-q", `--separate-git-dir=${gitdir}`], { cwd: d });
  const hook = path.join(gitdir, "hooks", "pre-commit");
  assert.equal(fs.existsSync(hook), false);
  const log = init(d);
  assert.equal(fs.existsSync(hook), false);
  assert.equal(fs.existsSync(path.join(d, "tmp")), false);
  assert.ok(log.some((l) => l.startsWith("hook: skipped (outside the project")));
  assert.ok(fs.readFileSync(path.join(d, "AGENTS.md"), "utf8").includes("non-slop"));
});

test("a symlink used as the scan root into /proc, /sys, /dev, /run, or / is named and not walked", { timeout: 8000 }, async () => {
  const d = tmp();
  const targets = ["/proc", "/sys", "/dev", "/run", "/"].filter((p) => fs.existsSync(p));
  // "/" on every platform; /proc, /sys, /dev and /run only where the OS has them.
  // Requiring /proc outright made this test Linux-shaped and it failed on macOS
  // before exercising anything. The guardrail it protects — a symlink root into a
  // system directory must be named, not walked — is worth checking wherever
  // those directories exist, and "/" always does.
  assert.ok(targets.includes("/"), "expected / to be a candidate target");
  assert.ok(targets.length >= 2, `expected at least one system directory beyond /, got ${targets.join(", ")}`);
  for (const t of targets) {
    const link = path.join(d, "link-" + (t === "/" ? "root" : t.slice(1)));
    fs.symlinkSync(t, link);
    const res = await scanTarget(link);
    assert.equal(res.filesScanned, 0, t);
    assert.match(res.note.join("\n"), new RegExp(`skipped symlink .*\\(resolves to ${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`));
  }
  const real = path.join(d, "real");
  fs.mkdirSync(real);
  fs.writeFileSync(path.join(real, "a.css"), "body{font-family:Inter,sans-serif}\n");
  const ok = path.join(d, "ok");
  fs.symlinkSync(real, ok);
  const scanned = await scanTarget(ok);
  assert.ok(ids(scanned).has("default-font"));
  assert.equal(scanned.filesScanned, 1);
});

const promisePage = () => `<html lang="en">
<head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body>
<h1>Unlock a vibrant world of colour</h1>
<p>Step into a world of possibilities.</p>
<p>Explore 348 colour combinations by Sanzo Wada.</p>
<p>Please unlock this file.</p>
<blockquote><p>Seamlessly unlock your true potential.</p></blockquote>
</body></html>`;

test("generic-promise is REVIEW: the sentence is quoted, nothing is scored or rewritten", async () => {
  const d = tmp();
  fs.writeFileSync(path.join(d, "a.html"), promisePage());
  const res = await scanTarget(d);
  const hits = res.findings.filter((f) => f.id === "generic-promise");
  assert.equal(hits.length, 2);
  assert.ok(hits.every((f) => f.status === "REVIEW"));
  assert.ok(hits.some((f) => f.detail === "Unlock a vibrant world of colour"));
  assert.ok(hits.some((f) => /Step into a world of possibilities/.test(f.detail)));
  assert.ok(hits.every((f) => /world of something|promises a journey|announces a future|promises a height|invites the reader/.test(f.why)));
  assert.ok(!hits.some((f) => /348 colour combinations|unlock this file/i.test(f.detail)));
  assert.equal(res.summary.points, 0);
  assert.equal(res.summary.review, 2);
  assert.equal(res.summary.verdict, "OK");
  assert.ok(!res.findings.some((f) => f.id === "hype-copy"), "a quotation is not a hype-copy hit");
  const cli = spawnSync(process.execPath, [CLI, "scan", d], { encoding: "utf8" });
  assert.equal(cli.status, 0);
  assert.match(cli.stdout, /REVIEW\s+generic-promise/);
  assert.match(cli.stdout, /Unlock a vibrant world of colour/);
  assert.match(cli.stdout, /do not rewrite/i);
  assert.match(cli.stdout, /Verdict: OK/);
  const hook = spawnSync(process.execPath, [CLI, "scan", "--hook"], { encoding: "utf8", input: JSON.stringify({ tool_input: { file_path: path.join(d, "a.html") } }) });
  assert.equal(hook.status, 0, hook.stderr);
});

test("allowlisted phrases and Protected voice are not flagged; a rule allow is ALLOWED", async () => {
  const listed = tmp();
  fs.writeFileSync(path.join(listed, "a.html"), promisePage());
  fs.writeFileSync(path.join(listed, "STYLE.md"), "## Allow\n- phrase \"Unlock a vibrant world of colour\": the 1932 poster line\n");
  let res = await scanTarget(listed);
  let hits = res.findings.filter((f) => f.id === "generic-promise");
  assert.equal(hits.length, 1);
  assert.match(hits[0].detail, /world of possibilities/);
  assert.ok(!res.findings.some((f) => /Unlock a vibrant world of colour/.test(f.detail || "")));

  const voice = tmp();
  fs.writeFileSync(path.join(voice, "a.html"), promisePage());
  fs.writeFileSync(path.join(voice, "STYLE.md"), "## Protected voice\n- phrase \"Unlock a vibrant world of colour\": poster kept in the story\n- phrase \"Step into a world of possibilities\": the catalogue story\n");
  res = await scanTarget(voice);
  assert.equal(res.findings.filter((f) => f.id === "generic-promise").length, 0);
  assert.equal(res.summary.points, 0);
  assert.equal(res.style.phrases, 2);

  const marked = tmp();
  fs.writeFileSync(path.join(marked, "a.html"), `<html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><h1>Unlock a vibrant world of colour, the line Sanzo Wada kept</h1></body></html>`);
  let bare = await scanTarget(marked);
  assert.equal(bare.findings.filter((f) => f.id === "generic-promise" && f.status === "REVIEW").length, 1);
  fs.writeFileSync(path.join(marked, "STYLE.md"), "## Protected voice\n- marker \"Sanzo Wada\": this page is about his colour book\n");
  res = await scanTarget(marked);
  assert.equal(res.findings.filter((f) => f.id === "generic-promise").length, 0);

  const quoted = tmp();
  fs.writeFileSync(path.join(quoted, "a.html"), `<html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><blockquote><p>Unlock a vibrant world of colour. Seamlessly unlock your true potential.</p></blockquote></body></html>`);
  res = await scanTarget(quoted);
  assert.ok(!res.findings.some((f) => f.id === "generic-promise" || f.id === "hype-copy"));

  const allowed = tmp();
  fs.writeFileSync(path.join(allowed, "a.html"), promisePage());
  fs.writeFileSync(path.join(allowed, "STYLE.md"), "## Allow\n- rule generic-promise: the poster line is the voice\n");
  res = await scanTarget(allowed);
  hits = res.findings.filter((f) => f.id === "generic-promise");
  assert.ok(hits.length >= 1);
  assert.ok(hits.every((f) => f.status === "ALLOWED"));
  assert.equal(res.summary.review, 0);
  assert.equal(res.summary.points, 0);

  const tree = tmp();
  fs.mkdirSync(path.join(tree, "apps/web"), { recursive: true });
  fs.mkdirSync(path.join(tree, "apps/other"), { recursive: true });
  fs.writeFileSync(path.join(tree, "apps/web/a.html"), promisePage());
  fs.writeFileSync(path.join(tree, "apps/other/a.html"), promisePage());
  fs.writeFileSync(path.join(tree, "apps/web/STYLE.md"), "## Protected voice\n- phrase \"Unlock a vibrant world of colour\": kept here\n- phrase \"Step into a world of possibilities\": kept here\n");
  res = await scanTarget(tree);
  assert.equal(res.findings.filter((f) => f.id === "generic-promise" && f.rel.startsWith("apps/web/")).length, 0);
  const other = res.findings.filter((f) => f.id === "generic-promise" && f.rel.startsWith("apps/other/"));
  assert.equal(other.length, 2);
  assert.ok(other.every((f) => f.status === "REVIEW"));
});

test("Protected voice and allowlisted phrases parse; a prose Voice section does not", () => {
  const s = parseStyle("# S\n## Voice\n- phrase \"not this one\": prose register\n## Protected voice\n- phrase \"the water came up the soi\": field note\n- marker \"Sanzo Wada\": the colour book\n- phrase ab\n## Allow\n- phrase \"unlock a vibrant world of colour\": poster line\n- rule glass: kept\n");
  assert.deepEqual(s.phrases.map((p) => p.text), ["the water came up the soi", "unlock a vibrant world of colour"]);
  assert.deepEqual(s.markers.map((m) => m.text), ["Sanzo Wada"]);
  assert.deepEqual(s.rules.map((r) => r.id), ["glass"]);
  assert.ok(s.warnings.some((w) => /too short/i.test(w)));
});

const shell = (body) => `<html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${body}</body></html>`;

test("a listed phrase that only contains the match does not hide other sentences, and a marker does not hide the rest of its line", async () => {
  const d = tmp();
  fs.writeFileSync(path.join(d, "a.html"), shell(`<p>Unlock your workflow.</p><p>Take your startup to new heights.</p>`));
  let res = await scanTarget(d);
  assert.equal(res.summary.points, 1);
  assert.ok(res.findings.some((f) => f.id === "hype-copy" && f.status === "FAIL"));
  assert.ok(res.findings.some((f) => f.id === "generic-promise" && f.status === "REVIEW" && /to new heights/i.test(f.detail)));
  fs.writeFileSync(path.join(d, "STYLE.md"), "## Allow\n- phrase \"unlock your true potential in the field note\": not the sentence on the page\n- phrase \"The river rose to new heights of 2.4 metres in the field note\": not the sentence on the page\n");
  res = await scanTarget(d);
  assert.equal(res.summary.points, 1, "hype-copy still scores");
  assert.equal(res.summary.review, 1);
  assert.ok(res.findings.some((f) => f.id === "hype-copy" && f.status === "FAIL"));
  assert.ok(res.findings.some((f) => f.id === "generic-promise" && f.status === "REVIEW"));

  const line = tmp();
  fs.writeFileSync(path.join(line, "a.html"), shell(`<p>Unlock a vibrant world of colour. Sanzo Wada printed 348.</p><p>Seamlessly unlock your workflow. Sanzo Wada kept the poster.</p>`));
  res = await scanTarget(line);
  assert.ok(res.findings.some((f) => f.id === "generic-promise" && f.status === "REVIEW"));
  assert.equal(res.summary.points, 1);
  fs.writeFileSync(path.join(line, "STYLE.md"), "## Protected voice\n- marker \"Sanzo Wada\": the colour book, on the next sentence\n");
  res = await scanTarget(line);
  assert.ok(res.findings.some((f) => f.id === "generic-promise" && f.status === "REVIEW" && /Unlock a vibrant world of colour/.test(f.detail)));
  assert.ok(!/Sanzo Wada/.test(res.findings.find((f) => f.id === "generic-promise").detail));
  assert.ok(res.findings.some((f) => f.id === "hype-copy" && f.status === "FAIL"));
  assert.equal(res.summary.points, 1);
});

test("voice still covers the sentence itself: any case, a subfolder style.md, a parent phrase, a Signature, and Thai or Chinese markers", async () => {
  const caps = tmp();
  fs.writeFileSync(path.join(caps, "a.html"), shell(`<h1>UNLOCK A VIBRANT WORLD OF COLOUR</h1><p>Step into a world of possibilities.</p>`));
  fs.writeFileSync(path.join(caps, "STYLE.md"), "## Protected voice\n- phrase \"unlock a vibrant world of colour\": the poster, any case\n");
  let res = await scanTarget(caps);
  assert.equal(res.findings.filter((f) => f.id === "generic-promise").length, 1);
  assert.match(res.findings.find((f) => f.id === "generic-promise").detail, /possibilities/);

  const tree = tmp();
  fs.mkdirSync(path.join(tree, "apps/web"), { recursive: true });
  fs.writeFileSync(path.join(tree, "apps/web/a.html"), shell(`<h1>Unlock a vibrant world of colour</h1><p>Step into a world of possibilities.</p>`));
  fs.writeFileSync(path.join(tree, "apps/web/style.md"), "## Protected voice\n- phrase \"Unlock a vibrant world of colour\": kept in this folder\n");
  res = await scanTarget(tree);
  assert.equal(res.findings.filter((f) => f.id === "generic-promise").length, 1);
  assert.match(res.findings.find((f) => f.id === "generic-promise").detail, /possibilities/);

  const parent = tmp();
  fs.mkdirSync(path.join(parent, "child"), { recursive: true });
  fs.writeFileSync(path.join(parent, "STYLE.md"), "## Allow\n- phrase \"Unlock a vibrant world of colour\": inherited from the parent\n");
  fs.writeFileSync(path.join(parent, "child/STYLE.md"), "## Allow\n- rule glass: the child has its own style file\n");
  fs.writeFileSync(path.join(parent, "child/a.html"), shell(`<h1>Unlock a vibrant world of colour</h1><p>Step into a world of possibilities.</p>`));
  res = await scanTarget(parent);
  const childHits = res.findings.filter((f) => f.id === "generic-promise");
  assert.equal(childHits.length, 1);
  assert.match(childHits[0].detail, /possibilities/);

  const signed = tmp();
  fs.writeFileSync(path.join(signed, "AGENTS.md"), "## Signature\n- phrase \"Unlock a vibrant world of colour\": the poster\n");
  fs.writeFileSync(path.join(signed, "a.html"), shell(`<h1>Unlock a vibrant world of colour</h1><p>Step into a world of possibilities.</p>`));
  res = await scanTarget(signed);
  assert.equal(res.findings.filter((f) => f.id === "generic-promise").length, 1);
  assert.match(res.findings.find((f) => f.id === "generic-promise").detail, /possibilities/);

  const marks = tmp();
  fs.writeFileSync(path.join(marks, "a.html"), shell(`<p>Unlock a vibrant world of colour ที่บางมด</p><p>Step into a world of possibilities.</p><p>Dive into a world of 三藏和田.</p>`));
  fs.writeFileSync(path.join(marks, "STYLE.md"), "## Protected voice\n- marker \"บางมด\": the station\n- marker \"三藏和田\": the name\n");
  res = await scanTarget(marks);
  const left = res.findings.filter((f) => f.id === "generic-promise");
  assert.equal(left.length, 1);
  assert.match(left[0].detail, /possibilities/);

  const quotes = tmp();
  fs.writeFileSync(path.join(quotes, "a.html"), shell(`<blockquote><blockquote><p>Unlock a vibrant world of colour</p></blockquote></blockquote><Q><em>Step into a world of possibilities.</em></Q><q cite="poster">Dive into a world of colour.</q><p>Take your startup to new heights.</p>`));
  res = await scanTarget(quotes);
  const after = res.findings.filter((f) => f.id === "generic-promise");
  assert.equal(after.length, 1);
  assert.match(after[0].detail, /to new heights/i);
});

test("a 1 MB line of unclosed q tags scans in under a second", { timeout: 5000 }, async () => {
  const d = tmp();
  const tags = "<q>".repeat(Math.ceil(1_000_000 / 3));
  assert.ok(Buffer.byteLength(tags) >= 1_000_000);
  fs.writeFileSync(path.join(d, "a.html"), `<html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>\n${tags}\n<p>Take your startup to new heights.</p></body></html>`);
  const t0 = performance.now();
  const res = await scanTarget(d);
  const ms = performance.now() - t0;
  assert.ok(ms < 1000, `scan took ${ms.toFixed(0)} ms`);
  assert.ok(res.findings.some((f) => f.id === "generic-promise" && f.status === "REVIEW"), "an unclosed q does not swallow the sentence after it");
});

test("a 1 MB line of mismatched quote tags scans in under a second", { timeout: 5000 }, async () => {
  const d = tmp();
  const run = 20000;
  // Opens of one name, then ends of the other: a stray end used to walk the whole open stack.
  const stray = "<q>".repeat(run) + "</blockquote>".repeat(run) + "<blockquote>".repeat(run) + "</q>".repeat(run);
  const mixed = "<q></blockquote><blockquote></q>";
  const tags = stray + mixed.repeat(Math.ceil((1_000_000 - Buffer.byteLength(stray)) / Buffer.byteLength(mixed)));
  assert.ok(Buffer.byteLength(tags) >= 1_000_000);
  fs.writeFileSync(path.join(d, "a.html"), `<html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>\n${tags}\n<p>Take your startup to new heights.</p></body></html>`);
  const t0 = performance.now();
  const res = await scanTarget(d);
  const ms = performance.now() - t0;
  assert.ok(ms < 1000, `scan took ${ms.toFixed(0)} ms`);
  assert.ok(res.findings.some((f) => f.id === "generic-promise" && f.status === "REVIEW" && /to new heights/i.test(f.detail)), "a stray end tag does not swallow the sentence after it");
});

test("the skip marker is documented, and documented as a reported exclusion", () => {
  const detect = fs.readFileSync(path.join(ROOT, "skills/detect/SKILL.md"), "utf8");
  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
  for (const [name, doc] of [["detect", detect], ["README", readme]]) {
    assert.match(doc, /non-slop-skip-file/, `${name} must document the marker`);
    assert.match(doc, /not scanned/, `${name} must say the scan names what it skipped`);
  }
});

test("the writing docs keep the principle, the refusal, and the trial the scanner cannot judge", () => {
  const writing = fs.readFileSync(path.join(ROOT, "skills/writing/SKILL.md"), "utf8");
  const review = fs.readFileSync(path.join(ROOT, "skills/review/SKILL.md"), "utf8");
  const agents = fs.readFileSync(path.join(ROOT, "AGENTS.md"), "utf8");
  assert.match(agents, /Every edit should help a reader do something or understand the subject better\. Preserve meaningful choices; question generic ones\./);
  assert.match(writing, /Every edit should help a reader do something or understand the subject better/);
  assert.match(writing, /AI-likeness/);
  assert.match(writing, /Mistakes added so the text looks human/);
  assert.match(writing, /banned-word list/);
  assert.match(review, /The scanner cannot judge this/);
  assert.match(review, /double-submit/);
  assert.match(review, /find X, download Y/);
  assert.match(review, /Readable labels/);
  assert.match(review, /Icon alignment/);
  assert.doesNotMatch(review, /concentric|border radius must|scale\(0\.96\)/i);
});

test("install.sh refuses a hostile ref and an old Node, and installs from the tarball curl saved", () => {
  const bad = spawnSync("sh", [path.join(ROOT, "install.sh")], { encoding: "utf8", env: { ...process.env, NON_SLOP_REF: "../evil" } });
  assert.notEqual(bad.status, 0);
  assert.match(bad.stderr, /refusing NON_SLOP_REF/);
  const bin = tmp();
  fs.writeFileSync(path.join(bin, "node"), "#!/bin/sh\nif [ \"$1\" = \"-p\" ]; then echo 16; exit 0; fi\necho v16.20.0\n");
  fs.chmodSync(path.join(bin, "node"), 0o755);
  fs.writeFileSync(path.join(bin, "curl"), "#!/bin/sh\necho curl-should-not-run >&2; exit 9\n");
  fs.chmodSync(path.join(bin, "curl"), 0o755);
  const old = spawnSync("sh", [path.join(ROOT, "install.sh")], { encoding: "utf8", env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, NON_SLOP_REF: "main" } });
  assert.notEqual(old.status, 0);
  assert.match(old.stderr, /Node 18/);
  assert.doesNotMatch(old.stderr, /curl-should-not-run/);

  const d = tmp();
  execFileSync("git", ["init", "-q"], { cwd: d });
  fs.writeFileSync(path.join(d, "AGENTS.md"), "# Keep\n");
  fs.writeFileSync(path.join(d, "notes.txt"), "do not lose\n");
  // GitHub serves the repo as `Non-Slop-<sha>/…`, and install.sh globs
  // `Non-Slop-*`, so the fixture needs that top-level directory. Built by staging
  // a directory rather than GNU `tar --transform`, which bsdtar (macOS, and
  // anything BSD-based) rejects with "Option --transform is not supported".
  const pack = tmp();
  const tarball = path.join(pack, "src.tgz");
  const stageRoot = path.join(pack, "Non-Slop-test");
  fs.mkdirSync(stageRoot, { recursive: true });
  fs.cpSync(ROOT, stageRoot, {
    recursive: true,
    filter: (src) => path.basename(src) !== ".git",
  });
  execFileSync("tar", ["-czf", tarball, "-C", pack, "Non-Slop-test"]);
  const curlBin = path.join(pack, "bin");
  fs.mkdirSync(curlBin);
  fs.writeFileSync(path.join(curlBin, "curl"), `#!/bin/sh\nout=""\nwhile [ $# -gt 0 ]; do\n  if [ "$1" = "-o" ]; then out=$2; shift 2; continue; fi\n  shift\ndone\ncp ${JSON.stringify(tarball)} "$out"\n`);
  fs.chmodSync(path.join(curlBin, "curl"), 0o755);
  const env = { ...process.env, PATH: `${curlBin}:${process.env.PATH}` };
  const run = () => spawnSync("sh", [path.join(ROOT, "install.sh")], { cwd: d, encoding: "utf8", env });
  const first = run();
  assert.equal(first.status, 0, first.stderr + first.stdout);
  const second = run();
  assert.equal(second.status, 0, second.stderr + second.stdout);
  const agents = fs.readFileSync(path.join(d, "AGENTS.md"), "utf8");
  assert.ok(agents.startsWith("# Keep\n"));
  assert.equal(agents.split("<!-- non-slop:start -->").length, 2);
  assert.equal(fs.readFileSync(path.join(d, "notes.txt"), "utf8"), "do not lose\n");
  assert.ok(fs.existsSync(path.join(d, ".non-slop/bin/non-slop.mjs")));
});
