// Draws every image in the README into dist/, one per GitHub theme.
//
//   GITHUB_TOKEN=... node scripts/build.mjs            fetch live data and draw
//   node scripts/build.mjs --save data.json            ...and keep the data
//   node scripts/build.mjs --from data.json            draw offline from saved data
//
// Zero dependencies; Node 20+.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import cfg from '../profile.config.mjs';
import { fetchProfile, normalize } from './lib/github.mjs';
import { themes } from './lib/theme.mjs';
import { hero } from './cards/hero.mjs';
import { elements } from './cards/elements.mjs';
import { skyline } from './cards/skyline.mjs';
import { specimen } from './cards/specimen.mjs';
import { coffee } from './cards/coffee.mjs';
import { social } from './cards/social.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const arg = (flag) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : undefined;
};

async function load() {
  const from = arg('--from');
  if (from) return JSON.parse(await readFile(from, 'utf8'));
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('Set GITHUB_TOKEN (any token that can read public data), or pass --from data.json.');
  const raw = await fetchProfile(cfg.login, token);
  const save = arg('--save');
  if (save) await writeFile(save, JSON.stringify(raw, null, 2));
  return raw;
}

const data = normalize(await load());

const files = {};
for (const t of Object.values(themes)) {
  files[`hero-${t.id}.svg`] = hero(t, cfg, data);
  files[`elements-${t.id}.svg`] = elements(t, cfg, data);
  files[`skyline-${t.id}.svg`] = skyline(t, cfg, data);
  cfg.featured.forEach((f, i) => (files[`specimen-${f.repo}-${t.id}.svg`] = specimen(t, cfg, data, f, i)));
  files[`coffee-${t.id}.svg`] = coffee(t);
  for (const s of cfg.socials) files[`social-${s.id}-${t.id}.svg`] = social(t, s);
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const [name, svg] of Object.entries(files)) await writeFile(path.join(out, name), svg);

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1);
for (const [name, svg] of Object.entries(files)) console.log(`${name.padEnd(36)} ${kb(svg).padStart(6)} KB`);
console.log(`\n${Object.keys(files).length} files in dist/ — ${data.calendar.total} contributions, ${data.repos.length} public repos`);
