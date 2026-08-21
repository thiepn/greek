const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const context={window:{}};vm.createContext(context);vm.runInContext(read('curriculum.js'),context,{filename:'curriculum.js'});
const curriculum=context.window.KOINE_CURRICULUM;
const course=require('../data/course-content.js');
const learning=require('../learning-engine.js');
const canonical=curriculum.stages.flatMap(s=>s.units.map((id,i)=>({id,title:s.unitTitles[i],stageId:s.id})));
const ids=[];
const greek=/[\u0370-\u03ff\u1f00-\u1fff]/u;
const walk=(v,fn,p='root')=>{if(typeof v==='string')fn(v,p);else if(Array.isArray(v))v.forEach((x,i)=>walk(x,fn,`${p}[${i}]`));else if(v&&typeof v==='object')Object.entries(v).forEach(([k,x])=>walk(x,fn,`${p}.${k}`));};

assert.equal(course.version,'bg16-b001.0');
assert.equal(course.unitCount,50);
assert.equal(course.units.length,50);
assert.equal(course.source.status,'internal-editorial-review');
assert(/not a claim of external scholarly peer review/i.test(course.source.note));
assert.deepEqual(course.units.map(u=>u.id),canonical.map(u=>u.id),'course must cover canonical Units 1–50 in exact order');

course.units.forEach((u,i)=>{
  const meta=canonical[i];
  assert.equal(u.title,meta.title,`Unit ${u.id} title drift from canonical curriculum`);
  assert(u.objective.length>=40,`Unit ${u.id} objective too thin`);
  assert(Array.isArray(u.teach)&&u.teach.length>=3,`Unit ${u.id} needs >=3 teaching movements`);
  assert(u.teach.every(x=>x.length>=55),`Unit ${u.id} teaching movement too thin`);
  assert(Array.isArray(u.forms)&&u.forms.length>=2,`Unit ${u.id} needs worked forms/patterns`);
  assert(typeof u.caution==='string'&&u.caution.length>=35,`Unit ${u.id} needs explicit safeguard`);
  assert(Array.isArray(u.scripture)&&u.scripture.length>=1,`Unit ${u.id} needs Scripture transfer`);
  u.scripture.forEach(s=>{assert(/^[1-3]?\s?[A-Za-z]+(?:\s[A-Za-z]+)*\s\d+(?::\d+(?:-\d+)?)?$/.test(s.ref),`Unit ${u.id} invalid Scripture ref ${s.ref}`);assert(s.task.length>=40,`Unit ${u.id} Scripture task too thin`)});
  assert(Array.isArray(u.checks)&&u.checks.length>=3,`Unit ${u.id} needs >=3 deterministic checkpoints`);
  u.checks.forEach(q=>{
    ids.push(q.id);
    assert(learning.DIMENSIONS.includes(q.dimension),`${q.id} invalid dimension`);
    assert(Array.isArray(q.choices)&&q.choices.length>=2,`${q.id} needs choices`);
    assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.choices.length,`${q.id} invalid answer index`);
    assert(new Set(q.choices).size===q.choices.length,`${q.id} duplicate choice`);
    assert(q.explanation.length>=10,`${q.id} explanation too thin`);
    assert(learning.ERROR_TYPES[q.errorType],`${q.id} invalid error type ${q.errorType}`);
  });
});
assert.equal(new Set(ids).size,ids.length,'checkpoint ids must be globally unique');
assert.equal(ids.length,150,'BG16-B001 freezes exactly three checkpoints per canonical unit');
walk(course,(s,p)=>{if(greek.test(s))assert.equal(s,s.normalize('NFC'),`non-NFC Greek at ${p}`)});

// Normative answers must not teach mechanical slogans. Corrective teaching prose is
// intentionally allowed to quote a bad slogan while explicitly rejecting it.
const normativeAnswers=course.units.flatMap(u=>u.checks.map(q=>`${q.choices[q.answer]} ${q.explanation}`)).join('\n').toLowerCase();
for(const bad of [
  /aorist\s*(?:=|means)\s*(?:once|simple past)/,
  /no article\s*(?:=|means)\s*indefinite/,
  /genitive\s*(?:=|means)\s*(?:of|from)/,
  /present\s*(?:=|means)\s*continuous/,
  /historical present\s*(?:=|means)\s*(?:vivid|dramatic)/
])assert(!bad.test(normativeAnswers),`mechanical grammar slogan found in normative answer: ${bad}`);

assert(/Do not.*aorist.*once/i.test(course.units[18].caution),'Unit 19 must reject once-for-all aorist claims');
assert(/Do not.*present/i.test(course.units[11].caution),'Unit 12 must reject mechanical present translation');
assert(/does not mean.*(?:long|duration|repeated|incomplete)/i.test(course.units[16].caution),'Unit 17 must distinguish imperfective viewpoint from event duration');
assert(/Anarthrous does not automatically mean indefinite/i.test(course.units[40].caution),'Unit 41 must reject article/indefiniteness shortcut');
assert(/genitive is not semantically equal to English “of”/i.test(course.units[37].caution),'Unit 38 must reject genitive=of shortcut');
assert(/Do not.*historical present.*vivid/i.test(course.units[45].caution),'Unit 46 must reject automatic historical-present vividness');
assert(course.units[47].teach.some(x=>/Etymology/.test(x)),'Unit 48 must explicitly guard lexical etymology');
assert(course.units[48].teach.some(x=>/not itself a manuscript apparatus/.test(x)),'Unit 49 must distinguish edition comparison from manuscript evidence');
assert(course.units[49].teach.some(x=>/grammatical fact/.test(x)),'Unit 50 must preserve the exegetical evidence ladder');

console.log(`BG16-B001 course certification passed: ${course.units.length} canonical units, ${ids.length} deterministic checkpoints, Scripture transfer in every unit.`);
