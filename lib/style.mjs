// non-slop-skip-file: scanner code, not UI
// STYLE.md allowlist: the owner's deliberate choices. Anything listed here is reported
// as ALLOWED and never counts toward a verdict. See templates/STYLE.md for the format.
import fs from "node:fs";
import path from "node:path";

export function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") { re += ".*"; i++; if (glob[i + 1] === "/") i++; }
      else re += "[^/]*";
    } else if (c === "?") re += "[^/]";
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp("^" + re + "$");
}

const ENTRY = /^\s*[-*]\s+(rule|font|colou?r)\s+(.+?)\s*(?::\s*(.*))?$/i;

// Parse the "## Allow" section of a STYLE.md. Returns { rules:[{id,glob,why}], fonts:Map, colours:Map, warnings:[] }
export function parseStyle(text, file = "STYLE.md") {
  const out = { file, rules: [], fonts: new Map(), colours: new Map(), warnings: [] };
  if (!text) return out;
  let inAllow = false, level = 0;
  for (const raw of text.split(/\r?\n/)) {
    const h = raw.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      if (inAllow && h[1].length <= level) inAllow = false;
      if (/^allow(list)?\b|scanner allow/i.test(h[2].trim())) { inAllow = true; level = h[1].length; }
      continue;
    }
    if (!inAllow) continue;
    const m = raw.match(ENTRY);
    if (!m) continue;
    const kind = m[1].toLowerCase(); let target = m[2].trim(); const why = (m[3] || "").trim();
    if (!why) out.warnings.push(`${file}: "${raw.trim()}" has no reason. It is still honoured; add one so reviewers know why.`);
    if (kind === "rule") {
      const [id, , glob] = target.split(/\s+/);
      out.rules.push({ id: id.toLowerCase(), glob: glob ? globToRegExp(glob) : null, globText: glob || null, why });
    } else if (kind === "font") {
      target = target.replace(/^["']|["']$/g, "").toLowerCase();
      out.fonts.set(target, why);
    } else {
      const hex = normHex(target);
      if (hex) out.colours.set(hex, why); else out.warnings.push(`${file}: can't read colour "${target}" (use #rrggbb).`);
    }
  }
  return out;
}

export function normHex(s) {
  const m = String(s).trim().toLowerCase().match(/^#([0-9a-f]{3}|[0-9a-f]{6})\b/);
  if (!m) return null;
  let h = m[1]; if (h.length === 3) h = [...h].map((c) => c + c).join("");
  return "#" + h;
}

// Find STYLE.md (or the "## Signature" section of AGENTS.md) at or above `start`, up to the git root.
export function loadStyle(start, explicit) {
  if (explicit) return parseStyle(fs.readFileSync(explicit, "utf8"), explicit);
  let dir = path.resolve(start);
  try { if (fs.statSync(dir).isFile()) dir = path.dirname(dir); } catch { return parseStyle("", "(none)"); }
  for (;;) {
    for (const name of ["STYLE.md", "style.md", ".non-slop/STYLE.md"]) {
      const p = path.join(dir, name);
      if (fs.existsSync(p)) return parseStyle(fs.readFileSync(p, "utf8"), p);
    }
    const agents = path.join(dir, "AGENTS.md");
    if (fs.existsSync(agents)) {
      const t = fs.readFileSync(agents, "utf8"); const i = t.search(/^##\s+Signature\b/m);
      if (i >= 0) { const s = parseStyle(t.slice(i).replace(/^##\s+Signature/m, "## Allow"), agents + "#Signature"); if (s.rules.length || s.fonts.size || s.colours.size) return s; }
    }
    if (fs.existsSync(path.join(dir, ".git"))) break;
    const up = path.dirname(dir); if (up === dir) break; dir = up;
  }
  return parseStyle("", "(none)");
}

// Inline escapes in source: `non-slop-allow: id, id -- reason` on the line or the line above;
// `non-slop-allow-file: id, id -- reason` anywhere in the file (no ids = whole file).
export function inlineAllows(text) {
  const file = new Set(); let wholeFile = false; const lines = new Map();
  const ls = text.split(/\r?\n/);
  ls.forEach((l, i) => {
    let m = l.match(/non-slop-allow-file:?\s*([a-z0-9, -]*?)(?:\s+--|\*\/|-->|$)/i);
    if (m) { const ids = m[1].split(/[\s,]+/).filter(Boolean); if (!ids.length) wholeFile = true; ids.forEach((x) => file.add(x.toLowerCase())); return; }
    m = l.match(/non-slop-allow:?\s*([a-z0-9, -]+?)(?:\s+--|\*\/|-->|$)/i);
    if (m) { const ids = m[1].split(/[\s,]+/).filter(Boolean).map((x) => x.toLowerCase()); for (const n of [i + 1, i + 2]) lines.set(n, [...(lines.get(n) || []), ...ids]); }
  });
  return { file, wholeFile, lines };
}

// Is this finding allowed? Returns a reason string or null.
export function allowedBy(style, inline, finding, rel) {
  if (inline) {
    if (inline.wholeFile) return "inline (whole file)";
    if (inline.file.has(finding.id)) return "inline (file)";
    if ((inline.lines.get(finding.line) || []).includes(finding.id)) return "inline (line)";
  }
  for (const r of style.rules) {
    if (r.id !== finding.id && r.id !== "*") continue;
    if (r.glob && !r.glob.test(rel)) continue;
    return `${path.basename(style.file)}: ${r.why || "listed"}`;
  }
  if (finding.font && style.fonts.has(finding.font.toLowerCase())) return `${path.basename(style.file)}: font ${finding.font}${style.fonts.get(finding.font.toLowerCase()) ? " — " + style.fonts.get(finding.font.toLowerCase()) : ""}`;
  if (finding.colours && finding.colours.length && finding.colours.every((c) => style.colours.has(c))) return `${path.basename(style.file)}: colour ${finding.colours.join(", ")}`;
  return null;
}
