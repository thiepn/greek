const assert=require('assert');

global.window={};
require('../curriculum.js');
const curriculum=global.window.KOINE_CURRICULUM;
const {LearningEngine,MemoryStorage,DIMENSIONS,STORAGE_KEY}=require('../learning-engine.js');

let now=new Date('2026-08-21T09:00:00.000Z');
const clock=()=>new Date(now);
function engineWith(seed={}){return new LearningEngine({curriculum,storage:new MemoryStorage(seed),clock});}
function advance(days){now=new Date(now.getTime()+days*86400000);}
function resetNow(){now=new Date('2026-08-21T09:00:00.000Z');}
function fillDimension(engine,unitId,dimension,count){for(let i=0;i<count;i++)engine.recordEvidence({unitId,dimension,correct:true,hintLevel:'none',source:'test'});}
function masterUnit(engine,unitId){fillDimension(engine,unitId,'concept',2);fillDimension(engine,unitId,'recognition',4);fillDimension(engine,unitId,'application',3);fillDimension(engine,unitId,'reading',2);return engine.getUnit(unitId);}

(function testInitialState(){
  resetNow();const e=engineWith();const d=e.getDashboard();
  assert.equal(Object.keys(e.snapshot().units).length,50,'must create all 50 canonical unit records');
  assert.equal(e.getUnit(1).status,'available');
  assert.equal(e.getUnit(2).status,'locked');
  assert.equal(d.mastered,0);
})();

(function testSingleCorrectIsNotMastery(){
  resetNow();const e=engineWith();
  e.recordEvidence({unitId:1,dimension:'concept',correct:true,hintLevel:'none',source:'test'});
  assert.equal(e.getUnit(1).status,'in-progress');
  assert.equal(e.getUnit(1).dimensions.concept.evidence,1);
})();

(function testHintPenalty(){
  resetNow();const a=engineWith(),b=engineWith();
  a.recordEvidence({unitId:1,dimension:'concept',correct:true,hintLevel:'none',source:'test'});
  b.recordEvidence({unitId:1,dimension:'concept',correct:true,hintLevel:'full',source:'test'});
  assert(a.getUnit(1).dimensions.concept.score>b.getUnit(1).dimensions.concept.score,'unassisted evidence must be stronger than full-reveal evidence');
  assert(b.getDashboard().openRemediation>0,'full reveal should create dependency remediation');
})();

(function testTypedRemediation(){
  resetNow();const e=engineWith();
  e.recordEvidence({unitId:1,dimension:'recognition',correct:false,errorType:'case_confusion',itemId:'x',source:'test'});
  const s=e.snapshot();
  assert.equal(s.errors.case_confusion.count,1);
  assert.equal(s.remediation.length,1);
  assert.equal(e.recommend().kind,'remediation');
})();

(function testUnitMasteryAndPrerequisite(){
  resetNow();const e=engineWith();const u=masterUnit(e,1);
  assert.equal(u.status,'mastered');
  assert.equal(e.getUnit(2).status,'available','unit 2 should unlock after unit 1 mastery');
  assert(u.nextReviewAt,'mastery should schedule review');
})();

(function testStageGate(){
  resetNow();const e=engineWith();
  [1,2,3,4].forEach(id=>masterUnit(e,id));
  assert.equal(e.getStage('S0').passed,true,'S0 should pass when all dimensions are strong across all four units');
  assert.equal(e.getUnit(5).status,'available','first unit of S1 requires S0 stage gate');
})();

(function testReviewDueAndDecay(){
  resetNow();const e=engineWith();masterUnit(e,1);
  advance(15);
  assert.equal(e.getUnit(1).status,'review','scheduled review should surface after interval');
  const before=e.getUnit(1).dimensions.reading.score;
  const effective=e.getUnit(1).dimensions.reading.effective;
  assert(effective<before,'effective reading score should decay after grace period');
})();

(function testPassedStageDoesNotRelock(){
  resetNow();const e=engineWith();[1,2,3,4].forEach(id=>masterUnit(e,id));
  assert.equal(e.getUnit(5).status,'available');
  advance(90);
  assert.equal(e.getStage('S0').passed,true,'historically passed stage must remain passed');
  assert.notEqual(e.getUnit(5).status,'locked','decay creates review work but must not relock reached curriculum');
})();

(function testLegacyMigration(){
  resetNow();
  const legacy={done:['alphabet','article'],attempts:12,correct:9,review:[{form:'λόγῳ'}],words:['x']};
  const e=engineWith({'koine-path-v01':JSON.stringify(legacy)}),s=e.snapshot();
  assert.equal(s.migration.legacyImported,true);
  assert.equal(s.prototype.attempts,12);
  assert.equal(s.units['1'].dimensions.concept.evidence,1);
  assert.notEqual(e.getUnit(1).status,'mastered','legacy completion must not grant canonical mastery');
  assert(e.storage.getItem(STORAGE_KEY),'migrated v3 state must be persisted');
})();

(function testPrototypeStatePersistence(){
  resetNow();const storage=new MemoryStorage();const e=new LearningEngine({curriculum,storage,clock});
  e.updatePrototypeState({done:['alphabet'],attempts:3,correct:2,review:[],words:['a']});
  const e2=new LearningEngine({curriculum,storage,clock});
  assert.deepEqual(e2.getPrototypeState().done,['alphabet']);
  assert.equal(e2.getPrototypeState().attempts,3);
})();

(function testRemediationResolutionAddsEvidence(){
  resetNow();const e=engineWith();
  e.recordEvidence({unitId:1,dimension:'recognition',correct:false,errorType:'case_confusion',itemId:'x',source:'test'});
  const id=e.snapshot().remediation[0].id;
  e.resolveRemediation(id,{correct:true});
  assert.equal(e.snapshot().remediation[0].status,'resolved');
  assert(e.getUnit(1).dimensions.recognition.evidence>=2,'resolution should add successful recognition evidence after the original failure');
})();

(function testAllDimensionsExist(){
  resetNow();const e=engineWith();
  DIMENSIONS.forEach(d=>assert(e.getUnit(1).dimensions[d],`missing dimension ${d}`));
})();

console.log('BG3 learning-engine tests passed: 12 suites');
