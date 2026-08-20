import http from 'http';

const URLS_TO_TEST = [
  { path: '/manifest.webmanifest', expectedType: 'application/manifest+json' },
  { path: '/sw.js', expectedType: 'application/javascript' },
  { path: '/offline.html', expectedType: 'text/html' },
  { path: '/icons/icon-192.png', expectedType: 'image/png' },
  { path: '/icons/icon-512.png', expectedType: 'image/png' },
  { path: '/icons/icon-maskable-192.png', expectedType: 'image/png' },
  { path: '/icons/icon-maskable-512.png', expectedType: 'image/png' },
  { path: '/icons/apple-touch-icon-180.png', expectedType: 'image/png' },
  { path: '/icons/favicon-32.png', expectedType: 'image/png' },
  { path: '/screenshots/desktop-1280x720.png', expectedType: 'image/png' },
  { path: '/screenshots/mobile-720x1280.png', expectedType: 'image/png' }
];

function checkUrl(urlPath, expectedType) {
  return new Promise((resolve) => {
    const req = http.get({
      hostname: 'localhost',
      port: 3000,
      path: urlPath,
      headers: { 'User-Agent': 'PWA-Verification-Bot' }
    }, (res) => {
      let dataLen = 0;
      res.on('data', (chunk) => {
        dataLen += chunk.length;
      });
      res.on('end', () => {
        const contentType = res.headers['content-type'] || '';
        const is200 = res.statusCode === 200;
        const typeMatch = contentType.includes(expectedType);
        const hasBody = dataLen > 0;
        resolve({
          path: urlPath,
          status: res.statusCode,
          contentType,
          bytes: dataLen,
          ok: is200 && typeMatch && hasBody
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        path: urlPath,
        status: 'ERROR',
        error: err.message,
        ok: false
      });
    });
  });
}

async function run() {
  console.log('=== PWA ENDPOINT VERIFICATION TEST ===\n');
  let allOk = true;
  const results = [];

  for (const item of URLS_TO_TEST) {
    const res = await checkUrl(item.path, item.expectedType);
    results.push(res);
    if (!res.ok) allOk = false;
    const mark = res.ok ? '✓ PASS' : '✗ FAIL';
    console.log(`${mark} | ${res.path.padEnd(38)} | HTTP ${res.status} | ${res.contentType} | ${res.bytes} bytes`);
  }

  console.log('\n======================================');
  if (allOk) {
    console.log('ALL PWA ASSETS VERIFIED WITH HTTP 200 & CORRECT CONTENT-TYPE!');
  } else {
    console.error('SOME PWA ASSETS FAILED VERIFICATION.');
    process.exit(1);
  }
}

run();
