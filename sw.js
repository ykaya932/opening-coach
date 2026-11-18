const V='oc-v6';const SHELL=['./','index.html','app.css','app.js','chess.js','pieces.js','courses.js','icon.svg','manifest.webmanifest','engine/stockfish-16.1-lite-single.js','engine/stockfish-16.1-lite-single.wasm'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
 // network first, so a new version is used as soon as it is published; the cache is only a fallback when offline
 e.respondWith(caches.open(V).then(c=>fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>c.match(e.request,{ignoreSearch:true}))))});
