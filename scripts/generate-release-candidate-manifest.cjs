const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p));
const text=p=>read(p).toString('utf8');
const json=p=>JSON.parse(text(p));
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const candidate=json('RELEASE_CANDIDATE.json');
const content=json('generated/content-qa-manifest.json');
if(content.certifiedContentFingerprint!==candidate.bg15ContentFingerprint)throw new Error(`BG15 fingerprint drift: expected ${candidate.bg15ContentFingerprint}, got ${content.certifiedContentFingerprint}`);

const index=text('index.html');
const localRefs=[...index.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]).filter(x=>!x.startsWith('http')&&!x.startsWith('#'));
const runtimeSet=new Set(['index.html','manifest.webmanifest','sw.js','RELEASE_CANDIDATE.json',...localRefs]);
function addTree(rel){const abs=path.join(ROOT,rel);if(!fs.existsSync(abs))return;for(const ent of fs.readdirSync(abs,{withFileTypes:true})){if(ent.name==='node_modules'||ent.name.startsWith('.dev.')||ent.name==='.env')continue;const child=path.posix.join(rel,ent.name);if(ent.isDirectory())addTree(child);else runtimeSet.add(child)}}
addTree('worker');
const runtimeFiles=[...runtimeSet].filter(p=>fs.existsSync(path.join(ROOT,p))&&fs.statSync(path.join(ROOT,p)).isFile()).sort();
const runtime=runtimeFiles.map(p=>{const b=read(p);return{path:p,bytes:b.length,sha256:sha(b)}});
const runtimeFingerprint=sha(runtime.map(x=>`${x.path}:${x.sha256}`).join('\n'));
const releaseBlockers=(candidate.knownV1Blockers||[]).filter(x=>x.severity==='release-blocker');
const technicalVerdict=process.env.BG16_TECHNICAL_VERDICT||'PENDING_VALIDATION';
const productVerdict=technicalVerdict==='TECHNICAL_RC_CERTIFIED'?(releaseBlockers.length?'V1_RELEASE_BLOCKED':'V1_RELEASE_CERTIFIED'):'PENDING_VALIDATION';
const manifest={
  schemaVersion:1,
  candidate:candidate.candidate,
  headSha:process.env.RC_HEAD_SHA||null,
  generatedAt:new Date().toISOString(),
  frozenInputs:{
    bg15SourceHead:candidate.bg15SourceHead,
    bg15ContentFingerprint:candidate.bg15ContentFingerprint,
    corpusRevision:candidate.corpusRevision,
    apparatusRevision:candidate.apparatusRevision
  },
  verdicts:{
    technical:technicalVerdict,
    product:productVerdict,
    production:'PENDING_MAIN_DEPLOYMENT',
    manualAssistiveTechnology:'NOT_MANUALLY_CERTIFIED'
  },
  releaseBlockers,
  runtime:{fileCount:runtime.length,runtimeFingerprint,files:runtime},
  content:{certifiedContentFingerprint:content.certifiedContentFingerprint,counts:content.counts,corpus:content.corpus.coverage}
};
const semantic=JSON.parse(JSON.stringify(manifest));delete semantic.generatedAt;
manifest.releaseCandidateFingerprint=sha(JSON.stringify(semantic));
const out=path.join(ROOT,'generated','release-candidate-manifest.json');
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(manifest,null,2)+'\n');
console.log(`BG16 release candidate fingerprint: ${manifest.releaseCandidateFingerprint}`);
console.log(`Technical verdict: ${manifest.verdicts.technical}; product verdict: ${manifest.verdicts.product}; blockers: ${releaseBlockers.length}`);
