const VERSION    = '2026.05.10-v3.9';       // ← 每次只改這一行
const CACHE_NAME = `prime-pwa-${VERSION}`;

self.addEventListener('message', (e) => {
  if (e.data === 'GET_VERSION') {
    e.source.postMessage({ type: 'VERSION', version: VERSION });
  }
});

self.addEventListener('install', (e) => {
  self.skipWaiting(); // 新版 SW 立刻取代舊版，不等分頁關閉
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.map(n => n !== CACHE_NAME && caches.delete(n)))
    ).then(() => self.clients.claim()) // 立刻接管所有已開的分頁
  );
});

self.addEventListener('fetch', (e) => {
  // 網路優先：先抓最新版，失敗才用快取（離線備用）
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
