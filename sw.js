const CACHE='ceto-senaryo-v5.1';

const LOCAL=[
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

const PDFJS=[
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js?v=5',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js?v=5'
];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const c=await caches.open(CACHE);

    await c.addAll(LOCAL);

    for(const u of PDFJS){
      try{
        const r=await fetch(u,{mode:'cors'});
        if(r.ok) await c.put(u,r.clone());
      }catch(e){}
    }

    self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>
  event.waitUntil((async()=>{
    for(const k of await caches.keys()){
      if(k!==CACHE){
        await caches.delete(k);
      }
    }

    await self.clients.claim();
  })())
);

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;

  event.respondWith((async()=>{
    const cached=await caches.match(event.request,{
      ignoreSearch:true
    });

    if(cached){
      return cached;
    }

    try{
      const r=await fetch(event.request);

      if(r && (r.ok || r.type==='opaque')){
        const c=await caches.open(CACHE);
        c.put(event.request,r.clone());
      }

      return r;

    }catch(e){

      if(event.request.mode==='navigate'){
        return await caches.match('./index.html');
      }

      throw e;
    }
  })());
});
