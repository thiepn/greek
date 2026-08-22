const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const weekly=require('../weekly-planning-engine.js');
const portability=require('../data-portability.js');

const ctx={window:{}};vm.runInNewContext(fs.readFileSync('curriculum.js','utf8'),ctx,{filename:'curriculum.js'});const curriculum=ctx.window.KOINE_CURRICULUM;
const unitIds=curriculum.stages.flatMap(s=>s.units);assert.equal(curriculum.stages.length,8);assert.equal(unitIds.length,50);
let masteredCount=8;
let masteryDates={};
function unitState(id){const mastered=unitIds.indexOf(id)<masteredCount;return{id,status:mastered?'mastered':'locked',masteredAt:mastered?(masteryDates[id]||'2026-06-01T08:00:00.000Z'):null}}
const learning={
  getDashboard(){return{mastered:masteredCount,total:50,due:0,openRemediation:0,currentStage:{id:'S1'},recommendation:{kind:'new-unit',unitId:masteredCount+1}}},
  getUnit(id){return unitState(id)},
  getStage(id){const s=curriculum.stages.find(x=>x.id===id);return{...s,units:s.units.map(unitState),passed:id==='S0',passedAt:id==='S0'?'2026-06-01T08:00:00.000Z':null}},
  snapshot(){return{units:Object.fromEntries(unitIds.map(id=>[String(id),unitState(id)]))}}
};
const emptySessions={snapshot:()=>({history:[]})};
const profile={sessionMinutes:25,daysPerWeek:5,goal:'read-nt'};
const guided={status:'ready',mode:'canonical-path'};
const now=new Date('2026-08-22T12:00:00Z');

const plan=weekly.createWeeklyPlan({curriculum,learningEngine:learning,sessionEngine:emptySessions,profile,guidancePlan:guided,now});
assert.equal(plan.targetMinutes,125);assert.equal(plan.targetDays,5);assert.equal(plan.sessions.length,5);assert.equal(plan.sessions.reduce((n,s)=>n+s.minutes,0),125);assert.equal(plan.priorities.reduce((n,p)=>n+p.minutes,0),125);
assert.equal(plan.priorWeek.observed,false);assert.equal(plan.priorWeek.unusedMinutes,0);assert.match(plan.backlogPolicy,/no missed-work debt is inferred/i);
assert.equal(plan.milestones.filter(m=>m.kind==='stage').length,8);assert.equal(plan.milestones.find(m=>m.id==='stage-S0').complete,true);assert.equal(plan.milestone.id,'stage-S1');assert.equal(plan.courseForecast.confidence,'low');assert.deepEqual(plan.courseForecast.minutesPerUnitRange,[45,90]);assert.ok(plan.courseForecast.earliestWeeks<=plan.courseForecast.latestWeeks);assert.notEqual(plan.courseForecast.earliestDate,plan.courseForecast.latestDate);

const priorHistory=[{startedAt:'2026-08-12T08:00:00Z',engagedSeconds:30*60,tasks:[]}];
const priorSessions={snapshot:()=>({history:priorHistory})};
const recovered=weekly.createWeeklyPlan({curriculum,learningEngine:learning,sessionEngine:priorSessions,profile,guidancePlan:guided,now});
assert.equal(recovered.priorWeek.observed,true);assert.equal(recovered.priorWeek.actualMinutes,30);assert.equal(recovered.priorWeek.unusedMinutes,95);assert.equal(recovered.targetMinutes,125,'missed work must not inflate next-week capacity');assert.equal(recovered.sessions.reduce((n,s)=>n+s.minutes,0),125);assert.match(recovered.backlogPolicy,/not added to this week's target/i);

const observedHistory=['2026-07-29','2026-08-05','2026-08-12'].map(d=>({startedAt:`${d}T08:00:00Z`,engagedSeconds:125*60,tasks:[]}));
masteryDates={[unitIds[0]]:'2026-07-30T08:00:00Z',[unitIds[1]]:'2026-08-02T08:00:00Z',[unitIds[2]]:'2026-08-07T08:00:00Z',[unitIds[3]]:'2026-08-13T08:00:00Z'};
const empirical=weekly.forecastRange({remainingUnits:20,weeklyTargetMinutes:125,learningState:learning.snapshot(),sessionState:{history:observedHistory},now});
assert.equal(empirical.confidence,'high');assert.equal(empirical.method,'recent mastery and completed-week active-time evidence');assert.equal(empirical.evidenceWeeks,3);assert.equal(empirical.evidenceMasteries,4);assert.ok(empirical.minutesPerUnitRange[0]<empirical.minutesPerUnitRange[1]);assert.ok(empirical.earliestWeeks<empirical.latestWeeks);

const fakeStage=curriculum.stages[1];const allMasteredButNotPassed={...learning,getStage(id){const s=curriculum.stages.find(x=>x.id===id);return{...s,units:s.units.map(u=>({id:u,status:'mastered',masteredAt:'2026-08-01T00:00:00Z'})),passed:id==='S0',passedAt:id==='S0'?'2026-08-01T00:00:00Z':null}}};
const milestones=weekly.milestoneList(curriculum,allMasteredButNotPassed);assert.equal(milestones.find(m=>m.id===`stage-${fakeStage.id}`).complete,false,'stage milestone requires canonical stage pass, not a planner inference');

const storage=new weekly.MemoryStorage();const planner=new weekly.WeeklyPlanningEngine({curriculum,learningEngine:learning,sessionEngine:emptySessions,storage,clock:()=>now});let live=planner.getPlan(profile,guided);assert.equal(live.selectedTarget.id,'course-complete');
live=planner.setTarget('stage-S3',profile,guided);assert.equal(live.selectedTarget.id,'stage-S3');assert.ok(live.targetForecast.remainingUnits<=live.courseForecast.remainingUnits);assert.equal(planner.snapshot().preferences.targetId,'stage-S3');
const generatedAt=live.generatedAt;masteredCount=9;live=planner.getPlan(profile,guided);assert.equal(live.reason,'auto');assert.notEqual(live.evidenceSignature,plan.evidenceSignature);assert.equal(live.selectedTarget.id,'stage-S3');
const reloaded=new weekly.WeeklyPlanningEngine({curriculum,learningEngine:learning,sessionEngine:emptySessions,storage,clock:()=>now});assert.equal(reloaded.snapshot().preferences.targetId,'stage-S3');assert.equal(reloaded.getPlan(profile,guided).selectedTarget.id,'stage-S3');

assert.ok(storage.getItem(weekly.STATE_KEY));const stores=portability.collectStores(storage);assert.ok(stores[weekly.STATE_KEY]);const backup=portability.serializeBackup(storage,{appVersion:'v1.5-feature'});const parsed=portability.parseBackup(backup);assert.ok(parsed.stores[weekly.STATE_KEY]);
assert.throws(()=>portability.validateStores({...stores,[weekly.STATE_KEY]:JSON.stringify({schemaVersion:99,preferences:{targetId:'course-complete'},current:null,archive:[]})}),/Weekly-planning state/);
assert.throws(()=>portability.validateStores({...stores,[weekly.STATE_KEY]:JSON.stringify({schemaVersion:1,preferences:{targetId:'course-complete'},current:null,archive:Array(21).fill({})})}),/retention bound/);

const source=fs.readFileSync('weekly-planning-engine.js','utf8'),ui=fs.readFileSync('weekly-planning-ui.js','utf8'),html=fs.readFileSync('index.html','utf8'),dpui=fs.readFileSync('data-portability-ui.js','utf8');
for(const forbidden of ['recordEvidence','recordExposure','recordHint']){assert.ok(!source.includes(forbidden),`weekly planner must not call ${forbidden}`);assert.ok(!ui.includes(forbidden),`weekly UI must not call ${forbidden}`)}
for(const asset of ['weekly-planning.css','weekly-planning-engine.js','weekly-planning-ui.js'])assert.ok(html.includes(asset),`${asset} missing from index`);
assert.ok(html.includes('id="weekly-plan"'));assert.ok(html.includes('id="milestones-forecast"'));assert.ok(html.indexOf('session-engine.js')<html.indexOf('weekly-planning-engine.js'));assert.ok(html.indexOf('session-ui.js')<html.indexOf('weekly-planning-ui.js'));assert.match(dpui,/appVersion:'v1\.\d+(?:-feature)?'/);
console.log('V1.5 weekly capacity, backlog recovery, milestones, forecast ranges, target persistence, mastery firewall, and backup integration: PASS');
