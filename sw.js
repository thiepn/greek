/* Koinē Path BG13 service worker */
'use strict';
importScripts('./generated/pwa-version.js');
const PWA_VERSION=self.KOINE_PWA_BUILD||'bg13-dev';
const SHELL_CACHE=`koine-shell-${PWA_VERSION}`;
const RUNTIME_CACHE=`koine-runtime-${PWA_VERSION}`;
const CORPUS_PREFIX='koine-corpus-';
const SHELL_PREFIX='koine-shell-';
const RUNTIME_PREFIX='koine-runtime-';
const scopeUrl=path=>new URL(path,self.registration.scope).toString();

async function shellManifest(){
  const r=await fetch(scopeUrl('generated/pwa-shell.json'),{cache:'no-store'});
  if(!r.ok)throw new Error(`PWA shell manifest HTTP ${r.status}`);
  return r.json();
}
async function corpusRevision(){
  const url=scopeUrl('generated/corpus/manifest.json');
  let r=await caches.match(url);
  if(!r){try{r=await fetch(url,{cache:'no-store'})}catch{}}
  if(!r?.ok)return null;
  try{return (await r.clone().json())?.source?.revision||null}catch{return null}
}
function corpusCacheName(revision){return `${CORPUS_PREFIX}${revision}`}

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const manifest=await shellManifest();
    if(manifest.version!==PWA_VERSION)throw new Error(`PWA version mismatch: ${manifest.version}`);
    const cache=await caches.open(SHELL_CACHE);
    const urls=manifest.assets.map(scopeUrl);
    await cache.addAll(urls.map(url=>new Request(url,{cache:'reload'})));
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(name=>(name.startsWith(SHELL_PREFIX)&&name!==SHELL_CACHE)||(name.startsWith(RUNTIME_PREFIX)&&name!==RUNTIME_CACHE)).map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  const msg=event.data||{};
  if(msg.type==='SKIP_WAITING')self.skipWaiting();
  if(msg.type==='GET_PWA_VERSION')event.ports?.[0]?.postMessage({version:PWA_VERSION});
});

async function networkFirstNavigation(request){
  try{
    const fresh=await fetch(request);
    if(fresh?.ok){const c=await caches.open(RUNTIME_CACHE);c.put(scopeUrl('index.html'),fresh.clone()).catch(()=>{});}
    return fresh;
  }catch{
    return (await caches.match(scopeUrl('index.html')))||(await caches.match(scopeUrl('./')))||Response.error();
  }
}

async function corpusRequest(request){
  const path=new URL(request.url).pathname;
  const revision=await corpusRevision();
  if(revision){
    const hit=await (await caches.open(corpusCacheName(revision))).match(request);
    if(hit)return hit;
  }
  const shellHit=await caches.match(request);
  if(shellHit)return shellHit;
  try{
    const fresh=await fetch(request);
    if(fresh.ok){
      let responseRevision=null;
      try{responseRevision=(await fresh.clone().json())?.sourceRevision||null}catch{}
      responseRevision=responseRevision||revision||await corpusRevision();
      if(responseRevision){const c=await caches.open(corpusCacheName(responseRevision));await c.put(request,fresh.clone());}
    }
    return fresh;
  }catch{
    throw new Error(`Offline corpus asset unavailable: ${path}`);
  }
}

async function staticRequest(request){
  const hit=await caches.match(request);if(hit)return hit;
  const fresh=await fetch(request);
  if(fresh.ok&&new URL(request.url).origin===self.location.origin){const c=await caches.open(RUNTIME_CACHE);c.put(request,fresh.clone()).catch(()=>{});}
  return fresh;
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){event.respondWith(networkFirstNavigation(request));return;}
  const rel=url.pathname.slice(new URL(self.registration.scope).pathname.length);
  if(/^generated\/corpus\/(books\/|frequency\.json$|lexical-index\.json$)/.test(rel)){event.respondWith(corpusRequest(request));return;}
  if(rel==='generated/corpus/manifest.json'){
    event.respondWith((async()=>{
      const cached=await caches.match(request);if(cached)return cached;
      try{const fresh=await fetch(request,{cache:'no-store'});if(fresh.ok){const c=await caches.open(SHELL_CACHE);await c.put(request,fresh.clone());}return fresh}catch{return Response.error()}
    })());
    return;
  }
  event.respondWith(staticRequest(request));
});
