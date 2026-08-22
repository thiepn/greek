const BASE='https://thiepn.github.io/greek/';
const EXPECTED_MAIN_SHA='60b7028017dfb7cc1b3adab9b153f00ab6c72b6f';
const EXPECTED_BUILD=`bg13-${EXPECTED_MAIN_SHA.slice(0,12)}`;
const CONTENT_FINGERPRINT='e654a810fca0c9fbfa88c8808fa275204fba5a3806ac5ffd4f052a4ef0e9e445';
const CORPUS_REVISION='aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d';

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(path,{json=false}={}){
  const url=new URL(path,BASE).href;
  let last;
  for(let i=0;i<18;i++){
    try{
      const r=await fetch(`${url}${url.includes('?')?'&':'?'}production_check=${Date.now()}`,{cache:'no-store',headers:{'cache-control':'no-cache'}});
      if(!r.ok)throw new Error(`${r.status} ${r.statusText}`);
      return json?await r.json():await r.text();
    }catch(e){last=e;if(i<17)await sleep(5000);}
  }
  throw new Error(`Unable to fetch ${url}: ${last}`);
}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const html=await get('./');
assert(/Koin[eē]/i.test(html)||html.includes('Koinē Path'),'Production root does not identify Koinē Path');

const version=await get('generated/pwa-version.js');
assert(version.includes(JSON.stringify(EXPECTED_BUILD)),`PWA deployment identity mismatch. Expected ${EXPECTED_BUILD}; got ${version.trim()}`);

const rc=await get('RELEASE_CANDIDATE.json',{json:true});
assert(rc.candidate==='1.0.0-rc.2',`Unexpected live candidate ${rc.candidate}`);
assert(rc.certifiedContentFingerprint===CONTENT_FINGERPRINT,'Live certified-content fingerprint mismatch');
assert(Array.isArray(rc.knownV1Blockers)&&rc.knownV1Blockers.length===0,'Live release metadata still has v1 blockers');

const manifest=await get('generated/corpus/manifest.json',{json:true});
assert(manifest.source?.revision===CORPUS_REVISION,'Live corpus revision mismatch');
const c=manifest.coverage||{};
assert(c.books===27&&c.chapters===260&&c.verses===7927&&c.tokens===137554&&c.lemmas===5461&&c.fullCorpusIngested===true,`Live corpus coverage mismatch: ${JSON.stringify(c)}`);

const john=await get('generated/corpus/books/John.json',{json:true});
assert(john.sourceRevision===CORPUS_REVISION,'Live John corpus revision mismatch');
assert(john.book?.id==='John'&&john.book?.chapters===21&&john.book?.tokens>0,'Live John book artifact is invalid');

console.log('PRODUCTION_DEPLOYMENT_VERIFIED');
console.log('main_sha:',EXPECTED_MAIN_SHA);
console.log('pwa_build:',EXPECTED_BUILD);
console.log('candidate:',rc.candidate);
console.log('content_fingerprint:',CONTENT_FINGERPRINT);
console.log('corpus:',JSON.stringify(c));
