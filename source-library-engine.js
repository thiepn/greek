(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.KoineSourceLibrary=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

const STORAGE_KEY='koine-path-source-library-v1';
const SCHEMA_VERSION=1;
const MAX_SOURCES=500,MAX_COLLECTIONS=40,MAX_TAGS=24,MAX_NOTE=12000,MAX_ANNOTATIONS=80,MAX_LINKS=1000,MAX_IMPORT_RECORDS=300;
const TYPES=['book','article','chapter','thesis','website','grammar','lexicon','commentary','dissertation','conference','other'];
const VERIFICATION=['unverified','metadata-checked','consulted'];
const clone=v=>JSON.parse(JSON.stringify(v));
const iso=d=>new Date(d).toISOString();
const safe=s=>{try{return JSON.parse(s)}catch{return null}};
const clean=(s,n=MAX_NOTE)=>String(s??'').trim().slice(0,n);
const fold=s=>clean(s,2000).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

class MemoryStorage{
  constructor(seed={}){this.m=new Map(Object.entries(seed))}
  getItem(k){return this.m.has(k)?this.m.get(k):null}
  setItem(k,v){this.m.set(k,String(v))}
}

function normalizeDoi(v){return clean(v,500).toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//,'').replace(/^doi:\s*/,'').trim()}
function normalizeIsbn(v){return clean(v,100).replace(/[^0-9Xx]/g,'').toUpperCase()}
function validUrl(v){if(!v)return true;try{const u=new URL(v);return u.protocol==='http:'||u.protocol==='https:'}catch{return false}}
function person(input){
  if(!input)return null;
  if(typeof input==='object'){
    const literal=clean(input.literal,240),family=clean(input.family,120),given=clean(input.given,160);
    if(literal)return{literal};
    return family||given?{family,given}:null;
  }
  const s=clean(input,240);if(!s)return null;
  if(s.includes(',')){const [family,...rest]=s.split(',');return{family:clean(family,120),given:clean(rest.join(','),160)}}
  const parts=s.split(/\s+/);if(parts.length===1)return{literal:s};
  const family=parts.pop();return{family,given:parts.join(' ')};
}
function people(input){
  const arr=Array.isArray(input)?input:String(input||'').split(/\s+and\s+|\s*;\s*/i);
  return arr.map(person).filter(Boolean).slice(0,24);
}
function personLabel(p){return p?.literal||[p?.family,p?.given].filter(Boolean).join(', ')}
function authorShort(s){const p=s.authors?.[0]||s.editors?.[0];return p?.family||p?.literal||'anon'}
function normalizeSource(input={}){
  const type=TYPES.includes(input.type)?input.type:'other';
  const tags=[...new Set((Array.isArray(input.tags)?input.tags:String(input.tags||'').split(',')).map(x=>clean(x,80)).filter(Boolean))].slice(0,MAX_TAGS);
  const url=clean(input.url,1600);if(url&&!validUrl(url))throw new Error('Source URL must use http or https.');
  const title=clean(input.title,600);if(!title)throw new Error('A scholarly source needs a title.');
  return{
    type,title,subtitle:clean(input.subtitle,500),authors:people(input.authors),editors:people(input.editors),year:clean(input.year,20),
    publisher:clean(input.publisher,400),place:clean(input.place,240),containerTitle:clean(input.containerTitle,600),volume:clean(input.volume,80),issue:clean(input.issue,80),pages:clean(input.pages,120),edition:clean(input.edition,120),
    doi:normalizeDoi(input.doi),isbn:normalizeIsbn(input.isbn),url,accessedAt:clean(input.accessedAt,40),language:clean(input.language,80),citationKey:clean(input.citationKey,160),tags,notes:clean(input.notes),
    verification:{status:VERIFICATION.includes(input.verification?.status)?input.verification.status:'unverified',note:clean(input.verification?.note,2000),checkedAt:input.verification?.checkedAt?clean(input.verification.checkedAt,40):null},
    annotations:(Array.isArray(input.annotations)?input.annotations:[]).slice(0,MAX_ANNOTATIONS).map(a=>({id:clean(a.id,180),locator:clean(a.locator,500),note:clean(a.note),linkedProjectId:a.linkedProjectId?clean(a.linkedProjectId,180):null,createdAt:clean(a.createdAt,40),updatedAt:clean(a.updatedAt,40)}))
  };
}
function fingerprint(source){
  const doi=normalizeDoi(source.doi),isbn=normalizeIsbn(source.isbn);
  if(doi)return`doi:${doi}`;if(isbn)return`isbn:${isbn}`;
  return`bib:${fold(source.title)}|${fold(authorShort(source))}|${fold(source.year)}`;
}
function duplicateCandidates(sources,input){
  const src=normalizeSource(input),fp=fingerprint(src);
  return sources.filter(s=>fingerprint(s)===fp).map(s=>({id:s.id,reason:fp.startsWith('doi:')?'doi':fp.startsWith('isbn:')?'isbn':'bibliographic-key',citationKey:s.citationKey,title:s.title}));
}
function keyStem(source){
  const a=fold(authorShort(source)).split(' ')[0]||'anon',y=String(source.year||'nd').replace(/[^0-9a-z]/gi,'')||'nd',word=fold(source.title).split(' ').find(x=>x.length>3)||'source';
  return`${a}${y}${word}`.replace(/[^a-z0-9]/gi,'').slice(0,70)||'source';
}
function citationKey(source,existing=[]){
  const stem=keyStem(source),used=new Set(existing.map(x=>String(x).toLowerCase()));
  if(!used.has(stem.toLowerCase()))return stem;
  for(let i=2;i<1000;i++){const k=`${stem}${i}`;if(!used.has(k.toLowerCase()))return k}
  return`${stem}${Date.now()}`;
}
function contributorText(arr=[]){if(!arr.length)return'';const names=arr.map(personLabel);return names.length<=3?names.join('; '):`${names.slice(0,3).join('; ')}; et al.`}
function formatCitation(s){
  const authors=contributorText(s.authors)||contributorText(s.editors)||'Anonymous';
  const year=s.year||'n.d.',title=s.title+(s.subtitle?`: ${s.subtitle}`:'');
  let out=`${authors} (${year}). ${title}.`;
  if(s.containerTitle)out+=` ${s.containerTitle}${s.volume?` ${s.volume}`:''}${s.issue?`(${s.issue})`:''}${s.pages?`, ${s.pages}`:''}.`;
  if(['book','grammar','lexicon','commentary'].includes(s.type)){const pub=[s.edition,s.place,s.publisher].filter(Boolean).join(', ');if(pub)out+=` ${pub}.`}
  else if(s.publisher)out+=` ${s.publisher}.`;
  if(s.doi)out+=` https://doi.org/${s.doi}`;else if(s.url)out+=` ${s.url}`;
  return out.replace(/\s+/g,' ').trim();
}
function escBib(v){return String(v||'').replace(/[{}]/g,'').trim()}
function bibType(t){return({article:'article',chapter:'incollection',thesis:'thesis',dissertation:'phdthesis',conference:'inproceedings',website:'online'}[t]||'book')}
function toBibTeX(s){
  const fields=[],add=(k,v)=>{if(v)fields.push(`  ${k} = {${escBib(v)}}`)};
  add('author',s.authors.map(p=>p.literal||[p.family,p.given].filter(Boolean).join(', ')).join(' and '));
  add('editor',s.editors.map(p=>p.literal||[p.family,p.given].filter(Boolean).join(', ')).join(' and '));
  add('title',s.title+(s.subtitle?`: ${s.subtitle}`:''));add('year',s.year);add('publisher',s.publisher);add('address',s.place);
  add('journal',s.type==='article'?s.containerTitle:'');add('booktitle',['chapter','conference'].includes(s.type)?s.containerTitle:'');
  add('volume',s.volume);add('number',s.issue);add('pages',s.pages);add('edition',s.edition);add('doi',s.doi);add('isbn',s.isbn);add('url',s.url);add('language',s.language);
  return`@${bibType(s.type)}{${s.citationKey},\n${fields.join(',\n')}\n}`;
}
function risType(t){return({book:'BOOK',article:'JOUR',chapter:'CHAP',thesis:'THES',dissertation:'THES',website:'ELEC',grammar:'BOOK',lexicon:'BOOK',commentary:'BOOK',conference:'CPAPER'}[t]||'GEN')}
function toRIS(s){
  const out=[`TY  - ${risType(s.type)}`];
  for(const p of s.authors)out.push(`AU  - ${p.literal||[p.family,p.given].filter(Boolean).join(', ')}`);
  for(const p of s.editors)out.push(`ED  - ${p.literal||[p.family,p.given].filter(Boolean).join(', ')}`);
  out.push(`TI  - ${s.title}${s.subtitle?`: ${s.subtitle}`:''}`);
  if(s.year)out.push(`PY  - ${s.year}`);if(s.containerTitle)out.push(`T2  - ${s.containerTitle}`);if(s.publisher)out.push(`PB  - ${s.publisher}`);if(s.place)out.push(`CY  - ${s.place}`);if(s.volume)out.push(`VL  - ${s.volume}`);if(s.issue)out.push(`IS  - ${s.issue}`);if(s.pages)out.push(`SP  - ${s.pages}`);if(s.doi)out.push(`DO  - ${s.doi}`);if(s.isbn)out.push(`SN  - ${s.isbn}`);if(s.url)out.push(`UR  - ${s.url}`);out.push('ER  - ');
  return out.join('\n');
}
function parseBibFields(body){
  const out={};let key='',val='',mode='key',depth=0,quote=false;
  const commit=()=>{const k=key.trim().toLowerCase(),v=val.trim().replace(/^["{]+|["}]+$/g,'').trim();if(k)out[k]=v;key='';val='';mode='key'};
  for(let i=0;i<body.length;i++){
    const c=body[i];if(c==='"'&&body[i-1]!=='\\')quote=!quote;
    if(!quote){if(c==='{')depth++;else if(c==='}')depth=Math.max(0,depth-1);if(c==='='&&mode==='key'){mode='value';continue}if(c===','&&depth===0&&mode==='value'){commit();continue}}
    if(mode==='key')key+=c;else val+=c;
  }
  commit();return out;
}
function parseBibTeX(text){
  text=String(text||'');const records=[];let i=0;
  while(i<text.length&&records.length<MAX_IMPORT_RECORDS){
    const at=text.indexOf('@',i);if(at<0)break;const m=text.slice(at).match(/^@([A-Za-z]+)\s*[{(]/);if(!m){i=at+1;continue}
    const type=m[1].toLowerCase(),open=at+m[0].length-1,openChar=text[open],closeChar=openChar==='{'?'}':')';let depth=1,quote=false,j=open+1;
    for(;j<text.length&&depth;j++){const c=text[j];if(c==='"'&&text[j-1]!=='\\')quote=!quote;if(!quote){if(c===openChar)depth++;else if(c===closeChar)depth--}}
    if(depth)break;const inside=text.slice(open+1,j-1),comma=inside.indexOf(',');if(comma<0){i=j;continue}
    const key=inside.slice(0,comma).trim(),f=parseBibFields(inside.slice(comma+1));
    const map={article:'article',incollection:'chapter',inproceedings:'conference',phdthesis:'dissertation',mastersthesis:'thesis',thesis:'thesis',online:'website',misc:'other'};
    records.push({type:map[type]||'book',citationKey:key,title:f.title||'',authors:f.author||'',editors:f.editor||'',year:f.year||'',publisher:f.publisher||'',place:f.address||'',containerTitle:f.journal||f.booktitle||'',volume:f.volume||'',issue:f.number||'',pages:f.pages||'',edition:f.edition||'',doi:f.doi||'',isbn:f.isbn||'',url:f.url||'',language:f.language||''});
    i=j;
  }
  return records;
}
function parseRIS(text){
  const records=[];let cur=null;
  for(const raw of String(text||'').split(/\r?\n/)){
    const m=raw.match(/^([A-Z0-9]{2})\s*-\s*(.*)$/);if(!m)continue;const[,tag,v]=m;
    if(tag==='TY'){if(cur)records.push(cur);cur={authors:[],editors:[],type:({BOOK:'book',JOUR:'article',CHAP:'chapter',THES:'thesis',ELEC:'website',CPAPER:'conference'}[v]||'other')};}
    else if(tag==='ER'){if(cur)records.push(cur);cur=null;}
    else if(cur){if(tag==='AU')cur.authors.push(v);else if(tag==='ED')cur.editors.push(v);else if(tag==='TI'||tag==='T1')cur.title=v;else if(tag==='PY'||tag==='Y1')cur.year=v.slice(0,4);else if(tag==='T2'||tag==='JO'||tag==='JF')cur.containerTitle=v;else if(tag==='PB')cur.publisher=v;else if(tag==='CY')cur.place=v;else if(tag==='VL')cur.volume=v;else if(tag==='IS')cur.issue=v;else if(tag==='SP')cur.pages=v;else if(tag==='DO')cur.doi=v;else if(tag==='SN')cur.isbn=v;else if(tag==='UR')cur.url=v;}
    if(records.length>=MAX_IMPORT_RECORDS)break;
  }
  if(cur&&records.length<MAX_IMPORT_RECORDS)records.push(cur);return records;
}
function initial(now){return{schemaVersion:SCHEMA_VERSION,sources:[],collections:[],links:[],createdAt:iso(now),updatedAt:iso(now)}}
function validateSource(s){
  if(!s||typeof s.id!=='string'||!TYPES.includes(s.type)||typeof s.title!=='string'||!s.title||!Array.isArray(s.authors)||!Array.isArray(s.editors)||!Array.isArray(s.tags)||s.tags.length>MAX_TAGS||typeof s.notes!=='string'||s.notes.length>MAX_NOTE||!Array.isArray(s.annotations)||s.annotations.length>MAX_ANNOTATIONS)throw new Error('Source-library record is malformed.');
  if(!validUrl(s.url)||!VERIFICATION.includes(s.verification?.status))throw new Error('Source-library metadata is malformed.');
  if('fullText'in s||'pdf'in s||'content'in s||'body'in s)throw new Error('Source library may not persist source full text.');
  return true;
}
function validateState(s){
  if(s?.schemaVersion!==SCHEMA_VERSION||!Array.isArray(s.sources)||!Array.isArray(s.collections)||!Array.isArray(s.links))throw new Error('Source-library state has an unsupported schema.');
  if(s.sources.length>MAX_SOURCES||s.collections.length>MAX_COLLECTIONS||s.links.length>MAX_LINKS)throw new Error('Source-library retention bound exceeded.');
  const ids=new Set();for(const x of s.sources){validateSource(x);if(ids.has(x.id))throw new Error('Duplicate source-library id.');ids.add(x.id)}
  for(const c of s.collections){if(!c||typeof c.id!=='string'||typeof c.name!=='string'||!Array.isArray(c.sourceIds)||c.sourceIds.some(id=>!ids.has(id)))throw new Error('Source-library collection is malformed.')}
  for(const l of s.links){if(!l||typeof l.id!=='string'||!ids.has(l.sourceId)||typeof l.researchEntryId!=='string')throw new Error('Source-library research link is malformed.')}
  return true;
}

class SourceLibraryEngine{
  constructor({storage=null,clock=()=>new Date()}={}){
    this.storage=storage||((typeof localStorage!=='undefined')?localStorage:new MemoryStorage());this.clock=clock;
    const saved=safe(this.storage.getItem(STORAGE_KEY));if(saved){try{validateState(saved);this.state=saved}catch{this.state=initial(clock())}}else this.state=initial(clock());this.persist();
  }
  persist(){this.state.updatedAt=iso(this.clock());this.storage.setItem(STORAGE_KEY,JSON.stringify(this.state))}
  snapshot(){return clone(this.state)}
  listSources(){return clone(this.state.sources)}
  getSource(id){return clone(this.requireSource(id))}
  requireSource(id){const s=this.state.sources.find(x=>x.id===id);if(!s)throw new Error('Unknown scholarly source.');return s}
  addSource(input,{allowDuplicate=false}={}){
    if(this.state.sources.length>=MAX_SOURCES)throw new Error(`Scholarly sources are limited to ${MAX_SOURCES}.`);
    const n=normalizeSource(input),dupes=duplicateCandidates(this.state.sources,n);if(dupes.length&&!allowDuplicate){const e=new Error(`Possible duplicate source: ${dupes[0].title}`);e.code='DUPLICATE_SOURCE';e.duplicates=dupes;throw e}
    const now=iso(this.clock()),s={id:`source.${Date.now()}.${Math.random().toString(36).slice(2,7)}`,...n,citationKey:n.citationKey||citationKey(n,this.state.sources.map(x=>x.citationKey)),createdAt:now,updatedAt:now};
    validateSource(s);this.state.sources.unshift(s);this.persist();return clone(s);
  }
  updateSource(id,patch={}){
    const old=this.requireSource(id),n=normalizeSource({...old,...patch,verification:patch.verification||old.verification,annotations:old.annotations});Object.assign(old,n);
    if(patch.citationKey!==undefined)old.citationKey=clean(patch.citationKey,160)||citationKey(old,this.state.sources.filter(x=>x.id!==id).map(x=>x.citationKey));
    old.updatedAt=iso(this.clock());this.persist();return clone(old);
  }
  deleteSource(id){this.state.sources=this.state.sources.filter(x=>x.id!==id);this.state.collections.forEach(c=>c.sourceIds=c.sourceIds.filter(x=>x!==id));this.state.links=this.state.links.filter(x=>x.sourceId!==id);this.persist()}
  findDuplicates(input){return duplicateCandidates(this.state.sources,input)}
  setVerification(id,status,note=''){if(!VERIFICATION.includes(status))throw new Error('Unknown source verification state.');const s=this.requireSource(id);s.verification={status,note:clean(note,2000),checkedAt:status==='unverified'?null:iso(this.clock())};s.updatedAt=iso(this.clock());this.persist();return clone(s)}
  addAnnotation(id,{locator='',note='',linkedProjectId=null}={}){const s=this.requireSource(id);if(s.annotations.length>=MAX_ANNOTATIONS)throw new Error(`Source annotations are limited to ${MAX_ANNOTATIONS}.`);if(!clean(note))throw new Error('Source annotation needs a note.');const now=iso(this.clock()),a={id:`annotation.${Date.now()}.${Math.random().toString(36).slice(2,7)}`,locator:clean(locator,500),note:clean(note),linkedProjectId:linkedProjectId?clean(linkedProjectId,180):null,createdAt:now,updatedAt:now};s.annotations.unshift(a);s.updatedAt=now;this.persist();return clone(a)}
  createCollection(name){if(this.state.collections.length>=MAX_COLLECTIONS)throw new Error(`Collections are limited to ${MAX_COLLECTIONS}.`);name=clean(name,180);if(!name)throw new Error('Collection needs a name.');const c={id:`collection.${Date.now()}.${Math.random().toString(36).slice(2,7)}`,name,sourceIds:[],createdAt:iso(this.clock()),updatedAt:iso(this.clock())};this.state.collections.unshift(c);this.persist();return clone(c)}
  listCollections(){return clone(this.state.collections)}
  addToCollection(collectionId,sourceId){const c=this.state.collections.find(x=>x.id===collectionId);this.requireSource(sourceId);if(!c)throw new Error('Unknown source collection.');if(!c.sourceIds.includes(sourceId))c.sourceIds.push(sourceId);c.updatedAt=iso(this.clock());this.persist();return clone(c)}
  removeFromCollection(collectionId,sourceId){const c=this.state.collections.find(x=>x.id===collectionId);if(!c)throw new Error('Unknown source collection.');c.sourceIds=c.sourceIds.filter(x=>x!==sourceId);c.updatedAt=iso(this.clock());this.persist();return clone(c)}
  deleteCollection(id){this.state.collections=this.state.collections.filter(x=>x.id!==id);this.persist()}
  linkResearch(sourceId,researchEntryId,{locator='',snapshot=null}={}){const s=this.requireSource(sourceId),existing=this.state.links.find(x=>x.sourceId===sourceId&&x.researchEntryId===researchEntryId);if(existing)return clone(existing);if(this.state.links.length>=MAX_LINKS)throw new Error(`Research links are limited to ${MAX_LINKS}.`);const l={id:`source-link.${Date.now()}.${Math.random().toString(36).slice(2,7)}`,sourceId:s.id,researchEntryId:clean(researchEntryId,180),locator:clean(locator,500),citationSnapshot:clean(snapshot||formatCitation(s),2000),createdAt:iso(this.clock())};this.state.links.unshift(l);this.persist();return clone(l)}
  sourceForResearchEntry(researchEntryId){const l=this.state.links.find(x=>x.researchEntryId===researchEntryId);return l?{link:clone(l),source:this.getSource(l.sourceId)}:null}
  linksForSource(sourceId){return clone(this.state.links.filter(x=>x.sourceId===sourceId))}
  importText(format,text,{skipDuplicates=true}={}){const raw=format==='ris'?parseRIS(text):parseBibTeX(text);if(!raw.length)throw new Error(`No ${format==='ris'?'RIS':'BibTeX'} records found.`);const report={format,records:raw.length,imported:[],skipped:[],warnings:[]};for(const r of raw.slice(0,MAX_IMPORT_RECORDS)){try{const dup=this.findDuplicates(r);if(dup.length&&skipDuplicates){report.skipped.push({title:r.title||'Untitled',reason:dup[0].reason,existingId:dup[0].id});continue}report.imported.push(this.addSource(r,{allowDuplicate:!skipDuplicates}))}catch(e){report.warnings.push({title:r.title||'Untitled',message:e.message})}}return report}
  bibliography(sourceIds=null){const ids=sourceIds?new Set(sourceIds):null;return this.state.sources.filter(s=>!ids||ids.has(s.id)).slice().sort((a,b)=>(authorShort(a)+a.year+a.title).localeCompare(authorShort(b)+b.year+b.title)).map(formatCitation).join('\n')}
  exportBibTeX(sourceIds=null){const ids=sourceIds?new Set(sourceIds):null;return this.state.sources.filter(s=>!ids||ids.has(s.id)).map(toBibTeX).join('\n\n')+'\n'}
  exportRIS(sourceIds=null){const ids=sourceIds?new Set(sourceIds):null;return this.state.sources.filter(s=>!ids||ids.has(s.id)).map(toRIS).join('\n\n')+'\n'}
}

return{STORAGE_KEY,SCHEMA_VERSION,MAX_SOURCES,MAX_COLLECTIONS,MAX_TAGS,MAX_NOTE,MAX_ANNOTATIONS,MAX_LINKS,MAX_IMPORT_RECORDS,TYPES,VERIFICATION,MemoryStorage,normalizeDoi,normalizeIsbn,normalizeSource,fingerprint,duplicateCandidates,citationKey,formatCitation,toBibTeX,toRIS,parseBibTeX,parseRIS,validateSource,validateState,SourceLibraryEngine};
});