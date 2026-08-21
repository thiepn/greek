const assert=require('node:assert/strict');
const {OfflineEngine,PROGRAM_PACKS,corpusCacheName,bookUrl,humanBytes}=require('../offline-engine.js');

class MemoryCache{
  constructor(){this.map=new Map()}
  key(x){return typeof x==='string'?x:x.url}
  async put(k,v){this.map.set(this.key(k),v.clone())}
  async match(k){return this.map.get(this.key(k))||undefined}
  async delete(k){return this.map.delete(this.key(k))}
}
class MemoryCaches{
  constructor(){this.map=new Map()}
  async open(n){if(!this.map.has(n))this.map.set(n,new MemoryCache());return this.map.get(n)}
  async keys(){return [...this.map.keys()]}
  async delete(n){return this.map.delete(n)}
}
const revision='abc123revision';
const manifest={source:{revision},books:[{id:'Mark'},{id:'Phil'},{id:'1John'}]};
const payloads=new Map([
  ['generated/corpus/manifest.json',manifest],
  ['generated/corpus/frequency.json',{sourceRevision:revision,entries:[]}],
  ['generated/corpus/lexical-index.json',{sourceRevision:revision,entries:[]}],
  [bookUrl('Mark'),{sourceRevision:revision,book:{id:'Mark'}}],
  [bookUrl('Phil'),{sourceRevision:revision,book:{id:'Phil'}}],
  [bookUrl('1John'),{sourceRevision:revision,book:{id:'1John'}}]
]);
const fetchFn=async url=>payloads.has(String(url))?new Response(JSON.stringify(payloads.get(String(url))),{status:200,headers:{'content-type':'application/json'}}):new Response('missing',{status:404});
const caches=new MemoryCaches();
const storage={estimate:async()=>({usage:1024*1024*2,quota:1024*1024*100}),persisted:async()=>false,persist:async()=>true};
(async()=>{
  assert.equal(PROGRAM_PACKS.fluency.books.length,3);
  assert.equal(corpusCacheName(revision),`koine-corpus-${revision}`);
  assert.equal(humanBytes(1024),'1.0 KB');
  const engine=new OfflineEngine({fetchFn,cacheStorage:caches,storageManager:storage});
  assert.equal(engine.supported(),true);
  await engine.downloadBook('Mark');
  let s=await engine.status();assert.equal(s.books.Mark,true);assert.equal(s.books.Phil,false);assert.equal(s.frequency,true);
  await engine.downloadPack('phil');s=await engine.status();assert.equal(s.books.Phil,true);
  await caches.open('koine-corpus-oldrevision');s=await engine.status();assert.deepEqual(s.staleCaches,['koine-corpus-oldrevision']);
  assert.equal(await engine.clearStale(),1);assert.deepEqual((await engine.status()).staleCaches,[]);
  await engine.downloadFull();s=await engine.status();assert.equal(s.downloadedBooks,3);assert.equal(s.lexical,true);
  await engine.removeBook('Mark');assert.equal((await engine.status()).books.Mark,false);
  const e=await engine.estimate();assert.equal(e.percent,2);assert.match(e.usageText,/MB/);assert.equal(await engine.requestPersistence(),true);
  await engine.clearCurrent();assert.equal((await caches.keys()).some(x=>x===corpusCacheName(revision)),false);
  console.log('BG13 offline engine tests passed.');
})().catch(err=>{console.error(err);process.exit(1)});
