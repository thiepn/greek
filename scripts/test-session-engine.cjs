const assert=require('node:assert/strict');
const fs=require('node:fs');
const sessions=require('../session-engine.js');
const portability=require('../data-portability.js');

let now=new Date('2026-08-17T08:00:00Z');
const clock=()=>new Date(now);
const storage=new sessions.MemoryStorage({'koine-path-learning-v3':'canonical-learning-marker','other-app':'keep'});
const engine=new sessions.SessionEngine({storage,clock});
assert.equal(sessions.STATE_KEY,'koine-path-sessions-v1');
assert.ok(sessions.STATE_KEY.startsWith(portability.STORAGE_PREFIX));
assert.equal(engine.getActiveSession(),null);
assert.throws(()=>engine.startSession({status:'setup',tasks:[]}),/ready guided study plan/i);

const plan={status:'ready',mode:'canonical-path',goal:'read-nt',minutes:25,tasks:[
  {kind:'primary',view:'learn',unitId:1,minutes:15,title:'Begin Unit 1'},
  {kind:'transfer',view:'read',minutes:5,title:'Greek text transfer'},
  {kind:'vocabulary',view:'review',minutes:5,title:'Vocabulary / due review'}
]};
const learningBefore=storage.getItem('koine-path-learning-v3');
let active=engine.startSession(plan);
assert.equal(active.plannedMinutes,25);assert.equal(active.tasks.length,3);assert.equal(active.status,'active');
for(let i=0;i<10;i++)assert.equal(engine.recordEngagement(30,'learn'),30);
engine.markTaskComplete('task-1',true);
engine.setContextView('read');for(let i=0;i<2;i++)engine.recordEngagement(30);
assert.equal(engine.getActiveSession().engagedSeconds,360);assert.equal(engine.getActiveSession().byView.learn,300);assert.equal(engine.getActiveSession().byView.read,60);
engine.pause();assert.equal(engine.getActiveSession().status,'paused');assert.equal(engine.recordEngagement(30,'read'),0);engine.resume();assert.equal(engine.getActiveSession().status,'active');
assert.equal(storage.getItem('koine-path-learning-v3'),learningBefore,'session tracking must not mutate canonical learning state');

const reloaded=new sessions.SessionEngine({storage,clock});
assert.equal(reloaded.getActiveSession().engagedSeconds,360,'unfinished session must survive reload');
const finished=reloaded.finishSession({reason:'manual'});assert.equal(finished.completedTasks,1);assert.equal(finished.totalTasks,3);assert.equal(reloaded.getActiveSession(),null);
let analytics=reloaded.analytics({sessionMinutes:25,daysPerWeek:5},clock());
assert.equal(analytics.week.targetMinutes,125);assert.equal(analytics.week.minutes,6);assert.equal(analytics.week.studyDays,1);assert.equal(analytics.recent28.sessions,1);assert.equal(analytics.activityMix[0].view,'learn');

const lowPlan={status:'ready',mode:'canonical-path',goal:'course-mastery',minutes:45,tasks:[
  {kind:'primary',view:'learn',minutes:25,title:'Course work'},
  {kind:'support',view:'review',minutes:10,title:'Review'},
  {kind:'transfer',view:'read',minutes:10,title:'Reading'}
]};
for(let day=1;day<=3;day++){
  now=new Date(`2026-08-${17+day}T08:00:00Z`);reloaded.startSession(lowPlan);for(let i=0;i<6;i++)reloaded.recordEngagement(30,'learn');reloaded.finishSession({reason:'manual'});
}
analytics=reloaded.analytics({sessionMinutes:45,daysPerWeek:5},clock());
assert.equal(analytics.week.targetMinutes,225);assert.equal(analytics.workloadSuggestion.suggestedMinutes,25,'repeated under-filled 45-minute sessions should suggest, not force, a shorter workload');
assert.ok(analytics.recent28.consistencyPercent>=0&&analytics.recent28.consistencyPercent<=100);assert.equal(analytics.trend7.length,7);assert.equal(storage.getItem('other-app'),'keep');

const stores=portability.collectStores(storage);assert.ok(stores[sessions.STATE_KEY],'session history must be included in V1.2+ portable backups');assert.equal(stores['other-app'],undefined);
const backup=portability.serializeBackup(storage,{appVersion:'v1.4-feature'}),parsed=portability.parseBackup(backup);assert.ok(parsed.stores[sessions.STATE_KEY]);
assert.throws(()=>portability.validateStores({...stores,[sessions.STATE_KEY]:JSON.stringify({schemaVersion:99,active:null,history:[]})}),/Daily-session state/);
assert.throws(()=>portability.validateStores({...stores,[sessions.STATE_KEY]:JSON.stringify({schemaVersion:1,active:null,history:Array(401).fill({})})}),/retention bound/);

const source=fs.readFileSync('session-engine.js','utf8'),ui=fs.readFileSync('session-ui.js','utf8'),html=fs.readFileSync('index.html','utf8');
for(const forbidden of ['recordEvidence','recordExposure','recordHint']){assert.ok(!source.includes(forbidden),`session engine must not call ${forbidden}`);assert.ok(!ui.includes(forbidden),`session UI must not call ${forbidden}`)}
for(const asset of ['session.css','session-engine.js','session-ui.js'])assert.ok(html.includes(asset),`${asset} missing from index`);
assert.ok(html.includes('id="daily-session"'));assert.ok(html.includes('id="learning-analytics"'));
assert.ok(html.indexOf('onboarding-engine.js')<html.indexOf('session-engine.js'));assert.ok(html.indexOf('app.js')<html.indexOf('session-ui.js'));
console.log('V1.4 session lifecycle, foreground-time analytics, workload fit, mastery firewall, and backup integration: PASS');
