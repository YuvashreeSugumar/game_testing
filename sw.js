
const CACHE='pgr-v1';
const ASSETS=[
  './','./index.html','./style.css','./script.js','./manifest.webmanifest',
  './assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/ui/banner.png',
  './assets/img/star.png','./assets/img/flower.png','./assets/img/crown.png','./assets/img/mask.png','./assets/img/diamond.png',
  './assets/spot/scene1_A.png','./assets/spot/scene1_B.png','./assets/spot/scene2_A.png','./assets/spot/scene2_B.png'
];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=> k!==CACHE && caches.delete(k))))); });
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  if(url.origin === location.origin){
    e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
  }
});
