const CACHE='vtaper-v6';
const ASSETS=['./','./index.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;
  const accept=req.headers.get('accept')||'';
  // NETWORK-FIRST for the page itself, so a new deploy shows up as soon as you're online.
  // Falls back to the cached copy only when the network fails (offline).
  if(req.mode==='navigate' || (req.method==='GET' && accept.indexOf('text/html')>=0)){
    e.respondWith(
      fetch(req).then(res=>{const copy=res.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy)); return res;})
        .catch(()=>caches.match(req).then(r=>r||caches.match('./index.html')))
    );
    return;
  }
  // CACHE-FIRST for everything else (icons, sw itself is handled by the browser).
  e.respondWith(caches.match(req).then(r=>r||fetch(req)));
});
