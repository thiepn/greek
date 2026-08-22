const assert=require('assert');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const course=require('../data/course-content.js');
const experience=require('../data/course-v1.1-enrichment.js');
const greek=/[\u0370-\u03ff\u1f00-\u1fff]/u;
const ids=[];
const walk=(v,fn,p='root')=>{if(typeof v==='string')fn(v,p);else if(Array.isArray(v))v.forEach((x,i)=>walk(x,fn,`${p}[${i}]`));else if(v&&typeof v==='object')Object.entries(v).forEach(([k,x])=>walk(x,fn,`${p}.${k}`));};

assert.equal(experience.version,'v1.1.0');
assert.equal(experience.role,'supplementary-unscored-learning-experience');
assert.equal(experience.policy.masteryEvidence,false,'supplementary practice must never become mastery evidence');
assert.equal(experience.policy.practiceItemsPerUnit,2);
assert.equal(experience.unitCount,50);
assert.equal(experience.units.length,50);
assert.deepEqual(experience.units.map(x=>x.id),course.units.map(x=>x.id),'v1.1 enrichment must cover canonical Units 1–50 exactly');
assert.equal(course.units.reduce((n,u)=>n+u.checks.length,0),150,'v1.1 must preserve the 150 canonical mastery checkpoints');

experience.units.forEach(e=>{
  assert(e.focus.length>=55,`Unit ${e.id} reading-problem focus too thin`);
  assert(e.observe&&greek.test(e.observe.greek),`Unit ${e.id} needs a Greek observation surface`);
  assert(e.observe.prompt.length>=35,`Unit ${e.id} observation prompt too thin`);
  assert(e.observe.explanation.length>=55,`Unit ${e.id} observation explanation too thin`);
  assert(e.contrast&&e.contrast.left!==e.contrast.right,`Unit ${e.id} needs a genuine contrast pair`);
  assert(e.contrast.prompt.length>=30,`Unit ${e.id} contrast prompt too thin`);
  assert(e.contrast.explanation.length>=55,`Unit ${e.id} contrast explanation too thin`);
  assert(Array.isArray(e.practice)&&e.practice.length===2,`Unit ${e.id} must have exactly two supplementary practice items`);
  e.practice.forEach(q=>{
    ids.push(q.id);
    assert(/^u\d+\.p[12]$/.test(q.id),`${q.id} invalid supplementary practice id`);
    assert(!('dimension' in q)&&!('errorType' in q),`${q.id} must not carry mastery-engine fields`);
    assert(q.prompt.length>=25,`${q.id} prompt too thin`);
    assert(Array.isArray(q.choices)&&q.choices.length>=2,`${q.id} needs choices`);
    assert(new Set(q.choices).size===q.choices.length,`${q.id} has duplicate choices`);
    assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.choices.length,`${q.id} invalid answer`);
    assert(q.explanation.length>=25,`${q.id} explanation too thin`);
  });
  assert(e.reasoning.length>=65,`Unit ${e.id} needs a substantive explain-your-reasoning prompt`);
});
assert.equal(ids.length,100,'v1.1 freezes exactly 100 supplementary retrieval items');
assert.equal(new Set(ids).size,100,'supplementary practice ids must be globally unique');
walk(experience,(s,p)=>{if(greek.test(s))assert.equal(s,s.normalize('NFC'),`non-NFC Greek at ${p}`)});

const normative=experience.units.flatMap(e=>[
  e.observe.explanation,e.contrast.explanation,e.reasoning,
  ...e.practice.map(q=>`${q.choices[q.answer]} ${q.explanation}`)
]).join('\n').toLowerCase();
for(const bad of [
  /aorist\s*(?:=|means)\s*(?:once|one[- ]time|simple past)/,
  /present\s*(?:=|means)\s*continuous/,
  /imperfect\s*(?:=|means)\s*(?:continuous|repeated)/,
  /no article\s*(?:=|means)\s*indefinite/,
  /genitive\s*(?:=|means)\s*(?:of|from)/,
  /historical present\s*(?:=|means)\s*(?:vivid|dramatic)/
])assert(!bad.test(normative),`mechanical grammar slogan found in v1.1 normative content: ${bad}`);

const ui=read('course-ui.js');
const index=read('index.html');
assert(ui.includes('KOINE_COURSE_ENRICHMENT'),'Learn UI must load the v1.1 enrichment layer');
assert(ui.includes('Practice before the checkpoint'),'Learn UI must expose unscored retrieval practice');
assert(ui.includes('Explain your reasoning'),'Learn UI must expose reasoning generation');
assert(ui.includes('Read again'),'Learn UI must expose post-checkpoint transfer');
const practiceFn=ui.match(/function answerPractice\([\s\S]*?\n  }\n\n  function answer\(/)?.[0]||'';
assert(practiceFn,'answerPractice function not found');
assert(!/recordEvidence|recordExposure/.test(practiceFn),'supplementary practice must have no learning-engine write path');
const enrichmentPos=index.indexOf('data/course-v1.1-enrichment.js');
const uiPos=index.indexOf('course-ui.js');
assert(enrichmentPos>=0&&enrichmentPos<uiPos,'enrichment must load before course-ui.js');
assert(index.includes('course-v1.1.css'),'v1.1 Learn styles must load');

console.log(`V1.1 learning-experience certification passed: ${experience.units.length} enriched units, ${ids.length} unscored retrieval items, 150 canonical mastery checkpoints preserved.`);