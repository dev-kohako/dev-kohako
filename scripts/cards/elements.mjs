import { doc, esc, fit, panel, r1, textWidth } from '../lib/svg.mjs';
import { uses } from '../lib/github.mjs';

const W = 840, ROWS = 5, PAD = 24, GAP = 4, ROW_PITCH = 64;

// Lay the categories out in the periodic table's silhouette: the first one in
// tall columns on the left (the second starting a row down, like Be under H),
// the last one mirrored on the right, everything else in 3-row middle columns.
// The empty top-middle is where the title and the key go, as on the real one.
function layout(cats) {
  const cols = [];
  const push = (cat, sizes) => {
    let left = cat.elements.length;
    for (const [from, to] of sizes) {
      const cap = to - from + 1, take = Math.min(cap, left);
      // bottom-aligned: a short column sits on the floor, gaps float on top
      cols.push({ cat: cat.id, from, to, first: to - take + 1, items: cat.elements.slice(cat.elements.length - left, cat.elements.length - left + take) });
      left -= take;
    }
  };
  const tall = (n, leftSide) => {
    const extra = Math.max(0, Math.ceil((n - 5) / 4));
    const sizes = Array.from({ length: extra }, () => [2, ROWS]);
    return leftSide ? [[1, ROWS], ...sizes] : [...sizes, [1, ROWS]];
  };

  const [first, ...rest] = cats;
  const last = rest.pop();
  push(first, tall(first.elements.length, true));
  for (const c of rest) push(c, Array.from({ length: Math.ceil(c.elements.length / 3) }, () => [3, ROWS]));
  // the right block fills left-to-right but its tallest column is the outer one
  const right = tall(last.elements.length, false);
  const lastEls = last.elements;
  const outerTake = Math.min(5, lastEls.length);
  const innerEls = lastEls.slice(0, lastEls.length - outerTake);
  push({ id: last.id, elements: innerEls }, right.slice(0, -1));
  push({ id: last.id, elements: lastEls.slice(lastEls.length - outerTake) }, [right.at(-1)]);
  return cols;
}

export function elements(t, cfg, data) {
  let z = 0;
  const cats = cfg.categories.map((c) => ({
    ...c,
    elements: c.elements.map((e) => ({ ...e, z: ++z, cat: c.id, mass: data.repos.filter((r) => uses(e, r)).length })),
  }));
  const all = cats.flatMap((c) => c.elements);
  const hot = new Set(
    all.filter((e) => e.mass > 0 && e.chip !== false && e.cat !== cats[0].id).sort((a, b) => b.mass - a.mass).slice(0, 6).map((e) => e.s),
  );

  const cols = layout(cats);
  const C = cols.length;
  const pitch = Math.min(62, (W - 2 * PAD + GAP) / C);
  const tw = pitch - GAP, th = ROW_PITCH - GAP;
  const x0 = (W - (C * pitch - GAP)) / 2, y0 = PAD;
  const H = y0 + ROWS * ROW_PITCH - GAP + PAD;
  const X = (col) => x0 + col * pitch, Y = (row) => y0 + (row - 1) * ROW_PITCH;

  let tiles = '';
  let pulse = 0;
  cols.forEach((col, ci) => {
    const color = t.cats[col.cat];
    for (let row = col.from; row <= col.to; row++) {
      const x = r1(X(ci)), y = r1(Y(row));
      const el = row >= col.first ? col.items[row - col.first] : null;
      if (!el) {
        tiles += `<g class="el" style="animation-delay:${ci * 55}ms"><rect x="${x}" y="${y}" width="${r1(tw)}" height="${th}" rx="6" stroke="${color}" stroke-opacity=".28" stroke-dasharray="3 3"/><text x="${r1(x + tw / 2)}" y="${y + 36}" text-anchor="middle" class="sans" font-size="16" fill="${color}" fill-opacity=".3">?</text></g>`;
        continue;
      }
      const glow = hot.has(el.s)
        ? `<rect class="hot" x="${x}" y="${y}" width="${r1(tw)}" height="${th}" rx="6" stroke="${color}" stroke-width="2" filter="url(#glow)" style="animation-delay:${r1(pulse++ * 0.7)}s"/>`
        : '';
      tiles += `<g class="el" style="animation-delay:${ci * 55}ms">${glow}
<rect x="${x}" y="${y}" width="${r1(tw)}" height="${th}" rx="6" fill="${color}" fill-opacity="${t.tileFill}" stroke="${color}" stroke-opacity="${t.tileStroke}"/>
<text x="${r1(x + 5)}" y="${y + 12}" class="mono" font-size="8" fill="${t.faint}">${el.z}</text>
${el.mass ? `<text x="${r1(x + tw - 5)}" y="${y + 12}" text-anchor="end" class="mono" font-size="8" font-weight="700" fill="${color}">${el.mass}</text>` : ''}
<text x="${r1(x + tw / 2)}" y="${y + 37}" text-anchor="middle" class="sans" font-size="20" font-weight="700" fill="${color}">${esc(el.s)}</text>
<text x="${r1(x + tw / 2)}" y="${y + th - 8}" text-anchor="middle" class="sans" font-size="8"${fit(el.n, 8, tw - 6)} fill="${t.muted}">${esc(el.n)}</text></g>`;
    }
  });

  // --- title, legend and key in the top-middle gap --------------------------
  const tx = X(2) + 2;
  const keyCol = C - 4;
  const kx = X(keyCol), ky = Y(1), kw = 2 * pitch - GAP, kh = 2 * ROW_PITCH - GAP;
  const key = all[0];
  const kc = t.cats[key.cat];
  const textMax = kx - tx - 70;

  let legend = '';
  let lx = tx, ly = Y(2) + 38;
  cats.forEach((c, i) => {
    const w = textWidth(c.label, 10, 0.62) + 26;
    if (lx + w > tx + textMax && lx > tx) {
      lx = tx;
      ly += 16;
    }
    legend += `<g class="lg" style="animation-delay:${400 + i * 70}ms"><rect x="${r1(lx)}" y="${ly - 8}" width="9" height="9" rx="2" fill="${t.cats[c.id]}" fill-opacity=".25" stroke="${t.cats[c.id]}"/><text x="${r1(lx + 14)}" y="${ly}" class="mono" font-size="10" fill="${t.muted}">${esc(c.label)}</text></g>`;
    lx += w;
  });

  const note = (label, y, tx2) =>
    `<text x="${r1(kx - 30)}" y="${y + 3}" text-anchor="end" class="mono" font-size="9" fill="${t.faint}">${label}</text><path d="M${r1(kx - 26)} ${y}H${r1(tx2)}" stroke="${t.faint}" stroke-width=".8" stroke-dasharray="2 2"/><circle cx="${r1(tx2)}" cy="${y}" r="1.8" fill="${t.faint}"/>`;

  const keyTile = `
<rect x="${r1(kx)}" y="${ky}" width="${r1(kw)}" height="${kh}" rx="9" fill="${kc}" fill-opacity="${t.tileFill * 1.4}" stroke="${kc}" stroke-opacity=".75" stroke-width="1.4"/>
<text x="${r1(kx + 9)}" y="${ky + 19}" class="mono" font-size="12" fill="${t.faint}">${key.z}</text>
<text x="${r1(kx + kw - 9)}" y="${ky + 19}" text-anchor="end" class="mono" font-size="12" font-weight="700" fill="${kc}">${key.mass}</text>
<text x="${r1(kx + kw / 2)}" y="${ky + 72}" text-anchor="middle" class="sans" font-size="42" font-weight="700" fill="${kc}">${esc(key.s)}</text>
<text x="${r1(kx + kw / 2)}" y="${ky + kh - 14}" text-anchor="middle" class="sans" font-size="12" fill="${t.muted}">${esc(key.n)}</text>
${note('atomic no.', ky + 15, kx + 6)}
${note('symbol', ky + 58, kx + kw / 2 - 26)}
${note('name', ky + kh - 18, kx + kw / 2 - 32)}
<path d="M${r1(kx + kw - 3)} ${ky + 15}H${r1(X(C - 2) + 5)}" stroke="${t.faint}" stroke-width=".8" stroke-dasharray="2 2"/>
<circle cx="${r1(kx + kw - 3)}" cy="${ky + 15}" r="1.8" fill="${t.faint}"/>
${['public', 'repos', 'using it'].map((w, i) => `<text x="${r1(X(C - 2) + 8)}" y="${ky + 18 + i * 11}" class="mono" font-size="9" fill="${t.faint}">${w}</text>`).join('')}`;

  const css = `
.el{opacity:0;animation:in .7s cubic-bezier(.2,.7,.2,1) forwards}
.lg{opacity:0;animation:in .6s ease forwards}
@keyframes in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.hot{opacity:0;animation:hot 4.2s ease-in-out infinite}
@keyframes hot{0%,100%{opacity:0}50%{opacity:.85}}`;

  const defs = `<filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>`;

  const body = `
${panel(t, W, H)}
<text x="${r1(tx)}" y="${Y(1) + 14}" class="mono" font-size="11" fill="${t.amber}">// fig. 2 — the periodic table of my stack</text>
<text x="${r1(tx - 1)}" y="${Y(1) + 44}" class="sans" font-size="26" font-weight="700" letter-spacing="-.4" fill="${t.text}">Elements I build with</text>
<text x="${r1(tx)}" y="${Y(1) + 66}" class="sans" font-size="12" fill="${t.muted}">The corner number counts my public repos using each one,</text>
<text x="${r1(tx)}" y="${Y(1) + 82}" class="sans" font-size="12" fill="${t.muted}">recounted from their manifests every day. Glowing: most used.</text>
${legend}
${keyTile}
${tiles}`;

  return doc({
    w: W,
    h: H,
    title: 'The periodic table of my stack',
    desc: cats.map((c) => `${c.label}: ${c.elements.map((e) => e.n + (e.mass ? ` (${e.mass} repos)` : '')).join(', ')}`).join('. '),
    css,
    defs,
    body,
  });
}
