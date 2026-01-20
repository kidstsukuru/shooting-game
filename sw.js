const CACHE_NAME = 'space-shooter-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './images/player.png',
    './images/enemy.png',
    './images/small_enemy.png',
    './images/boss.png',
    './images/icon-512.png'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
