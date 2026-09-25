import { r1, smoothClosed } from '../../lib/svg.mjs';

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

// Each project gets its own lump of amber and its own inclusion.
export function specimenArt(t, R, index, id) {
  const pts = Array.from({ length: 9 }, (_, k) => {
    const a = (k / 9) * Math.PI * 2 + (R() - 0.5) * 0.35;
    const rad = 46 * (0.8 + R() * 0.3);
    return [Math.cos(a) * rad * 0.85, Math.sin(a) * rad * 1.1];
  });
  const blob = smoothClosed(pts);
  const kind = index % 4;
  const tilt = r1(R() * 30 - 15);

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

  const body = `<g transform="translate(68 82)">
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
</g>`;

  return { css, defs, body };
}
