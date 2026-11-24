const CACHE='ronahi-v1-57';
const FILES=['./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('ronahi-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==location.origin)return;
 if(url.pathname.includes('/data/')||url.pathname.includes('/audio/')){
  event.respondWith(caches.open(CACHE).then(async cache=>{
   const cached=await cache.match(event.request);
   if(cached)return cached;
   try{const response=await fetch(event.request);if(response.ok)cache.put(event.request,response.clone());return response}
   catch(e){return cached||Response.error()}
  }));
  return;
 }
 if(event.request.mode==='navigate'||url.pathname.endsWith('/index.html')){
  event.respondWith(fetch(event.request).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy))}
   return response;
  }).catch(()=>caches.match('./index.html')));
 }
});
