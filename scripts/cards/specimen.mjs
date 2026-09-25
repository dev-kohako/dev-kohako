import { doc, esc, fit, panel, r1, rng, textWidth, wrap } from '../lib/svg.mjs';
import { uses } from '../lib/github.mjs';

// Cards sit two to a row at 50% each. The gutter between them is transparent
// space inside the SVG (right of even cards, left of odd ones), so the outer
// edges line up with the full-width panels above and below.
const W = 410, H = 170, GUTTER = 10;

// The picture on the left comes from the skin (a lump of amber, a cartridge);
// it is seeded by the repo name so it never changes between builds.
export function specimen(t, cfg, data, feat, index) {
  const repo = data.repos.find((r) => r.name === feat.repo);
  if (!repo) throw new Error(`featured repo "${feat.repo}" is not a public repo of ${data.login}`);
  const art = t.specimenArt(t, rng(repo.name), index, `s${index}`);

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
    chips += `<rect x="${r1(cx)}" y="138" width="${r1(w)}" height="19" rx="9.5" fill="${c}" fill-opacity=".1" stroke="${c}" stroke-opacity=".45"/><text x="${r1(cx + w / 2)}" y="151" text-anchor="middle" class="${t.mono}" font-size="9.5" fill="${c}">${esc(e.n)}</text>`;
    cx += w + 6;
  }

  const body = `<g transform="translate(${index % 2 ? GUTTER : 0} 0)">
${panel(t, W, H)}
<rect x="14" y="14" width="108" height="142" rx="10" fill="${t.bg2}"/>
${art.body}
<text x="${x}" y="34" class="${t.mono}" font-size="9" letter-spacing="1.6" fill="${t.accent}">${t.words.specimen}${String(index + 1).padStart(3, '0')}${
    repo.primary ? `<tspan fill="${t.faint}" letter-spacing=".4">  ·  ${esc(repo.primary.name)}</tspan>` : ''
  }</text>
<text x="${W - 20}" y="34" text-anchor="end" class="${t.mono}" font-size="11" fill="${t.muted}">★ ${repo.stars}</text>
<text x="${x}" y="62" class="${t.sans}" font-size="20" font-weight="700" letter-spacing="-.3" fill="${t.text}"${fit(repo.name, 20, maxW, 0.56)}>${esc(repo.name)}</text>
${lines.map((l, k) => `<text x="${x}" y="${86 + k * 16}" class="${t.sans}" font-size="12.5" fill="${t.muted}">${esc(l)}</text>`).join('\n')}
${chips}
${repo.homepage ? `<text x="${W - 20}" y="152" text-anchor="end" class="${t.mono}" font-size="10.5" font-weight="700" fill="${t.accent}">live ↗</text>` : ''}
</g>`;

  return doc({
    w: W + GUTTER,
    h: H,
    title: repo.name,
    desc: `${feat.blurb ?? repo.description} ${repo.stars} stars.${tech.length ? ` Built with ${tech.map((e) => e.n).join(', ')}.` : ''}`,
    css: art.css,
    defs: art.defs,
    body,
    fonts: t.fonts,
  });
}
