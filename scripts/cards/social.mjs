import { doc, esc } from '../lib/svg.mjs';

const W = 180, H = 46;

const ICONS = {
  youtube: (c, bg) => `<rect x="-10" y="-7" width="20" height="14" rx="4" fill="${c}"/><path d="M-2.6 -3.8L4.2 0L-2.6 3.8Z" fill="${bg}"/>`,
  instagram: (c) => `<rect x="-8.5" y="-8.5" width="17" height="17" rx="5" stroke="${c}" stroke-width="1.8"/><circle r="3.9" stroke="${c}" stroke-width="1.8"/><circle cx="4.6" cy="-4.6" r="1.1" fill="${c}"/>`,
  email: (c) => `<rect x="-9.5" y="-7" width="19" height="14" rx="2.5" stroke="${c}" stroke-width="1.8"/><path d="M-8.5 -5.5L0 1L8.5 -5.5" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/>`,
  linkedin: (c, bg) => `<rect x="-8.5" y="-8.5" width="17" height="17" rx="3.5" fill="${c}"/><text x="0" y="4.2" text-anchor="middle" class="sans" font-size="11" font-weight="800" fill="${bg}">in</text>`,
};

export function social(t, s, index) {
  const b = t.button(index, H);
  const icon = (ICONS[s.id] ?? ICONS.email)(b.icon, b.fill);
  const body = `
<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="${b.rx}" fill="${b.fill}" stroke="${b.stroke}" stroke-opacity="${b.strokeOpacity}" stroke-width="1.5"/>
<g transform="translate(26 23)">${icon}</g>
<text x="48" y="28" class="${t.sans}" font-size="14" font-weight="600" fill="${t.text}">${esc(s.label)}</text>
<text x="${W - 22}" y="28" text-anchor="end" class="${t.mono}" font-size="13" fill="${t.faint}">↗</text>`;
  return doc({ w: W, h: H, title: s.label, desc: `${s.label}: ${s.url.replace(/^mailto:/, '')}`, body, fonts: t.fontsLite });
}
