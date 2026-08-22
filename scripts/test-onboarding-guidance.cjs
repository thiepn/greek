const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const guidance=require('../onboarding-engine.js');
const portability=require('../data-portability.js');

const ctx={window:{}};vm.runInNewContext(fs.readFileSync('curriculum.js','utf8'),ctx,{filename:'curriculum.js'});const curriculum=ctx.window.KOINE_CURRICULUM;
assert.equal(curriculum.stages.length,8);
assert.equal(guidance.QUESTIONS.length,16);
assert.equal(new Set(guidance.QUESTIONS.map(q=>q.id)).size,16);
for(const stage of curriculum.stages)assert.equal(guidance.QUESTIONS.filter(q=>q.stage===stage.id).length,2,`${stage.id} must have exactly two placement items`);
for(const q of guidance.QUESTIONS){assert.equal(q.prompt,q.prompt.normalize('NFC'));for(const option of q.options)assert.equal(option,option.normalize('NFC'));assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.options.length)}
assert.equal(guidance.stageForScore(0),0);assert.equal(guidance.stageForScore(2),1);assert.equal(guidance.stageForScore(14),7);assert.equal(guidance.stageForScore(16),7);
assert.ok(guidance.STATE_KEY.startsWith(portability.STORAGE_PREFIX));

function dashboard(stageId='S0'){
  return{currentStage:{id:stageId},recommendation:{kind:'new-unit',unitId:1,title:'Begin Unit 1: Alphabet recognition',reason:'Prerequisites are satisfied.'},mastered:0,total:50,due:0,openRemediation:0};
}
let masteryWrites=0;
const learningEngine={getDashboard:()=>dashboard('S0'),recordEvidence(){masteryWrites++},recordExposure(){masteryWrites++},recordHint(){masteryWrites++}};
const storage=new guidance.MemoryStorage();
const engine=new guidance.GuidanceEngine({curriculum,learningEngine,storage,clock:()=>new Date('2026-08-22T18:00:00Z')});
engine.saveProfile({experience:'coursework',goal:'read-nt',sessionMinutes:45,daysPerWeek:6});
engine.startPlacement();
for(const q of guidance.QUESTIONS)engine.answerPlacement(q.id,q.correct);
const result=engine.completePlacement();
assert.equal(result.score,16);assert.equal(result.stageId,'S7');assert.match(result.notice,/does not mark units mastered/i);assert.equal(masteryWrites,0,'placement must never write mastery evidence');
engine.finishOnboarding();
const beforePlan=storage.getItem(guidance.STATE_KEY);const plan=engine.getGuidedPlan();const afterPlan=storage.getItem(guidance.STATE_KEY);
assert.equal(plan.mode,'accelerated-validation');assert.equal(plan.minutes,45);assert.equal(plan.tasks.reduce((sum,t)=>sum+t.minutes,0),45);assert.equal(plan.tasks[0].unitId,1);assert.equal(beforePlan,afterPlan,'reading the guided plan must be side-effect free');assert.equal(masteryWrites,0);

for(const minutes of [10,25,45]){
  const s=new guidance.MemoryStorage(),e=new guidance.GuidanceEngine({curriculum,learningEngine:{getDashboard:()=>dashboard('S0')},storage:s});e.saveProfile({sessionMinutes:minutes,goal:'course-mastery'});e.skipPlacement();e.finishOnboarding();const p=e.getGuidedPlan();assert.equal(p.tasks.reduce((sum,t)=>sum+t.minutes,0),minutes,`plan must respect ${minutes}-minute budget`);
}

const low=new guidance.GuidanceEngine({curriculum,storage:new guidance.MemoryStorage()});low.startPlacement();for(const q of guidance.QUESTIONS)low.answerPlacement(q.id,(q.correct+1)%q.options.length);assert.equal(low.completePlacement().stageId,'S0');
assert.throws(()=>{const x=new guidance.GuidanceEngine({curriculum,storage:new guidance.MemoryStorage()});x.startPlacement();x.answerPlacement('p01',0);x.completePlacement()},/incomplete/i);

const backupStorage=new portability.MemoryStorage({'other-app':'keep'});const backedEngine=new guidance.GuidanceEngine({curriculum,storage:backupStorage});backedEngine.saveProfile({experience:'alphabet',goal:'grammar-refresh',sessionMinutes:25});backedEngine.skipPlacement();backedEngine.finishOnboarding();const stores=portability.collectStores(backupStorage);assert.ok(stores[guidance.STATE_KEY],'V1.3 guidance state must be covered by V1.2 backups');assert.equal(stores['other-app'],undefined);
const serialized=portability.serializeBackup(backupStorage,{appVersion:'v1.3-feature'});const parsed=portability.parseBackup(serialized);assert.ok(parsed.stores[guidance.STATE_KEY]);
const malformed=JSON.parse(serialized);malformed.stores[guidance.STATE_KEY]=JSON.stringify({schemaVersion:99});malformed.integrity.value=portability.checksum(JSON.stringify({schemaVersion:malformed.schemaVersion,stores:Object.keys(malformed.stores).sort().reduce((o,k)=>(o[k]=malformed.stores[k],o),{})}));assert.throws(()=>portability.parseBackup(malformed),/Guided-study state/);

const engineSource=fs.readFileSync('onboarding-engine.js','utf8'),uiSource=fs.readFileSync('onboarding-ui.js','utf8'),html=fs.readFileSync('index.html','utf8');
assert.ok(!/recordEvidence\s*\(/.test(engineSource),'guidance engine must have no mastery evidence write path');assert.ok(!/recordEvidence\s*\(/.test(uiSource),'guidance UI must have no mastery evidence write path');
for(const asset of ['onboarding.css','onboarding-engine.js','onboarding-ui.js'])assert.ok(html.includes(asset),`${asset} missing from index`);
assert.ok(html.includes('id="guided-plan"'));assert.ok(html.includes('id="study-path-settings"'));
assert.ok(html.indexOf('learning-engine.js')<html.indexOf('onboarding-engine.js'));assert.ok(html.indexOf('course-ui.js')<html.indexOf('onboarding-ui.js'));
assert.ok(!/setTimeout\(\(\)=>openDialog/.test(uiSource),'onboarding must not forcibly open for existing users');
console.log('V1.3 onboarding, placement, guided-path, mastery-firewall, and backup integration: PASS');
