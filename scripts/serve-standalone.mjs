/**
 * Tiny static server for the STANDALONE build (panther-studio.html).
 * It serves ONLY the single HTML file and 404s everything else — exactly
 * like double-clicking the file offline — so the app's built-in local
 * fallbacks (vector, PSD magic layers, script, palette) kick in.
 *
 * Usage: npm run serve:standalone  (http://localhost:8080)
 */
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'panther-studio.html'));

const server = createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } else {
    // Everything else (including /api/*) 404s — this simulates pure offline.
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found (standalone mode — no backend attached)');
  }
});

server.listen(8080, '0.0.0.0', () => {
  console.log('Standalone Panther Studio: http://0.0.0.0:8080  (no backend, pure offline mode)');
});
