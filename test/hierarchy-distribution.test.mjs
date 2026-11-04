import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { init } from '../lib/init.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LAWS = ['MSH.md', 'GLANCE-PATH-FOR-AI.md', 'KINETIC-GRIDS-FOR-AI.md'];

function checkHierarchy(root) {
  for (const name of LAWS) assert.ok(fs.existsSync(path.join(root, name)), `missing distributed law: ${name}`);
  for (const name of ['glance-path', 'kinetic-grid']) {
    const skill = path.join(root, 'skills', name, 'SKILL.md');
    const target = fs.readFileSync(skill, 'utf8').match(/\]\((\.\.\/\.\.\/[^)]+)\)/)?.[1];
    assert.ok(target, `${name}: no canonical law link`);
    assert.ok(fs.existsSync(path.resolve(path.dirname(skill), target)), `${name}: broken distributed law link ${target}`);
  }
}

test('init distributes the complete hierarchy pack and keeps its skill links usable', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'non-slop-hierarchy-init-'));
  try {
    init(temp, { hook: false, append: false });
    const installed = path.join(temp, '.non-slop');
    checkHierarchy(installed);
    for (const name of LAWS) assert.equal(fs.readFileSync(path.join(installed, name), 'utf8'), fs.readFileSync(path.join(ROOT, name), 'utf8'));
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});

test('the actual npm archive includes the hierarchy laws and resolves packaged skill links', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'non-slop-hierarchy-pack-'));
  try {
    const packed = spawnSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', temp], { cwd: ROOT, encoding: 'utf8' });
    assert.equal(packed.status, 0, packed.stderr);
    const name = JSON.parse(packed.stdout)[0].filename;
    const unpacked = spawnSync('tar', ['-xzf', path.join(temp, name), '-C', temp], { encoding: 'utf8' });
    assert.equal(unpacked.status, 0, unpacked.stderr);
    checkHierarchy(path.join(temp, 'package'));
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});
