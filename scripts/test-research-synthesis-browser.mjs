import {chromium} from 'playwright';
const url=process.env.KOINE_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:900},acceptDownloads:true});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto(url,{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.KOINE_FULL_READER?.manifest?.books?.length===27&&window.KOINE_PASSAGE_WORKBENCH&&window.KOINE_CORPUS_RESEARCH&&window.KOINE_RESEARCH_SYNTHESIS_UI,{timeout:18000});
const learningBefore=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));
const fixture=await page.evaluate(()=>{
  const p=window.KOINE_PASSAGE_WORKBENCH.createProject({book:'John',chapter:1,startVerse:1,endVerse:4},{title:'John 1 synthesis project'});
  const r=window.KOINE_CORPUS_RESEARCH;
  const entries=[
    r.addEntry({provenance:'corpus',title:'John 1:1 corpus observation',note:'Primary corpus observation.',refs:[{book:'John',chapter:1,startVerse:1,endVerse:1}],linkedProjectId:p.id}),
    r.addEntry({provenance:'reviewed',title:'Reviewed John syntax case',note:'Reviewed internal material.',refs:[{book:'John',chapter:1,startVerse:1,endVerse:1}],caseId:'case.browser',unitId:50,linkedProjectId:p.id}),
    r.addEntry({provenance:'learner',title:'Working learner inference',note:'This inference remains provisional.',refs:[{book:'John',chapter:1,startVerse:1,endVerse:1}],linkedProjectId:p.id}),
    r.addEntry({provenance:'external',title:'Reference grammar',citation:'Example Author, Reference Grammar, 2nd ed.',locator:'§12',url:'https://example.com/grammar',note:'External terminology note.',linkedProjectId:p.id})
  ];return{projectId:p.id,entryIds:entries.map(e=>e.id)};
});
await page.evaluate(()=>{window.KOINE_APP_OPEN_VIEW('synthesis');window.KOINE_RESEARCH_SYNTHESIS_UI.render()});
await page.getByRole('heading',{name:'Turn research into an auditable argument.',exact:true}).waitFor();
await page.locator('#syn-new-title').fill('John 1 Exegetical Dossier');
await page.locator('#syn-new-project').selectOption(fixture.projectId);
await page.locator('#syn-create').click();
await page.getByRole('heading',{name:'John 1 Exegetical Dossier',exact:true}).waitFor();

await page.locator('#syn-question').fill('How should the clause be described before theological synthesis?');
await page.locator('#syn-context').fill('Immediate literary and syntactic context.');
await page.locator('#syn-thesis').fill('The argument should distinguish grammatical observation from theological inference.');
await page.locator('#syn-argument').fill('1. Establish syntax. 2. Compare corpus and reviewed evidence. 3. Mark inferential boundaries.');
await page.locator('#syn-conclusion').fill('The evidence constrains the argument while leaving some interpretive questions open.');
await page.locator('#syn-theological').fill('Theological synthesis follows rather than replaces the linguistic argument.');
await page.locator('#syn-limitations').fill('One alternative reading remains deliberately unresolved.');
await page.locator('#syn-save-writing').click();

await page.locator('#syn-reading-title').fill('Alternative construal');
await page.locator('#syn-reading-summary').fill('A possible construal retained for comparison without automatic winner selection.');
await page.locator('#syn-add-reading').click();
let readingId=await page.evaluate(()=>window.KOINE_RESEARCH_SYNTHESIS.getDossier().readings[0].id);

await page.locator('#syn-claim-text').fill('The clause should be described from its syntax before theological synthesis.');
await page.locator('#syn-claim-layer').selectOption('argument');
await page.locator('#syn-claim-confidence').selectOption('medium');
await page.locator('#syn-claim-contestation').selectOption('contested');
await page.locator('#syn-add-claim').click();
await page.locator('#syn-claim-text').fill('An alternative construal remains possible pending stronger evidence.');
await page.locator('#syn-claim-layer').selectOption('inference');
await page.locator('#syn-claim-confidence').selectOption('low');
await page.locator('#syn-claim-contestation').selectOption('unresolved');
await page.locator('#syn-claim-reading').selectOption(readingId);
await page.locator('#syn-add-claim').click();

for(const id of fixture.entryIds){await page.locator(`[data-syn-import="${id}"]`).click()}
await page.locator('#syn-add-project-passage').click();
const state=await page.evaluate(()=>{const d=window.KOINE_RESEARCH_SYNTHESIS.getDossier();return{claims:d.claims.map(c=>({id:c.id,text:c.text})),evidence:d.evidence.map(e=>({id:e.id,provenance:e.provenance,title:e.title}))}});
const primary=state.claims.find(c=>c.text.startsWith('The clause')),alternate=state.claims.find(c=>c.text.startsWith('An alternative'));
const corpus=state.evidence.find(e=>e.provenance==='corpus'&&e.title==='John 1:1 corpus observation');
const reviewed=state.evidence.find(e=>e.provenance==='reviewed'),learner=state.evidence.find(e=>e.provenance==='learner'),external=state.evidence.find(e=>e.provenance==='external');
async function link(claimId,evidenceId,relation,note=''){await page.locator('#syn-link-claim').selectOption(claimId);await page.locator('#syn-link-evidence').selectOption(evidenceId);await page.locator('#syn-link-relation').selectOption(relation);await page.locator('#syn-link-note').fill(note);await page.locator('#syn-add-link').click()}
await link(primary.id,corpus.id,'support','Primary corpus observation anchors this claim.');
await link(primary.id,external.id,'counter','External terminology cautions against overstatement.');
await link(primary.id,reviewed.id,'context','Reviewed internal material supplies context.');
await link(alternate.id,learner.id,'unresolved','This remains a learner hypothesis rather than established corpus evidence.');

const gaps=await page.evaluate(()=>window.KOINE_RESEARCH_SYNTHESIS.gapReport());if(!gaps.unsupportedClaims.includes(alternate.id)||gaps.unsupportedClaims.includes(primary.id)||gaps.contestedWithoutCounter.includes(primary.id)||gaps.unresolvedWithoutMarker.includes(alternate.id))throw new Error(`Unexpected V1.9 gap report: ${JSON.stringify(gaps)}`);
const reading=await page.evaluate(()=>window.KOINE_RESEARCH_SYNTHESIS.readingComparison()[0]);if('score' in reading||reading.unresolved!==1)throw new Error('Alternative reading comparison introduced scoring or lost unresolved evidence.');
let learningAfter=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));if(learningAfter!==learningBefore)throw new Error('Building citation graph mutated canonical learning state.');

await page.locator('#syn-complete').click();
await page.locator('#syn-actions').getByText('complete',{exact:false}).first().waitFor();
const dossier=await page.evaluate(()=>window.KOINE_RESEARCH_SYNTHESIS.getDossier());if(dossier.status!=='complete')throw new Error('Dossier did not complete after required writing and support were present.');
learningAfter=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));if(learningAfter!==learningBefore)throw new Error('Completing dossier mutated canonical learning state.');

const malformedRejected=await page.evaluate(()=>{try{window.KoineDataPortability.validateStores({'koine-path-research-synthesis-v1':JSON.stringify({schemaVersion:99,dossiers:[],activeDossierId:null})});return false}catch{return true}});if(!malformedRejected)throw new Error('V1.9 portability guard accepted malformed synthesis state.');
const backupState=await page.evaluate(()=>({backup:JSON.parse(window.KoineDataPortability.serializeBackup(localStorage,{appVersion:'old'})),hasSourceLibrary:Boolean(window.KoineSourceLibrary)}));
const expectedBackupVersion=backupState.hasSourceLibrary?'v1.10-feature':'v1.9-feature';if(backupState.backup.appVersion!==expectedBackupVersion||!backupState.backup.stores['koine-path-research-synthesis-v1'])throw new Error(`V1.9 backup export did not preserve synthesis state/current feature version: expected ${expectedBackupVersion}, got ${backupState.backup.appVersion}.`);
const downloadPromise=page.waitForEvent('download');await page.locator('#syn-export').click();const download=await downloadPromise;if(!download.suggestedFilename().endsWith('.md'))throw new Error('Dossier export was not Markdown.');
const md=await page.evaluate(()=>window.KOINE_RESEARCH_SYNTHESIS.exportMarkdown());if(!md.includes('Evidence appendix')||!md.includes('Bibliography / external sources')||!md.includes('citation counts are descriptive, not truth scores'))throw new Error('Dossier Markdown omitted evidence/citation boundaries.');

await page.setViewportSize({width:320,height:844});
const overflow=await page.evaluate(()=>({doc:document.documentElement.scrollWidth-window.innerWidth,syn:document.querySelector('#synthesis').scrollWidth-document.querySelector('#synthesis').clientWidth}));if(overflow.doc>1||overflow.syn>1)throw new Error(`V1.9 introduced 320px horizontal overflow: ${JSON.stringify(overflow)}`);
if(errors.length)throw new Error(`Browser errors: ${errors.join(' | ')}`);
await browser.close();
console.log('V1.9 browser claims, citation graph, alternative readings, gap detection, dossier completion, backup guard, mastery firewall, export, and 320px reflow: PASS');