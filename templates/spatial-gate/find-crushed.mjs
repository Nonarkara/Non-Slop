/**
 * Find text that has been squeezed into a column too narrow to read.
 *
 * The spatial-law instrument asks whether a ROW has a hole in it. It does not
 * ask whether a heading has been crushed to one word per line — that is not a
 * hole, it is a box that is too narrow, and the text still "fits" it. The
 * instrument flagged one of these (a section heading squeezed to 85px beside
 * a 219px control group) only because the control group happened to be short
 * enough to leave a measurable gap.
 *
 * This asks the direct question: is there a text element whose box is far
 * narrower than the text it holds, so the reader gets one or two words on
 * every line?
 *
 *   node scripts/spatial/find-crushed.mjs --base http://127.0.0.1:4399 --width 359
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const arg = (n, d) => {
  const i = argv.indexOf('--' + n);
  if (i === -1) return d;
  const v = argv[i + 1];
  return v && !v.startsWith('--') ? v : true;
};

const BASE = String(arg('base', 'http://127.0.0.1:4399')).replace(/\/$/, '');
const WIDTH = Number(arg('width', 359));
const SETTLE = Number(arg('settle', 900));
const MIN_W = Number(arg('min-width', 130));
const MAX_WORDS_PER_LINE = Number(arg('max-words-per-line', 2));
const DIR = arg('dir', null);

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

function chromePath() {
  for (const c of CHROME_CANDIDATES) if (existsSync(c)) return c;
  throw new Error('no Chrome found; set CHROME_PATH');
}

const profile = mkdtempSync(join(tmpdir(), 'crushed-'));
const port = 9000 + Math.floor(Math.random() * 900);
const chrome = spawn(chromePath(), [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-extensions',
  '--disable-background-networking',
  '--hide-scrollbars',
  'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });

let chromeErr = '';
chrome.stderr.on('data', (d) => { chromeErr += d.toString(); });

async function waitForDevtools() {
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (r.ok) return (await r.json()).webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('chrome devtools never came up. stderr:\n' + chromeErr.slice(-1500));
}

function cdp(ws) {
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  });
  return (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pending.set(mid, { resolve, reject });
      ws.send(JSON.stringify({ id: mid, method, params, ...(sessionId ? { sessionId } : {}) }));
      setTimeout(() => {
        if (pending.has(mid)) { pending.delete(mid); reject(new Error('timeout: ' + method)); }
      }, 45000);
    });
}

// A text element is CRUSHED when its box is narrow AND the text has to break
// so often that the reader gets about one word per line. Letters-per-line is
// the wrong measure — a 30-character heading broken over 6 lines is 5 letters
// per line, which looks "low" by a length-based rule while being the worst
// case. WORDS per line is the measure that matches what the reader
// experiences: one word per line is a crushed column.
const PROBE = `(() => {
  const MIN_W = ${MIN_W};
  const MAX_WPL = ${MAX_WORDS_PER_LINE};
  const out = [];
  const all = document.querySelectorAll('main *');
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (cs.position === 'absolute' || cs.position === 'fixed') continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    // Only elements that hold text directly, or whose only content is text.
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.nodeValue).join(' ').replace(/\\s+/g,' ').trim();
    const text = own || el.textContent.replace(/\\s+/g,' ').trim();
    if (text.length < 24) continue;
    // a wrapper that holds block children is a column, not a line of text
    if (!own && [...el.children].some(c => getComputedStyle(c).display === 'block')) continue;
    const words = text.split(/\\s+/).filter(Boolean).length;
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
    const lines = Math.max(1, Math.round(r.height / lh));
    const wpl = words / lines;
    // An INLINE element's bounding box is the union of its line boxes, so the
    // last short line makes the box look narrower than the text really was
    // given. The text was laid out in the containing block's width, so that is
    // the width to judge it by.
    let width = r.width;
    if (cs.display === 'inline' && el.parentElement) {
      const pcs = getComputedStyle(el.parentElement);
      width = el.parentElement.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight);
    }
    if (width < MIN_W && wpl < MAX_WPL) {
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className || '').slice(0, 48),
        w: +width.toFixed(1),
        boxW: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
        fs: cs.fontSize,
        lines,
        words: words,
        wordsPerLine: +wpl.toFixed(2),
        text: text.slice(0, 70),
      });
    }
  }
  return out;
})()`;

try {
  const wsUrl = await waitForDevtools();
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', rej);
  });
  const send = cdp(ws);

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);

  await S('Page.enable');
  await S('Runtime.enable');
  await S('Emulation.setDeviceMetricsOverride', {
    width: WIDTH, height: 900, deviceScaleFactor: 1, mobile: false,
  });

  const routes = DIR
    ? readdirSync(String(DIR)).filter((f) => {
        try { return statSync(join(String(DIR), f, 'index.html')).isFile(); } catch { return false; }
      }).map((f) => '/' + f + '/')
    : ['/'];

  let total = 0;
  for (const route of routes) {
    await S('Page.navigate', { url: BASE + route });
    for (let i = 0; i < 200; i++) {
      const r = await S('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
      if (r.result.value === 'complete') break;
      await new Promise((r) => setTimeout(r, 100));
    }
    await new Promise((r) => setTimeout(r, SETTLE));
    const res = await S('Runtime.evaluate', { expression: PROBE, returnByValue: true });
    const els = res.result.value || [];
    if (!els.length) continue;
    total += els.length;
    console.log(`\n${route}  (${els.length} crushed)`);
    for (const e of els) {
      console.log(`   ${e.tag}.${e.cls}  w=${e.w} fs=${e.fs} lines=${e.lines} words/line=${e.wordsPerLine}  "${e.text}"`);
    }
  }
  console.log(`\n${total} crushed text element(s) at ${WIDTH}px`);
} finally {
  try { chrome.kill('SIGKILL'); } catch { /* already gone */ }
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* best effort */ }
}
