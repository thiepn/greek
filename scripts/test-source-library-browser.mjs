import {chromium} from 'playwright';
const url=process.env.KOINE_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:900},acceptDownloads:true});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto(url,{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.KOINE_FULL_READER?.manifest?.books?.length===27&&window.KOINE_SOURCE_LIBRARY_UI&&window.KOINE_CORPUS_RESEARCH&&window.KOINE_RESEARCH_SYNTHESIS&&window.KOINE_PASSAGE_WORKBENCH,{timeout:18000});
const learningBefore=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));
const fixture=await page.evaluate(()=>{
  const p=window.KOINE_PASSAGE_WORKBENCH.createProject({book:'John',chapter:1,startVerse:1,endVerse:4},{title:'John 1 source project'});
  const d=window.KOINE_RESEARCH_SYNTHESIS.createDossier({title:'John 1 source dossier',linkedProjectId:p.id});
  return{projectId:p.id,dossierId:d.id};
});
await page.evaluate(()=>window.KOINE_APP_OPEN_VIEW('sources'));
await page.getByRole('heading',{name:'Keep bibliography separate from argument.',exact:true}).waitFor();

await page.locator('#source-new-type').selectOption('grammar');
await page.locator('#source-new-title').fill('A Reference Grammar of Koine Greek');
await page.locator('#source-new-authors').fill('Example, Anna');
await page.locator('#source-new-year').fill('2026');
await page.locator('#source-new-publisher').fill('Example Press');
await page.locator('#source-new-doi').fill('https://doi.org/10.1000/grammar');
await page.locator('#source-new-tags').fill('grammar, syntax');
await page.locator('#source-add-button').click();
await page.getByRole('heading',{name:'A Reference Grammar of Koine Greek',exact:true}).waitFor();
let state=await page.evaluate(()=>window.KOINE_SOURCE_LIBRARY.snapshot());
if(state.sources.length!==1||state.sources[0].doi!=='10.1000/grammar'||!state.sources[0].citationKey)throw new Error('Manual source creation did not normalize DOI/citation key.');
const grammarId=state.sources[0].id;

await page.locator('#source-new-type').selectOption('book');
await page.locator('#source-new-title').fill('Duplicate record');
await page.locator('#source-new-authors').fill('Other, Person');
await page.locator('#source-new-year').fill('2025');
await page.locator('#source-new-doi').fill('10.1000/grammar');
await page.locator('#source-add-button').click();
await page.locator('#source-add-status').filter({hasText:/Possible duplicate source/}).waitFor();
state=await page.evaluate(()=>window.KOINE_SOURCE_LIBRARY.snapshot());if(state.sources.length!==1)throw new Error('Duplicate DOI was inserted instead of rejected.');

const bib=`@article{doe2024aspect,
  author = {Doe, Jane and Roe, John},
  title = {Aspect and Discourse},
  journal = {Journal of Greek Studies},
  year = {2024},
  volume = {12},
  number = {2},
  pages = {10--25},
  doi = {10.2000/aspect}
}`;
await page.locator('#source-import-format').selectOption('bibtex');
await page.locator('#source-import-text').fill(bib);
await page.locator('#source-import-button').click();
await page.locator('#source-import-status').filter({hasText:/Imported 1\/1/}).waitFor();
state=await page.evaluate(()=>window.KOINE_SOURCE_LIBRARY.snapshot());if(state.sources.length!==2)throw new Error('BibTeX import did not create one source.');

await page.evaluate(id=>window.KOINE_SOURCE_LIBRARY_UI.openSource(id),grammarId);
await page.getByRole('heading',{name:'A Reference Grammar of Koine Greek',exact:true}).waitFor();
await page.locator('#source-new-collection').fill('John 1 research');await page.locator('#source-create-collection').click();
await page.locator('#source-add-to-collection').click();
state=await page.evaluate(()=>window.KOINE_SOURCE_LIBRARY.snapshot());if(state.collections.length!==1||!state.collections[0].sourceIds.includes(grammarId))throw new Error('Source collection did not preserve selected source.');

await page.locator('#source-verification').selectOption('consulted');await page.locator('#source-set-verification').click();
await page.evaluate(id=>window.KOINE_SOURCE_LIBRARY_UI.openSource(id),grammarId);
await page.locator('#source-locator').fill('§12');await page.locator('#source-project').selectOption(fixture.projectId);await page.locator('#source-annotation').fill('Terminology relevant to the clause.');await page.locator('#source-add-annotation').click();
state=await page.evaluate(()=>window.KOINE_SOURCE_LIBRARY.snapshot());const grammar=state.sources.find(s=>s.id===grammarId);if(grammar.verification.status!=='consulted'||grammar.annotations.length!==1||grammar.annotations[0].locator!=='§12')throw new Error('Verification/locator annotation workflow failed.');

await page.locator('#source-locator').fill('§12');await page.locator('#source-project').selectOption(fixture.projectId);await page.locator('#source-annotation').fill('Structured source handoff note.');await page.locator('#source-send-research').click();
await page.locator('#source-detail-status').filter({hasText:/V1\.8 external research entry/}).waitFor();
let linked=await page.evaluate(id=>({links:window.KOINE_SOURCE_LIBRARY.linksForSource(id),entries:window.KOINE_CORPUS_RESEARCH.listEntries()}),grammarId);if(linked.links.length!==1||!linked.entries.some(e=>e.id===linked.links[0].researchEntryId&&e.provenance==='external'))throw new Error('Source was not linked through V1.8 Research.');
let learningAfter=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));if(learningAfter!==learningBefore)throw new Error('Source-to-research handoff mutated canonical learning state.');

await page.locator('#source-send-dossier').click();await page.locator('#source-detail-status').filter({hasText:/active dossier/}).waitFor();
const dossier=await page.evaluate(()=>window.KOINE_RESEARCH_SYNTHESIS.getDossier());if(dossier.id!==fixture.dossierId||dossier.evidence.filter(e=>e.provenance==='external').length!==1)throw new Error('Structured source did not import into active dossier through V1.8 evidence.');
learningAfter=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));if(learningAfter!==learningBefore)throw new Error('Source-to-dossier handoff mutated canonical learning state.');

await page.evaluate(()=>{window.KOINE_APP_OPEN_VIEW('synthesis');window.KOINE_RESEARCH_SYNTHESIS_UI.render()});
await page.locator('#source-dossier-bibliography').getByRole('heading',{name:/Structured bibliography/}).waitFor();
const bibText=await page.locator('#source-dossier-bibliography').innerText();if(!bibText.includes('A Reference Grammar of Koine Greek')||!bibText.includes('@'))throw new Error('V1.10 dossier bibliography did not resolve structured source metadata.');

const malformedRejected=await page.evaluate(()=>{try{window.KoineDataPortability.validateStores({'koine-path-source-library-v1':JSON.stringify({schemaVersion:99,sources:[],collections:[],links:[]})});return false}catch{return true}});if(!malformedRejected)throw new Error('V1.10 portability guard accepted malformed source-library state.');
const backup=await page.evaluate(()=>JSON.parse(window.KoineDataPortability.serializeBackup(localStorage,{appVersion:'old'})));if(backup.appVersion!=='v1.10-feature'||!backup.stores['koine-path-source-library-v1'])throw new Error('V1.10 backup export did not include guarded source-library state/version.');

await page.evaluate(()=>window.KOINE_APP_OPEN_VIEW('sources'));
const downloadPromise=page.waitForEvent('download');await page.locator('#source-export-bib').click();const download=await downloadPromise;if(!download.suggestedFilename().endsWith('.bib'))throw new Error('Source library BibTeX export did not download a .bib file.');
const exportText=await page.evaluate(id=>window.KOINE_SOURCE_LIBRARY.exportBibTeX([id]),grammarId);if(!exportText.includes('@book{')||!exportText.includes('10.1000/grammar'))throw new Error('BibTeX export omitted structured metadata.');

await page.setViewportSize({width:320,height:844});
const overflow=await page.evaluate(()=>({doc:document.documentElement.scrollWidth-window.innerWidth,sources:document.querySelector('#sources').scrollWidth-document.querySelector('#sources').clientWidth}));if(overflow.doc>1||overflow.sources>1)throw new Error(`V1.10 introduced 320px source-library horizontal overflow: ${JSON.stringify(overflow)}`);
await page.evaluate(()=>{window.KOINE_APP_OPEN_VIEW('synthesis');window.KOINE_RESEARCH_SYNTHESIS_UI.render()});
const synOverflow=await page.evaluate(()=>({doc:document.documentElement.scrollWidth-window.innerWidth,syn:document.querySelector('#synthesis').scrollWidth-document.querySelector('#synthesis').clientWidth}));if(synOverflow.doc>1||synOverflow.syn>1)throw new Error(`V1.10 dossier bibliography introduced 320px overflow: ${JSON.stringify(synOverflow)}`);
if(errors.length)throw new Error(`Browser errors: ${errors.join(' | ')}`);
await browser.close();
console.log('V1.10 browser source creation, dedupe, BibTeX import, collections, annotations, V1.8/V1.9 handoff, bibliography resolution, backup guard, mastery firewall, export, and 320px reflow: PASS');