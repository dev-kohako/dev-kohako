import { ago, doc, esc, panel, r1, r2 } from '../../lib/svg.mjs';
import { room } from './room.mjs';

const W = 840, H = 300;

// Each technology gets a slot: it flickers on like a neon tube, holds, goes dark.
function neonWords(words, x, y, t) {
  const n = words.length, slot = 2.6, T = n * slot;
  let css = '', body = '';
  words.forEach((w, i) => {
    const p = (f) => r2(((i + f) / n) * 100);
    css += `@keyframes w${i}{0%,${p(0)}%{opacity:0}${p(0.04)}%{opacity:1}${p(0.07)}%{opacity:.15}${p(0.1)}%{opacity:1}${p(0.13)}%{opacity:.35}${p(0.16)}%,${p(0.92)}%{opacity:1}${p(0.97)}%,100%{opacity:0}}\n`;
    body += `<text x="${x}" y="${y}" class="display" font-size="52" font-weight="700" letter-spacing="-.5" fill="url(#neonword)" style="opacity:0;animation:w${i} ${r2(T)}s linear infinite">${esc(w)}</text>`;
  });
  return { css, body: `<g filter="url(#glow)">${body}</g>` };
}

export function hero(t, cfg, data, now = new Date()) {
  const latest = data.repos.find((r) => !r.archived);
  const words = neonWords(cfg.neon.words, 45, 248, t);
  const art = room(t, 648, 116, 16);
  const year = now.getFullYear();

  const css = `
.blink{animation:blink 1.2s steps(1) infinite}@keyframes blink{50%{opacity:.15}}
.in{opacity:0;animation:in .9s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
${words.css}${art.css}`;

  const defs = `
<linearGradient id="neonword" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${t.red}"/><stop offset="1" stop-color="${t.pink}"/></linearGradient>
<linearGradient id="topline" x1="0" x2="1"><stop offset="0" stop-color="${t.pink}" stop-opacity="0"/><stop offset=".3" stop-color="${t.pink}"/><stop offset=".7" stop-color="${t.blue}"/><stop offset="1" stop-color="${t.blue}" stop-opacity="0"/></linearGradient>
<radialGradient id="haloB" r="50%"><stop offset="0" stop-color="${t.blue}" stop-opacity="${t.halo}"/><stop offset="1" stop-color="${t.blue}" stop-opacity="0"/></radialGradient>
<radialGradient id="haloP" r="50%"><stop offset="0" stop-color="${t.pink}" stop-opacity="${t.halo}"/><stop offset="1" stop-color="${t.pink}" stop-opacity="0"/></radialGradient>
<pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".9" fill="${t.text}" fill-opacity=".07"/></pattern>
<filter id="glow" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<clipPath id="frame"><rect width="${W}" height="${H}" rx="16"/></clipPath>
${art.defs}`;

  const hud = (x, y, label, value, anchor = 'start') =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" class="display" font-size="10" font-weight="700" letter-spacing="1" fill="${t.faint}">${label}<tspan fill="${t.text}">${value}</tspan></text>`;

  const body = `
${panel(t, W, H)}
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <ellipse cx="560" cy="170" rx="190" ry="150" fill="url(#haloB)"/>
  <ellipse cx="740" cy="150" rx="170" ry="140" fill="url(#haloP)"/>
  <rect width="${W}" height="1.5" fill="url(#topline)"/>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" stroke="${t.stroke}"/>

${hud(28, 30, 'SYS_ID: ', `KWK-${year}`)}
${hud(28, 45, 'STATUS: ', 'ONLINE')}
<rect class="blink" x="${W - 158}" y="22.5" width="7" height="7" fill="${t.blue}"/>
<text x="${W - 26}" y="30" text-anchor="end" class="display" font-size="10" font-weight="700" letter-spacing="1" fill="${t.blueSoft}">NEURAL LINK ACTIVE</text>

<g class="in">
  ${t.kicker(48, 100, cfg.neon.kicker)}
  <text x="45" y="150" class="display" font-size="54" font-weight="700" letter-spacing="-1" fill="${t.text}">${esc(cfg.name)}</text>
  <text x="48" y="190" class="display" font-size="22" font-weight="700" fill="${t.text}" fill-opacity=".92">Developer</text>
</g>
${words.body}
<text x="48" y="280" class="display" font-size="13.5" fill="${t.muted}">${esc(cfg.location)}${
    latest ? ` · last pushed <tspan fill="${t.blueSoft}" font-weight="700">${esc(latest.name)}</tspan> ${esc(ago(latest.pushedAt, now))}` : ''
  }</text>

${art.body}`;

  return doc({
    w: W,
    h: H,
    title: `${cfg.name} — developer`,
    desc: `An isometric neon-lit room: a desk with code on the monitor, a gaming chair, a bookcase, and a TV showing a space invader above an NES. Beside it, the name ${cfg.name} and a neon sign cycling through ${cfg.neon.words.join(', ')}.`,
    css,
    defs,
    body,
    fonts: t.fonts,
  });
}
