const assert=require('node:assert/strict');
const fs=require('node:fs');
const synthesis=require('../research-synthesis-engine.js');
const research=require('../corpus-research-engine.js');
const portability=require('../data-portability.js');

const now=new Date('2026-08-23T10:00:00Z');
const storage=new portability.MemoryStorage();
const syn=new synthesis.ResearchSynthesisEngine({storage,clock:()=>now});
const res=new research.CorpusResearchEngine({storage,clock:()=>now});

assert.equal(synthesis.STORAGE_KEY,'koine-path-research-synthesis-v1');
assert.equal(synthesis.SCHEMA_VERSION,1);
assert.deepEqual(synthesis.LAYERS,['observation','argument','inference','theological-synthesis']);
assert.deepEqual(synthesis.RELATIONS,['support','counter','context','unresolved']);
assert.deepEqual(synthesis.CONFIDENCE,['unspecified','low','medium','high']);
assert.deepEqual(synthesis.CONTESTATION,['uncontested','contested','unresolved']);

const projectId='workbench.1';
const corpusEntry=res.addEntry({provenance:'corpus',title:'John 1:1 lexical observation',note:'The lemma occurs in the canonical passage.',refs:[{book:'John',chapter:1,verse:1}],linkedProjectId:projectId});
const reviewed=res.addEntry({provenance:'reviewed',title:'Reviewed syntax case',note:'Reviewed internal case.',refs:[{book:'John',chapter:1,verse:1}],caseId:'case.john.1.1',unitId:50,linkedProjectId:projectId});
const learner=res.addEntry({provenance:'learner',title:'Learner inference',note:'A provisional inference.',refs:[{book:'John',chapter:1,verse:1}],linkedProjectId:projectId});
const external=res.addEntry({provenance:'external',title:'Reference grammar',citation:'Example Author, Reference Grammar, 2nd ed.',locator:'§12',url:'https://example.com/grammar',note:'Terminology note.',linkedProjectId:projectId});

const d=syn.createDossier({title:'John 1:1 Exegetical Dossier',linkedProjectId:projectId});
assert.equal(d.status,'active');
const reading=syn.addReading(d.id,{title:'Qualitative reading',summary:'A possible construal to test against the evidence.'});
const primary=syn.addClaim(d.id,{text:'The clause should be described from its syntax before theological synthesis.',layer:'argument',confidence:'medium',contestation:'contested'});
const alternative=syn.addClaim(d.id,{text:'An alternative construal remains possible and requires explicit counter-evidence.',layer:'inference',confidence:'low',contestation:'unresolved',readingId:reading.id});
const eCorpus=syn.importResearchEntry(d.id,corpusEntry),eReviewed=syn.importResearchEntry(d.id,reviewed),eLearner=syn.importResearchEntry(d.id,learner),eExternal=syn.importResearchEntry(d.id,external);
assert.deepEqual(syn.getDossier(d.id).evidence.map(e=>e.provenance).sort(),['corpus','external','learner','reviewed']);
const again=syn.importResearchEntry(d.id,external);assert.equal(again.id,eExternal.id,'same research entry should not duplicate evidence');
const passage=syn.addCanonicalEvidence(d.id,{book:'John',chapter:1,startVerse:1,endVerse:4},{title:'John 1:1–4 canonical anchor'});assert.equal(passage.provenance,'corpus');

let gaps=syn.gapReport(d.id);assert.ok(gaps.unsupportedClaims.includes(primary.id));assert.ok(gaps.contestedWithoutCounter.includes(primary.id));assert.ok(gaps.unresolvedWithoutMarker.includes(alternative.id));assert.ok(gaps.orphanEvidence.length>=5);
syn.linkEvidence(d.id,{claimId:primary.id,evidenceId:eCorpus.id,relation:'support',note:'Primary corpus observation anchors the claim.'});
syn.linkEvidence(d.id,{claimId:primary.id,evidenceId:eExternal.id,relation:'counter',note:'External terminology complicates an overconfident formulation.'});
syn.linkEvidence(d.id,{claimId:primary.id,evidenceId:eReviewed.id,relation:'context'});
syn.linkEvidence(d.id,{claimId:alternative.id,evidenceId:eLearner.id,relation:'unresolved',note:'This remains a learner hypothesis.'});
gaps=syn.gapReport(d.id);assert.ok(!gaps.unsupportedClaims.includes(primary.id));assert.ok(!gaps.contestedWithoutCounter.includes(primary.id));assert.ok(gaps.unsupportedClaims.includes(alternative.id),'unresolved claim can remain unsupported');assert.ok(!gaps.unresolvedWithoutMarker.includes(alternative.id));

const comparison=syn.readingComparison(d.id);assert.equal(comparison.length,1);assert.equal(comparison[0].title,'Qualitative reading');assert.equal(comparison[0].claims,1);assert.equal(comparison[0].unresolved,1);assert.ok(!('score' in comparison[0]),'reading comparison must not emit a quality score');

syn.updateDossier(d.id,{sections:{question:'How should the clause be described before theological synthesis?',context:'Immediate literary and syntactic context.',thesis:'The argument should preserve the distinction between grammatical observation and theological inference.',argument:'1. Establish syntax.\n2. Compare evidence.\n3. Mark interpretive boundaries.',conclusion:'The dossier preserves what the evidence establishes and what remains inferred.',theologicalSynthesis:'Theological synthesis is stated after the linguistic argument, not substituted for it.',limitations:'The dossier retains a deliberately unresolved alternative reading.'}});
const completed=syn.completeDossier(d.id);assert.equal(completed.status,'complete');assert.ok(completed.completedAt);

const md=syn.exportMarkdown(d.id);assert.match(md,/^# John 1:1 Exegetical Dossier/m);assert.match(md,/Claim graph/);assert.match(md,/Alternative readings/);assert.match(md,/Evidence-gap report/);assert.match(md,/Evidence appendix/);assert.match(md,/Bibliography \/ external sources/);assert.match(md,/Example Author, Reference Grammar/);assert.match(md,/confidence medium/);assert.match(md,/counter/);assert.match(md,/does not create canonical Koinē Path mastery evidence/);assert.match(md,/citation counts are descriptive, not truth scores/);

const snap=syn.snapshot();assert.doesNotThrow(()=>synthesis.validateState(snap));assert.throws(()=>synthesis.validateState({...snap,schemaVersion:99}),/unsupported schema/i);assert.throws(()=>synthesis.validateState({...snap,dossiers:Array(25).fill(snap.dossiers[0])}),/dossier bound/i);
const malformed=JSON.parse(JSON.stringify(snap));malformed.dossiers[0].links[0].evidenceId='missing';assert.throws(()=>synthesis.validateState(malformed),/Citation graph link/);
const stores=portability.collectStores(storage);assert.ok(stores[synthesis.STORAGE_KEY]);

const source=fs.readFileSync('research-synthesis-engine.js','utf8'),ui=fs.readFileSync('research-synthesis-ui.js','utf8'),guard=fs.readFileSync('research-synthesis-portability.js','utf8'),html=fs.readFileSync('index.html','utf8');
for(const forbidden of ['recordEvidence','recordExposure','recordHint']){assert.ok(!source.includes(forbidden),`synthesis engine must not call ${forbidden}`);assert.ok(!ui.includes(forbidden),`synthesis UI must not call ${forbidden}`)}
for(const asset of ['research-synthesis.css','research-synthesis-engine.js','research-synthesis-ui.js','research-synthesis-portability.js'])assert.ok(html.includes(asset),`${asset} missing from index`);
assert.ok(html.indexOf('corpus-research-engine.js')<html.indexOf('research-synthesis-engine.js'));
assert.ok(html.indexOf('corpus-research-ui.js')<html.indexOf('research-synthesis-ui.js'));
assert.ok(html.indexOf('corpus-research-portability.js')<html.indexOf('research-synthesis-portability.js')&&html.indexOf('research-synthesis-portability.js')<html.indexOf('data-portability-ui.js'));
assert.ok(guard.includes("backup.appVersion='v1.9-feature'"));assert.ok(guard.includes('validateSynthesisStores'));
assert.ok(!source.includes('truthScore')&&!source.includes('qualityScore'));
console.log('V1.9 layered claims, evidence snapshots, citation graph, alternative readings, gap detection, dossier export, mastery firewall, and backup integration: PASS');