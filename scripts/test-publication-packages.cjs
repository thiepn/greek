const assert=require('node:assert/strict');
const fs=require('node:fs');
const pkg=require('../publication-package-output-hardening.js');

const clock=()=>new Date('2026-08-23T17:30:00Z');
const storage=new pkg.MemoryStorage();
const engine=new pkg.SubmissionProfileEngine({storage,clock});
assert.equal(pkg.STORAGE_KEY,'koine-path-submission-profiles-v1');
assert.equal(pkg.SCHEMA_VERSION,1);
assert.equal(engine.listProfiles().length,1);
let profile=engine.getProfile();
assert.equal(profile.pageSize,'A4');assert.equal(profile.outputs.docx,true);assert.equal(profile.outputs.pdf,true);
profile=engine.applyPreset(profile.id,'double-spaced-letter');assert.equal(profile.pageSize,'Letter');assert.equal(profile.lineSpacing,2);
profile=engine.updateProfile(profile.id,{wordLimit:1000,marginsMm:{left:35},outputs:{pdf:false,ris:true},headerText:'John 1 Study',footerText:'Draft for review'});assert.equal(profile.marginsMm.left,35);assert.equal(profile.outputs.pdf,false);assert.equal(profile.outputs.ris,true);
assert.doesNotThrow(()=>pkg.validateState(engine.snapshot()));
assert.throws(()=>pkg.normalizeProfile({...profile,fontSizePt:30}),/font size/i);
assert.throws(()=>pkg.normalizeProfile({...profile,marginsMm:{...profile.marginsMm,left:5}}),/margins/i);
assert.throws(()=>pkg.validateState({...engine.snapshot(),schemaVersion:99}),/unsupported schema/i);

const dossier={id:'dossier.1',title:'John 1 Dossier',status:'active',claims:[],evidence:[]};
const publicationProfile={id:'profile.1',name:'Publication',placement:'footnotes',notesHeading:'Notes',bibliographyHeading:'Bibliography',includeBibliography:true,document:{title:'John 1 Study',author:'Researcher',date:'2026-08-23'}};
const sources=[{id:'source.1',title:'Greek Grammar',authors:[{family:'Example',given:'Anna'}],editors:[],year:'2026',verification:{status:'unverified'}}];
const markdown='# John 1 Study\n\nResearcher\n\n## Claims\n\n- **argument** — The clause requires careful syntax.[^1]\n\n## Notes\n\n[^1]: Anna Example, Greek Grammar, §12.\n\n## Bibliography\n\n- Example, Anna. Greek Grammar. 2026.\n';
const check=pkg.preflight({dossier,sources,publicationProfile,submissionProfile:profile,markdown,gapReport:{unsupportedClaims:['c1'],contestedWithoutCounter:[],unresolvedWithoutMarker:[]}});
assert.equal(check.ready,true);assert.ok(check.warnings.some(x=>x.code==='dossier-incomplete'));assert.ok(check.warnings.some(x=>x.code==='evidence-gaps'));assert.ok(check.info.some(x=>x.code==='source-unverified'));assert.equal('score' in check,false);
const blocked=pkg.preflight({dossier:null,sources:[],publicationProfile:{document:{}},submissionProfile:{...profile,outputs:{...profile.outputs,docx:false,pdf:false,markdown:false}},markdown:''});assert.equal(blocked.ready,false);assert.ok(blocked.errors.length>=2);

const docx=pkg.generateDocx({markdown,submissionProfile:profile,publicationProfile,metadata:{title:'John 1 Study',author:'Researcher',createdAt:'2026-08-23T17:30:00Z'}});
assert.equal(docx[0],0x50);assert.equal(docx[1],0x4b);assert.equal(docx[2],0x03);assert.equal(docx[3],0x04);
const docxText=Buffer.from(docx).toString('utf8');
for(const required of ['[Content_Types].xml','word/document.xml','word/styles.xml','word/footnotes.xml','word/header1.xml','word/footer1.xml','word/_rels/document.xml.rels'])assert.ok(docxText.includes(required),`DOCX missing ${required}`);
assert.ok(docxText.includes('relationships/styles'));assert.ok(docxText.includes('w:headerReference'));assert.ok(docxText.includes('John 1 Study'));assert.ok(docxText.includes('Draft for review'));
assert.ok(docxText.includes('w:br w:type="page"'),'DOCX title-page preference must create a page break before body headings');
assert.ok(docxText.includes('w:ind w:left="720" w:hanging="720"'),'DOCX bibliography must use a hanging indent');
assert.ok(docxText.includes('w:footnoteReference w:id="1"'));assert.ok(docxText.includes('Greek Grammar'));
const endMarkdown=markdown.replace(/^\[\^1\]:/m,'1.').replace(/\[\^1\]/g,'[1]');
const endDocx=pkg.generateDocx({markdown:endMarkdown,submissionProfile:profile,publicationProfile:{...publicationProfile,placement:'endnotes'},metadata:{title:'Endnotes',createdAt:'2026-08-23T17:30:00Z'}});const endText=Buffer.from(endDocx).toString('utf8');assert.ok(endText.includes('word/endnotes.xml'));assert.ok(endText.includes('w:endnoteReference w:id="1"'));

const pdf=pkg.pdfFromJpegs([{data:new Uint8Array([0xff,0xd8,0xff,0xd9]),width:10,height:10},{data:new Uint8Array([0xff,0xd8,0xff,0xd9]),width:10,height:10}],pkg.PAGE_SIZES.A4);const pdfText=Buffer.from(pdf).toString('latin1');assert.ok(pdfText.startsWith('%PDF-1.4'));assert.match(pdfText,/\/Count 2/);assert.ok(pdfText.endsWith('%%EOF\n'));

const files=[{name:'study.docx',data:docx},{name:'study.md',data:markdown}];const manifest=pkg.buildManifest({dossier,publicationProfile,submissionProfile:profile,files,preflightResult:check,generatedAt:'2026-08-23T17:30:00.000Z'});assert.equal(manifest.feature,'v1.12');assert.equal(manifest.files.length,2);assert.match(manifest.files[0].fnv1a32,/^[0-9a-f]{8}$/);assert.ok(manifest.boundaries.some(x=>x.includes('mastery')));
const zip=pkg.zipStore([{name:'manifest.json',data:JSON.stringify(manifest)},{name:'study.md',data:markdown}]);const zipText=Buffer.from(zip).toString('utf8');assert.equal(zip[0],0x50);assert.ok(zipText.includes('manifest.json'));assert.ok(zipText.includes('study.md'));

(async()=>{
  const draws=[];const fakeFactory=()=>{const ctx={fillStyle:'',font:'',textAlign:'',textBaseline:'',fillRect(){},measureText(t){return{width:String(t).length*7}},fillText(t){draws.push(String(t))},save(){},restore(){}};return{width:0,height:0,getContext:()=>ctx,toDataURL:()=>`data:image/jpeg;base64,${Buffer.from([0xff,0xd8,0xff,0xd9]).toString('base64')}`}};
  const footerPdf=await pkg.generatePdf({markdown:'# Test\n\nBody text.',submissionProfile:{...profile,outputs:{...profile.outputs,pdf:true}},canvasFactory:fakeFactory});assert.ok(Buffer.from(footerPdf).toString('latin1').startsWith('%PDF-'));assert.ok(draws.includes('Draft for review'),'PDF footer text was not rendered');

  const packageProfile={...profile,outputs:{docx:true,pdf:false,markdown:true,bibtex:true,ris:false,preflight:true,manifest:true},wordLimit:0};
  const publicationApi={renderMarkdown:()=>markdown};
  const sourceApi={exportBibTeX:ids=>`@book{source1, title={Greek Grammar}}\n% ${ids.join(',')}`,exportRIS:()=>''};
  const pack=await pkg.generatePackage({dossier:{...dossier,status:'complete'},sources,publicationProfile,submissionProfile:packageProfile,publicationApi,sourceLibraryApi:sourceApi,resolveSource:()=>null,gapReport:{unsupportedClaims:[],contestedWithoutCounter:[],unresolvedWithoutMarker:[]},clock});
  assert.ok(pack.fileName.endsWith('-submission-package.zip'));assert.ok(pack.files.some(f=>f.name.endsWith('.docx')));assert.ok(pack.files.some(f=>f.name==='manifest.json'));assert.ok(pack.files.some(f=>f.name==='preflight.json'));assert.ok(Buffer.from(pack.zip).toString('utf8').includes('manifest.json'));

  const engineSource=fs.readFileSync('publication-package-engine.js','utf8'),hardening=fs.readFileSync('publication-package-output-hardening.js','utf8'),ui=fs.readFileSync('publication-package-ui.js','utf8'),html=fs.readFileSync('index.html','utf8'),guard=fs.readFileSync('publication-package-portability.js','utf8'),dpui=fs.readFileSync('data-portability-ui.js','utf8');
  for(const forbidden of ['recordEvidence','recordExposure','recordHint']){assert.ok(!engineSource.includes(forbidden),`package engine must not call ${forbidden}`);assert.ok(!hardening.includes(forbidden),`package output hardening must not call ${forbidden}`);assert.ok(!ui.includes(forbidden),`package UI must not call ${forbidden}`)}
  for(const forbidden of ['authorityScore','qualityScore','truthScore','consensusScore','readinessScore']){assert.ok(!engineSource.includes(forbidden),`package engine must not emit ${forbidden}`);assert.ok(!hardening.includes(forbidden),`package output hardening must not emit ${forbidden}`)}
  for(const asset of ['publication-package.css','publication-package-engine.js','publication-package-output-hardening.js','publication-package-ui.js','publication-package-portability.js'])assert.ok(html.includes(asset),`${asset} missing from index`);
  assert.ok(html.indexOf('publication-engine.js')<html.indexOf('publication-package-engine.js'));assert.ok(html.indexOf('publication-package-engine.js')<html.indexOf('publication-package-output-hardening.js'));assert.ok(html.indexOf('publication-package-output-hardening.js')<html.indexOf('publication-package-ui.js'));assert.ok(html.indexOf('publication-portability.js')<html.indexOf('publication-package-portability.js'));
  assert.ok(guard.includes("backup.appVersion='v1.12-feature'"));assert.ok(guard.includes('storage?.getItem?.(KEY)'));
  assert.ok(dpui.includes("appVersion:'v1.12-feature'"));
  console.log('V1.12 submission profiles, preflight severities, hardened OOXML DOCX, semantic notes, headers/footers/title page/hanging bibliography, PDF footer/container, package manifest, ZIP delivery, mastery firewall, and backup integration: PASS');
})().catch(err=>{console.error(err);process.exit(1)});