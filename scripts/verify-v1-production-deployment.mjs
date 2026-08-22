const BASE='https://thiepn.github.io/greek/';
const EXPECTED_MAIN_SHA='a8969652b8e868c07174a97c1998ebe8a3152b35';
const EXPECTED_BUILD=`bg13-${EXPECTED_MAIN_SHA.slice(0,12)}`;
const CONTENT_FINGERPRINT='e654a810fca0c9fbfa88c8808fa275204fba5a3806ac5ffd4f052a4ef0e9e445';
const CORPUS_REVISION='aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function probe(path){
  const url=new URL(path,BASE).href;
  const r=await fetch(`${url}${url.includes('?')?'&':'?'}v1_production_check=${Date.now()}`,{cache:'no-store',headers:{'cache-control':'no-cache'}});
  const text=await r.text();
  console.log(`${path}: ${r.status} ${r.headers.get('content-type')||''} bytes=${text.length}`);
  return {status:r.status,text,url};
}
async function waitFor(path){
  let p;
  for(let i=0;i<18;i++){
    p=await probe(path);
    if(p.status===200)return p;
    if(i<17)await sleep(5000);
  }
  return p;
}
function json(p,label){try{return JSON.parse(p.text)}catch{throw new Error(`${label} is not valid JSON`)}}
function assert(ok,msg){if(!ok)throw new Error(msg)}

const html=await waitFor('./');
assert(html.status===200,'Production root is unavailable');
assert(/Koin[eē]/i.test(html.text)||html.text.includes('Koinē Path'),'Production root does not identify Koinē Path');

const diagnostics={};
for(const path of ['course-ui.js','pwa-manager.js','manifest.webmanifest','RELEASE_CANDIDATE.json','generated/pwa-version.js','generated/corpus/manifest.json','generated/corpus/books/John.json']) diagnostics[path]=await probe(path);

const version=diagnostics['generated/pwa-version.js'];
assert(version.status===200,`Live Pages is not serving the current generated PWA build marker (${version.status})`);
assert(version.text.includes(JSON.stringify(EXPECTED_BUILD)),`PWA deployment identity mismatch. Expected ${EXPECTED_BUILD}; got ${version.text.trim()}`);

const rcProbe=diagnostics['RELEASE_CANDIDATE.json'];
assert(rcProbe.status===200,'Live Pages is not serving RELEASE_CANDIDATE.json');
const rc=json(rcProbe,'RELEASE_CANDIDATE.json');
assert(rc.candidate==='1.0.0',`Unexpected live candidate ${rc.candidate}`);
assert(rc.status==='production-certified',`Unexpected live release status ${rc.status}`);
assert(rc.certifiedContentFingerprint===CONTENT_FINGERPRINT,'Live certified-content fingerprint mismatch');
assert(rc.verdicts?.technical==='TECHNICAL_RC_CERTIFIED','Live technical verdict mismatch');
assert(rc.verdicts?.product==='V1_RELEASE_CERTIFIED','Live product verdict mismatch');
assert(rc.verdicts?.production==='PRODUCTION_CERTIFIED','Live production verdict mismatch');
assert(Array.isArray(rc.knownV1Blockers)&&rc.knownV1Blockers.length===0,'Live release metadata still has v1 blockers');

const manifestProbe=diagnostics['generated/corpus/manifest.json'];
assert(manifestProbe.status===200,'Live Pages is not serving generated corpus manifest');
const manifest=json(manifestProbe,'corpus manifest');
assert(manifest.source?.revision===CORPUS_REVISION,'Live corpus revision mismatch');
const c=manifest.coverage||{};
assert(c.books===27&&c.chapters===260&&c.verses===7927&&c.tokens===137554&&c.lemmas===5461&&c.fullCorpusIngested===true,`Live corpus coverage mismatch: ${JSON.stringify(c)}`);

const johnProbe=diagnostics['generated/corpus/books/John.json'];
assert(johnProbe.status===200,'Live Pages is not serving John corpus artifact');
const john=json(johnProbe,'John corpus');
assert(john.sourceRevision===CORPUS_REVISION,'Live John corpus revision mismatch');
assert(john.book?.id==='John'&&john.book?.chapters===21&&john.book?.tokens>0,'Live John book artifact is invalid');

console.log('V1_PRODUCTION_DEPLOYMENT_VERIFIED');
console.log('main_sha:',EXPECTED_MAIN_SHA);
console.log('pwa_build:',EXPECTED_BUILD);
console.log('candidate:',rc.candidate);
console.log('production_verdict:',rc.verdicts.production);
console.log('content_fingerprint:',CONTENT_FINGERPRINT);
console.log('corpus:',JSON.stringify(c));
