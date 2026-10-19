// non-slop-skip-file: scanner code, not UI
// Rendered "ship basics" that the static scan can't see: labels and names on what the page
// actually renders (including JS-built controls), a way home, which languages a reader can reach (reported, not scored), and page speed
// (largest paint, layout shift, image bytes). The practices are paraphrased in skills/direction
// from Harsh Vijay, "11 Website Design Best Practices To Follow In 2026" (ruttl.com); see CREDITS.md.

// Runs in the page (page.evaluate). Self-contained.
export function basicsMetrics() {
  const MAPSEL = '.leaflet-container,.maplibregl-map,.mapboxgl-map,.gm-style,.ol-viewport,.esri-view,.cesium-widget';
  const shown = (el) => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1 || r.bottom <= 0 || r.right <= 0 || r.left >= innerWidth || r.top > innerHeight * 4) return false; const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05 && !el.closest('[aria-hidden="true"],[inert]') && !el.closest(MAPSEL); };
  const named = (el) => ['aria-label', 'title'].some((a) => (el.getAttribute(a) || '').trim()) || (el.getAttribute('aria-labelledby') || '').split(/\s+/).some((id) => id && (document.getElementById(id)?.textContent || '').trim());
  const out = { unlabelled: [], unnamed: [] };
  for (const el of document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]):not([type=image]),select,textarea')) {
    if (!shown(el) || named(el) || el.closest('label') || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`))) continue;
    out.unlabelled.push(el.getAttribute('placeholder') || el.getAttribute('name') || el.tagName.toLowerCase());
  }
  for (const el of document.querySelectorAll('a[href],button,[role=button],[role=link],input[type=submit],input[type=button]')) {
    if (!shown(el) || named(el) || (el.innerText || el.value || '').trim()) continue;
    if ([...el.querySelectorAll('img[alt],svg title')].some((i) => (i.getAttribute('alt') || i.textContent || '').trim())) continue;
    out.unnamed.push(el.outerHTML.slice(0, 60));
  }
  // a way home near the top (not asked of the home page itself or a local file): same-origin link to "/", a language root, or a github.io/gitlab.io project root
  const here = new URL(location.href); const seg = here.pathname.split('/')[1] || '';
  const roots = ['/'].concat(seg && /\.(github|gitlab)\.io$/.test(here.hostname) && here.pathname.length > seg.length + 1 ? ['/' + seg + '/'] : []);
  const atRoot = roots.concat(seg && /\.(github|gitlab)\.io$/.test(here.hostname) ? ['/' + seg + '/'] : []).some((root) => /^((en|th|zh|zh-cn|zh-hans)\/?)?(index\.html?)?$/i.test(here.pathname.startsWith(root) ? here.pathname.slice(root.length) : 'x'));
  out.homeLink = here.protocol === 'file:' || atRoot ? null : [...document.querySelectorAll('a[href]')].some((a) => {
    const r = a.getBoundingClientRect(); if (r.width < 1 || r.top > 200 || r.bottom < 0) return false;
    try { const u = new URL(a.href, here); return u.origin === here.origin && !u.hash.slice(1) && roots.some((root) => u.pathname.startsWith(root) && /^((en|th|zh|zh-cn|zh-hans)\/?)?(index\.html?)?$/i.test(u.pathname.slice(root.length))); } catch { return false; }
  });
  // languages a reader can reach: hreflang/lang attributes or a switch labelled ไทย / 中文 / EN
  const langs = new Set();
  for (const e of document.querySelectorAll('[hreflang],[lang]')) { const l = (e.getAttribute('hreflang') || e.getAttribute('lang') || '').toLowerCase().slice(0, 2); if (['en', 'th', 'zh'].includes(l)) langs.add(l); }
  for (const e of document.querySelectorAll('a,button,option,[role=tab],[role=menuitem]')) { const t = (e.textContent || '').trim(); if (/^(ไทย|ภาษาไทย|th)$/i.test(t)) langs.add('th'); if (/^(中文|简体|简体中文|zh)$/i.test(t)) langs.add('zh'); if (/^(en|eng|english)$/i.test(t)) langs.add('en'); }
  out.languages = [...langs].sort();
  out.images = [...document.querySelectorAll('img')].filter((i) => i.currentSrc && !i.closest(MAPSEL)).map((i) => ({ src: i.currentSrc, natural: i.naturalWidth, shown: Math.round(i.getBoundingClientRect().width) })).filter((i) => i.shown > 0);
  out.perf = window.__nsPerf ? { lcpMs: Math.round(window.__nsPerf.lcp), cls: +window.__nsPerf.cls.toFixed(3) } : null;
  return out;
}

// page.addInitScript before goto. CLS here sums every unexpected shift, so it reads a little high.
export const PERF_INIT = `window.__nsPerf={lcp:0,cls:0};try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__nsPerf.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__nsPerf.cls+=e.value}).observe({type:'layout-shift',buffered:true})}catch(e){}`;

// Image transfer sizes for one page (map tiles left out). Call before goto; await done() after load.
export function watchImages(page) {
  const jobs = [];
  page.on('requestfinished', (req) => {
    if (req.resourceType() !== 'image' || req.url().startsWith('data:') || /tile|\/\d+\/\d+\/\d+(@\dx)?(\.\w+)?(\?|$)/i.test(req.url())) return;
    jobs.push(req.sizes().then((s) => ({ url: req.url(), bytes: s.responseBodySize })).catch(() => null));
  });
  return { done: async () => (await Promise.all(jobs)).filter(Boolean) };
}

export const BUDGET = { lcpMs: 4000, cls: 0.25, imageBytes: 300e3, imagesTotal: 2e6, oversize: 2.5, oversizeMinBytes: 100e3 };

// Plain-language image findings from transfer sizes and what the page displays.
export function imageFindings(sizes = [], shown = []) {
  const out = []; const total = sizes.reduce((a, s) => a + (s.bytes || 0), 0);
  const heavy = sizes.filter((s) => s.bytes > BUDGET.imageBytes).sort((a, b) => b.bytes - a.bytes);
  if (heavy.length) out.push(`${heavy.length} over ${BUDGET.imageBytes / 1e3} KB (largest ${Math.round(heavy[0].bytes / 1e3)} KB ${heavy[0].url.split('/').pop().slice(0, 40)})`);
  if (total > BUDGET.imagesTotal) out.push(`${(total / 1e6).toFixed(1)} MB of images`);
  const bytes = new Map(sizes.map((s) => [s.url, s.bytes]));
  const big = shown.filter((i) => i.natural > BUDGET.oversize * i.shown && (bytes.get(i.src) || 0) > BUDGET.oversizeMinBytes);
  if (big.length) out.push(`${big.length} served over ${BUDGET.oversize}× shown width (${big[0].natural}px shown at ${big[0].shown}px)`);
  return out;
}

// Largest paint must be slow on BOTH the desktop and phone loads to count; one slow load can be the network.
export const slowBoth = (d, m) => { const a = d.basics?.perf?.lcpMs, b = m.basics?.perf?.lcpMs; return a && b ? Math.min(a, b) : 0; };
