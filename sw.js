const CACHE = 'kin-v1';
const SHELL = [
  '/',
  '/src/styles/tokens.css',
  '/src/styles/base.css',
  '/src/styles/components.css',
  '/src/styles/responsive.css',
  '/src/styles/business.css',
  '/icons/icon.svg',
  '/manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Pass through Supabase API, auth, storage, and cross-origin requests uncached
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith('/rest/') ||
      url.pathname.startsWith('/auth/') ||
      url.pathname.startsWith('/storage/') ||
      url.pathname.startsWith('/functions/')) return;

  // Stale-while-revalidate for same-origin assets
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const fresh = fetch(e.request).then(res => {
          if (res.ok && e.request.method === 'GET') cache.put(e.request, res.clone());
          return res;
        }).catch(() => cached);
        return cached || fresh;
      })
    )
  );
});
