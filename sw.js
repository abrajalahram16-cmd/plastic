// Service worker: makes the app installable, shows push notifications and opens the app when they are tapped.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

// Network first; the app needs live data from Supabase, so nothing is cached here.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request));
});

self.addEventListener('push', event => {
  let data = { title: 'مصنع البلاستيك', body: '' };
  try { data = { ...data, ...event.data.json() }; } catch (_) { /* plain text or empty push */ }
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: 'logo.png',
    badge: 'logo.png',
    tag: 'plastic-' + Date.now(),
    dir: 'rtl',
    lang: 'ar',
    data: { url: data.url || './' },
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
