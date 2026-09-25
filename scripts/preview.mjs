// Writes preview.html: the README as it will look on GitHub, dark and light
// side by side, reading the SVGs from dist/. Run build.mjs first.
//
//   node scripts/preview.mjs --dist dist-neon --out preview-neon.html
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readme = (await readFile(path.join(root, 'README.md'), 'utf8')).replace(/<!--[\s\S]*?-->/g, '');
const remote = /https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/output\//g;
const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const dist = arg('--dist', 'dist'), out = arg('--out', 'preview.html');

// Just enough markdown for this README: paragraphs, links, bold.
const md = (s) =>
  s
    .split(/\n{2,}/)
    .map((b) => (b.trim().startsWith('<') ? b : `<p>${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code>$1</code>').replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')}</p>`))
    .join('\n');

// Resolve each <picture> to the source GitHub would pick for that theme.
const themed = (html, theme) =>
  html.replace(/<picture>([\s\S]*?)<\/picture>/g, (_, inner) => {
    const src = inner.match(new RegExp(`prefers-color-scheme: ${theme}\\)" srcset="([^"]+)"`))?.[1];
    return inner.replace(/<source[^>]*>/g, '').replace(/src="[^"]+"/, `src="${src}"`).trim();
  });

const body = md(readme).replace(remote, `${dist}/`);
const column = (theme) => `<section class="${theme}"><div class="box"><div class="head">dev-kohako / README.md</div><article>${themed(body, theme)}</article></div></section>`;

await writeFile(
  path.join(root, out),
  `<!doctype html><meta charset="utf-8"><title>Profile preview</title>
<style>
body{margin:0;display:grid;grid-template-columns:1fr 1fr;font:16px/1.5 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif}
@media (max-width:1700px){body{grid-template-columns:1fr}}
section{padding:32px 24px}
.dark{background:#0d1117;color:#e6edf3}.light{background:#fff;color:#1f2328}
.box{max-width:830px;margin:0 auto;border:1px solid #3d444d;border-radius:6px;padding:0 24px 24px}
.light .box{border-color:#d1d9e0}
.head{font-size:12px;padding:14px 0;opacity:.8}
article img{max-width:100%;box-sizing:content-box}
a{color:#4493f8}.light a{color:#0969da}
p{margin:0 0 16px}
</style>
${column('dark')}${column('light')}`,
);
console.log(`wrote ${out}`);
