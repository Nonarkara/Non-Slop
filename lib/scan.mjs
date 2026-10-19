// non-slop-skip-file: scanner code, not UI
// Static scan of a folder, files, staged files or a URL. Zero dependencies (Node 18+).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { RULES, SEV_POINTS, SEV_ORDER } from "./rules.mjs";
import { loadStyle, inlineAllows, allowedBy, parseStyle } from "./style.mjs";

const KIND = { ".css": "css", ".scss": "css", ".sass": "css", ".less": "css", ".html": "markup", ".htm": "markup", ".vue": "markup", ".svelte": "markup", ".astro": "markup", ".jsx": "markup", ".tsx": "markup", ".js": "script", ".mjs": "script", ".cjs": "script", ".ts": "script" };
const IMG = /\.(png|jpe?g|gif|webp|avif|bmp|tiff?)$/i, FONT = /\.(woff2?|ttf|otf|eot)$/i;
const SKIP = new Set(["node_modules", ".git", "dist", "build", "out", ".next", ".nuxt", ".svelte-kit", ".output", "coverage", "vendor", ".turbo", ".vercel", ".cache", ".non-slop", ".wrangler", "__pycache__"]);
const EXAMPLES = new Set(["examples", "example", "fixtures", "__fixtures__", "__mocks__", "stories", ".storybook", "test", "tests"]);

function walk(root, opts, out = []) {
  let st; try { st = fs.statSync(root); } catch { return out; }
  if (st.isFile()) { out.push(root); return out; }
  for (const e of fs.readdirSync(root, { withFileTypes: true })) {
    if (e.isDirectory()) { if (SKIP.has(e.name) || (!opts.includeExamples && EXAMPLES.has(e.name))) continue; walk(path.join(root, e.name), opts, out); }
    else if (e.isFile()) out.push(path.join(root, e.name));
  }
  return out;
}

export function fileCtx(abs, base, text) {
  const ext = path.extname(abs).toLowerCase(); const rel = path.relative(base, abs) || path.basename(abs);
  if (text === undefined) {
    const kind = KIND[ext];
    if (!kind) return IMG.test(abs) || FONT.test(abs) ? { rel, abs, kind: "other", text: "", size: fs.statSync(abs).size } : null;
    if (/\.min\.(js|css)$/.test(abs)) return null;
    const size = fs.statSync(abs).size; if (size > 1.5e6) return null;
    text = fs.readFileSync(abs, "utf8");
  }
  if (/non-slop-skip-file|non-slop-example|slop-example/.test(text.slice(0, 400)) && !process.env.NON_SLOP_INCLUDE_EXAMPLES) return null;
  // Rules read `text` with comments blanked (same length, newlines kept); allow comments are read from `raw`.
  const blank = (m) => m.replace(/[^\n]/g, " ");
  const code = text.replace(/<!--[\s\S]*?-->/g, blank).replace(/\/\*[\s\S]*?\*\//g, blank);
  return { rel: rel.split(path.sep).join("/"), abs, kind: KIND[ext] || "markup", text: code, raw: text, size: text.length };
}

export function runRules(files, style, { min = "P2" } = {}) {
  const proj = { files, css: files.filter((f) => f.kind === "css" || /<style/i.test(f.text)), fontFiles: files.filter((f) => FONT.test(f.rel)).map((f) => path.basename(f.rel).toLowerCase().replace(/[-_ ](regular|bold|italic|light|medium|semibold|variable|vf|latin|thai|\d+).*$/, "").replace(/[-_]/g, "")) };
  const inl = new Map(files.map((f) => [f.rel, inlineAllows(f.raw ?? f.text)]));
  const findings = [];
  for (const r of RULES) {
    if (SEV_ORDER[r.sev] > SEV_ORDER[min]) continue;
    const raw = [];
    if (r.project) { try { for (const h of r.project(proj)) raw.push(h); } catch (e) { if (process.env.NON_SLOP_DEBUG) console.error(r.id, e); } }
    else for (const f of files) { if (!r.kinds.includes(f.kind)) continue; try { for (const h of r.file(f)) raw.push({ rel: f.rel, ...h }); } catch (e) { if (process.env.NON_SLOP_DEBUG) console.error(r.id, f.rel, e); } }
    for (const h of raw) {
      const f = { id: r.id, sev: r.sev, cat: r.cat, title: r.title, fix: r.fix, ...h };
      const why = allowedBy(style, inl.get(h.rel), f, h.rel);
      f.status = why ? (r.noAllow ? "ASK-OWNER" : "ALLOWED") : "FAIL";
      if (why) f.allowedBy = why;
      findings.push(f);
    }
  }
  return findings;
}

// Judge the stack, not the item: distinct counted rules, weighted by severity.
export function verdict(findings) {
  const counted = new Map();
  for (const f of findings) if (f.status === "FAIL" && !counted.has(f.id)) counted.set(f.id, f);
  const list = [...counted.values()];
  const points = list.reduce((a, f) => a + SEV_POINTS[f.sev], 0);
  const p0 = list.filter((f) => f.sev === "P0").length, p1 = list.filter((f) => f.sev === "P1").length, p2 = list.filter((f) => f.sev === "P2").length;
  const cats = new Set(list.filter((f) => f.sev !== "P2").map((f) => f.cat));
  const v = points >= 8 || (p0 >= 1 && p0 + p1 >= 2) || cats.size >= 3 ? "SLOP" : points >= 3 ? "REVIEW" : "OK";
  return { verdict: v, points, p0, p1, p2, allowed: findings.filter((f) => f.status === "ALLOWED").length, askOwner: findings.filter((f) => f.status === "ASK-OWNER").length };
}

export async function scanTarget(target, opts = {}) {
  let files = [], base, style, note = [];
  if (/^https?:\/\//i.test(target)) {
    ({ files, note } = await fetchSite(target));
    base = target;
    style = opts.style ? loadStyle(null, opts.style) : parseStyle("", "(none: pass --style STYLE.md to apply an allowlist to a URL)");
  } else {
    base = path.resolve(target);
    const list = opts.staged ? stagedFiles(base) : walk(base, opts);
    const root = fs.statSync(base).isFile() ? path.dirname(base) : base;
    for (const abs of list) { const c = fileCtx(abs, root); if (c) files.push(c); }
    style = loadStyle(base, opts.style);
  }
  const findings = runRules(files, style, opts);
  return { target, filesScanned: files.filter((f) => f.kind !== "other").length, style: { file: style.file, rules: style.rules.length, fonts: style.fonts.size, colours: style.colours.size, warnings: style.warnings }, findings, summary: verdict(findings), note };
}

function stagedFiles(root) {
  try {
    const top = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: fs.statSync(root).isFile() ? path.dirname(root) : root, encoding: "utf8" }).trim();
    return execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], { cwd: top, encoding: "utf8" }).split("\n").filter(Boolean).map((p) => path.join(top, p)).filter((p) => !p.split(path.sep).some((s) => SKIP.has(s)) && fs.existsSync(p));
  } catch { return []; }
}

async function fetchText(url) {
  const r = await fetch(url, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (non-slop scanner; +https://github.com/Nonarkara/Non-Slop)", accept: "text/html,text/css,*/*" }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return { text: await r.text(), url: r.url };
}
async function fetchSite(url) {
  const note = []; const page = await fetchText(url); const files = [fileCtx(new URL(page.url).pathname.replace(/\/$/, "/index") + (/(\.html?)$/.test(page.url) ? "" : ".html"), "/", page.text)];
  const hrefs = [...page.text.matchAll(/<link\b[^>]*rel=["']?stylesheet["']?[^>]*>/gi)].map((m) => (m[0].match(/href=["']?([^"'\s>]+)/) || [])[1]).filter(Boolean).slice(0, 15);
  for (const h of hrefs) { try { const u = new URL(h, page.url); const css = await fetchText(u.href); const c = fileCtx((u.host === new URL(page.url).host ? u.pathname : "/" + u.host + u.pathname).replace(/(\.css)?$/, ".css"), "/", css.text); if (c) files.push(c); } catch (e) { note.push(`could not fetch ${h}: ${e.message}`); } }
  if (page.text.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, "").trim().length < 300) note.push("Little text in the HTML: the page is probably rendered by JavaScript. Run `non-slop render` for the real picture.");
  return { files, note };
}

export function formatText(res, { color = process.stdout.isTTY } = {}) {
  const c = (code, s) => (color ? `\x1b[${code}m${s}\x1b[0m` : s);
  const SEVC = { P0: "31;1", P1: "33", P2: "36" };
  const out = [`non-slop scan ${res.target}  ·  ${res.filesScanned} files  ·  style: ${res.style.file}${res.style.rules + res.style.fonts + res.style.colours ? ` (${res.style.rules} rules, ${res.style.fonts} fonts, ${res.style.colours} colours allowed)` : ""}`];
  for (const w of res.style.warnings) out.push(c("33", "  note: " + w));
  const byFile = new Map(); for (const f of res.findings) (byFile.get(f.rel) || byFile.set(f.rel, []).get(f.rel)).push(f);
  for (const [rel, fs_] of byFile) {
    out.push("", c("1", rel));
    for (const f of fs_.sort((a, b) => SEV_ORDER[a.sev] - SEV_ORDER[b.sev])) {
      const tag = f.status === "FAIL" ? c(SEVC[f.sev], f.sev.padEnd(9)) : f.status === "ALLOWED" ? c("32", "ALLOWED  ") : c("35", "ASK-OWNER");
      out.push(`  ${tag} ${f.id.padEnd(20)} ${f.line ? "L" + f.line : ""}  ${f.detail || ""}`);
      if (f.status === "FAIL") out.push(`            ${c("2", f.title)}`, `            fix: ${f.fix}`);
      else out.push(`            ${c("2", f.allowedBy + (f.status === "ASK-OWNER" ? " — listed as deliberate, but this one affects access: raise it with the owner, don't change it." : ""))}`);
    }
  }
  for (const n of res.note || []) out.push("", c("33", "note: " + n));
  const s = res.summary; const vc = s.verdict === "SLOP" ? "31;1" : s.verdict === "REVIEW" ? "33;1" : "32;1";
  out.push("", `${c(vc, "Verdict: " + s.verdict)}  points ${s.points} (distinct rules: P0 ${s.p0} · P1 ${s.p1} · P2 ${s.p2})  ·  allowed ${s.allowed}${s.askOwner ? `  ·  ask-owner ${s.askOwner}` : ""}`);
  out.push(c("2", "SLOP = ≥8 points, a P0 stacked with another P0/P1, or P0/P1 hits in ≥3 categories. REVIEW = 3–7. A screen, not a judge: render it and get a second reviewer."));
  return out.join("\n");
}
