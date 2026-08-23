import {chromium} from 'playwright';
const url=process.env.KOINE_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:900},acceptDownloads:true});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto(url,{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.KOINE_FULL_READER?.manifest?.books?.length===27&&window.KOINE_PUBLICATION_PACKAGE_UI&&window.KoinePublicationPackages?.hardenDocxParts&&window.KOINE_SOURCE_LIBRARY&&window.KOINE_CORPUS_RESEARCH&&window.KOINE_RESEARCH_SYNTHESIS&&window.KOINE_PASSAGE_WORKBENCH,{timeout:18000});
const learningBefore=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));
await page.evaluate(()=>{
  const p=window.KOINE_PASSAGE_WORKBENCH.createProject({book:'John',chapter:1,startVerse:1,endVerse:4},{title:'John 1 package project'});
  const d=window.KOINE_RESEARCH_SYNTHESIS.createDossier({title:'John 1 Package Dossier',linkedProjectId:p.id});
  window.KOINE_RESEARCH_SYNTHESIS.updateDossier(d.id,{sections:{question:'How should John 1:1 be described?',context:'The prologue establishes the immediate literary context.',thesis:'Syntactic description should precede broader theological synthesis.',argument:'Establish syntax and lexical evidence, then compare interpretations.',conclusion:'The evidence constrains but does not replace interpretation.',theologicalSynthesis:'Theological synthesis follows the linguistic argument.',limitations:'One interpretive question remains open.'}});
  const claim=window.KOINE_RESEARCH_SYNTHESIS.addClaim(d.id,{text:'The clause should be described syntactically before theological synthesis.',layer:'argument',confidence:'medium',contestation:'contested'});
  const s=window.KOINE_SOURCE_LIBRARY.addSource({type:'grammar',title:'A Reference Grammar of Koine Greek',authors:'Example, Anna',year:'2026',publisher:'Example Press',place:'Cologne',doi:'10.1000/grammar',verification:{status:'metadata-checked',note:'Fixture metadata.'}});
  const e=window.KOINE_CORPUS_RESEARCH.addEntry({provenance:'external',title:s.title,citation:window.KoineSourceLibrary.formatCitation(s),locator:'§12',note:'External terminology note.',linkedProjectId:p.id});
  window.KOINE_SOURCE_LIBRARY.linkResearch(s.id,e.id,{locator:'§12',snapshot:window.KoineSourceLibrary.formatCitation(s)});
  const ev=window.KOINE_RESEARCH_SYNTHESIS.importResearchEntry(d.id,e);
  window.KOINE_RESEARCH_SYNTHESIS.linkEvidence(d.id,{claimId:claim.id,evidenceId:ev.id,relation:'support',note:'Structured grammar support.'});
});

await page.evaluate(()=>window.KOINE_PUBLICATION_UI.open());
await page.getByRole('heading',{name:'Format the dossier without rewriting the evidence.',exact:true}).waitFor();
await page.locator('#pub-doc-title').fill('Published John 1 Study');
await page.locator('#pub-doc-author').fill('Researcher');
await page.locator('#pub-doc-date').fill('2026-08-23');
await page.locator('#pub-style').selectOption('koine-notes-bibliography');
await page.locator('#pub-placement').selectOption('footnotes');
await page.locator('#pub-save-profile').click();
await page.getByRole('heading',{name:'Format the dossier without rewriting the evidence.',exact:true}).waitFor();

await page.evaluate(()=>window.KOINE_PUBLICATION_PACKAGE_UI.open());
await page.getByRole('heading',{name:'Turn the dossier into submission artifacts.',exact:true}).waitFor();
await page.locator('#pkg-preset').selectOption('academic-a4');
await page.getByRole('heading',{name:'Turn the dossier into submission artifacts.',exact:true}).waitFor();
await page.locator('#pkg-name').fill('Seminary submission');
await page.locator('#pkg-header').fill('John 1 · Seminary submission');
await page.locator('#pkg-footer').fill('Research draft');
await page.locator('#pkg-word-limit').fill('20');
await page.locator('#pkg-out-ris').check();
await page.locator('#pkg-save').click();
await page.getByRole('heading',{name:'Turn the dossier into submission artifacts.',exact:true}).waitFor();
const store=await page.evaluate(()=>window.KOINE_SUBMISSION_PACKAGES.snapshot());if(store.schemaVersion!==1||store.profiles.length!==1||store.profiles[0].name!=='Seminary submission'||store.profiles[0].headerText!=='John 1 · Seminary submission'||store.profiles[0].footerText!=='Research draft')throw new Error('Submission profile did not persist expected V1.12 state.');
const preflightText=await page.locator('#package-preflight').innerText();if(!preflightText.includes('Warnings')||!preflightText.includes('word limit'))throw new Error('V1.12 preflight did not surface a non-blocking word-limit warning.');if(/readiness score/i.test(preflightText))throw new Error('V1.12 preflight exposed a readiness-score concept.');

const beforeOps=await page.evaluate(()=>({learning:localStorage.getItem('koine-path-learning-v3'),sources:localStorage.getItem('koine-path-source-library-v1'),dossier:JSON.stringify(window.KOINE_RESEARCH_SYNTHESIS.getDossier())}));
async function downloaded(selector){const waiting=page.waitForEvent('download',{timeout:30000});await page.locator(selector).click();const dl=await waiting,stream=await dl.createReadStream(),chunks=[];for await(const c of stream)chunks.push(c);return{name:dl.suggestedFilename(),bytes:Buffer.concat(chunks)}}
const docx=await downloaded('#pkg-docx');if(!docx.name.endsWith('.docx')||docx.bytes[0]!==0x50||docx.bytes[1]!==0x4b)throw new Error('DOCX download is not an OOXML ZIP package.');const docxText=docx.bytes.toString('utf8');for(const required of ['[Content_Types].xml','word/document.xml','word/styles.xml','word/footnotes.xml','word/header1.xml','word/footer1.xml'])if(!docxText.includes(required))throw new Error(`DOCX download omitted ${required}.`);if(!docxText.includes('relationships/styles')||!docxText.includes('w:headerReference')||!docxText.includes('John 1 · Seminary submission')||!docxText.includes('Research draft'))throw new Error('DOCX did not wire styles/header/footer metadata.');if(!docxText.includes('w:br w:type="page"'))throw new Error('DOCX title-page preference did not produce a page break.');if(!docxText.includes('w:ind w:left="720" w:hanging="720"'))throw new Error('DOCX bibliography did not use a hanging indent.');if(!docxText.includes('w:footnoteReference w:id="1"'))throw new Error('DOCX did not preserve semantic V1.11 footnote references.');
const pdf=await downloaded('#pkg-pdf');if(!pdf.name.endsWith('.pdf')||!pdf.bytes.toString('latin1',0,8).startsWith('%PDF-'))throw new Error('PDF download does not have a valid PDF signature.');const pdfText=pdf.bytes.toString('latin1');if(!/\/Type \/Pages/.test(pdfText)||!/\/Count \d+/.test(pdfText)||!pdfText.includes('%%EOF'))throw new Error('PDF download omitted page-tree or EOF structure.');
const bundle=await downloaded('#pkg-zip');if(!bundle.name.endsWith('-submission-package.zip')||bundle.bytes[0]!==0x50||bundle.bytes[1]!==0x4b)throw new Error('Submission package is not a ZIP download.');
function storedEntries(buf){const map=new Map();let o=0;while(o+30<=buf.length&&buf.readUInt32LE(o)===0x04034b50){const size=buf.readUInt32LE(o+18),nameLen=buf.readUInt16LE(o+26),extraLen=buf.readUInt16LE(o+28),name=buf.subarray(o+30,o+30+nameLen).toString('utf8'),start=o+30+nameLen+extraLen;map.set(name,buf.subarray(start,start+size));o=start+size}return map}
const entries=storedEntries(bundle.bytes),names=[...entries.keys()];for(const suffix of ['.docx','.pdf','.md','.bib','.ris'])if(!names.some(n=>n.endsWith(suffix)))throw new Error(`Submission package omitted selected ${suffix} deliverable.`);for(const exact of ['manifest.json','preflight.json'])if(!entries.has(exact))throw new Error(`Submission package omitted ${exact}.`);const manifest=JSON.parse(entries.get('manifest.json').toString('utf8'));if(manifest.feature!=='v1.12'||manifest.files.length<6||!manifest.files.every(f=>/^[0-9a-f]{8}$/.test(f.fnv1a32)))throw new Error('V1.12 manifest is incomplete or missing file checksums.');if(!manifest.boundaries.some(x=>x.includes('mastery'))||!manifest.boundaries.some(x=>x.includes('PDF output uses browser-canvas')))throw new Error('V1.12 manifest omitted artifact boundaries.');const preflight=JSON.parse(entries.get('preflight.json').toString('utf8'));if(preflight.errors.length!==0||preflight.warnings.length<1||'score'in preflight)throw new Error('Packaged preflight did not preserve severity-separated no-score output.');
const bundledDocx=entries.get(names.find(n=>n.endsWith('.docx'))).toString('utf8');if(!bundledDocx.includes('word/header1.xml')||!bundledDocx.includes('relationships/styles'))throw new Error('Packaged DOCX did not use hardened OOXML output.');

const afterOps=await page.evaluate(()=>({learning:localStorage.getItem('koine-path-learning-v3'),sources:localStorage.getItem('koine-path-source-library-v1'),dossier:JSON.stringify(window.KOINE_RESEARCH_SYNTHESIS.getDossier())}));if(afterOps.learning!==beforeOps.learning)throw new Error('Publication package generation mutated canonical learning state.');if(afterOps.sources!==beforeOps.sources)throw new Error('Publication package generation mutated V1.10 source-library state.');if(afterOps.dossier!==beforeOps.dossier)throw new Error('Publication package generation mutated V1.9 dossier state.');

const malformedRejected=await page.evaluate(()=>{try{window.KoineDataPortability.validateStores({'koine-path-submission-profiles-v1':JSON.stringify({schemaVersion:99,profiles:[],activeProfileId:null})});return false}catch{return true}});if(!malformedRejected)throw new Error('V1.12 portability guard accepted malformed submission-profile state.');
const backup=await page.evaluate(()=>JSON.parse(window.KoineDataPortability.serializeBackup(localStorage,{appVersion:'old'})));if(backup.appVersion!=='v1.12-feature'||!backup.stores['koine-path-submission-profiles-v1'])throw new Error('V1.12 backup export did not include submission profile state/version.');

await page.setViewportSize({width:320,height:844});
const overflow=await page.evaluate(()=>({doc:document.documentElement.scrollWidth-window.innerWidth,pkg:document.querySelector('#packages').scrollWidth-document.querySelector('#packages').clientWidth}));if(overflow.doc>1||overflow.pkg>1)throw new Error(`V1.12 introduced 320px package-workspace horizontal overflow: ${JSON.stringify(overflow)}`);
if(errors.length)throw new Error(`Browser errors: ${errors.join(' | ')}`);
await browser.close();
console.log('V1.12 browser submission profiles, preflight, hardened real DOCX/PDF downloads, package ZIP/manifest, backup guard, dossier/source/mastery firewalls, and 320px reflow: PASS');