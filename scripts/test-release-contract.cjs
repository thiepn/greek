const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const candidate=JSON.parse(read('RELEASE_CANDIDATE.json'));

assert.equal(candidate.candidate,'1.0.0-rc.1');
assert.equal(candidate.bg15SourceHead,'ac1cc912abb58b03ca7606eb39095cf54fa486f3');
assert.equal(candidate.bg15ContentFingerprint,'81f780289ed6d8719463092af9392fb5be85293aab20c50b26d0aa6758f130c5');
assert.equal(candidate.corpusRevision,'aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d');
assert.equal(candidate.apparatusRevision,'c4d241a9c1c479a55b989ba35a4976c1d0b8052c');
assert.equal(candidate.knownV1Blockers.filter(x=>x.severity==='release-blocker').length,1,'current v1 blocker register must be explicit');
assert.equal(candidate.productionVerification,'pending-merge-and-pages-deploy');

const context={window:{}};vm.createContext(context);vm.runInContext(read('curriculum.js'),context);
const curriculum=context.window.KOINE_CURRICULUM;
assert(curriculum&&curriculum.totalUnits===50,'canonical curriculum must contain 50 units');
assert.equal(curriculum.stages.flatMap(s=>s.units).length,50,'unit map must contain exactly 50 units');
assert(curriculum.principles.includes('tense-form-is-not-a-mechanical-time-or-action-kind'),'BG15 tense/aspect safeguard must remain frozen');
assert(curriculum.principles.includes('grammar-is-not-theology'),'grammar/theology boundary must remain frozen');

const app=read('app.js');
const lessonSection=app.slice(app.indexOf('const lessons=['),app.indexOf('const drills=['));
const prototypeLessonCount=(lessonSection.match(/\{id:'/g)||[]).length;
assert.equal(prototypeLessonCount,5,'release blocker contract expects exactly five prototype lessons until canonical course reconstruction');
assert(/Prototype lesson · canonical Unit/.test(lessonSection),'prototype lessons must remain visibly labeled as prototypes');

const index=read('index.html');
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

console.log(`BG16 release contract passed: ${curriculum.totalUnits} curriculum units, ${prototypeLessonCount} prototype lessons, ${candidate.knownV1Blockers.length} registered v1 blocker(s).`);
