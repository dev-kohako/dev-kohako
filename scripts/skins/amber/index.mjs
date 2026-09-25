// 琥珀: a collection preserved in amber. Warm, museum-label typography,
// system fonts only.
import { esc, mix } from '../../lib/svg.mjs';
import { hero } from './hero.mjs';
import { specimenArt } from './specimen.mjs';
import { cupArt } from './cup.mjs';

const MODES = {
  dark: {
    bg: '#0f0b07',
    bg2: '#181109',
    stroke: '#33261a',
    text: '#f8ecd9',
    muted: '#bfa88c',
    faint: '#86725c',
    accent: '#f5a524',
    accentHi: '#ffd47e',
    accentLo: '#b8650f',
    ink: '#000000',
    inkOpacity: 0.5,
    sideMix: '#000000',
    contour: 0.09,
    levels: ['#241b12', '#5f350f', '#a0560d', '#e38c12', '#ffc54d'],
    shimmer: '#fff3cf',
    cats: { lang: '#f5a524', front: '#fb7185', state: '#a78bfa', back: '#34d399', data: '#38bdf8', ops: '#d9c6a8' },
    tileFill: 0.1,
    tileStroke: 0.45,
    cup: '#efe2cc',
    cupShade: '#bda98c',
  },
  light: {
    bg: '#fdf8ef',
    bg2: '#f7eddc',
    stroke: '#ebdcc2',
    text: '#2a1a0b',
    muted: '#6f583b',
    faint: '#a58c6b',
    accent: '#c46a05',
    accentHi: '#e8961a',
    accentLo: '#8d4b06',
    ink: '#5a3410',
    inkOpacity: 0.13,
    sideMix: '#3b1d05',
    contour: 0.13,
    levels: ['#ede1cc', '#f6d08f', '#efab47', '#d9820f', '#a45604'],
    shimmer: '#fffaf0',
    cats: { lang: '#b45309', front: '#be123c', state: '#6d28d9', back: '#047857', data: '#0369a1', ops: '#6b5a45' },
    tileFill: 0.09,
    tileStroke: 0.5,
    cup: '#fffaf2',
    cupShade: '#d9c7aa',
  },
};

export default {
  id: 'amber',
  hero,
  theme(mode) {
    const t = { ...MODES[mode], mode, sans: 'sans', mono: 'mono', fonts: '', fontsLite: '' };
    t.words = {
      fig2: 'the periodic table of my stack',
      fig3: 'a year, crystallized',
      langs: 'languages, by bytes in public repos',
      fuel: 'fuel',
      specimen: 'SPECIMEN No. ',
    };
    t.kicker = (x, y, text, fig) =>
      `<text x="${x}" y="${y}" class="mono" font-size="11" fill="${t.accent}">// ${fig ? `fig. ${fig} — ` : ''}${esc(text)}</text>`;
    t.faces = (top) => [mix(top, t.sideMix, 0.3), mix(top, t.sideMix, 0.5)];
    t.bar = (k, n) => mix(t.accentHi, t.accentLo, k / Math.max(1, n - 1));
    t.fuelTitle = (x, y, text) =>
      `<text x="${x}" y="${y}" class="serif" font-style="italic" font-size="40" fill="${t.text}">${esc(text)}</text>`;
    t.button = (i, h) => ({ rx: (h - 1.5) / 2, fill: t.bg2, stroke: t.accent, strokeOpacity: '.4', icon: t.accent });
    t.specimenArt = specimenArt;
    t.cupArt = cupArt;
    return t;
  },
};
