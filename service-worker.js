self.addEventListener('install', (event) => {
  event.waitUntil((async ()=>{
    const cache = await caches.open('pwa-cache-v1');
    await cache.addAll([
      './pwa-index.html',
      './manifest.webmanifest',
      './icons/icon-192.png',
      './icons/icon-512.png'
    ]);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => !['pwa-cache-v1'].includes(k)).map(k => caches.delete(k)));
  })());
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  event.respondWith((async ()=>{
    try {
      const res = await fetch(event.request);
      return res;
    } catch (e) {
      const cache = await caches.open('pwa-cache-v1');
      const cached = await cache.match(event.request, {ignoreVary:true, ignoreSearch:false});
      if (cached) return cached;
      if (url.pathname.endsWith('/') || url.pathname.endsWith('pwa-index.html')) {
        return cache.match('./pwa-index.html');
      }
      throw e;
    }
  })());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {}
  const title = data.title || 'تنبيه جديد';
  const options = {
    body: data.body || 'Push message',
    icon: data.icon || 'icons/icon-192.png',
    badge: data.badge || 'icons/icon-192.png',
    data: data.data || {},
    actions: [{ action: 'open', title: 'فتح' }]
  };
  event.waitUntil((async ()=>{
    await self.registration.showNotification(title, options);
    // Ping pages to play sound if open
    const clis = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clis.forEach(c => c.postMessage({ type: 'PUSH_PING', payload: data }));
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification && event.notification.data && event.notification.data.url) || './';
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
