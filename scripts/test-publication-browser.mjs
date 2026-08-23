import {chromium} from 'playwright';
const url=process.env.KOINE_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:900},acceptDownloads:true});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto(url,{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.KOINE_FULL_READER?.manifest?.books?.length===27&&window.KOINE_PUBLICATION_UI&&window.KOINE_SOURCE_LIBRARY&&window.KOINE_CORPUS_RESEARCH&&window.KOINE_RESEARCH_SYNTHESIS&&window.KOINE_PASSAGE_WORKBENCH,{timeout:18000});
const before=await page.evaluate(()=>({learning:localStorage.getItem('koine-path-learning-v3'),sources:localStorage.getItem('koine-path-source-library-v1')}));
const fixture=await page.evaluate(()=>{
 const p=window.KOINE_PASSAGE_WORKBENCH.createProject({book:'John',chapter:1,startVerse:1,endVerse:4},{title:'John 1 publication project'});
 const d=window.KOINE_RESEARCH_SYNTHESIS.createDossier({title:'John 1 Publication Dossier',linkedProjectId:p.id});
 window.KOINE_RESEARCH_SYNTHESIS.updateDossier(d.id,{sections:{question:'How should the opening clause be described?',context:'Immediate literary context.',thesis:'Syntactic description should precede theological synthesis.',argument:'Establish syntax, then evaluate interpretations.',conclusion:'The evidence constrains but does not replace interpretation.',theologicalSynthesis:'Theological synthesis follows the linguistic argument.',limitations:'One interpretive question remains open.'}});
 const claim=window.KOINE_RESEARCH_SYNTHESIS.addClaim(d.id,{text:'The clause should be described syntactically before theological synthesis.',layer:'argument',confidence:'medium',contestation:'contested'});
 const s=window.KOINE_SOURCE_LIBRARY.addSource({type:'grammar',title:'A Reference Grammar of Koine Greek',authors:'Example, Anna',year:'2026',publisher:'Example Press',place:'Cologne',doi:'10.1000/grammar',notes:'Private source note must not appear by default.'});
 const e=window.KOINE_CORPUS_RESEARCH.addEntry({provenance:'external',title:s.title,citation:window.KoineSourceLibrary.formatCitation(s),locator:'§12',note:'External terminology note.',linkedProjectId:p.id});
 window.KOINE_SOURCE_LIBRARY.linkResearch(s.id,e.id,{locator:'§12',snapshot:window.KoineSourceLibrary.formatCitation(s)});
 const ev=window.KOINE_RESEARCH_SYNTHESIS.importResearchEntry(d.id,e);window.KOINE_RESEARCH_SYNTHESIS.linkEvidence(d.id,{claimId:claim.id,evidenceId:ev.id,relation:'support',note:'External terminology support.'});
 return{projectId:p.id,dossierId:d.id,sourceId:s.id};
});
const dossierBefore=await page.evaluate(()=>JSON.stringify(window.KOINE_RESEARCH_SYNTHESIS.getDossier()));
await page.evaluate(()=>window.KOINE_PUBLICATION_UI.open());
await page.getByRole('heading',{name:'Format the dossier without rewriting the evidence.',exact:true}).waitFor();
await page.locator('#publication-sources').getByText('A Reference Grammar of Koine Greek',{exact:false}).waitFor();

await page.locator('#pub-name').fill('Biblical studies endnotes');
await page.locator('#pub-style').selectOption('koine-biblical-studies-notes');
await page.locator('#pub-placement').selectOption('endnotes');
await page.locator('#pub-bib-template').selectOption('keyed');
await page.locator('#pub-doc-title').fill('Published John 1 Study');
await page.locator('#pub-doc-author').fill('Researcher');
await page.locator('#pub-doc-date').fill('2026-08-23');
await page.locator('#pub-save-profile').click();
await page.getByRole('heading',{name:'Format the dossier without rewriting the evidence.',exact:true}).waitFor();
const preview=await page.locator('.publication-preview-text').innerText();
if(!preview.includes('Published John 1 Study')||!preview.includes('## Notes')||!preview.includes('@'))throw new Error('Saved V1.11 profile did not update publication preview.');
if(preview.includes('Private source note must not appear by default.'))throw new Error('Publication preview leaked source notes without annotated-note opt-in.');
if(!preview.includes('not CSL/SBL/Chicago certified'))throw new Error('Publication preview omitted house-style non-certification boundary.');

const profileState=await page.evaluate(()=>window.KOINE_PUBLICATION.snapshot());if(profileState.schemaVersion!==1||profileState.profiles.length!==1||profileState.profiles[0].placement!=='endnotes')throw new Error('Publication profile did not persist expected state.');
let after=await page.evaluate(()=>({learning:localStorage.getItem('koine-path-learning-v3'),sources:localStorage.getItem('koine-path-source-library-v1'),dossier:JSON.stringify(window.KOINE_RESEARCH_SYNTHESIS.getDossier())}));
if(after.learning!==before.learning)throw new Error('Publication formatting mutated canonical learning state.');
if(after.sources!==before.sources&&JSON.parse(after.sources).sources.length!==1)throw new Error('Publication formatting unexpectedly rewrote source-library membership.');
if(after.dossier!==dossierBefore)throw new Error('Publication profile editing mutated V1.9 dossier state.');

for(const [format,ext] of [['markdown','.md'],['html','.html'],['text','.txt']]){const dp=page.waitForEvent('download');await page.locator(`[data-pub-export="${format}"]`).click();const dl=await dp;if(!dl.suggestedFilename().endsWith(ext))throw new Error(`${format} publication export used the wrong extension.`)}
const exports=await page.evaluate(()=>{const d=window.KOINE_RESEARCH_SYNTHESIS.getDossier(),ids=window.KoinePublication.sourceIdsForDossier(d,id=>window.KOINE_SOURCE_LIBRARY.sourceForResearchEntry(id)),sources=ids.map(id=>window.KOINE_SOURCE_LIBRARY.getSource(id)),profile=window.KOINE_PUBLICATION.getProfile();return{md:window.KOINE_PUBLICATION.exportPublication({dossier:d,sources,resolveSource:id=>window.KOINE_SOURCE_LIBRARY.sourceForResearchEntry(id),profile,format:'markdown'}),html:window.KOINE_PUBLICATION.exportPublication({dossier:d,sources,resolveSource:id=>window.KOINE_SOURCE_LIBRARY.sourceForResearchEntry(id),profile,format:'html'})}});
if(!exports.md.includes('## Bibliography')||!exports.md.includes('1. Anna Example')||!exports.html.includes('<!doctype html>'))throw new Error('V1.11 publication exports omitted notes/bibliography/HTML shell.');

const malformedRejected=await page.evaluate(()=>{try{window.KoineDataPortability.validateStores({'koine-path-publication-profiles-v1':JSON.stringify({schemaVersion:99,profiles:[],activeProfileId:null})});return false}catch{return true}});if(!malformedRejected)throw new Error('V1.11 portability guard accepted malformed publication-profile state.');
const backup=await page.evaluate(()=>JSON.parse(window.KoineDataPortability.serializeBackup(localStorage,{appVersion:'old'})));if(backup.appVersion!=='v1.11-feature'||!backup.stores['koine-path-publication-profiles-v1'])throw new Error('V1.11 backup export did not include guarded publication-profile state/version.');
after=await page.evaluate(()=>({learning:localStorage.getItem('koine-path-learning-v3'),dossier:JSON.stringify(window.KOINE_RESEARCH_SYNTHESIS.getDossier())}));if(after.learning!==before.learning||after.dossier!==dossierBefore)throw new Error('Publication export/backup validation mutated learning or dossier state.');

await page.setViewportSize({width:320,height:844});
const overflow=await page.evaluate(()=>({doc:document.documentElement.scrollWidth-window.innerWidth,pub:document.querySelector('#publication').scrollWidth-document.querySelector('#publication').clientWidth}));if(overflow.doc>1||overflow.pub>1)throw new Error(`V1.11 introduced 320px publication horizontal overflow: ${JSON.stringify(overflow)}`);
if(errors.length)throw new Error(`Browser errors: ${errors.join(' | ')}`);
await browser.close();
console.log('V1.11 browser profiles, citation styles, endnotes, bibliography templates, Markdown/HTML/text export, backup guard, dossier/source/mastery firewalls, and 320px reflow: PASS');