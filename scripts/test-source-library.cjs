const assert=require('node:assert/strict');
const fs=require('node:fs');
const lib=require('../source-library-engine.js');
const research=require('../corpus-research-engine.js');
const synthesis=require('../research-synthesis-engine.js');
const portability=require('../data-portability.js');

const now=new Date('2026-08-23T13:00:00Z');
const storage=new portability.MemoryStorage();
const library=new lib.SourceLibraryEngine({storage,clock:()=>now});
const notebook=new research.CorpusResearchEngine({storage,clock:()=>now});
const dossiers=new synthesis.ResearchSynthesisEngine({storage,clock:()=>now});

assert.equal(lib.STORAGE_KEY,'koine-path-source-library-v1');
assert.equal(lib.SCHEMA_VERSION,1);
assert.equal(lib.MAX_SOURCES,500);
assert.equal(lib.MAX_IMPORT_RECORDS,300);
assert.ok(lib.TYPES.includes('grammar')&&lib.TYPES.includes('lexicon')&&lib.TYPES.includes('commentary'));
assert.deepEqual(lib.VERIFICATION,['unverified','metadata-checked','consulted']);
assert.equal(lib.normalizeDoi('https://doi.org/10.1000/ABC'),'10.1000/abc');
assert.equal(lib.normalizeIsbn('978-1-2345-6789-X'),'978123456789X');

const grammar=library.addSource({type:'grammar',title:'A Reference Grammar of Koine Greek',authors:'Example, Anna',year:'2026',publisher:'Example Press',doi:'https://doi.org/10.1000/GRAMMAR',tags:'grammar, syntax'});
assert.equal(grammar.citationKey,'example2026reference');
assert.equal(grammar.doi,'10.1000/grammar');
assert.match(lib.formatCitation(grammar),/Example, Anna \(2026\)/);
assert.match(lib.formatCitation(grammar),/https:\/\/doi\.org\/10\.1000\/grammar/);
assert.throws(()=>library.addSource({type:'book',title:'Different title',authors:'Other, Author',year:'2025',doi:'10.1000/grammar'}),e=>e.code==='DUPLICATE_SOURCE');
assert.throws(()=>library.addSource({type:'grammar',title:'A Reference Grammar of Koine Greek',authors:'Example, Anna',year:'2026'}),e=>e.code==='DUPLICATE_SOURCE');

library.setVerification(grammar.id,'consulted','User reports consulting this source.');
assert.equal(library.getSource(grammar.id).verification.status,'consulted');
assert.ok(library.getSource(grammar.id).verification.checkedAt);
const annotation=library.addAnnotation(grammar.id,{locator:'§12',note:'Terminology relevant to the clause.',linkedProjectId:'workbench.1'});
assert.equal(annotation.locator,'§12');
const collection=library.createCollection('John 1 research');library.addToCollection(collection.id,grammar.id);assert.deepEqual(library.listCollections()[0].sourceIds,[grammar.id]);

const bib=`@article{doe2024aspect,
  author = {Doe, Jane and Roe, John},
  title = {Aspect and Discourse},
  journal = {Journal of Greek Studies},
  year = {2024},
  volume = {12},
  number = {2},
  pages = {10--25},
  doi = {10.2000/aspect}
}
@book{duplicate,
  author = {Example, Anna},
  title = {Duplicate metadata},
  year = {2026},
  doi = {10.1000/grammar}
}`;
const parsedBib=lib.parseBibTeX(bib);assert.equal(parsedBib.length,2);assert.equal(parsedBib[0].type,'article');assert.equal(parsedBib[0].containerTitle,'Journal of Greek Studies');
const bibReport=library.importText('bibtex',bib,{skipDuplicates:true});assert.equal(bibReport.imported.length,1);assert.equal(bibReport.skipped.length,1);assert.equal(bibReport.skipped[0].reason,'doi');
const article=bibReport.imported[0];assert.equal(article.authors.length,2);assert.equal(article.citationKey,'doe2024aspect');

const ris=`TY  - BOOK
AU  - Porter, Stanley
TI  - Idioms of the Greek New Testament
PY  - 1999
PB  - Sheffield Academic Press
SN  - 9781850753797
ER  - `;
const parsedRis=lib.parseRIS(ris);assert.equal(parsedRis.length,1);assert.equal(parsedRis[0].title,'Idioms of the Greek New Testament');
const risReport=library.importText('ris',ris);assert.equal(risReport.imported.length,1);const idioms=risReport.imported[0];assert.equal(idioms.isbn,'9781850753797');
assert.match(library.exportBibTeX([article.id]),/@article\{doe2024aspect/);assert.match(library.exportRIS([idioms.id]),/^TY  - BOOK/m);assert.match(library.bibliography([grammar.id]),/Reference Grammar/);

const projectId='workbench.1';
const external=notebook.addEntry({provenance:'external',title:grammar.title,citation:lib.formatCitation(grammar),locator:'§12',url:`https://doi.org/${grammar.doi}`,note:'Structured source handoff.',linkedProjectId:projectId});
const linked=library.linkResearch(grammar.id,external.id,{locator:'§12'});assert.equal(library.sourceForResearchEntry(external.id).source.id,grammar.id);const snapshot=linked.citationSnapshot;
library.updateSource(grammar.id,{title:'A Reference Grammar of Koine Greek — Revised Metadata'});assert.equal(library.linksForSource(grammar.id)[0].citationSnapshot,snapshot,'citation snapshot should not silently rewrite after library metadata edit');
const dossier=dossiers.createDossier({title:'John 1 dossier',linkedProjectId:projectId});const evidence=dossiers.importResearchEntry(dossier.id,external);assert.equal(evidence.provenance,'external');assert.equal(evidence.sourceId,external.id);

const state=library.snapshot();assert.doesNotThrow(()=>lib.validateState(state));const bad=JSON.parse(JSON.stringify(state));bad.sources[0].fullText='copyrighted source text';assert.throws(()=>lib.validateState(bad),/may not persist source full text/i);assert.throws(()=>lib.validateState({...state,schemaVersion:99}),/unsupported schema/i);assert.throws(()=>lib.validateState({...state,sources:Array(lib.MAX_SOURCES+1).fill(state.sources[0])}),/retention bound/i);
const stores=portability.collectStores(storage);assert.ok(stores[lib.STORAGE_KEY]);

const source=fs.readFileSync('source-library-engine.js','utf8'),ui=fs.readFileSync('source-library-ui.js','utf8'),bridge=fs.readFileSync('source-library-synthesis-bridge.js','utf8'),guard=fs.readFileSync('source-library-portability.js','utf8'),html=fs.readFileSync('index.html','utf8'),v18=fs.readFileSync('scripts/test-corpus-research-browser.mjs','utf8'),v19=fs.readFileSync('scripts/test-research-synthesis-browser.mjs','utf8');
for(const forbidden of ['recordEvidence','recordExposure','recordHint']){assert.ok(!source.includes(forbidden),`source library engine must not call ${forbidden}`);assert.ok(!ui.includes(forbidden),`source library UI must not call ${forbidden}`);assert.ok(!bridge.includes(forbidden),`source-library dossier bridge must not call ${forbidden}`)}
for(const forbidden of ['authorityScore','qualityScore','truthScore','consensusScore'])assert.ok(!source.includes(forbidden),`source library must not emit ${forbidden}`);
for(const asset of ['source-library.css','source-library-engine.js','source-library-ui.js','source-library-synthesis-bridge.js','source-library-portability.js'])assert.ok(html.includes(asset),`${asset} missing from index`);
assert.ok(html.indexOf('corpus-research-engine.js')<html.indexOf('source-library-engine.js')&&html.indexOf('source-library-engine.js')<html.indexOf('research-synthesis-engine.js'));
assert.ok(html.indexOf('research-synthesis-ui.js')<html.indexOf('source-library-ui.js')&&html.indexOf('source-library-ui.js')<html.indexOf('source-library-synthesis-bridge.js'));
assert.ok(html.indexOf('research-synthesis-portability.js')<html.indexOf('source-library-portability.js')&&html.indexOf('source-library-portability.js')<html.indexOf('data-portability-ui.js'));
assert.ok(guard.includes("backup.appVersion='v1.10-feature'"));assert.ok(guard.includes('validateSourceStores'));
assert.ok(v18.includes("'v1.10-feature'")&&v19.includes("'v1.10-feature'"),'older browser regressions must recognize the newer runtime backup version');
console.log('V1.10 structured sources, DOI/ISBN dedupe, BibTeX/RIS import, collections, annotations, provenance links, citation snapshots, dossier handoff, mastery firewall, and backup integration: PASS');