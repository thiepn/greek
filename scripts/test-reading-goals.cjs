const assert=require('node:assert/strict');
const fs=require('node:fs');
const reading=require('../reading-goals-engine.js');
const tracks=require('../data/reading-tracks.js');
const portability=require('../data-portability.js');

const catalog={books:[
  {id:'John',name:'John',chapters:21},
  {id:'Mark',name:'Mark',chapters:16},
  {id:'1John',name:'1 John',chapters:5},
  {id:'Phil',name:'Philippians',chapters:4}
]};
const now=new Date('2026-08-22T12:00:00Z');
const storage=new portability.MemoryStorage();
const engine=new reading.ReadingGoalsEngine({tracks,storage,clock:()=>now});
engine.setCatalog(catalog);

assert.equal(reading.STORAGE_KEY,'koine-path-reading-goals-v1');
assert.equal(reading.SCHEMA_VERSION,1);
assert.equal(Object.keys(tracks.tracks).length,4);
for(const track of Object.values(tracks.tracks)){
  assert.ok(track.items.length>=6,`${track.id} needs a real multi-passage path`);
  for(const item of track.items){assert.equal(typeof item.book,'string');assert.ok(Number(item.chapter)>=1);}
}

const bookGoal=engine.createBookGoal('Phil');
assert.equal(bookGoal.kind,'book');assert.equal(bookGoal.items.length,4);assert.deepEqual(bookGoal.items.map(x=>reading.refId(x.ref)),['Phil.1','Phil.2','Phil.3','Phil.4']);
let progress=engine.progress(bookGoal,['Phil.1','Phil.2']);assert.equal(progress.completed,2);assert.equal(progress.percent,50);assert.equal(progress.next.label,'Philippians 3');
assert.equal(Object.keys(engine.snapshot().coverage.passages).length,0,'chapter completion must remain owned by canonical reader state');

assert.throws(()=>engine.createPassageGoal({book:'John',chapter:3}),/verse range/i);
const passageGoal=engine.createPassageGoal({book:'John',chapter:3,startVerse:1,endVerse:21});assert.equal(passageGoal.kind,'passage');assert.equal(engine.progress(passageGoal,[]).completed,0);
engine.markPassageRead(passageGoal.items[0].ref);assert.equal(engine.progress(passageGoal,[]).completed,1);assert.equal(engine.progress(passageGoal,[]).complete,true);assert.ok(engine.snapshot().coverage.passages['John.3.1-21']);
engine.unmarkPassageRead(passageGoal.items[0].ref);assert.equal(engine.progress(passageGoal,[]).completed,0);

const trackGoal=engine.createTrackGoal('first-epistle');assert.equal(trackGoal.kind,'track');assert.equal(trackGoal.items.length,8);assert.equal(trackGoal.items[0].label,'Prologue');
assert.equal(trackGoal.items[0].assistance,'R1');assert.equal(trackGoal.items[1].assistance,'R1');assert.equal(trackGoal.items[2].assistance,'R2');assert.equal(trackGoal.items[3].assistance,'R2');assert.equal(trackGoal.items[4].assistance,'R3');assert.equal(trackGoal.items[5].assistance,'R3');assert.equal(trackGoal.items[6].assistance,'R4');assert.equal(trackGoal.items[7].assistance,'R4');
engine.setActive(trackGoal.id);let next=engine.next([]);assert.equal(next.item.label,'Prologue');engine.markPassageRead(next.item.ref);next=engine.next([]);assert.equal(next.item.label,'Light and confession');

const material={tokens:[
  {id:'1',lemma:'λόγος',posCode:'N-'},{id:'2',lemma:'εἰμί',posCode:'V-'},{id:'3',lemma:'θεός',posCode:'N-'},{id:'4',lemma:'γίνομαι',posCode:'V-'},{id:'5',lemma:'λόγος',posCode:'N-'},{id:'6',lemma:'ὁ',posCode:'RA'}
],verses:[{verse:1},{verse:2}]};
const analysis=reading.difficulty(material,{knownLemma:l=>['λόγος','θεός','ὁ'].includes(l),unitForToken:t=>t.posCode==='V-'?31:5,unitReady:id=>id===5});
assert.equal(analysis.tokenCount,6);assert.equal(analysis.uniqueLemmas,5);assert.ok(analysis.intrinsic.score>=0&&analysis.intrinsic.score<=100);assert.ok(analysis.preparedness.score>=0&&analysis.preparedness.score<=100);assert.notEqual(analysis.intrinsic.score,analysis.preparedness.score,'intrinsic difficulty and learner preparedness must remain separate measures');assert.equal(analysis.preparedness.vocabCoverage,67);assert.equal(analysis.preparedness.grammarCoverage,67);
const ranked=reading.rankMaterials([{id:'hard',analysis:{preparedness:{score:30},intrinsic:{score:75},tokenCount:100}},{id:'fit',analysis:{preparedness:{score:74},intrinsic:{score:42},tokenCount:120}}]);assert.equal(ranked[0].id,'fit');

const assistance=Array.from({length:8},(_,i)=>reading.suggestedAssistance(i,8));assert.deepEqual(assistance,['R1','R1','R2','R2','R3','R3','R4','R4']);

const limitStorage=new portability.MemoryStorage();const limited=new reading.ReadingGoalsEngine({tracks,storage:limitStorage,clock:()=>now});limited.setCatalog(catalog);for(let i=0;i<reading.MAX_GOALS;i++)limited.createBookGoal('Phil',{title:`Goal ${i}`});assert.throws(()=>limited.createBookGoal('Phil'),/limited to 24/);
const coverageStorage=new portability.MemoryStorage();const coverageEngine=new reading.ReadingGoalsEngine({tracks,storage:coverageStorage,clock:()=>now});coverageEngine.setCatalog(catalog);for(let i=1;i<=501;i++)coverageEngine.markPassageRead({book:'John',chapter:1,startVerse:i,endVerse:i});assert.equal(Object.keys(coverageEngine.snapshot().coverage.passages).length,reading.MAX_PASSAGE_COVERAGE);

const stores=portability.collectStores(storage);assert.ok(stores[reading.STORAGE_KEY]);const backup=portability.serializeBackup(storage,{appVersion:'v1.6-feature'});const parsed=portability.parseBackup(backup);assert.ok(parsed.stores[reading.STORAGE_KEY]);
const validGoalState=JSON.parse(storage.getItem(reading.STORAGE_KEY));assert.doesNotThrow(()=>portability.validateStores({[reading.STORAGE_KEY]:JSON.stringify(validGoalState)}));
assert.throws(()=>portability.validateStores({[reading.STORAGE_KEY]:JSON.stringify({...validGoalState,schemaVersion:99})}),/Reading-goal state/);
assert.throws(()=>portability.validateStores({[reading.STORAGE_KEY]:JSON.stringify({...validGoalState,goals:Array(25).fill(bookGoal)})}),/goal bound/);
assert.throws(()=>portability.validateStores({[reading.STORAGE_KEY]:JSON.stringify({...validGoalState,goals:[{...bookGoal,kind:'mastery'}]})}),/malformed/);
assert.throws(()=>portability.validateStores({[reading.STORAGE_KEY]:JSON.stringify({...validGoalState,goals:[{...bookGoal,items:[{ref:{book:'Phil',chapter:0}}]}]})}),/invalid corpus reference/);

const source=fs.readFileSync('reading-goals-engine.js','utf8'),ui=fs.readFileSync('reading-goals-ui.js','utf8'),html=fs.readFileSync('index.html','utf8'),sessionUi=fs.readFileSync('session-ui.js','utf8'),weeklyUi=fs.readFileSync('weekly-planning-ui.js','utf8'),dpui=fs.readFileSync('data-portability-ui.js','utf8');
for(const forbidden of ['recordEvidence','recordExposure','recordHint']){assert.ok(!source.includes(forbidden),`reading goals engine must not call ${forbidden}`);assert.ok(!ui.includes(forbidden),`reading goals UI must not call ${forbidden}`)}
for(const asset of ['reading-goals.css','data/reading-tracks.js','reading-goals-engine.js','reading-goals-ui.js'])assert.ok(html.includes(asset),`${asset} missing from index`);
assert.ok(html.indexOf('data/fluency-programs.js')<html.indexOf('data/reading-tracks.js'));
assert.ok(html.indexOf('reading-fluency.js')<html.indexOf('reading-goals-engine.js'));
assert.ok(html.indexOf('reading-fluency-ui.js')<html.indexOf('reading-goals-ui.js'));
assert.ok(sessionUi.includes('KOINE_READING_GOALS_UI'), 'daily sessions do not route V1.6 reading goals');
assert.ok(weeklyUi.includes('KOINE_READING_GOALS_UI'), 'weekly plan does not surface V1.6 reading goals');
assert.ok(dpui.includes("appVersion:'v1.6-feature'"));
console.log('V1.6 reading goals, passage plans, corpus tracks, difficulty/preparedness, mastery firewall, and backup integration: PASS');
