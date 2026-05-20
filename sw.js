const CACHE_NAME = 'mfcb-v1';

// Все ресурсы для кэширования (офлайн-работа)
const ASSETS = [
  '/mfcb-app/',
  '/mfcb-app/index.html',
  '/mfcb-app/manifest.json'
];

// Установка: кэшируем ресурсы
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Активация: удаляем старые кэши
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: сначала сеть, при ошибке — кэш
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Сохраняем свежую копию в кэш
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
