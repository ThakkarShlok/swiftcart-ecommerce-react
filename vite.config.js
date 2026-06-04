import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local so RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are available
// in the Vite dev-server process (they are NOT exposed to the browser bundle).
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvFile(join(__dirname, '.env.local'));
loadEnvFile(join(__dirname, '.env'));

// Vite middleware plugin — handles /api/* inside the dev server so no
// second terminal is needed and there are no cross-process TCP issues.
function localApiPlugin() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/([^/?#]+)/);
        if (!match) return next();

        const name = match[1];
        const handlerPath = join(__dirname, 'api', `${name}.js`);
        if (!existsSync(handlerPath)) return next();

        // Parse JSON body
        const chunks = [];
        await new Promise((resolve) => {
          req.on('data', c => chunks.push(c));
          req.on('end', resolve);
          req.on('error', resolve);
        });
        try { req.body = JSON.parse(Buffer.concat(chunks).toString() || '{}'); }
        catch { req.body = {}; }

        // Polyfill Express-style helpers
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (data) => {
          if (!res.headersSent) res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        try {
          // Cache-bust the import so hot-reload picks up edits
          const url = `file:///${handlerPath.replace(/\\/g, '/')}?t=${Date.now()}`;
          const mod = await import(url);
          await mod.default(req, res);
        } catch (err) {
          console.error(`[api/${name}]`, err.message);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localApiPlugin()],
  server: {
    port: 5173,
  },
});