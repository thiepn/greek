const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const path=require('path');

const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const loadWindow=(file,key)=>{const context={window:{}};vm.createContext(context);vm.runInContext(read(file),context,{filename:file});return context.window[key]};
const walk=(v,fn,path_='root')=>{if(typeof v==='string')fn(v,path_);else if(Array.isArray(v))v.forEach((x,i)=>walk(x,fn,`${path_}[${i}]`));else if(v&&typeof v==='object')Object.entries(v).forEach(([k,x])=>walk(x,fn,`${path_}.${k}`));};
const assertUnique=(xs,label)=>assert.equal(new Set(xs).size,xs.length,`${label} ids must be unique`);
const greek=/[\u0370-\u03ff\u1f00-\u1fff]/u;
const assertNfc=(data,label)=>walk(data,(s,p)=>{if(greek.test(s))assert.equal(s,s.normalize('NFC'),`${label} non-NFC Greek at ${p}`)});

const curriculum=loadWindow('curriculum.js','KOINE_CURRICULUM');
const greekData=require('../data/greek-data.js');
const morph=require('../data/morphology-lab-data.js');
require('../data/morphology-bg15-corrections.js')(morph);
const vocab=require('../data/vocabulary-seed.js');
const syntax=require('../data/syntax-lab-data.js');
const fluency=require('../data/fluency-programs.js');
const exegesis=require('../data/exegesis-lab-data.js');
const pronunciation=loadWindow('data/pronunciation-profiles.js','KOINE_PRONUNCIATION_DATA');

(function curriculumContract(){
  assert.equal(curriculum.totalUnits,50);
  const units=curriculum.stages.flatMap(s=>s.units);
  assert.deepEqual(units,[...Array(50)].map((_,i)=>i+1),'curriculum must cover Units 1–50 exactly once');
  assertUnique(units,'curriculum unit');
  assert(curriculum.principles.includes('lexical-restraint'));
  assert(curriculum.principles.includes('grammar-is-not-theology'));
  assert(curriculum.principles.includes('tense-form-is-not-a-mechanical-time-or-action-kind'));
  const s3=curriculum.stages.find(s=>s.id==='S3');
  assert.equal(s3.title,'Indicative Systems, Aspect & Principal Parts');
  assert(/contextual temporal\/aspectual interpretation/.test(s3.outcome));
})();

(function sourceAndSnapshotContract(){
  assert.equal(greekData.sources.morphgnt.revision,'aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d');
  assert.equal(greekData.sources.sblgnt.license,'CC BY 4.0');
  assert.equal(greekData.sources.morphgnt.license,'CC BY-SA 3.0');
  assert(/snapshot/i.test(greekData.sources.sblgnt.role));
  assert(/does not imply identity with later official SBLGNT releases/i.test(greekData.sources.sblgnt.note));
  assert.equal(greekData.vocabularyModel.tieBreak,'lemma-codepoint-order');
  const attribution=read('ATTRIBUTION.md');
  assert(/pinned SBLGNT\/MorphGNT snapshot/.test(attribution));
  assert(/v1\.2 \(2023\).*John 7:53–8:11/s.test(attribution));
  assert(/Unicode code-point/.test(attribution));
})();

(function morphologyContract(){
  assert.equal(morph.items.length,130,'BG15 morphology inventory count drift');
  assertUnique(morph.items.map(x=>x.id),'morphology');
  assert(morph.items.every(x=>x.sourceId===morph.source.id));
  Object.values(morph.principalParts).forEach(parts=>assert.equal(parts.length,6));
  const parses=(form,lemma='λύω')=>morph.items.filter(x=>x.form===form&&(!lemma||x.lemma===lemma));
  assert(parses('ἔλυον').some(x=>x.features.person===1&&x.features.number==='singular'));
  assert(parses('ἔλυον').some(x=>x.features.person===3&&x.features.number==='plural'));
  const kalon=morph.items.filter(x=>x.form==='καλόν'&&x.lemma==='καλός');
  assert(kalon.some(x=>x.features.gender==='masculine'&&x.features.case==='accusative'));
  assert(kalon.some(x=>x.features.gender==='neuter'&&x.features.case==='nominative'));
  assert(kalon.some(x=>x.features.gender==='neuter'&&x.features.case==='accusative'));
  assert(parses('λύσω').some(x=>x.features.mood==='indicative'&&x.features.tense==='future'));
  assert(parses('λύσω').some(x=>x.features.mood==='subjunctive'&&x.features.tense==='aorist'));
  assert(parses('λῦσαι').some(x=>x.features.mood==='infinitive'&&x.features.voice==='active'));
  assert(parses('λῦσαι').some(x=>x.features.mood==='imperative'&&x.features.voice==='middle'));
})();

(function vocabularyContract(){
  assert.equal(vocab.source.commit,'136cc6464f1d4dfca9dec63fbbe5fd013982459c');
  assert(/Sparse supplemental fallback entries never use subset position as NT-wide rank/.test(vocab.source.rankPolicy));
  const logos=vocab.entries.find(x=>x.lemma==='λόγος');
  const arche=vocab.entries.find(x=>x.lemma==='ἀρχή');
  assert.equal(logos.count,330);assert.equal(logos.rank,55,'λόγος exact fallback rank should be source-derived');
  assert.equal(arche.count,55);assert.equal(arche.rank,null,'sparse supplemental ἀρχή must not fabricate a subset rank');
  assert(vocab.entries.slice(0,39).every((x,i)=>x.rank===i+1),'contiguous source prefix ranks 1–39 should remain exact');
})();

(function reviewedInventoryContract(){
  assert.equal(syntax.exercises.length,34);assertUnique(syntax.exercises.map(x=>x.id),'syntax');
  for(let u=38;u<=44;u++)assert(syntax.exercises.filter(x=>x.unitId===u).length>=4,`Unit ${u} needs >=4 reviewed syntax exercises`);
  assert.equal(fluency.passages.length,15);assertUnique(fluency.passages.map(x=>x.id),'fluency');
  assert.deepEqual([45,46,47].map(u=>fluency.passages.filter(x=>x.unitId===u).length),[5,5,5]);
  assert.equal(exegesis.cases.length,27);assertUnique(exegesis.cases.map(x=>x.id),'exegesis');
  assert.deepEqual([48,49,50].map(u=>exegesis.cases.filter(x=>x.unitId===u).length),[8,8,11]);
  assert.deepEqual(exegesis.method.ladder,['grammatical_fact','contextual_judgment','interpretive_possibility','theological_conclusion']);
  assert.equal(exegesis.apparatus.revision,'c4d241a9c1c479a55b989ba35a4976c1d0b8052c');
  assert.equal(exegesis.apparatus.notManuscriptApparatus,true);
  assert.equal(exegesis.cases.filter(x=>x.variant).length,5);
  assert.equal(Object.keys(pronunciation.profiles).length,3);
  assert.equal(pronunciation.drills.length,6);
  assert.equal(pronunciation.listeningComprehension.length,3);
  assert.equal(pronunciation.profiles['koine-reconstructed'].tts,false);
  assert.equal(pronunciation.profiles.erasmian.tts,false);
  assert.equal(pronunciation.profiles.modern.tts,true);
})();

(function pedagogicalRestraintContract(){
  const syntaxNormative=syntax.exercises.map(x=>`${x.choices[x.answer]} ${x.explanation}`).join('\n');
  const exegesisNormative=exegesis.cases.map(x=>`${x.choices[x.answer]} ${x.constraint}`).join('\n');
  const normative=`${syntaxNormative}\n${exegesisNormative}`.toLowerCase();
  for(const bad of [/aorist\s*(?:=|means)\s*(?:once|simple past)/,/no article\s*(?:=|means)\s*indefinite/,/genitive\s*(?:=|means)\s*(?:of|from)/])assert(!bad.test(normative),`mechanical grammar slogan found: ${bad}`);
  const aspect=exegesis.cases.find(x=>x.id==='u50.mark1.15.aspect');
  assert(/imperfective viewpoint/.test(aspect.choices[aspect.answer]));
  assert(/context/.test(aspect.choices[aspect.answer]));
  const john=exegesis.cases.find(x=>x.id==='u50.john1.1.predicate');
  assert(/predicate nominative/.test(john.choices[john.answer]));
  assert(!/indefinite/.test(john.choices[john.answer]));
  assert(exegesis.method.rules.some(x=>/Lexical etymology, frequency, or one gloss never determines contextual meaning/.test(x)));
  assert(exegesis.method.rules.some(x=>/Edition-comparison apparatus data is not manuscript evidence/.test(x)));
})();

(function unicodeAndGlobalIdContract(){
  [['greek-data',greekData],['morphology',morph],['vocabulary',vocab],['syntax',syntax],['fluency',fluency],['exegesis',exegesis],['pronunciation',pronunciation]].forEach(([label,data])=>assertNfc(data,label));
  const ids=[...morph.items.map(x=>x.id),...syntax.exercises.map(x=>x.id),...fluency.passages.map(x=>`fluency.${x.id}`),...exegesis.cases.map(x=>x.id),...pronunciation.drills.map(x=>`pronunciation.${x.id}`),...pronunciation.listeningComprehension.map(x=>`pronunciation.${x.id}`)];
  assertUnique(ids,'reviewed content');
})();

(function deterministicCorpusOrderingContract(){
  const builder=read('scripts/build-full-corpus.mjs');
  const validator=read('scripts/validate-full-corpus.mjs');
  assert(/function codepointCompare/.test(builder));
  assert(!/localeCompare\(/.test(builder),'canonical corpus generation must not depend on locale collation');
  assert(/normalized-lemma-codepoint-order/.test(builder));
  assert(/tie-break/.test(validator)||/tieBreak/.test(validator),'full-corpus validator must enforce deterministic tie-break metadata/order');
})();

console.log('BG15 content QA contract passed: 50 units, 130 morphology parses, 34 syntax exercises, 15 fluency checkpoints, 27 exegesis cases, 9 pronunciation/listening drills.');