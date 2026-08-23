const assert=require('node:assert/strict');
const fs=require('node:fs');
const pub=require('../publication-engine.js');
const sources=require('../source-library-engine.js');

const now=new Date('2026-08-23T12:00:00Z');
const storage=new pub.MemoryStorage();
const engine=new pub.PublicationEngine({storage,clock:()=>now});
assert.equal(pub.STORAGE_KEY,'koine-path-publication-profiles-v1');
assert.equal(pub.SCHEMA_VERSION,1);
assert.deepEqual(pub.STYLE_IDS,['koine-author-date','koine-notes-bibliography','koine-biblical-studies-notes']);
assert.deepEqual(pub.PLACEMENTS,['parenthetical','footnotes','endnotes']);
assert.deepEqual(pub.BIB_TEMPLATES,['standard','keyed','annotated']);
assert.equal(engine.listProfiles().length,1);
assert.equal(engine.getProfile().placement,'footnotes');
assert.match(pub.style('koine-notes-bibliography').certification,/not CSL\/SBL\/Chicago certified/);

const source={id:'source.1',type:'grammar',title:'A Reference Grammar of Koine Greek',subtitle:'Syntax and Discourse',authors:[{family:'Example',given:'Anna'}],editors:[],year:'2026',publisher:'Example Press',place:'Cologne',containerTitle:'',volume:'',issue:'',pages:'',edition:'2nd ed.',doi:'10.1000/grammar',isbn:'',url:'',accessedAt:'',language:'English',citationKey:'example2026reference',tags:[],notes:'Private working source note.',verification:{status:'consulted',note:'',checkedAt:'2026-08-23T00:00:00.000Z'},annotations:[],createdAt:'2026-08-23T00:00:00.000Z',updatedAt:'2026-08-23T00:00:00.000Z'};
assert.match(pub.bibliographyEntry(source,'koine-author-date'),/^Example, Anna\. 2026\./);
assert.equal(pub.parentheticalCitation(source,'§12','koine-author-date'),'(Example 2026, §12)');
assert.match(pub.noteCitation(source,{locator:'§12',styleId:'koine-notes-bibliography'}),/Anna Example/);
assert.equal(pub.noteCitation(source,{locator:'§12',styleId:'koine-notes-bibliography',short:true}),'Example, A Reference Grammar of Koine Greek: Syntax…, §12.');

const dossier={id:'dossier.1',title:'John 1 Exegetical Dossier',status:'complete',sections:{question:'How should the clause be described?',context:'Immediate context.',thesis:'Grammar precedes synthesis.',argument:'1. Establish syntax.',conclusion:'The evidence constrains the reading.',theologicalSynthesis:'Theological synthesis follows linguistic work.',limitations:'One issue remains open.'},readings:[{id:'reading.1',title:'Alternative reading',summary:'Retained for comparison.'}],claims:[{id:'claim.1',text:'The clause should be described syntactically first.',layer:'argument',confidence:'medium',contestation:'contested',readingId:null},{id:'claim.2',text:'The same source is relevant again.',layer:'inference',confidence:'low',contestation:'unresolved',readingId:'reading.1'}],evidence:[{id:'evidence.1',provenance:'external',sourceKind:'research-entry',sourceId:'research.1',title:'Reference grammar',noteSnapshot:'Snapshot',refs:[],citation:{citation:'snapshot citation',locator:'§12',url:''}}],links:[{id:'link.1',claimId:'claim.1',evidenceId:'evidence.1',relation:'support',note:''},{id:'link.2',claimId:'claim.2',evidenceId:'evidence.1',relation:'context',note:''}]};
const sourceLink={source,link:{sourceId:source.id,researchEntryId:'research.1',locator:'§12',citationSnapshot:'immutable snapshot'}};
const resolver=id=>id==='research.1'?sourceLink:null;
assert.deepEqual(pub.sourceIdsForDossier(dossier,resolver),['source.1']);
const occ=pub.citationOccurrences(dossier,resolver);assert.equal(occ.length,2);assert.equal(occ[0].first,true);assert.equal(occ[1].first,false);

let profile=engine.getProfile();profile.document={title:'Publication Test',subtitle:'Styled dossier',author:'Researcher',date:'2026-08-23'};
let md=pub.renderMarkdown({dossier,sources:[source],resolveSource:resolver,profile});
assert.match(md,/\[\^1\]/);assert.match(md,/\[\^2\]/);assert.match(md,/\[\^1\]: Anna Example/);assert.match(md,/\[\^2\]: Example, A Reference Grammar/);assert.match(md,/## Bibliography/);assert.match(md,/not CSL\/SBL\/Chicago certified/);assert.ok(!md.includes('Private working source note.'),'source notes must be excluded by default');

profile={...profile,placement:'endnotes',bibliographyTemplate:'keyed',includeCitationKeys:false};md=pub.renderMarkdown({dossier,sources:[source],resolveSource:resolver,profile});assert.match(md,/## Notes/);assert.match(md,/1\. Anna Example/);assert.match(md,/@example2026reference/);
profile={...profile,placement:'parenthetical',styleId:'koine-author-date'};md=pub.renderMarkdown({dossier,sources:[source],resolveSource:resolver,profile});assert.match(md,/\(Example 2026, §12\)/);assert.ok(!md.includes('[^1]'));
profile={...profile,bibliographyTemplate:'annotated',includeSourceNotes:true};md=pub.renderMarkdown({dossier,sources:[source],resolveSource:resolver,profile});assert.match(md,/Private working source note/);

const html=pub.renderHtml({dossier,sources:[source],resolveSource:resolver,profile});assert.match(html,/<!doctype html>/);assert.match(html,/Publication Test/);const text=pub.renderText({dossier,sources:[source],resolveSource:resolver,profile});assert.match(text,/Bibliography/);

const created=engine.createProfile({name:'Endnote export',styleId:'koine-biblical-studies-notes',placement:'endnotes',bibliographyTemplate:'standard'});assert.equal(engine.listProfiles().length,2);engine.updateProfile(created.id,{document:{title:'Updated title'},includeEvidenceAppendix:false});assert.equal(engine.getProfile(created.id).document.title,'Updated title');assert.equal(engine.getProfile(created.id).includeEvidenceAppendix,false);assert.doesNotThrow(()=>pub.validateState(engine.snapshot()));assert.throws(()=>pub.validateState({...engine.snapshot(),schemaVersion:99}),/unsupported schema/i);assert.throws(()=>pub.validateState({...engine.snapshot(),profiles:Array(21).fill(engine.getProfile())}),/schema or bound/i);

const pengine=fs.readFileSync('publication-engine.js','utf8'),pui=fs.readFileSync('publication-ui.js','utf8'),htmlShell=fs.readFileSync('index.html','utf8'),port=fs.readFileSync('publication-portability.js','utf8'),dpui=fs.readFileSync('data-portability-ui.js','utf8');
for(const forbidden of ['recordEvidence','recordExposure','recordHint']){assert.ok(!pengine.includes(forbidden),`publication engine must not call ${forbidden}`);assert.ok(!pui.includes(forbidden),`publication UI must not call ${forbidden}`)}
for(const forbidden of ['authorityScore','truthScore','consensusScore','qualityScore']){assert.ok(!pengine.includes(forbidden),`publication engine must not add ${forbidden}`)}
for(const asset of ['publication.css','publication-engine.js','publication-ui.js','publication-portability.js'])assert.ok(htmlShell.includes(asset),`${asset} missing from index`);
assert.ok(htmlShell.indexOf('source-library-engine.js')<htmlShell.indexOf('publication-engine.js'));
assert.ok(htmlShell.indexOf('source-library-synthesis-bridge.js')<htmlShell.indexOf('publication-ui.js'));
assert.ok(htmlShell.indexOf('source-library-portability.js')<htmlShell.indexOf('publication-portability.js'));
assert.ok(port.includes("backup.appVersion='v1.11-feature'"));
assert.ok(dpui.includes("appVersion:'v1.11-feature'"));
console.log('V1.11 citation styles, note placement, bibliography templates, publication profiles, exports, provenance resolution, mastery firewall, and backup integration: PASS');