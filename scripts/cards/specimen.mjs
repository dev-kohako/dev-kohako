import { doc, esc, fit, panel, r1, rng, smoothClosed, textWidth, wrap } from '../lib/svg.mjs';
import { uses } from '../lib/github.mjs';

// Cards sit two to a row at 50% each. The gutter between them is transparent
// space inside the SVG (right of even cards, left of odd ones), so the outer
// edges line up with the full-width panels above and below.
const W = 410, H = 170, GUTTER = 10;

// Each project gets its own lump of amber and its own inclusion, seeded by the
// repo name so it never changes between builds.
function inclusion(kind, R) {
  if (kind === 0) {
    // a fern frond
    let d = 'M-4 34C-2 12 2 -8 10 -30';
    let leaves = '';
    for (let k = 0; k < 7; k++) {
      const tt = k / 7, x = -4 + tt * 13, y = 34 - tt * 62, len = 13 - k * 1.3;
      leaves += `<path d="M${r1(x)} ${r1(y)}q${r1(-len * 0.6)} ${r1(-2)} ${r1(-len)} ${r1(-7)}M${r1(x)} ${r1(y)}q${r1(len * 0.6)} ${r1(-4)} ${r1(len)} ${r1(-10)}"/>`;
    }
    return `<g stroke="#4a2305" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".75"><path d="${d}"/>${leaves}</g>`;
  }
  if (kind === 1) {
    // a cloud of trapped air
    let b = '';
    for (let k = 0; k < 14; k++) {
      const r = 1 + R() * 4.5;
      b += `<circle cx="${r1((R() - 0.5) * 60)}" cy="${r1((R() - 0.5) * 70)}" r="${r1(r)}" fill="#fff0c2" fill-opacity=".2" stroke="#fff6da" stroke-opacity=".6" stroke-width=".7"/>`;
    }
    return b;
  }
  if (kind === 2) {
    // a winged seed
    return `<g opacity=".72"><ellipse cx="0" cy="18" rx="6" ry="8" fill="#4a2305"/><path d="M0 12C-22 -8 -14 -40 2 -38C14 -30 12 -6 0 12Z" fill="#6b3508" fill-opacity=".7" stroke="#3a1a03" stroke-width=".8"/><path d="M0 12C-4 -6 -2 -24 2 -36" stroke="#3a1a03" stroke-width=".7"/></g>`;
  }
  // a small fly
  return `<g fill="#2a1003" opacity=".75" transform="rotate(${r1(R() * 60 - 30)})"><ellipse cx="0" cy="6" rx="5" ry="9"/><circle cx="0" cy="-6" r="4"/><ellipse cx="-9" cy="-2" rx="9" ry="4" fill="#f7e2b0" fill-opacity=".35" stroke="#2a1003" stroke-width=".6" transform="rotate(25 -9 -2)"/><ellipse cx="9" cy="-2" rx="9" ry="4" fill="#f7e2b0" fill-opacity=".35" stroke="#2a1003" stroke-width=".6" transform="rotate(-25 9 -2)"/><path d="M-4 2L-11 10M4 2L11 10M-4 6L-9 16M4 6L9 16" stroke="#2a1003" stroke-width="1"/></g>`;
}

export function specimen(t, cfg, data, feat, index) {
  const repo = data.repos.find((r) => r.name === feat.repo);
  if (!repo) throw new Error(`featured repo "${feat.repo}" is not a public repo of ${data.login}`);
  const R = rng(repo.name);
  const id = `s${index}`;

  const pts = Array.from({ length: 9 }, (_, k) => {
    const a = (k / 9) * Math.PI * 2 + (R() - 0.5) * 0.35;
    const rad = 46 * (0.8 + R() * 0.3);
    return [Math.cos(a) * rad * 0.85, Math.sin(a) * rad * 1.1];
  });
  const blob = smoothClosed(pts);
  const kind = index % 4;
  const tilt = r1(R() * 30 - 15);

  // Rarest first: what sets this project apart, not the React every card has.
  const cats = Object.fromEntries(cfg.categories.flatMap((c) => c.elements.map((e) => [e.s, c.id])));
  const mass = (e) => data.repos.filter((r) => uses(e, r)).length;
  const tech = cfg.categories
    .flatMap((c) => (c.id === cfg.categories[0].id ? [] : c.elements))
    .filter((e) => e.chip !== false && uses(e, repo))
    .map((e, order) => ({ ...e, order, mass: mass(e) }))
    .sort((a, b) => a.mass - b.mass || a.order - b.order);

  const x = 138, maxW = W - x - 20;
  const lines = wrap(feat.blurb ?? repo.description ?? '', maxW, 12.5, 0.485, 3);

  let chips = '', cx = x;
  for (const e of tech) {
    const w = textWidth(e.n, 9.5, 0.62) + 16;
    if (cx + w > W - (repo.homepage ? 62 : 20)) break;
    const c = t.cats[cats[e.s]];
    chips += `<rect x="${r1(cx)}" y="138" width="${r1(w)}" height="19" rx="9.5" fill="${c}" fill-opacity=".1" stroke="${c}" stroke-opacity=".45"/><text x="${r1(cx + w / 2)}" y="151" text-anchor="middle" class="mono" font-size="9.5" fill="${c}">${esc(e.n)}</text>`;
    cx += w + 6;
  }

  const css = `
.float{animation:float 6s ease-in-out infinite alternate}
@keyframes float{from{transform:translateY(-3px)}to{transform:translateY(3px)}}
.sweep{animation:sweep 7s ease-in-out infinite;animation-delay:${r1(index * 1.3)}s}
@keyframes sweep{0%,70%{transform:translateX(-110px)}90%,100%{transform:translateX(120px)}}`;

  const defs = `
<radialGradient id="${id}g" cx="36%" cy="30%" r="80%"><stop offset="0" stop-color="#fff0bd"/><stop offset=".22" stop-color="#ffc94a"/><stop offset=".55" stop-color="#ee9410"/><stop offset=".85" stop-color="#b3560a"/><stop offset="1" stop-color="#6b2d04"/></radialGradient>
<radialGradient id="${id}e" r="55%"><stop offset=".6" stop-color="#3a1602" stop-opacity="0"/><stop offset="1" stop-color="#3a1602" stop-opacity=".55"/></radialGradient>
<linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
<filter id="${id}h"><feGaussianBlur stdDeviation=".5"/></filter>
<clipPath id="${id}c"><path d="${blob}"/></clipPath>`;

  const body = `<g transform="translate(${index % 2 ? GUTTER : 0} 0)">
${panel(t, W, H)}
<rect x="14" y="14" width="108" height="142" rx="10" fill="${t.bg2}"/>
<g transform="translate(68 82)">
  <ellipse cx="0" cy="62" rx="36" ry="5" fill="${t.ink}" opacity="${t.inkOpacity}" filter="url(#${id}b)"/>
  <g class="float"><g transform="rotate(${tilt})">
    <path d="${blob}" fill="url(#${id}g)"/>
    <g clip-path="url(#${id}c)">
      <g filter="url(#${id}h)">${inclusion(kind, R)}</g>
      <path d="${blob}" fill="url(#${id}e)"/>
      <g class="sweep"><rect x="-30" y="-70" width="40" height="140" fill="url(#${id}s)" transform="skewX(-18)"/></g>
    </g>
    <ellipse cx="-18" cy="-28" rx="7" ry="3.5" transform="rotate(-38 -18 -28)" fill="#fff" opacity=".85"/>
    <path d="${blob}" stroke="#ffe6ad" stroke-opacity=".4"/>
  </g></g>
</g>
<text x="${x}" y="34" class="mono" font-size="9" letter-spacing="1.6" fill="${t.amber}">SPECIMEN No. ${String(index + 1).padStart(3, '0')}${
    repo.primary ? `<tspan fill="${t.faint}" letter-spacing=".4">  ·  ${esc(repo.primary.name)}</tspan>` : ''
  }</text>
<text x="${W - 20}" y="34" text-anchor="end" class="mono" font-size="11" fill="${t.muted}">★ ${repo.stars}</text>
<text x="${x}" y="62" class="sans" font-size="20" font-weight="700" letter-spacing="-.3" fill="${t.text}"${fit(repo.name, 20, maxW, 0.56)}>${esc(repo.name)}</text>
${lines.map((l, k) => `<text x="${x}" y="${86 + k * 16}" class="sans" font-size="12.5" fill="${t.muted}">${esc(l)}</text>`).join('\n')}
${chips}
${repo.homepage ? `<text x="${W - 20}" y="152" text-anchor="end" class="mono" font-size="10.5" font-weight="700" fill="${t.amber}">live ↗</text>` : ''}
</g>`;

  return doc({
    w: W + GUTTER,
    h: H,
    title: repo.name,
    desc: `${feat.blurb ?? repo.description} ${repo.stars} stars.${tech.length ? ` Built with ${tech.map((e) => e.n).join(', ')}.` : ''}`,
    css,
    defs,
    body,
  });
}
