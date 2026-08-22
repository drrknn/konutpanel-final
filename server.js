import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to adapt Express req/res to Web Standard Request/Response
async function runWebHandler(modulePath, req, res) {
  try {
    const fullPath = path.join(__dirname, modulePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: `Function ${modulePath} not found` });
    }
    const module = await import(fullPath);
    const handler = module.default || module.handler || module;

    const protocol = req.protocol || 'http';
    const host = req.get('host') || `localhost:${PORT}`;
    const url = new URL(req.originalUrl || req.url, `${protocol}://${host}`);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }
    }

    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body) {
        body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }
    }

    const webRequest = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
    });

    const webResponse = await handler(webRequest);
    res.status(webResponse.status);
    webResponse.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey !== 'content-length' && lowerKey !== 'transfer-encoding' && lowerKey !== 'content-encoding') {
        res.setHeader(key, value);
      }
    });

    const arrayBuffer = await webResponse.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('Handler execution error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

// API Routes
app.all(['/api/makale-uret', '/.netlify/functions/makale-uret'], (req, res) => {
  return runWebHandler('netlify/functions/makale-uret.mjs', req, res);
});

app.all(['/api/sifre-sifirla', '/.netlify/functions/sifre-sifirla'], (req, res) => {
  return runWebHandler('netlify/functions/sifre-sifirla.mjs', req, res);
});

app.all(['/api/muhasebeci-mail', '/.netlify/functions/muhasebeci-mail'], (req, res) => {
  return runWebHandler('netlify/functions/muhasebeci-mail.mjs', req, res);
});

// SSR Page generator routes (Blog, Articles, Sitemap, RSS)
app.get(['/blog', '/blog.html'], (req, res) => {
  return runWebHandler('netlify/functions/sayfa.mjs', req, res);
});

app.get('/y/:slug', (req, res) => {
  return runWebHandler('netlify/functions/sayfa.mjs', req, res);
});

app.get('/sitemap.xml', (req, res) => {
  return runWebHandler('netlify/functions/sayfa.mjs', req, res);
});

app.get('/rss.xml', (req, res) => {
  return runWebHandler('netlify/functions/sayfa.mjs', req, res);
});

// App & Landing route aliases matching netlify.toml
app.get('/', (req, res) => {
  const anasayfaPath = path.join(__dirname, 'anasayfa.html');
  if (fs.existsSync(anasayfaPath)) {
    return res.sendFile(anasayfaPath);
  }
  return res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(['/anasayfa', '/anasayfa.html'], (req, res) => {
  const anasayfaPath = path.join(__dirname, 'anasayfa.html');
  if (fs.existsSync(anasayfaPath)) {
    return res.sendFile(anasayfaPath);
  }
  return res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(['/uygulama', '/uygulama.html'], (req, res) => {
  return res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(['/yonetim', '/yonetim.html'], (req, res) => {
  const adminPath = path.join(__dirname, 'admin.html');
  if (fs.existsSync(adminPath)) {
    return res.sendFile(adminPath);
  }
  return res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/site-yonetim-programi', (req, res) => {
  const p = path.join(__dirname, 'site-yonetim-programi.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/apartman-yonetim-programi', (req, res) => {
  const p = path.join(__dirname, 'apartman-yonetim-programi.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/aidat-takip-programi', (req, res) => {
  const p = path.join(__dirname, 'aidat-takip-programi.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/gizlilik', (req, res) => {
  const p = path.join(__dirname, 'gizlilik.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/kullanim-kosullari', (req, res) => {
  const p = path.join(__dirname, 'kullanim-kosullari.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/kvkk', (req, res) => {
  const p = path.join(__dirname, 'kvkk.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/veri-isleyen-sozlesmesi', (req, res) => {
  const p = path.join(__dirname, 'veri-isleyen-sozlesmesi.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(['/.well-known/assetlinks.json', '/assetlinks.json'], (req, res) => {
  const p = path.join(__dirname, '.well-known', 'assetlinks.json');
  if (fs.existsSync(p)) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(p);
  }
  res.status(404).send('Not found');
});

app.get(['/manifest.webmanifest', '/manifest.json'], (req, res) => {
  const p = path.join(__dirname, 'manifest.webmanifest');
  if (fs.existsSync(p)) {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(p);
  }
  res.status(404).send('Not found');
});

app.get('/sw.js', (req, res) => {
  const p = path.join(__dirname, 'sw.js');
  if (fs.existsSync(p)) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(p);
  }
  res.status(404).send('Not found');
});

app.use('/icons', express.static(path.join(__dirname, 'icons'), {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  }
}));

app.use('/screenshots', express.static(path.join(__dirname, 'screenshots'), {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  }
}));

// Static assets (icons, css, js, html, etc.)
app.use(express.static(__dirname));

// Fallback for any unknown route (Prevent returning HTML for missing static assets)
app.use((req, res) => {
  if (req.path.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|webmanifest|json|js|css|woff2?|ttf)$/i)) {
    return res.status(404).type('text/plain').send('Asset not found');
  }
  const anasayfaPath = path.join(__dirname, 'anasayfa.html');
  if (fs.existsSync(anasayfaPath)) {
    return res.status(404).sendFile(anasayfaPath);
  }
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Konut Panel server running on http://0.0.0.0:${PORT}`);
});
