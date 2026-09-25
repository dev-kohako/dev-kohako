export const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const fmt = (n) => Number(n).toLocaleString('en-US');
export const r1 = (n) => Math.round(n * 10) / 10;
export const r2 = (n) => Math.round(n * 100) / 100;

const FONTS = `
.sans{font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif}
.mono{font-family:'JetBrains Mono','Cascadia Code','SF Mono',SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace}
.serif{font-family:Georgia,'Iowan Old Style','Palatino Linotype',Palatino,'Times New Roman',serif}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

export function doc({ w, h, title, desc, css = '', defs = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title>
<desc id="desc">${esc(desc)}</desc>
<defs><style>${FONTS}${css}</style>${defs}</defs>
${body}
</svg>
`;
}

export const panel = (t, w, h) =>
  `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="16" fill="${t.bg}" stroke="${t.stroke}"/>`;

// ---- colour ---------------------------------------------------------------

const rgb = (c) => {
  const n = parseInt(c.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
};
const hex = (a) => '#' + a.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => {
  const A = rgb(a), B = rgb(b);
  return hex(A.map((v, i) => v + (B[i] - v) * t));
};

// ---- randomness that is the same on every build ---------------------------

export function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- text -----------------------------------------------------------------

// No font metrics in an <img>-embedded SVG, so widths are estimates. Callers
// clamp with textLength where overflow would matter.
export const textWidth = (s, size, ratio = 0.53) => [...String(s)].length * size * ratio;

export function wrap(text, maxWidth, size, ratio = 0.53, maxLines = Infinity) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (line && textWidth(next, size, ratio) > maxWidth) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/[\s,.;:—-]*\S*$/, '') + '…';
    return kept;
  }
  return lines;
}

// Clamp a text run to a width without touching it when it already fits.
export const fit = (s, size, max, ratio = 0.53) =>
  textWidth(s, size, ratio) > max ? ` textLength="${r1(max)}" lengthAdjust="spacingAndGlyphs"` : '';

// ---- geometry -------------------------------------------------------------

// Closed Catmull-Rom spline through the points, as cubic Béziers.
export function smoothClosed(pts, tension = 1) {
  const n = pts.length;
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d + 'Z';
}

export const poly = (pts) => pts.map((p) => `${r1(p[0])},${r1(p[1])}`).join(' ');
