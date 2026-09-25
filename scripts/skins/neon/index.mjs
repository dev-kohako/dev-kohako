// Neon: the palette, type and props of josephkawe.com. Near-black, magenta and
// electric blue, League Spartan embedded so it renders inside an <img>.
import { readFileSync } from 'node:fs';
import { esc, mix } from '../../lib/svg.mjs';
import { hero } from './hero.mjs';
import { specimenArt } from './cartridge.mjs';
import { cupArt } from './sign.mjs';

const FONT = readFileSync(new URL('../../fonts/league-spartan-latin.woff2', import.meta.url)).toString('base64');
const STACK = `.display{font-family:'League Spartan','Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif}`;
const FACE = `@font-face{font-family:'League Spartan';font-weight:100 900;src:url(data:font/woff2;base64,${FONT}) format('woff2')}`;

const MODES = {
  dark: {
    bg: '#09090b',
    bg2: '#111114',
    stroke: '#27272a',
    text: '#fafafa',
    muted: '#a1a1a1',
    faint: '#71717b',
    accent: '#f6339a',
    accentHi: '#f6339a',
    accentLo: '#3080ff',
    pink: '#f6339a',
    blue: '#3080ff',
    blueSoft: '#7c9cff',
    red: '#ff2357',
    halo: 0.16,
    ink: '#000000',
    inkOpacity: 0.6,
    sideMix: '#000000',
    levels: ['#17171c', '#1c398e', '#4f39f6', '#c600db', '#ff2357'],
    shimmer: '#ffd6ea',
    cats: { lang: '#3080ff', front: '#f6339a', state: '#ac4bff', back: '#00d294', data: '#00d2ef', ops: '#fcbb00' },
    tileFill: 0.08,
    tileStroke: 0.5,
    cart: { body: '#5b5b64', edge: '#3a3a42', ridge: '#46464e' },
    room: {
      floor: '#1b1520', plank: '#ffffff0a', rug: '#1d1a3a', wallTop: '#2a2a33', wallCap: '#1f1f27',
      wallL: '#0f1432', wallR: '#260d1c', frame: '#3a3a48', dark: '#17171c', furniture: '#1f1f27',
      desk: '#2b2b35', chair: '#24242d', table: '#c9c9d1', shelfHole: '#0d0d11', leaf: '#1f8a55', glow: 0.55, lift: 0.07, dim: 0.12,
    },
  },
  light: {
    bg: '#fafafa',
    bg2: '#f1f1f4',
    stroke: '#e4e4e7',
    text: '#09090b',
    muted: '#52525c',
    faint: '#9f9fa9',
    accent: '#e30076',
    accentHi: '#e30076',
    accentLo: '#155dfc',
    pink: '#e30076',
    blue: '#155dfc',
    blueSoft: '#155dfc',
    red: '#e40014',
    halo: 0.1,
    ink: '#18181b',
    inkOpacity: 0.16,
    sideMix: '#18181b',
    levels: ['#e4e4e7', '#bedbff', '#54a2ff', '#ac4bff', '#e30076'],
    shimmer: '#ffffff',
    cats: { lang: '#155dfc', front: '#e30076', state: '#9810fa', back: '#009767', data: '#007492', ops: '#b75000' },
    tileFill: 0.07,
    tileStroke: 0.55,
    cart: { body: '#a1a1aa', edge: '#71717b', ridge: '#8a8a93' },
    room: {
      floor: '#e4dce8', plank: '#0000000d', rug: '#d9d4f0', wallTop: '#c8c8d0', wallCap: '#bdbdc6',
      wallL: '#dbe3fb', wallR: '#f7dde8', frame: '#9f9fa9', dark: '#3f3f46', furniture: '#b9b9c3',
      desk: '#d4d4dc', chair: '#52525c', table: '#f4f4f5', shelfHole: '#8a8a93', leaf: '#1f8a55', glow: 0.35, lift: 0.2, dim: 0.05,
    },
  },
};

export default {
  id: 'neon',
  hero,
  theme(mode) {
    const t = { ...MODES[mode], mode, sans: 'display', mono: 'display', fonts: STACK + FACE, fontsLite: STACK };
    t.words = {
      fig2: 'periodic table of my stack',
      fig3: 'a year, rendered',
      langs: 'languages by bytes',
      fuel: 'fuel',
      specimen: 'CARTRIDGE ',
    };
    // A pink tick and letter-spaced caps, like the section labels on the site.
    t.kicker = (x, y, text) =>
      `<rect x="${x}" y="${y - 9}" width="2.5" height="11" fill="${t.accent}"/><text x="${x + 9}" y="${y}" class="display" font-size="10.5" font-weight="700" letter-spacing="2.6" fill="${t.accent}">${esc(text.toUpperCase())}</text>`;
    // Blue light from the left, pink from the right.
    t.faces = (top) => [
      mix(mix(top, t.blue, 0.22), t.sideMix, mode === 'dark' ? 0.35 : 0.12),
      mix(mix(top, t.pink, 0.22), t.sideMix, mode === 'dark' ? 0.55 : 0.25),
    ];
    t.bar = (k, n) => mix(t.pink, t.blue, k / Math.max(1, n - 1));
    t.fuelTitle = (x, y, text) => {
      const [first, ...rest] = text.split(' ').reverse();
      return `<text x="${x}" y="${y}" class="display" font-size="42" font-weight="700" letter-spacing="-.5" fill="${t.text}">${esc(rest.reverse().join(' '))} <tspan fill="${t.accent}">${esc(first)}</tspan></text>`;
    };
    // Outlined buttons, alternating pink and blue like the site's calls to action.
    t.button = (i) => {
      const c = i % 2 ? t.blue : t.pink;
      return { rx: 8, fill: t.bg, stroke: c, strokeOpacity: '1', icon: c };
    };
    t.specimenArt = specimenArt;
    t.cupArt = cupArt;
    return t;
  },
};
