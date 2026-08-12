const CACHE_NAME = 'eiken-app-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './words.js'
];

// インストール時に静的ファイルをキャッシュ
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// リクエスト時にキャッシュがあれば通信せずにそれを返す（完全オフライン化）
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
