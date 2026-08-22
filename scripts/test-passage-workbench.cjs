const assert=require('node:assert/strict');
const fs=require('node:fs');
const workbench=require('../passage-workbench-engine.js');
const portability=require('../data-portability.js');

const now=new Date('2026-08-23T00:00:00Z');
const storage=new portability.MemoryStorage();
const engine=new workbench.PassageWorkbenchEngine({storage,clock:()=>now});

assert.equal(workbench.STORAGE_KEY,'koine-path-passage-workbench-v1');
assert.equal(workbench.SCHEMA_VERSION,1);
assert.deepEqual(workbench.WORKFLOW_STEPS,['observation','morphology','syntax','lexical','discourse','synthesis','boundary']);
assert.throws(()=>workbench.normalizeRef({book:'John',chapter:1}),/verse range/i);
assert.deepEqual(workbench.normalizeRef({book:'John',chapter:1,startVerse:1,endVerse:4}),{book:'John',chapter:1,startVerse:1,endVerse:4});
assert.equal(workbench.refId({book:'John',chapter:1,startVerse:1,endVerse:4}),'John.1.1-4');
assert.equal(workbench.refLabel({book:'John',chapter:1,startVerse:1,endVerse:4},'John'),'John 1:1–4');

const project=engine.createProject({book:'John',chapter:1,startVerse:1,endVerse:4},{title:'John prologue study',source:'reading-goal',sourceGoalId:'goal.1'});
assert.equal(project.status,'active');assert.equal(project.source,'reading-goal');assert.equal(project.sourceGoalId,'goal.1');
assert.equal(engine.progress(project.id).percent,0);
engine.updateNotes(project.id,{observation:'The opening repeats witness and proclamation language.',crossReferences:'Genesis 1; 1 John 1:1–4'});
engine.setStep(project.id,'observation',true);assert.equal(engine.progress(project.id).completed,1);
engine.addLexicalNote(project.id,{tokenId:'John.1.1.1',form:'λόγος',lemma:'λόγος',parse:'noun · nominative · singular · masculine',note:'Track how the referent develops in the immediate context.'});
engine.addQuestion(project.id,'What does the anarthrous θεός establish here?');
let saved=engine.getProject(project.id);assert.equal(saved.lexicalNotes.length,1);assert.equal(saved.questions.length,1);assert.equal(saved.notes.crossReferences,'Genesis 1; 1 John 1:1–4');
engine.updateQuestion(project.id,saved.questions[0].id,{answer:'Do not reduce the construction to an English article rule.',resolved:true});saved=engine.getProject(project.id);assert.equal(saved.questions[0].resolved,true);
assert.throws(()=>engine.completeProject(project.id),/seven workbench steps/i);
for(const step of workbench.WORKFLOW_STEPS)engine.setStep(project.id,step,true);
engine.updateNotes(project.id,{synthesis:'The prologue presents the Word in relation to God and creation before the incarnation claim is developed.',boundary:'The syntax constrains several readings, but grammar alone does not supply the full theological synthesis.'});
const completed=engine.completeProject(project.id);assert.equal(completed.status,'complete');assert.ok(completed.completedAt);assert.equal(engine.progress(project.id).percent,100);
engine.reopenProject(project.id);assert.equal(engine.getProject(project.id).status,'active');

const md=engine.exportMarkdown(project.id,'John');assert.match(md,/^# John prologue study/m);assert.match(md,/\*\*Passage:\*\* John 1:1–4/);assert.match(md,/Observations/);assert.match(md,/λόγος/);assert.match(md,/Project completion records study workflow only/);assert.ok(!md.includes('canonical mastery earned'));

const snapshot=engine.snapshot();assert.doesNotThrow(()=>workbench.validateState(snapshot));assert.equal(snapshot.projects.length,1);
assert.throws(()=>workbench.validateState({...snapshot,schemaVersion:99}),/unsupported schema/i);
assert.throws(()=>workbench.validateState({...snapshot,projects:Array(41).fill(snapshot.projects[0])}),/project bound/i);
const malformed={...snapshot,projects:[{...snapshot.projects[0],ref:{book:'John',chapter:1,startVerse:4,endVerse:1}}]};assert.throws(()=>workbench.validateState(malformed),/verse range/i);

const stores=portability.collectStores(storage);assert.ok(stores[workbench.STORAGE_KEY]);const backup=portability.serializeBackup(storage,{appVersion:'v1.7-feature'});const parsed=portability.parseBackup(backup);assert.ok(parsed.stores[workbench.STORAGE_KEY]);
assert.doesNotThrow(()=>portability.validateStores({[workbench.STORAGE_KEY]:JSON.stringify(snapshot)}));
assert.throws(()=>portability.validateStores({[workbench.STORAGE_KEY]:JSON.stringify({...snapshot,schemaVersion:2})}),/Passage-workbench state/);
assert.throws(()=>portability.validateStores({[workbench.STORAGE_KEY]:JSON.stringify({...snapshot,projects:Array(41).fill(snapshot.projects[0])})}),/project bound/);
const badRef={...snapshot,projects:[{...snapshot.projects[0],ref:{book:'John',chapter:0,startVerse:1,endVerse:2}}]};assert.throws(()=>portability.validateStores({[workbench.STORAGE_KEY]:JSON.stringify(badRef)}),/invalid corpus reference/);
const tooManyLex={...snapshot,projects:[{...snapshot.projects[0],lexicalNotes:Array(81).fill(snapshot.projects[0].lexicalNotes[0])}]};assert.throws(()=>portability.validateStores({[workbench.STORAGE_KEY]:JSON.stringify(tooManyLex)}),/lexical-note bound/);

const source=fs.readFileSync('passage-workbench-engine.js','utf8'),ui=fs.readFileSync('passage-workbench-ui.js','utf8'),html=fs.readFileSync('index.html','utf8'),dpui=fs.readFileSync('data-portability-ui.js','utf8');
for(const forbidden of ['recordEvidence','recordExposure','recordHint']){assert.ok(!source.includes(forbidden),`workbench engine must not call ${forbidden}`);assert.ok(!ui.includes(forbidden),`workbench UI must not call ${forbidden}`)}
for(const asset of ['passage-workbench.css','passage-workbench-engine.js','passage-workbench-ui.js'])assert.ok(html.includes(asset),`${asset} missing from index`);
assert.ok(html.indexOf('reading-goals-engine.js')<html.indexOf('passage-workbench-engine.js'));
assert.ok(html.indexOf('exegesis-lab-ui.js')<html.indexOf('passage-workbench-ui.js'));
assert.ok(ui.includes('Use active reading goal'),'V1.7 must accept the active V1.6 reading passage');
assert.ok(ui.includes('Ask grounded tutor'),'V1.7 must expose grounded tutor handoff');
assert.ok(ui.includes('Open reviewed case'),'V1.7 must link overlapping reviewed exegesis cases');
assert.ok(dpui.includes("appVersion:'v1.7-feature'"));
console.log('V1.7 passage projects, structured notes, workflow-only completion, export, tool handoffs, mastery firewall, and backup integration: PASS');