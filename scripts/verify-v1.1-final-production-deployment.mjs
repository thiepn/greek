import vm from 'node:vm';

const BASE='https://thiepn.github.io/greek/';
const EXPECTED_MAIN_SHA='0226bbf4ce20bc68760c544e4f63fc5389e1cfc5';
const EXPECTED_BUILD=`bg13-${EXPECTED_MAIN_SHA.slice(0,12)}`;
const CONTENT_FINGERPRINT='800642ad7fdc25f2a1b576abe6e013940da7171c1857d1718cb0d84d2a2660c1';
const RUNTIME_FINGERPRINT='1c690bc15c47d3092fcc48f104302cf12d2c80d1a7ef82f3438df41d9e653887';
const RELEASE_HEAD='edea302467608a152ba172465bb5c00e256b8c79';
const RELEASE_FINGERPRINT='fd11e3721181e6f83b9c67881325c69ecdcbee79fdd111597c912ba44e4bb3e8';
const VERIFIED_RUNTIME_MAIN='27eadce94b823c2be45ae6b03c8c9f6da101dce1';
const VERIFIED_RUNTIME_BUILD='bg13-27eadce94b82';
const CORPUS_REVISION='aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d';
const EXPECTED_COURSE={units:50,checkpoints:150,enrichedUnits:50,supplementaryPracticeItems:100};
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function probe(path){
  const url=new URL(path,BASE).href;
  const response=await fetch(`${url}${url.includes('?')?'&':'?'}v11_final_production_check=${Date.now()}`,{
    cache:'no-store',
    headers:{'cache-control':'no-cache','pragma':'no-cache'}
  });
  const text=await response.text();
  console.log(`${path}: ${response.status} ${response.headers.get('content-type')||''} bytes=${text.length}`);
  return {status:response.status,text,url,headers:response.headers};
}

function parseJson(result,label){
  try{return JSON.parse(result.text)}catch{throw new Error(`${label} is not valid JSON`)}
}

function assert(ok,message){
  if(!ok)throw new Error(message);
}

async function waitForExactDeployment(){
  let last='not probed';
  for(let attempt=0;attempt<24;attempt++){
    const [version,releaseProbe]=await Promise.all([
      probe('generated/pwa-version.js'),
      probe('RELEASE_CANDIDATE.json')
    ]);
    let release=null;
    try{if(releaseProbe.status===200)release=parseJson(releaseProbe,'RELEASE_CANDIDATE.json')}catch{}
    const versionOk=version.status===200&&version.text.includes(JSON.stringify(EXPECTED_BUILD));
    const releaseOk=
      release?.candidate==='1.1.0'&&
      release?.status==='production-certified'&&
      release?.verdicts?.production==='PRODUCTION_CERTIFIED'&&
      release?.certifiedContentFingerprint===CONTENT_FINGERPRINT;
    if(versionOk&&releaseOk)return {version,releaseProbe,release};
    last=`version=${version.status}:${version.text.trim()} candidate=${release?.candidate||'unavailable'} status=${release?.status||'unavailable'} production=${release?.verdicts?.production||'unavailable'} fingerprint=${release?.certifiedContentFingerprint||'unavailable'}`;
    console.log(`Waiting for exact final Pages deployment (${attempt+1}/24): ${last}`);
    if(attempt<23)await sleep(5000);
  }
  throw new Error(`Timed out waiting for exact v1.1 production metadata deployment. Last identity: ${last}`);
}

const exact=await waitForExactDeployment();
const html=await probe('./');
assert(html.status===200,'Production root is unavailable');
assert(html.text.includes('Koinē Path'),'Production root does not identify Koinē Path');
assert(html.text.includes('course-v1.1.css'),'Production root is missing the V1.1 course stylesheet');
assert(html.text.includes('data/course-v1.1-enrichment.js'),'Production root is missing V1.1 enrichment data');
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

const release=exact.release;
assert(release.candidate==='1.1.0',`Unexpected live candidate ${release.candidate}`);
assert(release.phase==='V1.1-production-promotion',`Unexpected live release phase ${release.phase}`);
assert(release.status==='production-certified',`Unexpected live release status ${release.status}`);
assert(release.certifiedContentFingerprint===CONTENT_FINGERPRINT,'Live certified-content fingerprint mismatch');
assert(release.releaseRuntimeFingerprint===RUNTIME_FINGERPRINT,'Live frozen runtime fingerprint mismatch');
assert(release.releaseCandidateSourceHead===RELEASE_HEAD,'Live accepted release head mismatch');
assert(release.releaseCandidateFingerprint===RELEASE_FINGERPRINT,'Live accepted release fingerprint mismatch');
assert(Array.isArray(release.knownV1Blockers)&&release.knownV1Blockers.length===0,'Live release metadata still has v1 blockers');
assert(release.verdicts?.technical==='TECHNICAL_RC_CERTIFIED','Live technical verdict is not certified');
assert(release.verdicts?.product==='V1_RELEASE_CERTIFIED','Live product verdict is not certified');
assert(release.verdicts?.production==='PRODUCTION_CERTIFIED','Live production verdict is not certified');
assert(release.productionVerification?.status==='verified','Live production-verification status is not verified');
assert(release.productionVerification?.expectedBranch==='main','Live production verification does not target main');
assert(release.productionVerification?.mainCommit===VERIFIED_RUNTIME_MAIN,'Live recorded runtime deployment commit mismatch');
assert(release.productionVerification?.pwaBuild===VERIFIED_RUNTIME_BUILD,'Live recorded runtime deployment build mismatch');
assert(release.productionVerification?.result==='V1_1_RELEASE_DEPLOYMENT_VERIFIED','Live recorded runtime deployment result mismatch');
const expected=release.expectedCourse||{};
assert(expected.units===EXPECTED_COURSE.units&&expected.checkpoints===EXPECTED_COURSE.checkpoints&&expected.enrichedUnits===EXPECTED_COURSE.enrichedUnits&&expected.supplementaryPracticeItems===EXPECTED_COURSE.supplementaryPracticeItems,`Live expected-course contract mismatch: ${JSON.stringify(expected)}`);

const pwaShell=parseJson(diagnostics['generated/pwa-shell.json'],'PWA shell manifest');
assert(pwaShell.version===EXPECTED_BUILD,`Live PWA shell version mismatch: ${pwaShell.version}`);
assert(Array.isArray(pwaShell.assets)&&pwaShell.assets.includes('course-v1.1.css'),'Live PWA shell omits course-v1.1.css');
assert(pwaShell.assets.includes('data/course-v1.1-enrichment.js'),'Live PWA shell omits V1.1 enrichment data');
assert(pwaShell.assets.includes('data/course-content.js'),'Live PWA shell omits canonical course content');
const sw=diagnostics['sw.js'].text;
assert(sw.includes("importScripts('./generated/pwa-version.js')"),'Live service worker is not bound to the generated build identity');
assert(sw.includes("const CORPUS_PREFIX='koine-corpus-'"),'Live service worker is missing revision-aware corpus cache identity');

const courseSandbox={};
courseSandbox.globalThis=courseSandbox;
vm.runInNewContext(diagnostics['data/course-content.js'].text,courseSandbox,{filename:'live-course-content.js'});
const course=courseSandbox.KOINE_COURSE_CONTENT;
assert(course?.unitCount===50&&course.units?.length===50,`Live canonical course is incomplete: ${course?.unitCount}`);
assert(course.units.reduce((sum,unit)=>sum+(unit.checks?.length||0),0)===150,'Live canonical course does not contain exactly 150 checkpoints');
assert(course.units.every((unit,index)=>unit.id===index+1),'Live canonical course unit IDs/order are invalid');

const enrichmentSandbox={};
enrichmentSandbox.globalThis=enrichmentSandbox;
vm.runInNewContext(diagnostics['data/course-v1.1-enrichment.js'].text,enrichmentSandbox,{filename:'live-course-v1.1-enrichment.js'});
const enrichment=enrichmentSandbox.KOINE_COURSE_ENRICHMENT;
assert(enrichment?.version==='v1.1.0',`Live enrichment version mismatch: ${enrichment?.version}`);
assert(enrichment.unitCount===50&&enrichment.units?.length===50,'Live V1.1 enrichment is not complete for all 50 units');
assert(enrichment.policy?.masteryEvidence===false,'Live supplementary V1.1 practice incorrectly claims mastery evidence');
assert(enrichment.policy?.practiceItemsPerUnit===2,'Live supplementary practice count policy drifted');
assert(enrichment.units.every((unit,index)=>unit.id===index+1&&unit.practice?.length===2),'Live V1.1 enrichment unit/practice structure is incomplete');
assert(enrichment.units.reduce((sum,unit)=>sum+unit.practice.length,0)===100,'Live V1.1 enrichment does not contain exactly 100 supplementary practice items');

const manifest=parseJson(diagnostics['generated/corpus/manifest.json'],'corpus manifest');
assert(manifest.source?.revision===CORPUS_REVISION,'Live corpus revision mismatch');
const coverage=manifest.coverage||{};
assert(coverage.books===27&&coverage.chapters===260&&coverage.verses===7927&&coverage.tokens===137554&&coverage.lemmas===5461&&coverage.fullCorpusIngested===true,`Live corpus coverage mismatch: ${JSON.stringify(coverage)}`);

const john=parseJson(diagnostics['generated/corpus/books/John.json'],'John corpus');
assert(john.sourceRevision===CORPUS_REVISION,'Live John corpus revision mismatch');
assert(john.book?.id==='John'&&john.book?.chapters===21&&john.book?.tokens>0,'Live John corpus artifact is invalid');

console.log('V1_1_PRODUCTION_METADATA_DEPLOYMENT_VERIFIED');
console.log('main_sha:',EXPECTED_MAIN_SHA);
console.log('pwa_build:',EXPECTED_BUILD);
console.log('candidate:',release.candidate);
console.log('release_status:',release.status);
console.log('production_verdict:',release.verdicts.production);
console.log('content_fingerprint:',CONTENT_FINGERPRINT);
console.log('runtime_fingerprint:',RUNTIME_FINGERPRINT);
console.log('course:',JSON.stringify({units:course.unitCount,checkpoints:150,enrichedUnits:enrichment.unitCount,supplementaryPracticeItems:100}));
console.log('corpus:',JSON.stringify(coverage));
