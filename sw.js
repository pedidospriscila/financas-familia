const CACHE = 'financas-v4';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      c.addAll([
        '/financas-familia/index.html',
        '/financas-familia/manifest.json',
        '/financas-familia/icon-192.png',
        '/financas-familia/icon-512.png'
      ]).catch(() => {})
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Nunca interceptar Firebase, Google APIs
  if(url.hostname.includes('firebase') || 
     url.hostname.includes('gstatic') || 
     url.hostname.includes('googleapis') ||
     url.hostname.includes('cdnjs')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if(res && res.status === 200) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
