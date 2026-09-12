/**
 * Panther Studio — standalone single-file HTML builder.
 *
 * Builds the full app (all studios, all offline fallbacks) and inlines the
 * JS + CSS into ONE portable HTML file: `panther-studio.html`.
 * Double-click it and every tool works — no server, no install, no keys
 * (AI image gen / video still needs internet + keys, with honest messages).
 *
 * Usage: npm run standalone
 */
import { build } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');

await build({
  root,
  base: './',
  logLevel: 'info',
});

// Work on the pristine Vite output; process tags BEFORE injecting any big
// inlined blobs so patterns can never match inside bundle code.
let html = readFileSync(resolve(dist, 'index.html'), 'utf8');

// NOTE: always use function replacements — a plain string replacement would
// interpret `$&`, `$1`, `$'` inside the inlined CSS/JS as substitution
// patterns and silently corrupt the bundle.
// 1. Inline local stylesheets (href-first regex, attribute order agnostic)
for (const m of [...html.matchAll(/<link\s+[^>]*href="(\.\/[^"]+\.css)"[^>]*>/g)]) {
  const srcPath = resolve(dist, m[1].replace(/^\.\//, ''));
  const css = readFileSync(srcPath, 'utf8');
  html = html.replace(m[0], () => `<style>${css}</style>`);
}

// 2. Inline local script bundles
for (const m of [...html.matchAll(/<script\s+[^>]*src="(\.\/[^"]+\.js)"[^>]*><\/script>/g)]) {
  const srcPath = resolve(dist, m[1].replace(/^\.\//, ''));
  const js = readFileSync(srcPath, 'utf8');
  html = html.replace(m[0], () => `<script type="module">${js}</script>`);
}

// 3. Drop modulepreload hints (the bundle is already inlined)
html = html.replace(/<link\s+[^>]*rel="modulepreload"[^>]*>/g, '');

// 4. Remove crossorigin attributes (inline assets don't need them and they
//    can break file:// loading in some browsers)
html = html.replace(/\scrossorigin(="[^"]*")?/g, '');

const out = resolve(root, 'panther-studio.html');
writeFileSync(out, html);
console.log(`\n✅ Standalone app written to ${out}`);
console.log(`   Size: ${(html.length / 1024 / 1024).toFixed(2)} MB — double-click to open, everything runs offline.`);
