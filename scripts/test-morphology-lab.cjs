const assert=require('assert');
const data=require('../data/morphology-lab-data.js');
const {MorphologyLab,MemoryStorage}=require('../morphology-lab.js');

function rngSeq(values){let i=0;return()=>values[i++%values.length];}
function labWith(opts={}){return new MorphologyLab({data,storage:new MemoryStorage(),rng:opts.rng||rngSeq([.13,.71,.37,.89,.22]),learningEngine:opts.learningEngine||null});}

(function datasetIntegrity(){
  assert(data.items.length>=100,'BG4 should contain a substantial reviewed morphology inventory');
  assert(data.items.every(x=>x.id&&x.form&&x.lemma&&x.unitId&&x.sourceId),'every morphology item needs identity, lemma, unit, and provenance');
  assert(data.items.every(x=>x.sourceId===data.source.id),'reviewed paradigm provenance must be explicit');
})();

(function syncretismIsExplicit(){
  const lab=labWith();
  const item=data.items.find(x=>x.form==='τῶν'&&x.lemma==='ὁ');
  const answer=lab.combinedParse(item);
  assert(answer.includes('masculine')&&answer.includes('feminine')&&answer.includes('neuter'),'τῶν must not be forced into one gender without context');
  const lyuo=data.items.find(x=>x.form==='λύω'&&x.family==='verb-present-active');
  const verbAnswer=lab.combinedParse(lyuo);
  assert(verbAnswer.includes('indicative')&&verbAnswer.includes('subjunctive'),'contextless λύω ambiguity must be represented');
})();

(function parseQuestionHasOneCorrectOption(){
  const lab=labWith();lab.state.focus='all';const q=lab.makeParse();
  assert.equal(q.mode,'parse');assert(q.options.length>=2);assert.equal(q.options.filter(x=>x.correct).length,1);assert(q.options.some(x=>x.label===q.answer&&x.correct));
})();

(function buildQuestionHasOneCorrectForm(){
  const lab=labWith();lab.state.focus='nominals';const q=lab.makeBuild();
  assert.equal(q.mode,'build');assert.equal(q.options.filter(x=>x.correct).length,1);assert(q.options.find(x=>x.correct).label===q.item.form);
})();

(function contrastUsesMinimalPairs(){
  const lab=labWith();lab.state.focus='all';const q=lab.makeContrast();
  assert.equal(q.mode,'contrast');assert(q.changedFeature);assert.equal(data.difference(q.item,q.comparison).length,1,'contrast mode must compare forms that differ in exactly one modeled feature');
})();

(function principalPartsAreSixSlotSystems(){
  Object.values(data.principalParts).forEach(parts=>assert.equal(parts.length,6));
  const lab=labWith();const q=lab.makePrincipal();assert.equal(q.mode,'principal');assert.equal(q.unitId,22);assert.equal(q.options.filter(x=>x.correct).length,1);
})();

(function assistanceIsRecordedAndPassedToBG3(){
  const calls=[];const learningEngine={getUnit:()=>({accessible:true,status:'available'}),snapshot:()=>({errors:{}}),recordHint:x=>calls.push(['hint',x]),recordEvidence:x=>calls.push(['evidence',x])};
  const lab=labWith({learningEngine});lab.state.focus='all';lab.current=lab.makeParse();lab.hint('lemma');const correct=lab.current.options.find(x=>x.correct);lab.answer(correct.id);
  assert.equal(calls[0][0],'hint');assert.equal(calls[0][1].level,'lemma');
  const evidence=calls.find(x=>x[0]==='evidence')[1];assert.equal(evidence.hintLevel,'lemma');assert.equal(evidence.correct,true);assert.equal(evidence.source,'morphology-lab');
})();

(function wrongAnswerCreatesDiagnosticError(){
  const calls=[];const learningEngine={getUnit:()=>({accessible:true,status:'available'}),snapshot:()=>({errors:{}}),recordHint:()=>{},recordEvidence:x=>calls.push(x)};
  const lab=labWith({learningEngine});
  const target=data.items.find(x=>x.form==='λόγῳ');const wrong=data.items.find(x=>x.form==='λόγου');
  lab.current={id:'manual',mode:'parse',unitId:7,item:target,dimension:'recognition',answer:lab.combinedParse(target),options:[{id:'bad',label:data.label(wrong),correct:false},{id:'good',label:lab.combinedParse(target),correct:true}]};
  const r=lab.answer('bad');assert.equal(r.correct,false);assert.equal(r.errorType,'case_confusion');assert.equal(calls[0].errorType,'case_confusion');
})();

(function familyWeaknessRaisesAdaptiveWeight(){
  const lab=labWith();const a=data.items.find(x=>x.family==='noun-2m'),b=data.items.find(x=>x.family==='article');
  lab.state.byFamily[a.family]={attempts:10,correct:2};lab.state.byFamily[b.family]={attempts:10,correct:10};
  assert(lab.familyWeight(a)>lab.familyWeight(b),'weak morphology families should receive greater selection weight');
})();

(function recentItemsAreDownWeighted(){
  const lab=labWith();const item=data.items[0],before=lab.familyWeight(item);lab.state.recent=[item.id];const after=lab.familyWeight(item);assert(after<before);
})();

(function statePersists(){
  const storage=new MemoryStorage(),a=new MorphologyLab({data,storage,rng:()=>.2});a.state.focus='all';a.current=a.makeParse();a.answer(a.current.options.find(x=>x.correct).id);
  const b=new MorphologyLab({data,storage,rng:()=>.2});assert.equal(b.stats().attempts,1);assert.equal(b.stats().correct,1);
})();

(function allFocusModesHaveInventory(){
  const lab=labWith();['foundation','nominals','verbs','advanced','all'].forEach(f=>{lab.state.focus=f;assert(lab.allowedItems().length>0,`${f} focus should contain exercises`);});
})();

(function modeledFamiliesCoverCurriculumBreadth(){
  const families=new Set(data.items.map(x=>x.family));['article','noun-2m','noun-2n','noun-1f','adjective','noun-3','pronoun','verb-present-active','verb-indicative-systems','participle','infinitive','subjunctive','imperative','mi-verb'].forEach(f=>assert(families.has(f),`missing morphology family ${f}`));
})();

console.log('BG4 morphology-lab tests passed: 13 suites');