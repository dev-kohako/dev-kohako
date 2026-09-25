import { mix, poly, r1, rng } from '../../lib/svg.mjs';

// An isometric bedroom-studio, lit blue from the desk side and pink from the
// TV side, like the one on josephkawe.com. Everything is boxes on a 10×10
// floor: x runs down-right, y down-left, z up.
const C30 = Math.cos(Math.PI / 6);

// The classic crab invader, two frames.
const INVADER = [
  ['..X.....X..', '...X...X...', '..XXXXXXX..', '.XX.XXX.XX.', 'XXXXXXXXXXX', 'X.XXXXXXX.X', 'X.X.....X.X', '...XX.XX...'],
  ['..X.....X..', 'X..X...X..X', 'X.XXXXXXX.X', 'XXX.XXX.XXX', 'XXXXXXXXXXX', '.XXXXXXXXX.', '..X.....X..', '.X.......X.'],
];

export function room(t, ox, oy, s) {
  const P = (x, y, z) => [ox + (x - y) * C30 * s, oy + (x + y) * 0.5 * s - z * s];
  const q = (pts, fill, extra = '') => `<polygon points="${poly(pts)}" fill="${fill}"${extra}/>`;
  const line = (a, b, stroke, extra = '') => `<path d="M${r1(a[0])} ${r1(a[1])}L${r1(b[0])} ${r1(b[1])}" stroke="${stroke}"${extra}/>`;
  const r = t.room;
  // Faces turned to the left catch the blue light, faces turned right the pink.
  const tone = (base) => ({
    top: mix(base, '#ffffff', r.lift),
    px: mix(mix(base, t.pink, 0.3), '#000000', r.dim),
    py: mix(mix(base, t.blue, 0.3), '#000000', r.dim + 0.12),
  });
  const box = (x, y, z, dx, dy, dz, c) => {
    const x1 = x + dx, y1 = y + dy, z1 = z + dz;
    return (
      q([P(x1, y, z), P(x1, y1, z), P(x1, y1, z1), P(x1, y, z1)], c.px) +
      q([P(x, y1, z), P(x1, y1, z), P(x1, y1, z1), P(x, y1, z1)], c.py) +
      q([P(x, y, z1), P(x1, y, z1), P(x1, y1, z1), P(x, y1, z1)], c.top)
    );
  };
  // Text laid flat on a wall: wall R runs along +x, wall L is read front to back.
  const onWallR = (x, z) => { const [X, Y] = P(x, 0.03, z); return `matrix(${r1(C30 * 100) / 100} .5 0 1 ${r1(X)} ${r1(Y)})`; };
  const onWallL = (y, z) => { const [X, Y] = P(0.03, y, z); return `matrix(${r1(C30 * 100) / 100} -.5 0 1 ${r1(X)} ${r1(Y)})`; };

  const out = [];
  const floorPts = [P(0, 0, 0), P(10, 0, 0), P(10, 10, 0), P(0, 10, 0)];

  // floor slab, planks, pools of light
  out.push(box(0, 0, -0.7, 10, 10, 0.7, { top: r.floor, px: mix(mix(r.floor, t.pink, 0.2), '#000000', 0.35), py: mix(mix(r.floor, t.blue, 0.2), '#000000', 0.45) }));
  for (let k = 1; k < 10; k++) out.push(line(P(0, k, 0), P(10, k, 0), r.plank, ' stroke-width=".8"'));
  out.push(`<g clip-path="url(#rfloor)"><ellipse cx="${r1(P(2.5, 3.5, 0)[0])}" cy="${r1(P(2.5, 3.5, 0)[1])}" rx="120" ry="60" fill="url(#rglowb)"/><ellipse cx="${r1(P(7, 2, 0)[0])}" cy="${r1(P(7, 2, 0)[1])}" rx="110" ry="55" fill="url(#rglowp)"/></g>`);

  // rug
  out.push(q([P(2.8, 4.8, 0.01), P(8.4, 4.8, 0.01), P(8.4, 8.9, 0.01), P(2.8, 8.9, 0.01)], r.rug));
  out.push(q([P(3.1, 5.1, 0.02), P(8.1, 5.1, 0.02), P(8.1, 8.6, 0.02), P(3.1, 8.6, 0.02)], 'none', ` stroke="${t.pink}" stroke-opacity=".45" stroke-width=".8"`));

  // walls
  out.push(box(-0.4, -0.4, 0, 0.4, 0.4, 5.5, { top: r.wallTop, px: r.wallTop, py: r.wallTop }));
  out.push(box(0, -0.4, 0, 10, 0.4, 5.5, { top: r.wallTop, px: r.wallCap, py: r.wallR }));
  out.push(box(-0.4, 0, 0, 0.4, 10, 5.5, { top: r.wallTop, px: r.wallL, py: r.wallCap }));
  out.push(`<g clip-path="url(#rwalll)"><ellipse cx="${r1(P(0, 3.2, 3.4)[0])}" cy="${r1(P(0, 3.2, 3.4)[1])}" rx="95" ry="85" fill="url(#rglowb)"/></g>`);
  out.push(`<g clip-path="url(#rwallr)"><ellipse cx="${r1(P(6.8, 0, 2.8)[0])}" cy="${r1(P(6.8, 0, 2.8)[1])}" rx="100" ry="80" fill="url(#rglowp)"/></g>`);

  // window with a few stars
  const win = [P(1.3, 0.02, 2.3), P(3.4, 0.02, 2.3), P(3.4, 0.02, 4.6), P(1.3, 0.02, 4.6)];
  out.push(q(win, 'url(#rsky)', ` stroke="${r.frame}" stroke-width="2"`));
  out.push(line(P(2.35, 0.02, 2.3), P(2.35, 0.02, 4.6), r.frame, ' stroke-width="1.5"'));
  out.push(line(P(1.3, 0.02, 3.45), P(3.4, 0.02, 3.45), r.frame, ' stroke-width="1.5"'));
  [[1.6, 4.2, 0], [2.9, 4.0, 1.3], [2.1, 2.9, 2.1], [3.1, 3.1, 0.7]].forEach(([x, z, d]) => {
    const [cx, cy] = P(x, 0.02, z);
    out.push(`<circle class="twinkle" cx="${r1(cx)}" cy="${r1(cy)}" r="1" fill="#ffffff" style="animation-delay:${d}s"/>`);
  });

  // neon along the top of both walls, and signs
  out.push(`<g filter="url(#rneon)" stroke-linecap="round">${line(P(0.03, 0.3, 5.2), P(0.03, 9.7, 5.2), t.blue, ' stroke-width="2.2"')}${line(P(0.3, 0.03, 5.2), P(9.7, 0.03, 5.2), t.pink, ' stroke-width="2.2"')}</g>`);
  out.push(`<g class="flick" filter="url(#rneon)"><text transform="${onWallR(5.6, 4.35)}" class="display" font-size="17" font-weight="800" letter-spacing="2" fill="${t.pink}">KWK</text></g>`);
  out.push(`<g filter="url(#rneon)"><text transform="${onWallL(4.3, 4.2)}" class="display" font-size="15" font-weight="700" fill="${t.blue}">&lt;/&gt;</text></g>`);

  // TV with an invader on it
  out.push(box(4.9, 0.02, 1.65, 3.8, 0.16, 2.05, tone(r.dark)));
  const scr = [P(5.02, 0.19, 1.77), P(8.58, 0.19, 1.77), P(8.58, 0.19, 3.58), P(5.02, 0.19, 3.58)];
  out.push(q(scr, 'url(#rtv)'));
  const px = 0.13, x0 = 6.8 - (11 * px) / 2, z0 = 2.7 + (8 * px) / 2;
  INVADER.forEach((frame, f) => {
    let d = '';
    frame.forEach((row, ri) =>
      [...row].forEach((ch, ci) => {
        if (ch !== 'X') return;
        const x = x0 + ci * px, z = z0 - ri * px;
        const pts = [P(x, 0.2, z), P(x + px, 0.2, z), P(x + px, 0.2, z - px), P(x, 0.2, z - px)];
        d += `M${pts.map((p) => `${r1(p[0])} ${r1(p[1])}`).join('L')}Z`;
      }),
    );
    out.push(`<path class="inv${f}" d="${d}" fill="${t.pink}" filter="url(#rneon)"/>`);
  });
  out.push(q(scr, 'url(#rscan)', ' class="scan"'));

  // rack and the NES
  out.push(box(4.7, 0.2, 0, 4.2, 1.2, 0.8, tone(r.furniture)));
  out.push(box(5.1, 0.45, 0.8, 1.3, 0.85, 0.3, { top: '#d9d9de', px: '#9f9fa9', py: '#bcbcc4' }));
  out.push(q([P(5.1, 1.3, 0.8), P(6.4, 1.3, 0.8), P(6.4, 1.3, 0.93), P(5.1, 1.3, 0.93)], '#3f3f46'));
  out.push(q([P(5.22, 1.3, 1.0), P(5.3, 1.3, 1.0), P(5.3, 1.3, 1.05), P(5.22, 1.3, 1.05)], '#ff2357', ' class="led"'));

  // desk, keyboard, monitor with code on it
  out.push(box(0.05, 1.3, 0, 1.9, 0.15, 2.25, tone(r.furniture)));
  out.push(box(0.05, 4.1, 0, 1.9, 1.1, 2.25, tone(r.furniture)));
  out.push(box(0, 1.2, 2.25, 2.3, 4.1, 0.2, tone(r.desk)));
  out.push(`<g filter="url(#rneon)">${line(P(2.3, 1.3, 2.22), P(2.3, 5.2, 2.22), t.blue, ' stroke-width="1.6"')}</g>`);
  out.push(box(0.3, 2.95, 2.45, 0.5, 0.6, 0.05, tone(r.dark)));
  out.push(box(0.45, 3.1, 2.5, 0.2, 0.3, 0.55, tone(r.dark)));
  out.push(box(0.5, 1.85, 2.9, 0.14, 2.6, 1.55, tone(r.dark)));
  out.push(q([P(0.645, 1.95, 3.0), P(0.645, 4.35, 3.0), P(0.645, 4.35, 4.35), P(0.645, 1.95, 4.35)], 'url(#rmon)'));
  const R = rng('monitor');
  const ink = [t.pink, '#7aa2ff', '#e4e4e7', '#00d2ef', '#c07eff'];
  for (let k = 0; k < 8; k++) {
    const indent = [0, 0.2, 0.4, 0.4, 0.2, 0.4, 0.2, 0][k];
    const len = 0.4 + R() * 1.4;
    const z = 4.2 - k * 0.15, y0 = 4.2 - indent;
    const a = P(0.65, y0, z), b = P(0.65, Math.max(2.05, y0 - len), z);
    out.push(`<path class="code" d="M${r1(a[0])} ${r1(a[1])}L${r1(b[0])} ${r1(b[1])}" pathLength="1" stroke="${ink[k % ink.length]}" stroke-width="1.3" stroke-linecap="round" style="animation-delay:${r1(k * 0.45)}s"/>`);
  }

  // keyboard and mouse sit in front of the monitor, so they are drawn after it
  out.push(box(1.15, 2.5, 2.45, 0.55, 1.5, 0.07, { top: 'url(#rrgb)', px: '#18181b', py: '#111114' }));
  out.push(box(1.25, 4.35, 2.45, 0.3, 0.2, 0.08, tone(r.dark)));

  // gaming chair, turned to the desk
  const seat = tone(r.chair);
  out.push(box(2.75, 2.95, 0.02, 0.9, 0.9, 0.1, tone(r.dark)));
  out.push(box(3.12, 3.32, 0.12, 0.16, 0.16, 0.85, tone(r.dark)));
  out.push(box(2.6, 2.8, 0.97, 1.15, 1.2, 0.22, seat));
  out.push(box(2.8, 2.72, 1.5, 0.85, 0.1, 0.08, seat));
  out.push(box(3.6, 2.8, 1.19, 0.24, 1.2, 1.7, seat));
  out.push(box(3.62, 3.1, 2.89, 0.2, 0.6, 0.45, seat));
  out.push(line(P(3.84, 3.1, 1.35), P(3.84, 3.1, 2.75), t.pink, ' stroke-width="1.8" stroke-opacity=".9"'));
  out.push(line(P(3.84, 3.7, 1.35), P(3.84, 3.7, 2.75), t.pink, ' stroke-width="1.8" stroke-opacity=".9"'));
  out.push(box(2.8, 3.98, 1.5, 0.85, 0.1, 0.08, seat));

  // low table on the rug, with the controller on it
  out.push(box(4.5, 5.9, 0, 2.4, 1.5, 0.5, tone(r.table)));
  const tz = 0.51;
  out.push(q([P(5.2, 6.45, tz), P(6.1, 6.45, tz), P(6.1, 6.85, tz), P(5.2, 6.85, tz)], '#d4d4d8', ' stroke="#71717b" stroke-width=".5"'));
  out.push(q([P(5.3, 6.57, tz), P(5.55, 6.57, tz), P(5.55, 6.73, tz), P(5.3, 6.73, tz)], '#27272a'));
  for (const x of [5.78, 5.93]) out.push(`<circle cx="${r1(P(x, 6.65, tz)[0])}" cy="${r1(P(x, 6.65, tz)[1])}" r="1.6" fill="#e40014"/>`);

  // bookcase with figures and a plant on top
  out.push(box(0, 6.6, 0, 1.1, 2.7, 4.3, tone(r.furniture)));
  const R2 = rng('books');
  const colors = [t.pink, t.blue, '#ac4bff', '#fcbb00', '#00d2ef', '#e4e4e7', '#ff2357'];
  for (const [zb, zt] of [[0.15, 1.35], [1.5, 2.7], [2.85, 4.1]]) {
    out.push(q([P(1.105, 6.72, zb), P(1.105, 9.18, zb), P(1.105, 9.18, zt), P(1.105, 6.72, zt)], r.shelfHole));
    let y = 6.8;
    while (y < 8.9) {
      const w = 0.12 + R2() * 0.16, h = (zt - zb) * (0.55 + R2() * 0.4);
      if (y + w > 9.1) break;
      const c = colors[Math.floor(R2() * colors.length)];
      out.push(box(0.35, y, zb, 0.7, w, h, { top: mix(c, '#ffffff', 0.2), px: mix(c, '#000000', 0.15), py: mix(c, '#000000', 0.45) }));
      y += w + 0.03 + (R2() < 0.15 ? 0.25 : 0);
    }
  }
  out.push(box(0.3, 6.9, 4.3, 0.4, 0.4, 0.45, tone(t.pink)));
  out.push(box(0.35, 7.6, 4.3, 0.35, 0.35, 0.3, tone(t.blue)));
  out.push(box(0.3, 8.4, 4.3, 0.45, 0.45, 0.35, tone('#5b4636')));
  const [lx, ly] = P(0.52, 8.62, 4.75);
  out.push(`<g fill="${r.leaf}"><circle cx="${r1(lx)}" cy="${r1(ly - 4)}" r="5"/><circle cx="${r1(lx - 5)}" cy="${r1(ly)}" r="4"/><circle cx="${r1(lx + 5)}" cy="${r1(ly - 1)}" r="4"/></g>`);

  const clip = (pts) => `<polygon points="${poly(pts)}"/>`;
  const defs = `
<clipPath id="rfloor">${clip(floorPts)}</clipPath>
<clipPath id="rwalll">${clip([P(0, 0, 0), P(0, 10, 0), P(0, 10, 5.5), P(0, 0, 5.5)])}</clipPath>
<clipPath id="rwallr">${clip([P(0, 0, 0), P(10, 0, 0), P(10, 0, 5.5), P(0, 0, 5.5)])}</clipPath>
<radialGradient id="rglowb"><stop offset="0" stop-color="${t.blue}" stop-opacity="${r.glow}"/><stop offset="1" stop-color="${t.blue}" stop-opacity="0"/></radialGradient>
<radialGradient id="rglowp"><stop offset="0" stop-color="${t.pink}" stop-opacity="${r.glow}"/><stop offset="1" stop-color="${t.pink}" stop-opacity="0"/></radialGradient>
<linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1026"/><stop offset="1" stop-color="#27164a"/></linearGradient>
<linearGradient id="rtv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0410"/><stop offset="1" stop-color="#3a0a22"/></linearGradient>
<linearGradient id="rmon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060d2b"/><stop offset="1" stop-color="#0d1c52"/></linearGradient>
<linearGradient id="rscan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".07"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
<linearGradient id="rrgb" x1="0" x2="1"><stop offset="0" stop-color="${t.pink}"/><stop offset=".5" stop-color="#ac4bff"/><stop offset="1" stop-color="${t.blue}"/></linearGradient>
<filter id="rneon" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

  const css = `
.code{stroke-dasharray:1;stroke-dashoffset:1;animation:code 7.2s linear infinite}
@keyframes code{0%{stroke-dashoffset:1;opacity:1}9%{stroke-dashoffset:0}84%{stroke-dashoffset:0;opacity:1}92%,100%{stroke-dashoffset:0;opacity:0}}
.inv0{animation:inv0 1.1s steps(1) infinite}.inv1{opacity:0;animation:inv1 1.1s steps(1) infinite}
@keyframes inv0{50%,100%{opacity:0}}@keyframes inv1{50%,100%{opacity:1}}
.scan{animation:scan 3s ease-in-out infinite alternate}@keyframes scan{from{opacity:.3}to{opacity:1}}
.led{animation:led 2.4s steps(1) infinite}@keyframes led{80%{opacity:.25}}
.twinkle{animation:twinkle 2.8s ease-in-out infinite}@keyframes twinkle{50%{opacity:.2}}
.flick{animation:flick 7s linear infinite}
@keyframes flick{0%,40%,43%,47%,100%{opacity:1}41.5%,45%{opacity:.25}}`;

  return { defs, css, body: out.join('\n') };
}
