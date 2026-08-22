const assert=require('node:assert/strict');
const {FluencyEngine,MemoryStorage,countClauses,readiness,streak}=require('../reading-fluency.js');
const programs={version:'test',programs:{one:{id:'one',unitId:45,book:'1John',chapters:[1,2]}},passages:[
{id:'micro',program:'one',unitId:45,level:'micro',ref:{book:'1John',chapter:1,startVerse:1,endVerse:1},prompt:'Main idea?',choices:['A','B'],answer:0,focus:'micro'},
{id:'short',program:'one',unitId:45,level:'short',ref:{book:'1John',chapter:1,startVerse:1,endVerse:2},prompt:'Main idea?',choices:['A','B'],answer:0,focus:'short'},
{id:'medium',program:'one',unitId:45,level:'medium',ref:{book:'1John',chapter:1,startVerse:1,endVerse:3},prompt:'Main idea?',choices:['A','B'],answer:0,focus:'medium'}]};
const T=(id,lemma='λόγος',text='λόγος')=>({id,lemma,word:text.replace(/[.;]/g,''),text,parseCode:'----NSM-'});
const book={book:{id:'1John',name:'1 John'},chapters:{'1':{'1':[T('t1'),T('t2','καί','καί.' )],'2':[T('t3'),T('t4','θεός','θεός;')],'3':[T('t5'),T('t6','ζωή','ζωή.')]},'2':{'1':[T('u1'),T('u2','φῶς','φῶς.')],'3':[T('u3')]}}};
const fetchFn=async()=>({ok:true,json:async()=>book});
let now=new Date('2026-08-21T10:00:00Z');const clock=()=>new Date(now);const advance=ms=>now=new Date(now.getTime()+ms);
const evidence=[],exposure=[];const learning={getUnit:()=>({accessible:true}),recordEvidence:x=>evidence.push(x),recordExposure:x=>exposure.push(x)};
const vocab={state:{cards:{a:{type:'lemma-recognition',lemma:'λόγος',reps:3,lastRating:'good',leech:false,suspended:false}}}};
(async()=>{
assert.equal(countClauses([T('a','x','x.'),T('b','y','y;')]),2);
const engine=new FluencyEngine({programs,learningEngine:learning,vocabularyEngine:vocab,storage:new MemoryStorage(),clock,fetchFn,unitForToken:()=>45});engine.setProgram('one');
let rec=await engine.recommend('one');assert.equal(rec.level,'micro');assert.equal(rec.suitability.vocabCoverage,50);
const micro=await engine.materialize('micro');assert.equal(micro.tokenCount,2);assert.equal(micro.reference,'1 John 1:1');
engine.start(micro,{mode:'cold',cold:true});assert.equal(engine.state.active.status,'first-pass');engine.markUnknown('t1');engine.markUnknown('t1');assert.equal(engine.state.active.firstPass.unknown,1);assert.equal(engine.state.active.firstPass.interruptions,2);
advance(60000);const first=engine.finishFirstPass();assert.equal(first.wpm,2);engine.answerCheckpoint(true);assert.equal(evidence.length,1);assert.equal(evidence[0].dimension,'reading');
engine.assist('t1');engine.assist('t1');engine.assist('t2');assert.equal(engine.state.active.analysis.assistance,2);advance(60000);engine.finishAnalysis();advance(30000);const done=engine.finishReread();assert.equal(done.summary.firstWpm,2);assert.equal(done.summary.rereadWpm,4);assert.equal(done.summary.rereadGain,100);assert.equal(done.summary.unknownRate,50);assert.equal(done.summary.assistanceRate,100);assert.equal(engine.state.active,null);
engine.state.history.unshift({status:'complete',program:'one',passageId:'x1',completedAt:'2026-08-20T10:00:00Z',summary:{comprehension:100,unknownRate:0,assistanceRate:0},tokenCount:120});engine.persist();assert.equal(engine.targetLevel('one'),'short');rec=await engine.recommend('one');assert.equal(rec.level,'short');
engine.state.history.unshift(...Array.from({length:3},(_,i)=>({status:'complete',program:'one',passageId:`s${i}`,completedAt:`2026-08-${19-i}T10:00:00Z`,summary:{comprehension:100,unknownRate:0,assistanceRate:0},tokenCount:120})));engine.persist();assert.equal(engine.targetLevel('one'),'medium');rec=await engine.recommend('one');assert.equal(rec.level,'medium');
engine.state.history.unshift(...Array.from({length:3},(_,i)=>({status:'complete',program:'one',passageId:`m${i}`,completedAt:`2026-08-${15-i}T10:00:00Z`,summary:{comprehension:100,unknownRate:0,assistanceRate:0},tokenCount:140})));engine.persist();assert.equal(engine.targetLevel('one'),'chapter');rec=await engine.recommend('one');assert.equal(rec.level,'chapter');assert.match(rec.id,/chapter\.1John\./);
const chapter=await engine.materializeChapter('1John',2,45);assert.equal(chapter.ref.startVerse,1);assert.equal(chapter.ref.endVerse,3);assert.equal(chapter.tokenCount,3);
const before=evidence.length;engine.start(chapter);advance(60000);engine.finishFirstPass();engine.answerCheckpoint(null);assert.equal(evidence.length,before);assert.ok(exposure.length>0);advance(30000);engine.finishAnalysis();advance(30000);engine.finishReread();
const good=Array.from({length:5},(_,i)=>({status:'complete',tokenCount:i<3?120:80,completedAt:`2026-08-${21-i}T10:00:00Z`,summary:{comprehension:100,unknownRate:5,assistanceRate:4,firstWpm:8}}));assert.equal(readiness(good).ready,true,'WPM must not be an R4 gate');assert.equal(streak(good),5);
const storage=new MemoryStorage();const e2=new FluencyEngine({programs,learningEngine:learning,storage,clock,fetchFn,unitForToken:()=>45});const m2=await e2.materialize('micro');e2.start(m2);const e3=new FluencyEngine({programs,learningEngine:learning,storage,clock,fetchFn,unitForToken:()=>45});const restored=await e3.restoreActiveMaterial();assert.equal(restored.id,'micro');assert.equal(e3.state.active.status,'first-pass');
console.log('BG10 reading fluency tests passed.');
})().catch(e=>{console.error(e);process.exit(1)});