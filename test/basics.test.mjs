import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { imageFindings, slowBoth, BUDGET } from "../lib/basics.mjs";
import { RENDER_RULES } from "../lib/render.mjs";

const FX = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), "test/fixtures/basics");
const rule = (id) => RENDER_RULES.find((r) => r.id === id);
const page = (b = {}, extra = {}) => ({ basics: { unlabelled: [], unnamed: [], homeLink: true, languages: ["en"], perf: { lcpMs: 900, cls: 0 }, ...b }, ...extra });

test("basics: a clean page trips none of the ship-basics rules", () => {
  for (const id of ["unlabelled-fields", "unnamed-controls", "slow-lcp", "layout-shift", "heavy-images", "no-home-link"]) assert.equal(rule(id).test(page(), page()), false, id);
});

test("basics: slow largest paint needs both loads to be slow; one slow load is the network", () => {
  assert.equal(rule("slow-lcp").test(page({ perf: { lcpMs: 6000, cls: 0 } }), page()), false);
  assert.equal(rule("slow-lcp").test(page({ perf: { lcpMs: 6000, cls: 0 } }), page({ perf: { lcpMs: 5000, cls: 0 } })), true);
  assert.equal(slowBoth(page({ perf: null }), page()), 0);
});

test("basics: labels, names, shift and a missing home link are caught; access rules are marked access", () => {
  assert.ok(rule("unlabelled-fields").test(page(), page({ unlabelled: ["email"] })));
  assert.ok(rule("unnamed-controls").test(page({ unnamed: ["<button>"] }), page()));
  assert.ok(rule("layout-shift").test(page(), page({ perf: { lcpMs: 1, cls: 0.4 } })));
  assert.ok(rule("no-home-link").test(page({ homeLink: false }), page()));
  assert.equal(rule("no-home-link").test(page({ homeLink: null }), page()), false, "a local file has no home to link to");
  assert.ok(rule("unlabelled-fields").a11y && rule("unnamed-controls").a11y);
  assert.equal(rule("heavy-images").w + rule("no-home-link").w, 0, "reported only");
});

test("basics: image findings flag weight and oversizing, not small or right-sized images", () => {
  assert.deepEqual(imageFindings([{ url: "a.webp", bytes: 40e3 }], [{ src: "a.webp", natural: 800, shown: 400 }]), []);
  const f = imageFindings([{ url: "https://x/hero.jpg", bytes: 900e3 }, { url: "b", bytes: 1.5e6 }], [{ src: "https://x/hero.jpg", natural: 4000, shown: 400 }]);
  assert.equal(f.length, 3);
  assert.match(f[0], /2 over 300 KB \(largest 1500 KB/);
  assert.match(f[1], /2\.4 MB/);
  assert.match(f[2], /4000px shown at 400px/);
  assert.equal(BUDGET.lcpMs, 4000);
});

test("basics: rendered fixture shows a missing label, an unnamed control, layout shift, a heavy image and no home link", { timeout: 120000 }, async (t) => {
  let ok = true; try { await import("playwright"); } catch { ok = false; }
  if (!ok) return t.skip("playwright not installed");
  const big = `<svg xmlns="http://www.w3.org/2000/svg" width="3000" height="3000"><rect width="3000" height="3000" fill="#888"/><!-- ${"x".repeat(400e3)} --></svg>`;
  const server = http.createServer((req, res) => {
    if (req.url.endsWith("/big.svg")) { res.writeHead(200, { "content-type": "image/svg+xml" }); return res.end(big); }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); res.end(fs.readFileSync(path.join(FX, "index.html")));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  try {
    const { renderUrl, formatRender } = await import("../lib/render.mjs");
    const r = await renderUrl(`http://127.0.0.1:${server.address().port}/notes/`, { out: fs.mkdtempSync(path.join(os.tmpdir(), "non-slop-")), settleMs: 1500 });
    assert.equal(r.status, "OK");
    const hit = new Set(r.hits.map((h) => h.id));
    for (const id of ["unlabelled-fields", "unnamed-controls", "layout-shift", "heavy-images", "no-home-link"]) assert.ok(hit.has(id), "missing " + id + "\n" + formatRender(r));
    assert.ok(!hit.has("slow-lcp"));
    assert.match(formatRender(r), /basics: largest paint \d+\/\d+ ms/);
  } finally { server.close(); }
});
