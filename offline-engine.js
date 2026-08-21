(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.KoineOffline=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const PWA_VERSION='bg13.0.0',CORPUS_PREFIX='koine-corpus-';
const PROGRAM_PACKS=Object.freeze({
  '1john':{name:'1 John fluency pack',books:['1John']},
  'mark':{name:'Mark fluency pack',books:['Mark']},
  'phil':{name:'Philippians fluency pack',books:['Phil']},
  'fluency':{name:'All fluency programs',books:['1John','Mark','Phil']}
});
const corpusCacheName=revision=>`${CORPUS_PREFIX}${revision}`;
const bookUrl=id=>`generated/corpus/books/${encodeURIComponent(id)}.json`;
const humanBytes=n=>{n=Number(n)||0;const u=['B','KB','MB','GB'];let i=0;while(n>=1024&&i<u.length-1){n/=1024;i++}return `${n>=10||i===0?Math.round(n):n.toFixed(1)} ${u[i]}`};
class OfflineEngine{
  constructor({fetchFn=null,cacheStorage=null,storageManager=null}={}){this.fetchFn=fetchFn||((typeof fetch!=='undefined')?fetch.bind(globalThis):null);this.caches=cacheStorage||((typeof caches!=='undefined')?caches:null);this.storage=storageManager||((typeof navigator!=='undefined')?navigator.storage:null);this.manifest=null}
  supported(){return !!(this.fetchFn&&this.caches)}
  async loadManifest(force=false){if(this.manifest&&!force)return this.manifest;if(!this.fetchFn)throw new Error('Fetch unavailable');const r=await this.fetchFn('generated/corpus/manifest.json',{cache:'no-store'});if(!r.ok)throw new Error(`Corpus manifest HTTP ${r.status}`);const m=await r.json();if(!m?.source?.revision||!Array.isArray(m.books))throw new Error('Invalid corpus manifest');this.manifest=m;return m}
  async currentCache(){const m=await this.loadManifest();return this.caches.open(corpusCacheName(m.source.revision))}
  async fetchAndStore(url,cache){const r=await this.fetchFn(url,{cache:'no-store'});if(!r.ok)throw new Error(`${url}: HTTP ${r.status}`);await cache.put(url,r.clone());return r}
  async downloadUrls(urls,{onProgress=null}={}){if(!this.supported())throw new Error('Offline cache unavailable');const m=await this.loadManifest(),cache=await this.caches.open(corpusCacheName(m.source.revision));let done=0;for(const url of [...new Set(urls)]){try{await this.fetchAndStore(url,cache)}catch(err){if(err?.name==='QuotaExceededError')throw new Error('Storage quota exceeded. Remove an offline pack or request persistent storage.');throw err}done++;onProgress?.({done,total:urls.length,url})}return{done,total:urls.length,revision:m.source.revision}}
  baseCorpusUrls({lexical=false}={}){const urls=['generated/corpus/manifest.json','generated/corpus/frequency.json'];if(lexical)urls.push('generated/corpus/lexical-index.json');return urls}
  async downloadBook(id,opts={}){const m=await this.loadManifest();if(!m.books.some(b=>b.id===id))throw new Error(`Unknown NT book ${id}`);return this.downloadUrls([...this.baseCorpusUrls(),bookUrl(id)],opts)}
  async downloadPack(id,opts={}){const p=PROGRAM_PACKS[id];if(!p)throw new Error(`Unknown offline pack ${id}`);return this.downloadUrls([...this.baseCorpusUrls(),...p.books.map(bookUrl)],opts)}
  async downloadFull(opts={}){const m=await this.loadManifest();return this.downloadUrls([...this.baseCorpusUrls({lexical:true}),...m.books.map(b=>bookUrl(b.id))],opts)}
  async downloadLexical(opts={}){return this.downloadUrls(['generated/corpus/manifest.json','generated/corpus/lexical-index.json'],opts)}
  async status(){const m=await this.loadManifest(),name=corpusCacheName(m.source.revision),cache=await this.caches.open(name),books={};for(const b of m.books)books[b.id]=!!(await cache.match(bookUrl(b.id)));const frequency=!!(await cache.match('generated/corpus/frequency.json')),lexical=!!(await cache.match('generated/corpus/lexical-index.json'));const names=await this.caches.keys(),stale=names.filter(x=>x.startsWith(CORPUS_PREFIX)&&x!==name);return{revision:m.source.revision,cacheName:name,books,downloadedBooks:Object.values(books).filter(Boolean).length,totalBooks:m.books.length,frequency,lexical,staleCaches:stale}}
  async removeBook(id){const m=await this.loadManifest(),cache=await this.caches.open(corpusCacheName(m.source.revision));return cache.delete(bookUrl(id))}
  async clearCurrent(){const m=await this.loadManifest();return this.caches.delete(corpusCacheName(m.source.revision))}
  async clearStale(){const m=await this.loadManifest(),keep=corpusCacheName(m.source.revision),names=await this.caches.keys(),targets=names.filter(x=>x.startsWith(CORPUS_PREFIX)&&x!==keep);await Promise.all(targets.map(x=>this.caches.delete(x)));return targets.length}
  async estimate(){if(!this.storage?.estimate)return null;const x=await this.storage.estimate();return{usage:Number(x.usage)||0,quota:Number(x.quota)||0,usageText:humanBytes(x.usage),quotaText:humanBytes(x.quota),percent:x.quota?Math.round(x.usage/x.quota*1000)/10:null,details:x.usageDetails||null}}
  async persistent(){if(!this.storage?.persisted)return null;return this.storage.persisted()}
  async requestPersistence(){if(!this.storage?.persist)return false;return this.storage.persist()}
}
return{PWA_VERSION,CORPUS_PREFIX,PROGRAM_PACKS,corpusCacheName,bookUrl,humanBytes,OfflineEngine};
});
