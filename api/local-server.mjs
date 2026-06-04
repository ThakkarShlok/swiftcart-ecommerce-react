/**
 * Local development server for API functions.
 * Run alongside `npm run dev` when `vercel dev` function proxying
 * doesn't work (known Windows Node.js cross-process TCP issue).
 *
 * Usage:
 *   node api/local-server.mjs        # listens on PORT env var or 3001
 *   Then: npm run dev                 # Vite proxies /api → localhost:3001
 *
 * Reads env from .env.local automatically via dotenv (if available),
 * otherwise reads process.env (set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET).
 */

import http from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Load .env.local manually (no dotenv dependency needed) ───────────────────
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvFile(join(ROOT, '.env.local'));
loadEnvFile(join(ROOT, '.env'));

// ── Body parser ──────────────────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}')); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

// ── Server ───────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3001', 10);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const match = url.pathname.match(/^\/api\/([^/]+)$/);

  if (!match) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const name = match[1];
  const handlerPath = join(ROOT, 'api', `${name}.js`);
  if (!existsSync(handlerPath)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `No handler for ${name}` }));
    return;
  }

  try {
    // Parse body and attach to req so handlers can read req.body
    req.body = await readBody(req);

    // Polyfill Express-style res.status(n).json(obj) on plain http.ServerResponse
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => {
      if (!res.headersSent) res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    };

    const modPath = new URL(`../api/${name}.js?t=${Date.now()}`, import.meta.url).href;
    const mod = await import(modPath);
    await mod.default(req, res);
  } catch (err) {
    console.error(`[local-server] Error in ${name}:`, err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  Local API server → http://localhost:${PORT}/api/\n`);
  console.log('  RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✓ set' : '✗ missing');
  console.log('  RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✓ set' : '✗ missing');
  console.log('\n  Run "npm run dev" in a separate terminal, then open http://localhost:5173\n');
});
