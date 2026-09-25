import { doc, esc, fmt, mix, panel, poly, r1 } from '../lib/svg.mjs';
import { streaks } from '../lib/github.mjs';

const W = 840, H = 480;
// Dimetric grid: weeks run down-right, weekdays down-left.
const A = 12, B = 5.3, SHRINK = 0.84, MAX_H = 70;
const OX = 150, OY = 112;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (iso) => {
  const [, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
};

export function skyline(t, cfg, data) {
  const days = data.calendar.days;
  const st = streaks(days);
  const positive = days.map((d) => d.count).filter((c) => c > 0).sort((a, b) => a - b);
  // Scale against the 95th percentile so one huge day does not flatten the rest.
  const cap = positive.length ? positive[Math.floor((positive.length - 1) * 0.95)] : 1;
  const lastDate = days.reduce((m, d) => (d.date > m ? d.date : m), '');

  const cells = [...days].sort((a, b) => a.week + a.weekday - (b.week + b.weekday) || a.week - b.week);
  let prisms = '';
  for (const d of cells) {
    const i = d.week, j = d.weekday;
    const cx = OX + (i - j) * A, cy = OY + (i + j) * B;
    const h = d.count ? 3 + Math.pow(Math.min(d.count, cap) / cap, 0.75) * MAX_H : 1.4;
    const n = [cx, cy - B * SHRINK], e = [cx + A * SHRINK, cy], s = [cx, cy + B * SHRINK], w = [cx - A * SHRINK, cy];
    const up = (p) => [p[0], p[1] - h];
    const top = t.levels[d.level];
    const left = mix(top, t.sideMix, 0.3), right = mix(top, t.sideMix, 0.5);
    const delay = (i + j) * 16;
    const shine = d.count
      ? `<polygon class="sh" points="${poly([up(n), up(e), up(s), up(w)])}" fill="${t.shimmer}" style="animation-delay:${r1(1.2 + (i + j) * 0.045)}s"/>`
      : '';
    const today = d.date === lastDate
      ? `<polygon class="today" points="${poly([up(n), up(e), up(s), up(w)])}" stroke="${t.amberHi}" stroke-width="1.4"/>`
      : '';
    prisms += `<g class="p" style="animation-delay:${delay}ms"><polygon points="${poly([w, up(w), up(s), s])}" fill="${left}"/><polygon points="${poly([s, up(s), up(e), e])}" fill="${right}"/><polygon points="${poly([up(n), up(e), up(s), up(w)])}" fill="${top}"/>${shine}${today}</g>`;
  }

  // Month names along the lower-left edge, tilted to the grid.
  const angle = (Math.atan2(B, A) * 180) / Math.PI;
  let months = '';
  let prev = -1;
  const firstOfWeek = new Map();
  for (const d of days) if (!firstOfWeek.has(d.week) || d.date < firstOfWeek.get(d.week)) firstOfWeek.set(d.week, d.date);
  for (const [week, date] of [...firstOfWeek].sort((a, b) => a[0] - b[0])) {
    const m = Number(date.split('-')[1]) - 1;
    if (m !== prev && week > 0) {
      const x = OX + (week - 6) * A - 4, y = OY + (week + 6) * B + 18;
      months += `<text transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(angle)})" class="mono" font-size="9" fill="${t.faint}">${MONTHS[m]}</text>`;
    }
    prev = m;
  }

  // Stats in the empty top-right triangle.
  const sx = 548;
  const stat = (x, y, label, value, sub = '') =>
    `<text x="${x}" y="${y}" class="mono" font-size="9" letter-spacing=".8" fill="${t.faint}">${label}</text><text x="${x}" y="${y + 21}" class="sans" font-size="19" font-weight="700" fill="${t.text}">${value}${sub ? `<tspan class="mono" font-size="10" font-weight="400" fill="${t.muted}"> ${sub}</tspan>` : ''}</text>`;
  const stats = `
<text x="${sx}" y="46" class="mono" font-size="11" fill="${t.amber}">// fig. 3 — a year, crystallized</text>
<text x="${sx - 2}" y="96" class="sans" font-size="46" font-weight="700" letter-spacing="-1" fill="${t.text}">${fmt(data.calendar.total)}</text>
<text x="${sx}" y="117" class="sans" font-size="13" fill="${t.muted}">contributions in the last 12 months</text>
${stat(sx, 148, 'COMMITS', fmt(data.counts.commits))}
${stat(sx + 90, 148, 'PULL REQUESTS', fmt(data.counts.prs))}
${stat(sx + 190, 148, 'STARS', fmt(data.stars))}
${stat(sx, 196, 'STREAK', st.current, st.current === 1 ? 'day' : 'days')}
${stat(sx + 90, 196, 'LONGEST', st.longest, 'days')}
${stat(sx + 190, 196, 'BEST DAY', st.best.count, st.best.date ? shortDate(st.best.date) : '')}`;

  // Languages in the empty bottom-left triangle.
  const langs = data.languages.slice(0, 6);
  const lx = 32, ly = 318;
  let langRows = `<text x="${lx}" y="${ly}" class="mono" font-size="11" fill="${t.amber}">// languages, by bytes in public repos</text>`;
  langs.forEach((l, k) => {
    const y = ly + 24 + k * 19;
    const color = mix(t.amberHi, t.amberLo, k / Math.max(1, langs.length - 1));
    const bw = Math.max(2, l.share * 150);
    langRows += `<g class="bar" style="animation-delay:${900 + k * 90}ms"><text x="${lx}" y="${y}" class="mono" font-size="10.5" fill="${t.muted}">${esc(l.name)}</text><rect x="${lx + 92}" y="${y - 8}" width="150" height="8" rx="4" fill="${t.levels[0]}"/><rect x="${lx + 92}" y="${y - 8}" width="${r1(bw)}" height="8" rx="4" fill="${color}"/><text x="${lx + 250}" y="${y}" class="mono" font-size="10.5" fill="${t.faint}">${(l.share * 100).toFixed(1)}%</text></g>`;
  });

  let legend = `<text x="${W - 196}" y="${H - 22}" class="mono" font-size="9" fill="${t.faint}">less</text>`;
  t.levels.forEach((c, k) => {
    const x = W - 162 + k * 20, y = H - 26;
    legend += `<polygon points="${poly([[x, y - 5], [x + 8, y], [x, y + 5], [x - 8, y]])}" fill="${c}" stroke="${mix(c, t.sideMix, 0.4)}" stroke-width=".6"/>`;
  });
  legend += `<text x="${W - 60}" y="${H - 22}" class="mono" font-size="9" fill="${t.faint}">more</text>`;

  const css = `
.p{opacity:0;animation:grow .7s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes grow{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.sh{opacity:0;animation:sh 7s ease-in-out infinite}
@keyframes sh{0%,14%,100%{opacity:0}5%{opacity:.55}}
.today{animation:today 1.6s ease-in-out infinite alternate}
@keyframes today{from{opacity:.2}to{opacity:1}}
.bar{opacity:0;animation:fade .6s ease forwards}
@keyframes fade{to{opacity:1}}`;

  const body = `
${panel(t, W, H)}
${prisms}
${months}
${stats}
${langRows}
${legend}`;

  return doc({
    w: W,
    h: H,
    title: `${fmt(data.calendar.total)} contributions in the last year`,
    desc: `An isometric landscape of amber crystals, one per day, taller on busier days. ${fmt(data.counts.commits)} commits, ${fmt(data.counts.prs)} pull requests, current streak ${st.current} days, longest ${st.longest} days. Top languages: ${langs.map((l) => `${l.name} ${(l.share * 100).toFixed(1)}%`).join(', ')}.`,
    css,
    body,
  });
}
