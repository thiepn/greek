const assert=require('node:assert/strict');
const fs=require('node:fs');
const research=require('../corpus-research-engine.js');
const portability=require('../data-portability.js');

const now=new Date('2026-08-23T08:00:00Z');
const storage=new portability.MemoryStorage();
const books={
  John:{book:{id:'John',name:'John',chapters:1},chapters:{'1':{'1':[
    {id:'John.1.1.1',text:'Ἐν',word:'Ἐν',lemma:'ἐν',parseCode:'--------'},
    {id:'John.1.1.2',text:'ἀρχῇ',word:'ἀρχῇ',lemma:'ἀρχή',parseCode:'----DSF-'},
    {id:'John.1.1.3',text:'ἦν',word:'ἦν',lemma:'εἰμί',parseCode:'3IIAI---'},
    {id:'John.1.1.4',text:'ὁ',word:'ὁ',lemma:'ὁ',parseCode:'----NSM-'},
    {id:'John.1.1.5',text:'λόγος',word:'λόγος',lemma:'λόγος',parseCode:'----NSM-'},
    {id:'John.1.1.6',text:'καὶ',word:'καὶ',lemma:'καί',parseCode:'--------'},
    {id:'John.1.1.7',text:'ὁ',word:'ὁ',lemma:'ὁ',parseCode:'----NSM-'},
    {id:'John.1.1.8',text:'λόγος',word:'λόγος',lemma:'λόγος',parseCode:'----NSM-'}
  ],'2':[
    {id:'John.1.2.1',text:'οὗτος',word:'οὗτος',lemma:'οὗτος',parseCode:'----NSM-'},
    {id:'John.1.2.2',text:'ἦν',word:'ἦν',lemma:'εἰμί',parseCode:'3IIAI---'}
  ]}}},
  Mark:{book:{id:'Mark',name:'Mark',chapters:1},chapters:{'1':{'1':[
    {id:'Mark.1.1.1',text:'Ἀρχὴ',word:'Ἀρχὴ',lemma:'ἀρχή',parseCode:'----NSF-'},
    {id:'Mark.1.1.2',text:'τοῦ',word:'τοῦ',lemma:'ὁ',parseCode:'----GSM-'},
    {id:'Mark.1.1.3',text:'εὐαγγελίου',word:'εὐαγγελίου',lemma:'εὐαγγέλιον',parseCode:'----GSN-'}
  ],'2':[
    {id:'Mark.1.2.1',text:'λόγος',word:'λόγος',lemma:'λόγος',parseCode:'----NSM-'}
  ]}}}
};
const catalog={books:[{id:'John',name:'John',chapters:1},{id:'Mark',name:'Mark',chapters:1}]};
const engine=new research.CorpusResearchEngine({storage,clock:()=>now,catalog,corpusRevision:'rev-123',loadBook:async id=>books[id]});

assert.equal(research.STORAGE_KEY,'koine-path-corpus-research-v1');
assert.deepEqual(research.PROVENANCE,['corpus','reviewed','learner','external']);
assert.deepEqual(research.normalizeRef({book:'John',chapter:1,verse:1}),{book:'John',chapter:1,startVerse:1,endVerse:1});
assert.throws(()=>research.normalizeRef({book:'John',chapter:0,verse:1}),/valid chapter/i);

let result;
(async()=>{
  result=await engine.search({mode:'lemma',query:'λόγος'});
  assert.equal(result.resultCount,3);assert.equal(result.hits.length,3);assert.equal(result.byBook.John,2);assert.equal(result.byBook.Mark,1);assert.equal(result.corpusRevision,'rev-123');
  const form=await engine.search({mode:'form',query:'Ἀρχὴ'});assert.equal(form.resultCount,1);assert.equal(form.hits[0].ref.book,'Mark');
  const normalized=await engine.search({mode:'lemma',query:'λόγος'});assert.equal(normalized.resultCount,3,'NFC-normalized query should match canonical lemma');
  const saved=engine.saveSearch(result);assert.equal(saved.resultCount,3);assert.equal(saved.corpusRevision,'rev-123');assert.ok(!('context' in saved.hits[0])||saved.hits[0].context===undefined,'saved hit should not persist verse context');

  const materials=[
    {ref:{book:'John',chapter:1,verse:1},label:'John 1:1',tokens:books.John.chapters['1']['1'],text:'John context'},
    {ref:{book:'Mark',chapter:1,verse:2},label:'Mark 1:2',tokens:books.Mark.chapters['1']['2'],text:'Mark context'}
  ];
  const comparison=research.compareMaterials(materials);assert.equal(comparison.items.length,2);assert.ok(comparison.sharedLemmas.includes('λόγος'));
  const comp=engine.saveComparison({title:'λόγος comparison',refs:materials.map(x=>x.ref),note:'Compare usage without assuming identical sense.',linkedProjectId:'workbench.1'});assert.equal(comp.refs.length,2);

  const corpusEntry=engine.addEntry({provenance:'corpus',title:'λόγος in two passages',note:'Primary corpus observation.',refs:materials.map(x=>x.ref),comparisonId:comp.id,linkedProjectId:'workbench.1'});
  const reviewed=engine.addEntry({provenance:'reviewed',title:'Reviewed syntax case',note:'Internal reviewed material.',refs:[materials[0].ref],caseId:'case.1',unitId:50,linkedProjectId:'workbench.1'});
  const learner=engine.addEntry({provenance:'learner',title:'Working observation',note:'This is my inference.',refs:[materials[0].ref],linkedProjectId:'workbench.1'});
  const external=engine.addEntry({provenance:'external',title:'Reference grammar',citation:'Example Grammar, 2nd ed.',locator:'§12',url:'https://example.com/grammar',note:'Consulted for terminology.',linkedProjectId:'workbench.1'});
  assert.deepEqual(engine.entriesForProject('workbench.1').map(x=>x.provenance).sort(),['corpus','external','learner','reviewed']);
  assert.throws(()=>engine.addEntry({provenance:'external',title:'Bad URL',citation:'X',url:'javascript:alert(1)',note:''}),/metadata/i);
  engine.updateEntry(learner.id,{note:'Revised learner inference.',linkedProjectId:null});assert.equal(engine.entriesForProject('workbench.1').length,3);

  const md=engine.exportMarkdown({projectTitles:{'workbench.1':'John project'}});assert.match(md,/Canonical Corpus Evidence/);assert.match(md,/Reviewed Koinē Path Material/);assert.match(md,/Learner Observations/);assert.match(md,/External Sources/);assert.match(md,/Example Grammar, 2nd ed/);assert.match(md,/rev-123/);assert.ok(!md.includes('John context'),'export should not reproduce full materialized passage text');

  const snapshot=engine.snapshot();assert.doesNotThrow(()=>research.validateState(snapshot));assert.throws(()=>research.validateState({...snapshot,schemaVersion:99}),/unsupported schema/i);assert.throws(()=>research.validateState({...snapshot,savedSearches:Array(41).fill(saved)}),/retention bound/i);
  const badEntry={...snapshot,entries:[{...external,external:{...external.external,url:'ftp://example.com'}}]};assert.throws(()=>research.validateState(badEntry),/external source/i);
  const stores=portability.collectStores(storage);assert.ok(stores[research.STORAGE_KEY]);

  const source=fs.readFileSync('corpus-research-engine.js','utf8'),ui=fs.readFileSync('corpus-research-ui.js','utf8'),bridge=fs.readFileSync('corpus-research-workbench-bridge.js','utf8'),guard=fs.readFileSync('corpus-research-portability.js','utf8'),html=fs.readFileSync('index.html','utf8');
  for(const forbidden of ['recordEvidence','recordExposure','recordHint']){assert.ok(!source.includes(forbidden),`research engine must not call ${forbidden}`);assert.ok(!ui.includes(forbidden),`research UI must not call ${forbidden}`);assert.ok(!bridge.includes(forbidden),`research bridge must not call ${forbidden}`)}
  for(const asset of ['corpus-research.css','corpus-research-engine.js','corpus-research-ui.js','corpus-research-workbench-bridge.js','corpus-research-portability.js'])assert.ok(html.includes(asset),`${asset} missing from index`);
  assert.ok(html.indexOf('passage-workbench-engine.js')<html.indexOf('corpus-research-engine.js'));
  assert.ok(html.indexOf('passage-workbench-ui.js')<html.indexOf('corpus-research-ui.js'));
  assert.ok(html.indexOf('data-portability.js')<html.indexOf('corpus-research-portability.js')&&html.indexOf('corpus-research-portability.js')<html.indexOf('data-portability-ui.js'));
  assert.ok(guard.includes("appVersion:'v1.8-feature'"));assert.ok(guard.includes('validateResearchStores'));
  console.log('V1.8 exact corpus search, comparisons, provenance notebook, project linkage, export, mastery firewall, and portability integration: PASS');
})().catch(err=>{console.error(err);process.exit(1)});