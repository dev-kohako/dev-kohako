import { doc, esc, panel, r1, r2, rng } from '../lib/svg.mjs';

const W = 840, H = 300;

// An irregular pebble of amber, centred on 0,0.
const GEM = 'M-24 -90C14 -106 66 -92 88 -56C108 -22 108 20 88 54C66 90 22 104 -20 98C-60 92 -96 66 -104 26C-112 -12 -94 -50 -68 -72C-54 -83 -40 -86 -24 -90Z';

const BUG = `
  <ellipse cx="0" cy="12" rx="12" ry="17"/>
  <ellipse cx="0" cy="-9" rx="7.5" ry="6.5"/>
  <circle cx="0" cy="-19" r="5"/>
  <g stroke="#2a1003" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M-6 -11L-16 -18L-21 -28M-7 -7L-19 -5L-27 -10M-6 -2L-16 8L-20 20"/>
    <path d="M6 -11L16 -18L21 -28M7 -7L19 -5L27 -10M6 -2L16 8L20 20"/>
    <path d="M-2 -23Q-7 -33 -13 -38M2 -23Q7 -33 13 -38" stroke-width="1.1"/>
  </g>
  <path d="M0 -3L0 28" stroke="#8a4510" stroke-width=".8"/>
  <ellipse cx="-5" cy="10" rx="4.5" ry="12" fill="#a0520c" opacity=".35"/>
  <ellipse cx="5" cy="10" rx="4.5" ry="12" fill="#a0520c" opacity=".35"/>`;

// SMIL keyframes for typing, holding, erasing each role in turn. Discrete
// steps land on character boundaries, and textLength pins every glyph to the
// same advance, so the clip and the caret line up whatever the mono font is.
function typing(roles, x, y, size, t) {
  const cw = r2(size * 0.6);
  const typeStep = 0.06, eraseStep = 0.028, hold = 2, gap = 0.4;
  let clock = 0;
  const segs = roles.map((role) => {
    const n = [...role].length;
    const seg = { role, n, start: clock };
    clock += n * typeStep + hold + n * eraseStep + gap;
    return seg;
  });
  const T = clock;
  const frames = (seg) => {
    const out = [[0, 0]];
    for (let c = 1; c <= seg.n; c++) out.push([seg.start + c * typeStep, c * cw]);
    const erase = seg.start + seg.n * typeStep + hold;
    for (let c = seg.n - 1; c >= 0; c--) out.push([erase + (seg.n - c) * eraseStep, c * cw]);
    return out;
  };
  const anim = (attr, list, offset = 0) =>
    `<animate attributeName="${attr}" dur="${r2(T)}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${list
      .map(([tt]) => (tt / T).toFixed(5))
      .join(';')}" values="${list.map(([, v]) => r2(v + offset)).join(';')}"/>`;

  let defs = '', body = '';
  segs.forEach((seg, i) => {
    const f = frames(seg);
    defs += `<clipPath id="role${i}"><rect x="${x}" y="${y - size}" width="0" height="${size * 1.5}">${anim('width', f)}</rect></clipPath>`;
    body += `<text x="${x}" y="${y}" class="mono" font-size="${size}" fill="${t.text}" textLength="${r2(seg.n * cw)}" lengthAdjust="spacing" clip-path="url(#role${i})">${esc(seg.role)}</text>`;
  });
  const caret = [[0, 0], ...segs.flatMap((s) => frames(s).slice(1))];
  body += `<rect x="${x}" y="${y - size * 0.82}" width="${r1(size * 0.52)}" height="${r1(size * 1.05)}" rx="1" fill="${t.amber}" class="blink">${anim('x', caret, x)}</rect>`;
  return { defs, body };
}

const ago = (iso, now) => {
  const days = Math.max(0, Math.round((now - new Date(iso)) / 86400000));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 45) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months < 12 ? `${months} months ago` : `${Math.round(months / 12)} years ago`;
};

export function hero(t, cfg, data, now = new Date()) {
  const R = rng('hero');

  let contours = '';
  for (let k = 0; k < 8; k++) {
    const y0 = 26 + k * 36, amp = 6 + R() * 14, ph = R() * 6.28, f = 1 + R() * 1.4;
    let d = '';
    for (let x = -20; x <= W + 20; x += 16) {
      const y = y0 + Math.sin((x / W) * 6.28 * f + ph) * amp + Math.sin(x / 83 + k) * 3;
      d += `${x === -20 ? 'M' : 'L'}${x} ${r1(y)}`;
    }
    contours += `<path class="flow" d="${d}" stroke="${t.amber}" stroke-opacity="${t.contour}" style="animation-delay:-${r1(R() * 30)}s"/>`;
  }

  let motes = '';
  for (let k = 0; k < 18; k++) {
    const dur = 7 + R() * 9;
    motes += `<circle class="mote" cx="${r1(20 + R() * 800)}" cy="${r1(190 + R() * 110)}" r="${r1(0.7 + R() * 1.7)}" fill="${t.amberHi}" style="animation-duration:${r1(dur)}s;animation-delay:-${r1(R() * dur)}s"/>`;
  }

  let bubbles = '';
  for (const [x, y, r] of [[-52, -30, 3.2], [-40, 44, 2.2], [48, -46, 2.6], [58, 30, 1.8], [-18, 66, 1.5], [30, -70, 1.4], [-60, 10, 1.2]])
    bubbles += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff0c2" fill-opacity=".18" stroke="#fff5d6" stroke-opacity=".55" stroke-width=".7"/>`;

  const type = typing(cfg.roles, 74, 184, 17, t);
  const latest = data.repos.find((r) => !r.archived);

  const css = `
.flow{stroke-dasharray:140 50;animation:flow 30s linear infinite}
@keyframes flow{to{stroke-dashoffset:-760}}
.mote{opacity:0;animation:rise linear infinite}
@keyframes rise{0%{transform:translateY(0);opacity:0}20%{opacity:.75}100%{transform:translateY(-170px);opacity:0}}
.float{animation:float 7s ease-in-out infinite alternate}
@keyframes float{from{transform:translateY(-6px) rotate(-1.5deg)}to{transform:translateY(6px) rotate(1.5deg)}}
.shadow{transform-box:fill-box;transform-origin:center;animation:shadow 7s ease-in-out infinite alternate}
@keyframes shadow{from{transform:scale(.82);opacity:.6}to{transform:scale(1.05);opacity:1}}
.halo{animation:halo 5s ease-in-out infinite alternate}
@keyframes halo{from{opacity:.55}to{opacity:1}}
.sweep{animation:sweep 6.5s ease-in-out infinite}
@keyframes sweep{0%,62%{transform:translateX(-190px)}86%,100%{transform:translateX(210px)}}
.blink{animation:blink 1.05s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.in{opacity:0;animation:in .9s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`;

  const defs = `
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.bg2}"/><stop offset=".6" stop-color="${t.bg}"/></linearGradient>
<radialGradient id="warm" cx="78%" cy="45%" r="60%"><stop offset="0" stop-color="${t.amber}" stop-opacity=".2"/><stop offset="1" stop-color="${t.amber}" stop-opacity="0"/></radialGradient>
<linearGradient id="name" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${t.text}"/><stop offset=".55" stop-color="${t.text}"/><stop offset="1" stop-color="${t.amberHi}"/></linearGradient>
<radialGradient id="gem" cx="38%" cy="30%" r="78%"><stop offset="0" stop-color="#fff2c4"/><stop offset=".18" stop-color="#ffcb52"/><stop offset=".46" stop-color="#f59e0b"/><stop offset=".76" stop-color="#c2610a"/><stop offset="1" stop-color="#6b2d04"/></radialGradient>
<radialGradient id="edge" cx="50%" cy="50%" r="54%"><stop offset=".62" stop-color="#3a1602" stop-opacity="0"/><stop offset="1" stop-color="#3a1602" stop-opacity=".6"/></radialGradient>
<radialGradient id="halo" r="50%"><stop offset="0" stop-color="#f5a524" stop-opacity=".42"/><stop offset=".55" stop-color="#f5a524" stop-opacity=".08"/><stop offset="1" stop-color="#f5a524" stop-opacity="0"/></radialGradient>
<linearGradient id="sheen" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="haze" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".65"/></filter>
<filter id="gloss" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>
<clipPath id="gemclip"><path d="${GEM}"/></clipPath>
<clipPath id="frame"><rect width="${W}" height="${H}" rx="16"/></clipPath>
${type.defs}`;

  const body = `
${panel(t, W, H)}
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#warm)"/>
  ${contours}
  ${motes}
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" stroke="${t.stroke}"/>

<g class="in">
  <text x="48" y="74" class="mono" font-size="12.5" letter-spacing=".5" fill="${t.faint}"><tspan fill="${t.amber}">${esc(cfg.kicker.split(' ')[0])}</tspan> ${esc(cfg.kicker.split(' ').slice(1).join(' '))}</text>
  <text x="45" y="136" class="sans" font-size="56" font-weight="700" letter-spacing="-1.5" fill="url(#name)">${esc(cfg.name)}</text>
</g>
<text x="48" y="184" class="mono" font-size="17" fill="${t.amber}">&gt;</text>
${type.body}
<rect x="48" y="210" width="36" height="2" rx="1" fill="${t.amber}"/>
<text x="48" y="240" class="sans" font-size="13.5" fill="${t.muted}">${esc(cfg.location)}${
    latest ? ` · last pushed <tspan fill="${t.text}" font-weight="600">${esc(latest.name)}</tspan> ${esc(ago(latest.pushedAt, now))}` : ''
  }</text>

<g transform="translate(652 138)">
  <ellipse class="shadow" cx="0" cy="126" rx="70" ry="9" fill="${t.ink}" opacity="${t.inkOpacity}" filter="url(#soft)"/>
  <circle class="halo" r="150" fill="url(#halo)"/>
  <g class="float">
    <path d="${GEM}" fill="url(#gem)"/>
    <g clip-path="url(#gemclip)">
      <ellipse cx="16" cy="62" rx="54" ry="24" fill="#ffe08a" opacity=".38" filter="url(#soft)"/>
      ${bubbles}
      <g transform="translate(4 8) rotate(-28) scale(1.18)" fill="#2a1003" opacity=".8" filter="url(#haze)">${BUG}</g>
      <path d="${GEM}" fill="url(#edge)"/>
      <g class="sweep"><rect x="-40" y="-130" width="64" height="260" fill="url(#sheen)" transform="skewX(-18)"/></g>
    </g>
    <path d="M-70 -48C-60 -76 -30 -92 2 -90C-26 -80 -50 -66 -62 -38Z" fill="#fff" opacity=".5" filter="url(#gloss)"/>
    <ellipse cx="-44" cy="-60" rx="9" ry="4.5" transform="rotate(-38 -44 -60)" fill="#fff" opacity=".9"/>
    <path d="${GEM}" stroke="#ffe6ad" stroke-opacity=".4" stroke-width="1.2"/>
  </g>
</g>
<text x="652" y="284" text-anchor="middle" class="serif" font-style="italic" font-size="13" fill="${t.faint}">fig. 1 — the only bug I keep</text>`;

  return doc({
    w: W,
    h: H,
    title: `${cfg.name} — ${cfg.roles[0]}`,
    desc: `${cfg.kicker}. A beetle trapped in a piece of amber floats beside the name while a caret types: ${cfg.roles.join(', ')}.`,
    css,
    defs,
    body,
  });
}
