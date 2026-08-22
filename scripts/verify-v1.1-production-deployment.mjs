import vm from 'node:vm';

const BASE='https://thiepn.github.io/greek/';
const EXPECTED_MAIN_SHA='27eadce94b823c2be45ae6b03c8c9f6da101dce1';
const EXPECTED_BUILD=`bg13-${EXPECTED_MAIN_SHA.slice(0,12)}`;
const CONTENT_FINGERPRINT='800642ad7fdc25f2a1b576abe6e013940da7171c1857d1718cb0d84d2a2660c1';
const CORPUS_REVISION='aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d';
const EXPECTED_COURSE={units:50,checkpoints:150,enrichedUnits:50,supplementaryPracticeItems:100};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function probe(path){
  const url=new URL(path,BASE).href;
  const r=await fetch(`${url}${url.includes('?')?'&':'?'}v11_production_check=${Date.now()}`,{
    cache:'no-store',
    headers:{'cache-control':'no-cache','pragma':'no-cache'}
  });
  const text=await r.text();
  console.log(`${path}: ${r.status} ${r.headers.get('content-type')||''} bytes=${text.length}`);
  return {status:r.status,text,url,headers:r.headers};
}
function json(p,label){try{return JSON.parse(p.text)}catch{throw new Error(`${label} is not valid JSON`)}}
function assert(ok,msg){if(!ok)throw new Error(msg)}

async function waitForExactDeployment(){
  let last='not probed';
  for(let i=0;i<24;i++){
    const [version,rcProbe]=await Promise.all([probe('generated/pwa-version.js'),probe('RELEASE_CANDIDATE.json')]);
    let rc=null;
    try{if(rcProbe.status===200)rc=json(rcProbe,'RELEASE_CANDIDATE.json')}catch{}
    const versionOk=version.status===200&&version.text.includes(JSON.stringify(EXPECTED_BUILD));
    const rcOk=rc?.candidate==='1.1.0'&&rc?.certifiedContentFingerprint===CONTENT_FINGERPRINT;
    if(versionOk&&rcOk)return {version,rcProbe,rc};
    last=`version=${version.status}:${version.text.trim()} candidate=${rc?.candidate||'unavailable'} fingerprint=${rc?.certifiedContentFingerprint||'unavailable'}`;
    console.log(`Waiting for exact Pages deployment (${i+1}/24): ${last}`);
    if(i<23)await sleep(5000);
  }
  throw new Error(`Timed out waiting for exact merged v1.1 deployment. Last identity: ${last}`);
}

const exact=await waitForExactDeployment();
const html=await probe('./');
assert(html.status===200,'Production root is unavailable');
assert(html.text.includes('Koinē Path'),'Production root does not identify Koinē Path');
assert(html.text.includes('course-v1.1.css'),'Production root is missing the V1.1 course stylesheet');
assert(html.text.includes('data/course-v1.1-enrichment.js'),'Production root is missing the V1.1 enrichment data');
assert(html.text.includes('course-ui.js'),'Production root is missing the production course UI');
assert(html.text.includes('pwa-manager.js'),'Production root is missing the PWA manager');

const paths=[
  'course-ui.js',
  'course-v1.1.css',
  'data/course-content.js',
  'data/course-v1.1-enrichment.js',
  'pwa-manager.js',
  'manifest.webmanifest',
  'sw.js',
  'generated/pwa-shell.json',
  'generated/corpus/manifest.json',
  'generated/corpus/books/John.json'
];
const diagnostics={};
for(const path of paths)diagnostics[path]=await probe(path);
for(const path of paths)assert(diagnostics[path].status===200,`Live Pages asset failed: ${path} HTTP ${diagnostics[path].status}`);

const rc=exact.rc;
assert(rc.candidate==='1.1.0',`Unexpected live candidate ${rc.candidate}`);
assert(rc.status==='release-candidate',`Unexpected pre-promotion live release status ${rc.status}`);
assert(rc.certifiedContentFingerprint===CONTENT_FINGERPRINT,'Live certified-content fingerprint mismatch');
assert(Array.isArray(rc.knownV1Blockers)&&rc.knownV1Blockers.length===0,'Live release metadata still has v1 blockers');
assert(rc.productionVerification?.status==='pending-main-deployment','Pre-promotion live production-verification state is unexpected');
assert(rc.productionVerification?.expectedBranch==='main','Live production metadata does not target main');
const expected=rc.expectedCourse||{};
assert(expected.units===EXPECTED_COURSE.units&&expected.checkpoints===EXPECTED_COURSE.checkpoints&&expected.enrichedUnits===EXPECTED_COURSE.enrichedUnits&&expected.supplementaryPracticeItems===EXPECTED_COURSE.supplementaryPracticeItems,`Live expected-course contract mismatch: ${JSON.stringify(expected)}`);

const pwaShell=json(diagnostics['generated/pwa-shell.json'],'PWA shell manifest');
assert(pwaShell.version===EXPECTED_BUILD,`Live PWA shell version mismatch: ${pwaShell.version}`);
assert(Array.isArray(pwaShell.assets)&&pwaShell.assets.includes('course-v1.1.css'),'Live PWA shell omits course-v1.1.css');
assert(pwaShell.assets.includes('data/course-v1.1-enrichment.js'),'Live PWA shell omits V1.1 enrichment data');
assert(pwaShell.assets.includes('data/course-content.js'),'Live PWA shell omits canonical course content');
const sw=diagnostics['sw.js'].text;
assert(sw.includes("importScripts('./generated/pwa-version.js')"),'Live service worker is not bound to the generated build identity');
assert(sw.includes("const CORPUS_PREFIX='koine-corpus-'"),'Live service worker is missing revision-aware corpus cache identity');

const courseSandbox={};courseSandbox.globalThis=courseSandbox;
vm.runInNewContext(diagnostics['data/course-content.js'].text,courseSandbox,{filename:'live-course-content.js'});
const course=courseSandbox.KOINE_COURSE_CONTENT;
assert(course?.unitCount===50&&course.units?.length===50,`Live canonical course is incomplete: ${course?.unitCount}`);
assert(course.units.reduce((n,u)=>n+(u.checkpoints?.length||0),0)===150,'Live canonical course does not contain exactly 150 checkpoints');
assert(course.units.every((u,i)=>u.id===i+1),'Live canonical course unit IDs/order are invalid');

const enrichmentSandbox={};enrichmentSandbox.globalThis=enrichmentSandbox;
vm.runInNewContext(diagnostics['data/course-v1.1-enrichment.js'].text,enrichmentSandbox,{filename:'live-course-v1.1-enrichment.js'});
const enrichment=enrichmentSandbox.KOINE_COURSE_ENRICHMENT;
assert(enrichment?.version==='v1.1.0',`Live enrichment version mismatch: ${enrichment?.version}`);
assert(enrichment.unitCount===50&&enrichment.units?.length===50,'Live V1.1 enrichment is not complete for all 50 units');
assert(enrichment.policy?.masteryEvidence===false,'Live supplementary V1.1 practice incorrectly claims mastery evidence');
assert(enrichment.policy?.practiceItemsPerUnit===2,'Live supplementary practice count policy drifted');
assert(enrichment.units.every((u,i)=>u.id===i+1&&u.practice?.length===2),'Live V1.1 enrichment unit/practice structure is incomplete');
assert(enrichment.units.reduce((n,u)=>n+u.practice.length,0)===100,'Live V1.1 enrichment does not contain exactly 100 supplementary practice items');

const manifest=json(diagnostics['generated/corpus/manifest.json'],'corpus manifest');
assert(manifest.source?.revision===CORPUS_REVISION,'Live corpus revision mismatch');
const c=manifest.coverage||{};
assert(c.books===27&&c.chapters===260&&c.verses===7927&&c.tokens===137554&&c.lemmas===5461&&c.fullCorpusIngested===true,`Live corpus coverage mismatch: ${JSON.stringify(c)}`);

const john=json(diagnostics['generated/corpus/books/John.json'],'John corpus');
assert(john.sourceRevision===CORPUS_REVISION,'Live John corpus revision mismatch');
assert(john.book?.id==='John'&&john.book?.chapters===21&&john.book?.tokens>0,'Live John corpus artifact is invalid');

console.log('V1_1_RELEASE_DEPLOYMENT_VERIFIED');
console.log('main_sha:',EXPECTED_MAIN_SHA);
console.log('pwa_build:',EXPECTED_BUILD);
console.log('candidate:',rc.candidate);
console.log('release_status:',rc.status);
console.log('content_fingerprint:',CONTENT_FINGERPRINT);
console.log('course:',JSON.stringify({units:course.unitCount,checkpoints:150,enrichedUnits:enrichment.unitCount,supplementaryPracticeItems:100}));
console.log('corpus:',JSON.stringify(c));
