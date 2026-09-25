// Draws every image in the README into dist/, one per GitHub theme.
//
//   GITHUB_TOKEN=... node scripts/build.mjs            fetch live data and draw
//   node scripts/build.mjs --save data.json            ...and keep the data
//   node scripts/build.mjs --from data.json            draw offline from saved data
//   node scripts/build.mjs --skin neon --out dist-neon  draw another skin somewhere else
//
// Zero dependencies; Node 20+.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import cfg from '../profile.config.mjs';
import { fetchProfile, normalize } from './lib/github.mjs';
import { skins } from './skins/index.mjs';
import { elements } from './cards/elements.mjs';
import { skyline } from './cards/skyline.mjs';
import { specimen } from './cards/specimen.mjs';
import { coffee } from './cards/coffee.mjs';
import { social } from './cards/social.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (flag) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const out = path.resolve(root, arg('--out') ?? 'dist');
const skin = skins[arg('--skin') ?? cfg.skin ?? 'amber'];
if (!skin) throw new Error(`Unknown skin. Pick one of: ${Object.keys(skins).join(', ')}`);

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
for (const mode of ['dark', 'light']) {
  const t = skin.theme(mode);
  files[`hero-${mode}.svg`] = skin.hero(t, cfg, data);
  files[`elements-${mode}.svg`] = elements(t, cfg, data);
  files[`skyline-${mode}.svg`] = skyline(t, cfg, data);
  cfg.featured.forEach((f, i) => (files[`specimen-${f.repo}-${mode}.svg`] = specimen(t, cfg, data, f, i)));
  files[`coffee-${mode}.svg`] = coffee(t);
  cfg.socials.forEach((s, i) => (files[`social-${s.id}-${mode}.svg`] = social(t, s, i)));
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const [name, svg] of Object.entries(files)) await writeFile(path.join(out, name), svg);

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1);
for (const [name, svg] of Object.entries(files)) console.log(`${name.padEnd(36)} ${kb(svg).padStart(6)} KB`);
console.log(`\n${Object.keys(files).length} files in ${path.relative(root, out)}/ (${skin.id}) — ${data.calendar.total} contributions, ${data.repos.length} public repos`);
