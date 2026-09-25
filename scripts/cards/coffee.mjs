import { doc, panel } from '../lib/svg.mjs';

const W = 840, H = 190;

export function coffee(t) {
  const art = t.cupArt(t, 150);

  const body = `
${panel(t, W, H)}
${art.body}

${t.kicker(290, 58, t.words.fuel, 4)}
${t.fuelTitle(288, 104, 'Vai um cafézinho?')}
<text x="290" y="134" class="${t.sans}" font-size="13.5" fill="${t.muted}">Brazilian for “fancy a coffee?”, which is how most good conversations start here.</text>
<text x="290" y="155" class="${t.sans}" font-size="13.5" fill="${t.muted}">Got an idea, a job, or a bug worth keeping? Say hi below.</text>`;

  return doc({
    w: W,
    h: H,
    title: 'Vai um cafézinho?',
    desc: art.desc,
    css: art.css,
    defs: art.defs,
    body,
    fonts: t.fonts,
  });
}
