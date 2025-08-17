
const CACHE='pfg-v2';
const ASSETS=[
  './','./index.html','./style.css','./ui.js','./games.js','./manifest.webmanifest',
  './assets/icons/icon-192.png','./assets/icons/icon-512.png',
  './assets/img/heart.png','./assets/img/puzzle.png','./assets/img/mask.png','./assets/img/gem.png','./assets/img/calc.png','./assets/img/mic.png','./assets/img/spark.png','./assets/img/star.png',
  './assets/audio/click.wav','./assets/audio/correct.wav','./assets/audio/wrong.wav'
];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=> k!==CACHE && caches.delete(k))))); });
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  if(url.origin===location.origin){
    e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
  }
});
