'use strict';
const CACHE='meal-picker-cache-v3';
const PREFIX='meal-picker-cache-';
const FILES=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./food-atlas.png'];
const SCOPE=new URL(self.registration.scope);
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const u=new URL(event.request.url);
 if(u.origin!==SCOPE.origin||!u.pathname.startsWith(SCOPE.pathname))return;
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
