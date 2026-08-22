const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const candidate=JSON.parse(read('RELEASE_CANDIDATE.json'));
const course=require('../data/course-content.js');
const experience=require('../data/course-v1.1-enrichment.js');

assert.equal(candidate.schemaVersion,3);
assert.equal(candidate.candidate,'1.1.0');
assert.equal(candidate.phase,'V1.1-production-promotion');
assert.equal(candidate.status,'production-certified');
assert.equal(candidate.contentSourceHead,'a48f7c781b3665fdd601abf5080282a1cc2ae29a');
assert.equal(candidate.certifiedContentFingerprint,'800642ad7fdc25f2a1b576abe6e013940da7171c1857d1718cb0d84d2a2660c1');
assert.equal(candidate.releaseCandidateSourceHead,'edea302467608a152ba172465bb5c00e256b8c79');
assert.equal(candidate.releaseCandidateFingerprint,'fd11e3721181e6f83b9c67881325c69ecdcbee79fdd111597c912ba44e4bb3e8');
assert.equal(candidate.releaseRuntimeFingerprint,'1c690bc15c47d3092fcc48f104302cf12d2c80d1a7ef82f3438df41d9e653887');
assert.equal(candidate.corpusRevision,'aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d');
assert.equal(candidate.apparatusRevision,'c4d241a9c1c479a55b989ba35a4976c1d0b8052c');
assert.equal(candidate.knownV1Blockers.length,0,'release blocker register must be empty');
assert(candidate.resolvedV1Blockers.some(x=>x.id==='BG16-B001'),'historical B001 resolution must remain auditable');
assert.equal(candidate.verdicts.technical,'TECHNICAL_RC_CERTIFIED');
assert.equal(candidate.verdicts.product,'V1_RELEASE_CERTIFIED');
assert.equal(candidate.verdicts.production,'PRODUCTION_CERTIFIED');
assert.equal(candidate.productionVerification.status,'verified');
assert.equal(candidate.productionVerification.expectedBranch,'main');
assert.equal(candidate.productionVerification.mainCommit,'27eadce94b823c2be45ae6b03c8c9f6da101dce1');
assert.equal(candidate.productionVerification.pwaBuild,'bg13-27eadce94b82');
assert.equal(candidate.productionVerification.verificationWorkflowRun,32589598659);
assert.equal(candidate.productionVerification.verificationJob,97071184937);
assert.equal(candidate.productionVerification.result,'V1_1_RELEASE_DEPLOYMENT_VERIFIED');
assert.deepEqual(candidate.productionVerification.liveCourse,{units:50,checkpoints:150,enrichedUnits:50,supplementaryPracticeItems:100});
assert.equal(candidate.productionVerification.liveCorpus.books,27);
assert.equal(candidate.productionVerification.liveCorpus.chapters,260);
assert.equal(candidate.productionVerification.liveCorpus.tokenBearingVerses,7927);
assert.equal(candidate.productionVerification.liveCorpus.tokens,137554);
assert.equal(candidate.productionVerification.liveCorpus.lemmas,5461);
assert.equal(candidate.productionVerification.liveCorpus.fullCorpusIngested,true);
assert.equal(candidate.previousProduction.candidate,'1.0.0');
assert.equal(candidate.previousProduction.status,'production-certified');
assert.equal(candidate.previousProduction.mainCommit,'60b7028017dfb7cc1b3adab9b153f00ab6c72b6f');
assert.equal(candidate.previousProduction.certifiedContentFingerprint,'e654a810fca0c9fbfa88c8808fa275204fba5a3806ac5ffd4f052a4ef0e9e445');
assert.equal(candidate.previousProduction.releaseCandidateFingerprint,'7deb0d2f913498fae9c90a95655e032b39753fb5302332185480738eb3398714');

const context={window:{}};vm.createContext(context);vm.runInContext(read('curriculum.js'),context);
const curriculum=context.window.KOINE_CURRICULUM;
assert(curriculum&&curriculum.totalUnits===50,'canonical curriculum must contain 50 units');
assert.equal(curriculum.stages.flatMap(s=>s.units).length,50,'unit map must contain exactly 50 units');
assert(curriculum.principles.includes('tense-form-is-not-a-mechanical-time-or-action-kind'),'tense/aspect safeguard must remain frozen');
assert(curriculum.principles.includes('grammar-is-not-theology'),'grammar/theology boundary must remain frozen');

assert.equal(course.units.length,50,'release requires production content for all 50 canonical units');
assert.deepEqual(course.units.map(u=>u.id),Array.from({length:50},(_,i)=>i+1),'course unit IDs must be complete and ordered');
assert.equal(course.units.reduce((n,u)=>n+u.checks.length,0),150,'release requires exactly 150 deterministic course checkpoints');
assert(course.units.every(u=>u.scripture.length>=1),'every canonical unit requires Scripture transfer');
assert(course.units.every(u=>u.teach.length>=3),'every canonical unit requires substantive teaching movements');

assert.equal(experience.version,'v1.1.0');
assert.equal(experience.role,'supplementary-unscored-learning-experience');
assert.equal(experience.policy.masteryEvidence,false,'V1.1 supplementary practice must remain outside mastery');
assert.equal(experience.units.length,50,'all 50 canonical units require the V1.1 learning-experience layer');
assert.deepEqual(experience.units.map(u=>u.id),course.units.map(u=>u.id),'V1.1 enrichment must map exactly to canonical Units 1–50');
assert.equal(experience.units.reduce((n,u)=>n+u.practice.length,0),100,'V1.1 requires exactly 100 supplementary retrieval items');
assert(experience.units.every(u=>u.observe&&u.contrast&&u.reasoning&&u.practice.length===2),'every unit requires observe, contrast, reasoning, and two practice items');
const expected=candidate.expectedCourse;
assert.equal(expected.units,50);assert.equal(expected.checkpoints,150);assert.equal(expected.enrichedUnits,50);assert.equal(expected.supplementaryPracticeItems,100);assert.equal(expected.observations,50);assert.equal(expected.contrasts,50);assert.equal(expected.reasoningPrompts,50);

const app=read('app.js');
assert(!/Prototype lesson · canonical Unit/.test(app),'retired prototype lesson labels must not return');
assert(!/const lessons\s*=\s*\[/.test(app),'release app bootstrap must not embed the obsolete five-lesson prototype');

const index=read('index.html');
const enrichPos=index.indexOf('data/course-v1.1-enrichment.js');
const courseUiPos=index.indexOf('course-ui.js');
assert(/data\/course-content\.js/.test(index)&&courseUiPos>=0&&/course\.css/.test(index),'production Learn course assets must be loaded');
assert(enrichPos>=0&&enrichPos<courseUiPos,'V1.1 enrichment must load before the Learn runtime');
assert(/Canonical 50-unit course/.test(index),'Learn workspace must identify the canonical course');
assert(/<meta name="koine-ai-endpoint" content="">/.test(index),'remote AI endpoint must remain blank until secure deployment is configured');
assert(/viewport-fit=cover/.test(index),'PWA safe-area viewport contract must remain enabled');
assert(!/user-scalable\s*=\s*no/i.test(index)&&!/maximum-scale\s*=\s*1/i.test(index),'browser zoom must not be disabled');

const pages=read('.github/workflows/pages.yml');
assert(/branches:\s*\[main\]/.test(pages),'production Pages deployment must remain main-only');
assert(/build-full-corpus\.mjs/.test(pages)&&/validate-full-corpus\.mjs/.test(pages),'production deployment must rebuild and validate the pinned corpus');
assert(/validate-pwa-build\.mjs/.test(pages),'production deployment must validate the PWA shell');

const releaseWorkflow=read('.github/workflows/release-certification.yml');
assert(/startsWith\(github\.head_ref, 'release\/'\)/.test(releaseWorkflow),'final certification must run for release/* pull requests');
assert(/test-learning-experience\.cjs/.test(releaseWorkflow),'release certification must include V1.1 deterministic learning QA');
assert(/chromium firefox webkit/.test(releaseWorkflow),'release certification must install all three browser engines');

const required=['CONTENT_QA.md','LEARNING_EXPERIENCE_V1_1.md','RELEASE_CERTIFICATION.md','RELEASE_NOTES.md','KNOWN_LIMITATIONS.md','RELEASE_CANDIDATE.json','ATTRIBUTION.md'];
required.forEach(p=>assert(fs.existsSync(path.join(root,p)),`missing release document ${p}`));

const jsFiles=[];
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(ent.name==='.git'||ent.name==='node_modules'||ent.name==='generated')continue;const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p);else if(/\.(?:js|cjs|mjs)$/.test(ent.name))jsFiles.push(p)}}
walk(root);
const clearers=jsFiles.filter(p=>/localStorage\.clear\s*\(/.test(fs.readFileSync(p,'utf8')));
assert.deepEqual(clearers,[],'release code must not wipe all learner localStorage');
const secretFiles=jsFiles.filter(p=>/sk-[A-Za-z0-9_-]{20,}/.test(fs.readFileSync(p,'utf8')));
assert.deepEqual(secretFiles,[],'release source must not contain likely OpenAI API keys');

console.log(`v1.1.0 production-promotion contract passed: ${course.units.length} units, 150 canonical checkpoints, 100 unscored retrieval items, verified live main ${candidate.productionVerification.mainCommit}, ${candidate.knownV1Blockers.length} release blockers.`);
