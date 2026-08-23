(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.KoinePublicationPackages=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

const STORAGE_KEY='koine-path-submission-profiles-v1';
const SCHEMA_VERSION=1;
const MAX_PROFILES=20;
const MAX_TEXT=12000;
const PAGE_SIZES={
  A4:{id:'A4',label:'A4',widthMm:210,heightMm:297,widthPt:595.28,heightPt:841.89,twipsW:11907,twipsH:16840},
  Letter:{id:'Letter',label:'US Letter',widthMm:215.9,heightMm:279.4,widthPt:612,heightPt:792,twipsW:12240,twipsH:15840}
};
const FONT_PRESETS={
  'academic-serif':{id:'academic-serif',label:'Academic serif',docx:'Times New Roman',css:'Georgia, "Times New Roman", serif'},
  'book-serif':{id:'book-serif',label:'Book serif',docx:'Georgia',css:'Georgia, serif'},
  'clean-sans':{id:'clean-sans',label:'Clean sans',docx:'Arial',css:'Arial, sans-serif'}
};
const PRESETS={
  'academic-a4':{name:'Academic paper · A4',pageSize:'A4',fontPreset:'academic-serif',fontSizePt:12,lineSpacing:1.5,paragraphSpacingPt:6,marginsMm:{top:25,right:25,bottom:25,left:30},pageNumbers:true,titlePage:true},
  'double-spaced-letter':{name:'Double-spaced paper · Letter',pageSize:'Letter',fontPreset:'academic-serif',fontSizePt:12,lineSpacing:2,paragraphSpacingPt:0,marginsMm:{top:25.4,right:25.4,bottom:25.4,left:25.4},pageNumbers:true,titlePage:true},
  'journal-manuscript':{name:'Journal manuscript',pageSize:'A4',fontPreset:'academic-serif',fontSizePt:11,lineSpacing:1.5,paragraphSpacingPt:4,marginsMm:{top:25,right:25,bottom:25,left:25},pageNumbers:true,titlePage:false}
};
const clone=v=>JSON.parse(JSON.stringify(v));
const clean=(v,n=MAX_TEXT)=>String(v??'').trim().slice(0,n);
const iso=d=>new Date(d).toISOString();
const safe=s=>{try{return JSON.parse(s)}catch{return null}};
const enc=new TextEncoder();

class MemoryStorage{
  constructor(seed={}){this.m=new Map(Object.entries(seed))}
  getItem(k){return this.m.has(k)?this.m.get(k):null}
  setItem(k,v){this.m.set(k,String(v))}
}
function defaultProfile(now=new Date()){
  const t=iso(now),base=PRESETS['academic-a4'];
  return{
    id:`submission.${Date.now()}.default`,name:base.name,presetId:'academic-a4',pageSize:base.pageSize,fontPreset:base.fontPreset,fontSizePt:base.fontSizePt,lineSpacing:base.lineSpacing,paragraphSpacingPt:base.paragraphSpacingPt,
    marginsMm:clone(base.marginsMm),pageNumbers:base.pageNumbers,pageNumberStart:1,titlePage:base.titlePage,headerText:'',footerText:'',
    institution:'',course:'',journal:'',manuscriptType:'paper',wordLimit:0,
    outputs:{docx:true,pdf:true,markdown:true,bibtex:true,ris:false,preflight:true,manifest:true},createdAt:t,updatedAt:t
  };
}
function normalizeProfile(input={},now=new Date()){
  const base=defaultProfile(now),p={...base,...clone(input),marginsMm:{...base.marginsMm,...clone(input.marginsMm||{})},outputs:{...base.outputs,...clone(input.outputs||{})}};
  if(!PAGE_SIZES[p.pageSize])throw new Error('Unsupported submission page size.');
  if(!FONT_PRESETS[p.fontPreset])throw new Error('Unsupported submission font preset.');
  p.name=clean(p.name,180)||'Submission profile';
  p.presetId=PRESETS[p.presetId]?p.presetId:'custom';
  p.fontSizePt=Number(p.fontSizePt);if(!Number.isFinite(p.fontSizePt)||p.fontSizePt<9||p.fontSizePt>16)throw new Error('Submission font size must be between 9 and 16 pt.');
  p.lineSpacing=Number(p.lineSpacing);if(![1,1.15,1.5,2].includes(p.lineSpacing))throw new Error('Submission line spacing must be 1, 1.15, 1.5, or 2.');
  p.paragraphSpacingPt=Number(p.paragraphSpacingPt);if(!Number.isFinite(p.paragraphSpacingPt)||p.paragraphSpacingPt<0||p.paragraphSpacingPt>24)throw new Error('Paragraph spacing must be between 0 and 24 pt.');
  for(const k of ['top','right','bottom','left']){p.marginsMm[k]=Number(p.marginsMm[k]);if(!Number.isFinite(p.marginsMm[k])||p.marginsMm[k]<10||p.marginsMm[k]>50)throw new Error('Submission margins must be between 10 and 50 mm.');}
  p.pageNumberStart=Math.max(1,Math.min(9999,Math.trunc(Number(p.pageNumberStart)||1)));
  p.wordLimit=Math.max(0,Math.min(1000000,Math.trunc(Number(p.wordLimit)||0)));
  for(const k of ['pageNumbers','titlePage'])p[k]=Boolean(p[k]);
  for(const k of ['docx','pdf','markdown','bibtex','ris','preflight','manifest'])p.outputs[k]=Boolean(p.outputs[k]);
  for(const k of ['headerText','footerText','institution','course','journal','manuscriptType'])p[k]=clean(p[k],500);
  return p;
}
function validateProfile(p){
  if(!p||typeof p.id!=='string'||typeof p.name!=='string'||p.name.length>180||!PAGE_SIZES[p.pageSize]||!FONT_PRESETS[p.fontPreset])throw new Error('Submission profile is malformed.');
  if(!Number.isFinite(p.fontSizePt)||p.fontSizePt<9||p.fontSizePt>16||![1,1.15,1.5,2].includes(p.lineSpacing)||!Number.isFinite(p.paragraphSpacingPt))throw new Error('Submission typography is malformed.');
  if(!p.marginsMm||!p.outputs)throw new Error('Submission profile layout is malformed.');
  for(const k of ['top','right','bottom','left'])if(!Number.isFinite(p.marginsMm[k])||p.marginsMm[k]<10||p.marginsMm[k]>50)throw new Error('Submission margin state is malformed.');
  for(const k of ['docx','pdf','markdown','bibtex','ris','preflight','manifest'])if(typeof p.outputs[k]!=='boolean')throw new Error('Submission output state is malformed.');
  return true;
}
function initial(now){const p=defaultProfile(now);return{schemaVersion:SCHEMA_VERSION,activeProfileId:p.id,profiles:[p],createdAt:iso(now),updatedAt:iso(now)}}
function validateState(s){
  if(s?.schemaVersion!==SCHEMA_VERSION||!Array.isArray(s.profiles)||s.profiles.length<1||s.profiles.length>MAX_PROFILES)throw new Error('Submission-profile state has an unsupported schema or bound.');
  s.profiles.forEach(validateProfile);
  if(!s.profiles.some(p=>p.id===s.activeProfileId))throw new Error('Active submission profile is missing.');
  return true;
}
class SubmissionProfileEngine{
  constructor({storage=null,clock=()=>new Date()}={}){
    this.storage=storage||((typeof localStorage!=='undefined')?localStorage:new MemoryStorage());this.clock=clock;
    const saved=safe(this.storage.getItem(STORAGE_KEY));if(saved){try{validateState(saved);this.state=saved}catch{this.state=initial(clock())}}else this.state=initial(clock());this.persist();
  }
  persist(){this.state.updatedAt=iso(this.clock());this.storage.setItem(STORAGE_KEY,JSON.stringify(this.state))}
  snapshot(){return clone(this.state)}
  listProfiles(){return clone(this.state.profiles)}
  getProfile(id=this.state.activeProfileId){const p=this.state.profiles.find(x=>x.id===id);return p?clone(p):null}
  createProfile(input={}){if(this.state.profiles.length>=MAX_PROFILES)throw new Error(`Submission profiles are limited to ${MAX_PROFILES}.`);const now=this.clock(),p=normalizeProfile({...input,id:`submission.${Date.now()}.${Math.random().toString(36).slice(2,7)}`,createdAt:iso(now),updatedAt:iso(now)},now);this.state.profiles.unshift(p);this.state.activeProfileId=p.id;this.persist();return clone(p)}
  updateProfile(id,patch={}){const i=this.state.profiles.findIndex(x=>x.id===id);if(i<0)throw new Error('Unknown submission profile.');const old=this.state.profiles[i],p=normalizeProfile({...old,...clone(patch),marginsMm:{...old.marginsMm,...clone(patch.marginsMm||{})},outputs:{...old.outputs,...clone(patch.outputs||{})}},this.clock());p.id=id;p.createdAt=old.createdAt;p.updatedAt=iso(this.clock());this.state.profiles[i]=p;this.persist();return clone(p)}
  applyPreset(id,presetId){if(!PRESETS[presetId])throw new Error('Unknown submission preset.');return this.updateProfile(id,{...clone(PRESETS[presetId]),presetId})}
  setActive(id){if(!this.state.profiles.some(p=>p.id===id))throw new Error('Unknown submission profile.');this.state.activeProfileId=id;this.persist();return this.getProfile(id)}
  deleteProfile(id){if(this.state.profiles.length<=1)throw new Error('Keep at least one submission profile.');this.state.profiles=this.state.profiles.filter(p=>p.id!==id);if(this.state.activeProfileId===id)this.state.activeProfileId=this.state.profiles[0].id;this.persist()}
}

function plainText(markdown){return String(markdown||'').replace(/^#{1,6}\s+/gm,'').replace(/\*\*/g,'').replace(/\*/g,'').replace(/\[\^(\d+)\]/g,'[$1]').replace(/^\[\^(\d+)\]:/gm,'$1.').replace(/^-\s+/gm,'').replace(/^---$/gm,'').trim()}
function wordCount(markdown){const t=plainText(markdown).replace(/https?:\/\/\S+/g,' ').trim();return t?t.split(/\s+/).filter(Boolean).length:0}
function preflight({dossier=null,sources=[],publicationProfile=null,submissionProfile=null,markdown='',gapReport=null}={}){
  const errors=[],warnings=[],info=[];
  let sp;try{sp=normalizeProfile(submissionProfile||{})}catch(e){errors.push({code:'submission-profile',message:e.message});return{ready:false,errors,warnings,info,wordCount:wordCount(markdown)}}
  if(!dossier)errors.push({code:'missing-dossier',message:'An active V1.9 dossier is required.'});
  if(dossier&&!clean(publicationProfile?.document?.title||dossier.title,600))errors.push({code:'missing-title',message:'A publication title is required.'});
  if(!sp.outputs.docx&&!sp.outputs.pdf&&!sp.outputs.markdown)errors.push({code:'no-primary-output',message:'Select at least one primary output: DOCX, PDF, or Markdown.'});
  const wc=wordCount(markdown);
  if(sp.wordLimit&&wc>sp.wordLimit)warnings.push({code:'word-limit',message:`Document has approximately ${wc} words, above the configured ${sp.wordLimit}-word limit.`});
  if(dossier&&dossier.status!=='complete')warnings.push({code:'dossier-incomplete',message:'The active dossier is not marked complete.'});
  if(!clean(publicationProfile?.document?.author,500))warnings.push({code:'missing-author',message:'Publication author metadata is empty.'});
  if(!clean(publicationProfile?.document?.date,500))info.push({code:'missing-date',message:'Publication date metadata is empty.'});
  if(publicationProfile?.includeBibliography&&sources.length===0)info.push({code:'empty-bibliography',message:'The publication profile includes a bibliography but no structured V1.10 sources are linked.'});
  for(const s of sources){const contributor=(s.authors?.length||s.editors?.length);if(!contributor||!s.year)warnings.push({code:'source-metadata',sourceId:s.id,message:`Source “${s.title||s.id}” is missing ${!contributor&&!s.year?'contributor and year':!contributor?'contributor':'year'} metadata.`});if(s.verification?.status==='unverified')info.push({code:'source-unverified',sourceId:s.id,message:`Source “${s.title||s.id}” is still marked unverified in V1.10.`})}
  if(gapReport){const unsupported=gapReport.unsupportedClaims?.length||0,counter=gapReport.contestedWithoutCounter?.length||0,unresolved=gapReport.unresolvedWithoutMarker?.length||0;if(unsupported||counter||unresolved)warnings.push({code:'evidence-gaps',message:`Dossier gap report still contains ${unsupported} unsupported, ${counter} contested-without-counter, and ${unresolved} unresolved-without-marker claim(s).`})}
  if(sp.outputs.pdf)info.push({code:'pdf-raster-text',message:'PDF pages are rendered locally through browser canvas to preserve Unicode Greek; PDF text is visual rather than tagged/selectable text.'});
  return{ready:errors.length===0,errors,warnings,info,wordCount:wc};
}

function xml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'')}
function stripInline(v){return String(v||'').replace(/\*\*/g,'').replace(/\*/g,'').replace(/`/g,'')}
function extractNotes(markdown,publicationProfile={}){
  const lines=String(markdown||'').split(/\r?\n/),placement=publicationProfile.placement||'parenthetical',heading=`## ${publicationProfile.notesHeading||'Notes'}`,notes=new Map(),skip=new Set();
  if(placement==='footnotes'){
    for(let i=0;i<lines.length;i++){const m=lines[i].match(/^\[\^(\d+)\]:\s*(.*)$/);if(m){notes.set(Number(m[1]),m[2]);skip.add(i)}}
    for(let i=0;i<lines.length;i++)if(lines[i]===heading&&[...skip].some(x=>x>i)){skip.add(i);break}
  }else if(placement==='endnotes'){
    const h=lines.indexOf(heading);if(h>=0){skip.add(h);for(let i=h+1;i<lines.length;i++){if(lines[i].startsWith('## '))break;const m=lines[i].match(/^(\d+)\.\s+(.*)$/);if(m){notes.set(Number(m[1]),m[2]);skip.add(i)}else if(!lines[i].trim())skip.add(i)}}
  }
  return{placement,notes,lines:lines.filter((_,i)=>!skip.has(i))};
}
function markdownParagraphs(markdown,publicationProfile={}){
  const extracted=extractNotes(markdown,publicationProfile),paras=[];
  for(const raw of extracted.lines){const line=raw.trimEnd();if(!line.trim())continue;if(line==='---'){paras.push({style:'Boundary',text:''});continue}if(line.startsWith('# ')){paras.push({style:'Title',text:stripInline(line.slice(2))});continue}if(line.startsWith('## ')){paras.push({style:'Heading1',text:stripInline(line.slice(3))});continue}if(line.startsWith('- ')){paras.push({style:'ListParagraph',text:stripInline(line.slice(2)),bullet:true});continue}if(/^\s+-\s+/.test(line)){paras.push({style:'ListParagraph',text:stripInline(line.replace(/^\s+-\s+/,'')),bullet:true});continue}paras.push({style:'Normal',text:stripInline(line)})}
  return{paragraphs:paras,placement:extracted.placement,notes:extracted.notes};
}
function textRuns(text,placement){
  const re=placement==='footnotes' ? /(\[\^\d+\])/g : placement==='endnotes' ? /(\[\d+\])/g : null;
  if(!re)return`<w:r><w:t xml:space="preserve">${xml(text)}</w:t></w:r>`;
  let out='',last=0,m;while((m=re.exec(text))){if(m.index>last)out+=`<w:r><w:t xml:space="preserve">${xml(text.slice(last,m.index))}</w:t></w:r>`;const id=Number(m[0].replace(/\D/g,''));out+=placement==='footnotes'?`<w:r><w:footnoteReference w:id="${id}"/></w:r>`:`<w:r><w:endnoteReference w:id="${id}"/></w:r>`;last=m.index+m[0].length}if(last<text.length)out+=`<w:r><w:t xml:space="preserve">${xml(text.slice(last))}</w:t></w:r>`;return out;
}
function paragraphXml(p,placement,profile){
  if(p.style==='Boundary')return'<w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>';
  const style=p.style||'Normal',bullet=p.bullet?'<w:ind w:left="360" w:hanging="180"/>':'',spacing=`<w:spacing w:line="${Math.round(profile.lineSpacing*240)}" w:lineRule="auto" w:after="${Math.round(profile.paragraphSpacingPt*20)}"/>`;
  const prefix=p.bullet?'• ':'';return`<w:p><w:pPr><w:pStyle w:val="${style}"/>${bullet}${spacing}</w:pPr>${textRuns(prefix+p.text,placement)}</w:p>`;
}
function notesXml(type,notes){
  const root=type==='footnotes'?'footnotes':'endnotes',item=type==='footnotes'?'footnote':'endnote',ref=type==='footnotes'?'footnoteRef':'endnoteRef';
  let body=`<w:${item} w:type="separator" w:id="-1"><w:p><w:r><w:separator/></w:r></w:p></w:${item}><w:${item} w:type="continuationSeparator" w:id="0"><w:p><w:r><w:continuationSeparator/></w:r></w:p></w:${item}>`;
  for(const [id,text] of [...notes.entries()].sort((a,b)=>a[0]-b[0]))body+=`<w:${item} w:id="${id}"><w:p><w:r><w:${ref}/><w:t xml:space="preserve"> </w:t></w:r><w:r><w:t xml:space="preserve">${xml(stripInline(text))}</w:t></w:r></w:p></w:${item}>`;
  return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:${root} xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">${body}</w:${root}>`;
}
function twipsMm(mm){return Math.round(mm*56.6929134)}
function docxParts({markdown,submissionProfile,publicationProfile={},metadata={}}){
  const sp=normalizeProfile(submissionProfile),page=PAGE_SIZES[sp.pageSize],font=FONT_PRESETS[sp.fontPreset],parsed=markdownParagraphs(markdown,publicationProfile),rels=[];let relIndex=1,footerRef='',notesRef='';
  const parts={};
  if(sp.pageNumbers||sp.headerText||sp.footerText){const id=`rId${relIndex++}`;rels.push(`<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>`);footerRef=`<w:footerReference w:type="default" r:id="${id}"/>`;parts['word/footer1.xml']=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>${xml(sp.footerText)}</w:t></w:r>${sp.pageNumbers?'<w:r><w:t xml:space="preserve"> </w:t></w:r><w:r><w:fldChar w:fldCharType="begin"/><w:instrText> PAGE </w:instrText><w:fldChar w:fldCharType="end"/></w:r>':''}</w:p></w:ftr>`}
  if(parsed.placement==='footnotes'&&parsed.notes.size){const id=`rId${relIndex++}`;rels.push(`<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes" Target="footnotes.xml"/>`);notesRef='footnotes';parts['word/footnotes.xml']=notesXml('footnotes',parsed.notes)}
  if(parsed.placement==='endnotes'&&parsed.notes.size){const id=`rId${relIndex++}`;rels.push(`<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/endnotes" Target="endnotes.xml"/>`);notesRef='endnotes';parts['word/endnotes.xml']=notesXml('endnotes',parsed.notes)}
  const body=parsed.paragraphs.map(p=>paragraphXml(p,parsed.placement,sp)).join('');
  const sect=`<w:sectPr>${footerRef}<w:pgSz w:w="${page.twipsW}" w:h="${page.twipsH}"/><w:pgMar w:top="${twipsMm(sp.marginsMm.top)}" w:right="${twipsMm(sp.marginsMm.right)}" w:bottom="${twipsMm(sp.marginsMm.bottom)}" w:left="${twipsMm(sp.marginsMm.left)}" w:header="720" w:footer="720" w:gutter="0"/><w:pgNumType w:start="${sp.pageNumberStart}"/></w:sectPr>`;
  parts['word/document.xml']=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${body}${sect}</w:body></w:document>`;
  const size=Math.round(sp.fontSizePt*2),line=Math.round(sp.lineSpacing*240),after=Math.round(sp.paragraphSpacingPt*20);
  parts['word/styles.xml']=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${xml(font.docx)}" w:hAnsi="${xml(font.docx)}" w:eastAsia="${xml(font.docx)}"/><w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:line="${line}" w:lineRule="auto" w:after="${after}"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="${Math.round(size*1.6)}"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:keepNext/><w:rPr><w:b/><w:sz w:val="${Math.round(size*1.25)}"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/></w:style></w:styles>`;
  parts['word/_rels/document.xml.rels']=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels.join('')}</Relationships>`;
  parts['_rels/.rels']='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>';
  const created=metadata.createdAt||'2026-01-01T00:00:00Z';parts['docProps/core.xml']=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xml(metadata.title||'Koinē Path dossier')}</dc:title><dc:creator>${xml(metadata.author||'')}</dc:creator><cp:lastModifiedBy>Koinē Path V1.12</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${xml(created)}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${xml(created)}</dcterms:modified></cp:coreProperties>`;
  parts['docProps/app.xml']='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Koinē Path</Application><AppVersion>1.12</AppVersion></Properties>';
  let overrides='<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>';
  if(parts['word/footer1.xml'])overrides+='<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>';if(notesRef==='footnotes')overrides+='<Override PartName="/word/footnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"/>';if(notesRef==='endnotes')overrides+='<Override PartName="/word/endnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml"/>';
  parts['[Content_Types].xml']=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${overrides}</Types>`;
  return parts;
}

function concatBytes(chunks){let n=0;for(const c of chunks)n+=c.length;const out=new Uint8Array(n);let o=0;for(const c of chunks){out.set(c,o);o+=c.length}return out}
function u16(n){const a=new Uint8Array(2);new DataView(a.buffer).setUint16(0,n,true);return a}
function u32(n){const a=new Uint8Array(4);new DataView(a.buffer).setUint32(0,n>>>0,true);return a}
const CRC_TABLE=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(data){let c=0xffffffff;for(const b of data)c=CRC_TABLE[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0}
function bytes(v){if(v instanceof Uint8Array)return v;if(v instanceof ArrayBuffer)return new Uint8Array(v);return enc.encode(String(v))}
function zipStore(entries){
  const locals=[],centrals=[];let offset=0;for(const entry of entries){const name=enc.encode(entry.name),data=bytes(entry.data),crc=crc32(data),local=concatBytes([u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(33),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),name,data]);locals.push(local);const central=concatBytes([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(33),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name]);centrals.push(central);offset+=local.length}const centralBytes=concatBytes(centrals),localBytes=concatBytes(locals),end=concatBytes([u32(0x06054b50),u16(0),u16(0),u16(entries.length),u16(entries.length),u32(centralBytes.length),u32(localBytes.length),u16(0)]);return concatBytes([localBytes,centralBytes,end])
}
function generateDocx({markdown,submissionProfile,publicationProfile,metadata={}}){const parts=docxParts({markdown,submissionProfile,publicationProfile,metadata});return zipStore(Object.keys(parts).sort().map(name=>({name,data:parts[name]})))}

function cleanPdfText(v){return stripInline(v).replace(/\[\^(\d+)\]/g,'[$1]')}
function pdfBlocks(markdown){const out=[];for(const raw of String(markdown||'').split(/\r?\n/)){const s=raw.trimEnd();if(!s.trim()){out.push({type:'space',text:''});continue}if(s==='---'){out.push({type:'rule',text:''});continue}if(s.startsWith('# ')){out.push({type:'h1',text:cleanPdfText(s.slice(2))});continue}if(s.startsWith('## ')){out.push({type:'h2',text:cleanPdfText(s.slice(3))});continue}if(s.startsWith('- ')){out.push({type:'bullet',text:`• ${cleanPdfText(s.slice(2))}`});continue}out.push({type:'p',text:cleanPdfText(s)})}return out}
function dataUrlBytes(url){const b64=String(url).split(',')[1]||'';if(typeof atob==='function'){const raw=atob(b64),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out}if(typeof Buffer!=='undefined')return new Uint8Array(Buffer.from(b64,'base64'));throw new Error('No base64 decoder is available.')}
function pdfFromJpegs(images,page){
  const objects=[null,null],pageIds=[];for(let i=0;i<images.length;i++){const imageId=3+i*3,contentId=imageId+1,pageId=imageId+2;pageIds.push(pageId);objects[imageId]={binary:images[i].data,prefix:`<< /Type /XObject /Subtype /Image /Width ${images[i].width} /Height ${images[i].height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${images[i].data.length} >>\nstream\n`,suffix:'\nendstream'};const stream=`q\n${page.widthPt.toFixed(2)} 0 0 ${page.heightPt.toFixed(2)} 0 0 cm\n/Im0 Do\nQ\n`;objects[contentId]={text:`<< /Length ${enc.encode(stream).length} >>\nstream\n${stream}endstream`};objects[pageId]={text:`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.widthPt.toFixed(2)} ${page.heightPt.toFixed(2)}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`}}
  objects[1]={text:'<< /Type /Catalog /Pages 2 0 R >>'};objects[2]={text:`<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`};const chunks=[enc.encode('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')],offsets=[0];let offset=chunks[0].length;for(let id=1;id<objects.length;id++){const obj=objects[id];offsets[id]=offset;const head=enc.encode(`${id} 0 obj\n`),tail=enc.encode('\nendobj\n');let mid;if(obj.binary)mid=concatBytes([enc.encode(obj.prefix),obj.binary,enc.encode(obj.suffix)]);else mid=enc.encode(obj.text);const all=concatBytes([head,mid,tail]);chunks.push(all);offset+=all.length}const xrefOffset=offset;let xref=`xref\n0 ${objects.length}\n0000000000 65535 f \n`;for(let id=1;id<objects.length;id++)xref+=`${String(offsets[id]).padStart(10,'0')} 00000 n \n`;xref+=`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;chunks.push(enc.encode(xref));return concatBytes(chunks)
}
async function generatePdf({markdown,submissionProfile,canvasFactory=null}){
  const sp=normalizeProfile(submissionProfile),page=PAGE_SIZES[sp.pageSize],font=FONT_PRESETS[sp.fontPreset],scale=96/72,width=Math.round(page.widthPt*scale),height=Math.round(page.heightPt*scale),mmPx=96/25.4,m={top:sp.marginsMm.top*mmPx,right:sp.marginsMm.right*mmPx,bottom:sp.marginsMm.bottom*mmPx,left:sp.marginsMm.left*mmPx},make=canvasFactory||(()=>{if(typeof document==='undefined')throw new Error('PDF generation requires a browser canvas.');return document.createElement('canvas')}),pages=[];let canvas,ctx,y,pageIndex=-1;
  const newPage=()=>{canvas=make();canvas.width=width;canvas.height=height;ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.fillStyle='#111';ctx.textBaseline='top';pageIndex++;y=m.top;pages.push(canvas)};newPage();
  const bodyPx=sp.fontSizePt*scale,lineBase=bodyPx*sp.lineSpacing,usable=width-m.left-m.right,bottom=height-m.bottom-(sp.pageNumbers?bodyPx*2:0);
  function drawWrapped(text,{size=bodyPx,bold=false,indent=0,after=sp.paragraphSpacingPt*scale}={}){ctx.font=`${bold?'700 ':'400 '}${size}px ${font.css}`;const max=usable-indent,words=String(text||'').split(/\s+/),lines=[];let line='';for(const w of words){const test=line?`${line} ${w}`:w;if(ctx.measureText(test).width>max&&line){lines.push(line);line=w}else line=test}if(line)lines.push(line);const lh=Math.max(size*1.2,lineBase*(size/bodyPx));for(const l of lines){if(y+lh>bottom){newPage();ctx.font=`${bold?'700 ':'400 '}${size}px ${font.css}`}ctx.fillStyle='#111';ctx.fillText(l,m.left+indent,y);y+=lh}y+=after}
  let seenFirstHeading=false;for(const b of pdfBlocks(markdown)){if(b.type==='space'){y+=lineBase*.45;continue}if(b.type==='rule'){y+=lineBase*.5;continue}if(b.type==='h1'){drawWrapped(b.text,{size:bodyPx*1.6,bold:true,after:bodyPx});seenFirstHeading=true;continue}if(b.type==='h2'){if(sp.titlePage&&pageIndex===0&&seenFirstHeading&&y>m.top+bodyPx*4)newPage();drawWrapped(b.text,{size:bodyPx*1.25,bold:true,after:bodyPx*.7});continue}if(b.type==='bullet'){drawWrapped(b.text,{indent:bodyPx,after:sp.paragraphSpacingPt*scale});continue}drawWrapped(b.text,{after:sp.paragraphSpacingPt*scale})}
  for(let i=0;i<pages.length;i++){const c=pages[i],cctx=c.getContext('2d');if(sp.pageNumbers){cctx.font=`400 ${bodyPx*.9}px ${font.css}`;cctx.textAlign='center';cctx.fillStyle='#333';cctx.fillText(String(sp.pageNumberStart+i),width/2,height-m.bottom+bodyPx*.45);cctx.textAlign='start'}if(sp.headerText){cctx.font=`400 ${bodyPx*.8}px ${font.css}`;cctx.fillStyle='#555';cctx.fillText(sp.headerText,m.left,Math.max(2,m.top-bodyPx*1.4))}}
  const images=pages.map(c=>({data:dataUrlBytes(c.toDataURL('image/jpeg',.92)),width:c.width,height:c.height}));return pdfFromJpegs(images,page)
}

function fnv1a32(data){const b=bytes(data);let h=0x811c9dc5;for(const x of b){h^=x;h=Math.imul(h,0x01000193)>>>0}return h.toString(16).padStart(8,'0')}
function mediaType(name){if(name.endsWith('.docx'))return'application/vnd.openxmlformats-officedocument.wordprocessingml.document';if(name.endsWith('.pdf'))return'application/pdf';if(name.endsWith('.md'))return'text/markdown';if(name.endsWith('.bib'))return'application/x-bibtex';if(name.endsWith('.ris'))return'application/x-research-info-systems';if(name.endsWith('.json'))return'application/json';return'application/octet-stream'}
function slug(v){return clean(v,200).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90)||'koine-path-dossier'}
function buildManifest({dossier,publicationProfile,submissionProfile,files,preflightResult,generatedAt}){return{schemaVersion:1,product:'Koinē Path',feature:'v1.12',generatedAt,dossier:{id:dossier?.id||null,title:dossier?.title||null,status:dossier?.status||null},publicationProfile:{id:publicationProfile?.id||null,name:publicationProfile?.name||null,styleId:publicationProfile?.styleId||null,placement:publicationProfile?.placement||null},submissionProfile:{id:submissionProfile.id,name:submissionProfile.name,pageSize:submissionProfile.pageSize,fontPreset:submissionProfile.fontPreset,fontSizePt:submissionProfile.fontSizePt,lineSpacing:submissionProfile.lineSpacing,marginsMm:clone(submissionProfile.marginsMm),wordLimit:submissionProfile.wordLimit},preflight:{errors:preflightResult.errors.length,warnings:preflightResult.warnings.length,info:preflightResult.info.length,wordCount:preflightResult.wordCount},files:files.map(f=>({name:f.name,mediaType:mediaType(f.name),bytes:bytes(f.data).length,fnv1a32:fnv1a32(f.data)})),boundaries:['Package generation does not create canonical Greek mastery evidence.','Package generation does not certify scholarly correctness, citation-style compliance, peer review, or submission acceptance.','PDF output uses browser-canvas page images to preserve Unicode Greek and is not tagged/selectable PDF text.']}}
async function generatePackage({dossier,sources=[],publicationProfile,submissionProfile,publicationApi,sourceLibraryApi=null,resolveSource=null,gapReport=null,clock=()=>new Date(),canvasFactory=null}={}){
  if(!publicationApi?.renderMarkdown)throw new Error('V1.12 package generation requires the V1.11 publication renderer.');const sp=normalizeProfile(submissionProfile),markdown=publicationApi.renderMarkdown({dossier,sources,resolveSource,profile:publicationProfile}),check=preflight({dossier,sources,publicationProfile,submissionProfile:sp,markdown,gapReport});if(!check.ready){const e=new Error('Publication package preflight has blocking errors.');e.preflight=check;throw e}const stem=slug(publicationProfile?.document?.title||dossier?.title),generatedAt=iso(clock()),metadata={title:publicationProfile?.document?.title||dossier?.title||'',author:publicationProfile?.document?.author||'',createdAt:generatedAt},files=[];
  if(sp.outputs.docx)files.push({name:`${stem}.docx`,data:generateDocx({markdown,submissionProfile:sp,publicationProfile,metadata})});
  if(sp.outputs.pdf)files.push({name:`${stem}.pdf`,data:await generatePdf({markdown,submissionProfile:sp,canvasFactory})});
  if(sp.outputs.markdown)files.push({name:`${stem}.md`,data:markdown});
  if(sp.outputs.bibtex&&sourceLibraryApi?.exportBibTeX)files.push({name:`${stem}-sources.bib`,data:sourceLibraryApi.exportBibTeX(sources.map(s=>s.id))});
  if(sp.outputs.ris&&sourceLibraryApi?.exportRIS)files.push({name:`${stem}-sources.ris`,data:sourceLibraryApi.exportRIS(sources.map(s=>s.id))});
  if(sp.outputs.preflight)files.push({name:'preflight.json',data:JSON.stringify(check,null,2)});
  const manifest=buildManifest({dossier,publicationProfile,submissionProfile:sp,files,preflightResult:check,generatedAt});if(sp.outputs.manifest)files.push({name:'manifest.json',data:JSON.stringify(manifest,null,2)});const zip=zipStore(files.map(f=>({name:f.name,data:f.data})));return{fileName:`${stem}-submission-package.zip`,zip,files,manifest,preflight:check,markdown}
}

return{STORAGE_KEY,SCHEMA_VERSION,MAX_PROFILES,PAGE_SIZES,FONT_PRESETS,PRESETS,MemoryStorage,defaultProfile,normalizeProfile,validateProfile,validateState,SubmissionProfileEngine,plainText,wordCount,preflight,extractNotes,markdownParagraphs,docxParts,zipStore,generateDocx,pdfBlocks,pdfFromJpegs,generatePdf,fnv1a32,buildManifest,generatePackage,slug};
});