const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const candidate=JSON.parse(read('RELEASE_CANDIDATE.json'));
const course=require('../data/course-content.js');

assert.equal(candidate.schemaVersion,2);
assert.equal(candidate.candidate,'1.0.0-rc.2');
assert.equal(candidate.phase,'BG16-B001');
assert.equal(candidate.contentSourceHead,'701ae7f3e3eaafcb8b2e33590df26ba665c8bab8');
assert.equal(candidate.certifiedContentFingerprint,'e654a810fca0c9fbfa88c8808fa275204fba5a3806ac5ffd4f052a4ef0e9e445');
assert.equal(candidate.corpusRevision,'aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d');
assert.equal(candidate.apparatusRevision,'c4d241a9c1c479a55b989ba35a4976c1d0b8052c');
assert.equal(candidate.knownV1Blockers.filter(x=>x.severity==='release-blocker').length,0,'v1 blocker register must be empty after B001 resolution');
assert(candidate.resolvedV1Blockers.some(x=>x.id==='BG16-B001'),'B001 resolution must remain auditable');
assert.equal(candidate.productionVerification,'pending-merge-and-pages-deploy');

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

const app=read('app.js');
assert(!/Prototype lesson · canonical Unit/.test(app),'retired prototype lesson labels must not return');
assert(!/const lessons\s*=\s*\[/.test(app),'release app bootstrap must not embed the obsolete five-lesson prototype');

const index=read('index.html');
assert(/data\/course-content\.js/.test(index)&&/course-ui\.js/.test(index)&&/course\.css/.test(index),'production Learn course assets must be loaded');
assert(/Canonical 50-unit course/.test(index),'Learn workspace must identify the canonical course');
assert(/<meta name="koine-ai-endpoint" content="">/.test(index),'remote AI endpoint must remain blank until secure deployment is configured');
assert(/viewport-fit=cover/.test(index),'PWA safe-area viewport contract must remain enabled');
assert(!/user-scalable\s*=\s*no/i.test(index)&&!/maximum-scale\s*=\s*1/i.test(index),'browser zoom must not be disabled');

const pages=read('.github/workflows/pages.yml');
assert(/branches:\s*\[main\]/.test(pages),'production Pages deployment must remain main-only');
assert(/build-full-corpus\.mjs/.test(pages)&&/validate-full-corpus\.mjs/.test(pages),'production deployment must rebuild and validate the pinned corpus');
assert(/validate-pwa-build\.mjs/.test(pages),'production deployment must validate the PWA shell');

const required=['CONTENT_QA.md','RELEASE_CERTIFICATION.md','KNOWN_LIMITATIONS.md','RELEASE_CANDIDATE.json','ATTRIBUTION.md'];
required.forEach(p=>assert(fs.existsSync(path.join(root,p)),`missing release document ${p}`));

const jsFiles=[];
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(ent.name==='.git'||ent.name==='node_modules'||ent.name==='generated')continue;const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p);else if(/\.(?:js|cjs|mjs)$/.test(ent.name))jsFiles.push(p)}}
walk(root);
const clearers=jsFiles.filter(p=>/localStorage\.clear\s*\(/.test(fs.readFileSync(p,'utf8')));
assert.deepEqual(clearers,[],'release code must not wipe all learner localStorage');
const secretFiles=jsFiles.filter(p=>/sk-[A-Za-z0-9_-]{20,}/.test(fs.readFileSync(p,'utf8')));
assert.deepEqual(secretFiles,[],'release source must not contain likely OpenAI API keys');

console.log(`BG16-B001 release contract passed: ${course.units.length} course units, 150 checkpoints, ${candidate.knownV1Blockers.length} registered v1 blockers.`);
