import { r1 } from '../../lib/svg.mjs';

// Label colours, one pair per card: [sun and grid, sky].
const LABELS = [
  ['#ff2357', '#1447e6'],
  ['#f6339a', '#4f39f6'],
  ['#00d2ef', '#9810fa'],
  ['#fcbb00', '#e30076'],
];

// A game cartridge whose label is a small synthwave landscape: the sun, the
// ridge and the grid are seeded by the repo name.
export function specimenArt(t, R, index, id) {
  const [hot, sky] = LABELS[index % LABELS.length];
  const sunX = r1((R() - 0.5) * 18);
  let ridge = 'M-29 16';
  for (let x = -29; x <= 29; x += 5.8) ridge += `L${r1(x)} ${r1(16 - 2 - R() * (Math.abs(x - sunX) < 10 ? 4 : 11))}`;
  ridge += 'L29 16Z';

  let grid = '';
  for (const y of [17.2, 18.8, 21, 24, 28]) grid += `M-29 ${y}H29`;
  for (let k = -4; k <= 4; k++) grid += `M${r1(k * 1.6)} 16L${r1(k * 8)} 30`;

  const c = t.cart;
  const css = `
.float{animation:float 6s ease-in-out infinite alternate}
@keyframes float{from{transform:translateY(-3px)}to{transform:translateY(3px)}}
.sweep{animation:sweep 7s ease-in-out infinite;animation-delay:${r1(index * 1.3)}s}
@keyframes sweep{0%,70%{transform:translateX(-90px)}90%,100%{transform:translateX(100px)}}
.sun{animation:sun 4s ease-in-out infinite alternate}@keyframes sun{from{opacity:.85}to{opacity:1}}`;

  const defs = `
<linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07071a"/><stop offset=".6" stop-color="${sky}"/><stop offset="1" stop-color="${hot}"/></linearGradient>
<linearGradient id="${id}sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="${hot}"/></linearGradient>
<linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="${id}m"><rect x="-30" y="-30" width="60" height="60" fill="#fff"/>${[5, 8, 10.6, 13].map((y, k) => `<rect x="-30" y="${y}" width="60" height="${r1(0.9 + k * 0.45)}" fill="#000"/>`).join('')}</mask>
<clipPath id="${id}c"><rect x="-29" y="-30" width="58" height="60" rx="2.5"/></clipPath>
<filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>`;

  const body = `<g transform="translate(68 82)">
  <ellipse cx="0" cy="62" rx="34" ry="5" fill="${t.ink}" opacity="${t.inkOpacity}" filter="url(#${id}b)"/>
  <g class="float">
    <path d="M-36 -48H36V41H27V47H-27V41H-36Z" fill="${c.body}" stroke="${c.edge}"/>
    <path d="M-36 -48H36V-44H-36Z" fill="${c.edge}" fill-opacity=".5"/>
    ${[-41.5, -38.5, -35.5].map((y) => `<path d="M-33 ${y}H33" stroke="${c.ridge}" stroke-width="1.4"/>`).join('')}
    <path d="M-34 -30V36M34 -30V36" stroke="${c.ridge}" stroke-width="1"/>
    <rect x="-30.5" y="-31.5" width="61" height="63" rx="3" fill="${c.edge}"/>
    <g clip-path="url(#${id}c)">
      <rect x="-30" y="-30" width="60" height="46" fill="url(#${id}sky)"/>
      <circle class="sun" cx="${sunX}" cy="4" r="14" fill="url(#${id}sun)" mask="url(#${id}m)"/>
      <path d="${ridge}" fill="#0a0a16"/>
      <rect x="-30" y="16" width="60" height="16" fill="#0a0a16"/>
      <path d="${grid}" stroke="${hot}" stroke-width=".6" stroke-opacity=".9"/>
      <text x="-25" y="-21" class="display" font-size="7.5" font-weight="800" letter-spacing="1" fill="#fff">KWK</text>
      <g class="sweep"><rect x="-20" y="-40" width="26" height="80" fill="url(#${id}s)" transform="skewX(-18)"/></g>
    </g>
    <path d="M-20 41H20" stroke="${c.ridge}" stroke-width="1.2"/>
  </g>
</g>`;

  return { css, defs, body };
}
