import { doc, mix, panel } from '../lib/svg.mjs';

const W = 840, H = 190;

export function coffee(t) {
  const cx = 150;
  // Three wisps, each with its own sway and height, so they never move in step.
  const steam = [
    [-17, 7, 24, 1.1],
    [1, -9, 30, 0],
    [18, 6, 20, 2.1],
  ]
    .map(
      ([dx, sway, rise, delay]) =>
        `<path class="steam" d="M${cx + dx} 80c${sway} -${rise * 0.4} ${-sway} -${rise * 0.6} 0 -${rise}s${sway} -${rise * 0.7} ${sway * 0.4} -${rise * 1.2}" stroke="${t.muted}" stroke-width="2.6" stroke-linecap="round" style="animation-delay:${delay}s"/>`,
    )
    .join('');

  const css = `
.steam{opacity:0;transform-box:fill-box;transform-origin:bottom;animation:steam 3.2s ease-in-out infinite}
@keyframes steam{0%{opacity:0;transform:translateY(8px) scaleY(.7)}35%{opacity:.55}100%{opacity:0;transform:translateY(-16px) scaleY(1.05)}}`;

  const defs = `
<radialGradient id="crema" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#b8743a"/><stop offset=".6" stop-color="#6b3714"/><stop offset="1" stop-color="#3a1c09"/></radialGradient>
<linearGradient id="cup" x1="0" x2="1"><stop offset="0" stop-color="${t.cup}"/><stop offset=".7" stop-color="${t.cup}"/><stop offset="1" stop-color="${t.cupShade}"/></linearGradient>`;

  const body = `
${panel(t, W, H)}
<ellipse cx="${cx}" cy="156" rx="80" ry="13" fill="${mix(t.bg2, t.amberLo, 0.25)}" stroke="${t.stroke}"/>
<ellipse cx="${cx}" cy="153" rx="46" ry="6" fill="${mix(t.bg2, t.amberLo, 0.12)}"/>
${steam}
<path d="M${cx + 48} 98c30 -4 32 34 -2 34" stroke="${t.cup}" stroke-width="8" stroke-linecap="round"/>
<path d="M${cx + 48} 98c30 -4 32 34 -2 34" stroke="${t.cupShade}" stroke-width="8" stroke-linecap="round" opacity=".35"/>
<path d="M${cx - 52} 88H${cx + 52}C${cx + 50} 120 ${cx + 42} 142 ${cx + 26} 152H${cx - 26}C${cx - 42} 142 ${cx - 50} 120 ${cx - 52} 88Z" fill="url(#cup)" stroke="${t.cupShade}"/>
<ellipse cx="${cx}" cy="88" rx="52" ry="10" fill="${t.cup}" stroke="${t.cupShade}"/>
<ellipse cx="${cx}" cy="90" rx="45" ry="7.2" fill="url(#crema)"/>
<path d="M${cx} 94c-9 -3 -11 -7 -6 -8 3 -.5 5 1 6 2 1 -1 3 -2.5 6 -2 5 1 3 5 -6 8Z" fill="#e7b98a" opacity=".85"/>

<text x="290" y="58" class="mono" font-size="11" fill="${t.amber}">// fig. 4 — fuel</text>
<text x="288" y="104" class="serif" font-style="italic" font-size="40" fill="${t.text}">Vai um cafézinho?</text>
<text x="290" y="134" class="sans" font-size="13.5" fill="${t.muted}">Brazilian for “fancy a coffee?”, which is how most good conversations start here.</text>
<text x="290" y="155" class="sans" font-size="13.5" fill="${t.muted}">Got an idea, a job, or a bug worth keeping? Say hi below.</text>`;

  return doc({
    w: W,
    h: H,
    title: 'Vai um cafézinho?',
    desc: 'A steaming cup of coffee with a heart in the crema. Brazilian for "fancy a coffee?". Contact links follow.',
    css,
    defs,
    body,
  });
}
