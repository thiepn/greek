const assert=require('assert');
const seed=require('../data/vocabulary-seed.js');
const {VocabularyEngine,MemoryStorage,parseTsv,band,unitForRank,CORE,STRETCH,CORPUS_KEY}=require('../vocabulary-engine.js');
let now=new Date('2026-08-21T10:00:00.000Z');const clock=()=>new Date(now);const reset=()=>now=new Date('2026-08-21T10:00:00.000Z');
function learning(target=80,accessible=true){return{events:[],getDashboard(){return{currentStage:{vocabTarget:target}}},getUnit(){return{accessible}},recordEvidence(x){this.events.push(['evidence',x])},recordExposure(x){this.events.push(['exposure',x])}}}
function engine(opts={}){return new VocabularyEngine({seed,storage:new MemoryStorage(),clock,learningEngine:opts.learning||learning(),fetchFn:opts.fetchFn||null})}
function fakeTsv(n=1250){let s='lemma\tcount\tgloss\n';for(let i=1;i<=n;i++)s+=`λέμμα${i}\t${2000-i}\tgloss ${i}\n`;return s}

(function parseCorpus(){const a=parseTsv(fakeTsv(),1200);assert.equal(a.length,1200);assert.equal(a[0].rank,1);assert.equal(a[999].band,'F4');assert.equal(a[1199].band,'F5')})();
(function rankBands(){assert.equal(band(100),'F1');assert.equal(band(101),'F2');assert.equal(band(601),'F4');assert.equal(band(null),null);assert.equal(unitForRank(20),4);assert.equal(unitForRank(1000),50);assert.equal(unitForRank(null),50)})();
(function fallbackRanksAreTruthful(){reset();const e=engine();assert.equal(e.entry('ὁ').rank,1);assert.equal(e.entry('λόγος').rank,55);assert.equal(e.entry('ἀρχή').rank,null);const c=e.ensureLemma('ἀρχή',{source:'reader'});assert.equal(c.rank,null);assert.equal(c.unitId,50)})();
(function targetFollowsStage(){reset();const e=engine({learning:learning(320)});assert.equal(e.targetRank(),320)})();
(function introduceRespectsTarget(){reset();const e=engine({learning:learning(20)});const c=e.introduceNext();assert(c.rank<=20)})();
(function dailyLimit(){reset();const e=engine();for(let i=0;i<12;i++)assert(e.introduceNext());assert.equal(e.introduceNext(),null)})();
(function goodSchedulesReview(){reset();const e=engine(),c=e.ensureLemma('ὁ');const r=e.rate(c.id,'good');assert.equal(r.state,'review');assert(r.intervalDays>=1);assert(new Date(r.dueAt)>now)})();
(function againCreatesLapse(){reset();const e=engine(),c=e.ensureLemma('καί');const r=e.rate(c.id,'again');assert.equal(r.state,'learning');assert.equal(r.lapses,1)})();
(function leechAfterSixLapses(){reset();const e=engine(),c=e.ensureLemma('δέ');for(let i=0;i<6;i++)e.rate(c.id,'again');assert.equal(e.state.cards[c.id].leech,true)})();
(function readerCreatesTwoKinds(){reset();const e=engine();const cards=e.addToken({id:'t1',word:'λόγον',lemma:'λόγος'},{passageId:'John.1.1'});assert.equal(cards.length,2);assert(Object.values(e.state.cards).some(c=>c.type==='form-to-lemma'));assert(Object.values(e.state.cards).some(c=>c.passages.includes('John.1.1')))})();
(function bg3EvidenceWhenAccessible(){reset();const l=learning(80,true),e=engine({learning:l}),c=e.ensureLemma('ὁ');e.rate(c.id,'good');assert.equal(l.events[0][0],'evidence')})();
(function bg3ExposureWhenLocked(){reset();const l=learning(80,false),e=engine({learning:l}),c=e.ensureLemma('ὁ');e.rate(c.id,'good');assert.equal(l.events[0][0],'exposure')})();
(async function remoteLoadAndCache(){reset();const storage=new MemoryStorage();const fetchFn=async()=>({ok:true,text:async()=>fakeTsv()});const e=new VocabularyEngine({seed,storage,clock,learningEngine:learning(),fetchFn});await e.loadCorpus();assert.equal(e.corpus.length,STRETCH);assert.equal(e.stats().coreLoaded,CORE);assert(storage.getItem(CORPUS_KEY));console.log('BG5 vocabulary-engine tests passed: 13 suites')})().catch(e=>{console.error(e);process.exit(1)});