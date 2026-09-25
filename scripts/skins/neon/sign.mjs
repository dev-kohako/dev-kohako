import { r1 } from '../../lib/svg.mjs';

// The coffee cup as a neon sign: pink tubes for the cup, blue for the steam.
export function cupArt(t, cx) {
  const tube = (d, color, extra = '') =>
    `<path d="${d}" stroke="${color}" stroke-width="7" stroke-opacity=".22" stroke-linecap="round" stroke-linejoin="round"${extra}/><path d="${d}" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;

  const steam = [
    [-17, 7, 24, 1.1],
    [1, -9, 30, 0],
    [18, 6, 20, 2.1],
  ]
    .map(([dx, sway, rise, delay]) => {
      const d = `M${cx + dx} 78c${sway} -${r1(rise * 0.4)} ${-sway} -${r1(rise * 0.6)} 0 -${rise}s${sway} -${r1(rise * 0.7)} ${r1(sway * 0.4)} -${r1(rise * 1.2)}`;
      return `<g class="steam" style="animation-delay:${delay}s">${tube(d, t.blue)}</g>`;
    })
    .join('');

  const cup = `M${cx - 50} 90H${cx + 50}C${cx + 48} 120 ${cx + 40} 140 ${cx + 25} 150H${cx - 25}C${cx - 40} 140 ${cx - 48} 120 ${cx - 50} 90Z`;
  const handle = `M${cx + 47} 100c30 -4 32 32 -3 33`;
  const heart = `M${cx} 132c-11 -7 -14 -14 -9 -18 3 -2.5 7 -1 9 2 2 -3 6 -4.5 9 -2 5 4 2 11 -9 18Z`;

  const css = `
.steam{opacity:0;animation:steam 3.2s ease-in-out infinite}
@keyframes steam{0%{opacity:0;transform:translateY(6px)}35%{opacity:1}100%{opacity:0;transform:translateY(-12px)}}
.sign{animation:sign 9s linear infinite}
@keyframes sign{0%,62%,64%,67%,100%{opacity:1}63%,65.5%{opacity:.3}}`;

  const defs = `
<filter id="tube" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<radialGradient id="wall" r="50%"><stop offset="0" stop-color="${t.pink}" stop-opacity="${t.halo}"/><stop offset="1" stop-color="${t.pink}" stop-opacity="0"/></radialGradient>`;

  const body = `<ellipse cx="${cx}" cy="112" rx="120" ry="80" fill="url(#wall)"/>
<g filter="url(#tube)">
${steam}
<g class="sign">${tube(cup, t.pink)}${tube(handle, t.pink)}${tube(`M${cx - 70} 162H${cx + 70}`, t.pink)}${tube(heart, t.red)}</g>
</g>`;

  return {
    css,
    defs,
    body,
    desc: 'A neon sign of a coffee cup with a heart, blue neon steam rising. Brazilian for "fancy a coffee?". Contact links follow.',
  };
}
