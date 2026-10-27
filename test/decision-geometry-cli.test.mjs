import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { spec, good } from "../tools/decision-geometry/fixtures.mjs";
test("non-slop geometry exposes the actual budget gate and its failure exit", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "non-slop-geometry-"));
  const a = path.join(root, "contract.json"),
    b = path.join(root, "captures.json");
  fs.writeFileSync(a, JSON.stringify({ version: 1, cases: [spec] }));
  fs.writeFileSync(b, JSON.stringify([good]));
  const run = () =>
    spawnSync(
      process.execPath,
      [
        fileURLToPath(new URL("../bin/non-slop.mjs", import.meta.url)),
        "geometry",
        a,
        b,
      ],
      { encoding: "utf8" },
    );
  try {
    let r = run();
    assert.equal(r.status, 0, r.stderr);
    assert.equal(JSON.parse(r.stdout).status, "BUDGETS_PASS");
    const bad = structuredClone(good);
    bad.action.rect.y = 700;
    fs.writeFileSync(b, JSON.stringify([bad]));
    r = run();
    assert.equal(r.status, 2);
    assert.ok(
      JSON.parse(r.stdout).failures.some((f) => f.code === "decision-gap"),
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('Non-Slop init installs a working geometry gate into a consumer project', async () => {
  const { init } = await import('../lib/init.mjs');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'Geometry consumer with spaces-'));
  try {
    init(root, { hook: false });
    const a = path.join(root, 'contract.json'), b = path.join(root, 'captures.json');
    fs.writeFileSync(a, JSON.stringify({ version: 1, cases: [spec] }));
    fs.writeFileSync(b, JSON.stringify([good]));
    const cli = path.join(root, '.non-slop/bin/non-slop.mjs');
    let r = spawnSync(process.execPath, [cli, 'geometry', a, b], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(JSON.parse(r.stdout).status, 'BUDGETS_PASS');
    const bad = structuredClone(good); bad.regions.map.rect.x = -5000;
    fs.writeFileSync(b, JSON.stringify([bad]));
    r = spawnSync(process.execPath, [cli, 'geometry', a, b], { encoding: 'utf8' });
    assert.equal(r.status, 2);
    assert.ok(JSON.parse(r.stdout).failures.some(f => f.code === 'region-not-visible'));
    assert.ok(fs.existsSync(path.join(root, '.non-slop/DECISION-GEOMETRY.md')));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
