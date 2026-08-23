(function(root,factory){
  const base=(typeof module==='object'&&module.exports)?require('./publication-package-engine.js'):root?.KoinePublicationPackages;
  const api=factory(base);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root&&base)root.KoinePublicationPackages=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(base){
'use strict';
if(!base)throw new Error('Publication package output hardening requires the V1.12 package engine.');
const originalGeneratePdf=base.generatePdf.bind(base);

const xml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'');
function addRelationship(xmlText,id,type,target){if(xmlText.includes(`Id="${id}"`))return xmlText;return xmlText.replace('</Relationships>',`<Relationship Id="${id}" Type="${type}" Target="${target}"/></Relationships>`)}
function addOverride(xmlText,partName,contentType){if(xmlText.includes(`PartName="${partName}"`))return xmlText;return xmlText.replace('</Types>',`<Override PartName="${partName}" ContentType="${contentType}"/></Types>`)}
function hardenDocxParts(args){
  const parts=base.docxParts(args),sp=base.normalizeProfile(args.submissionProfile),publication=args.publicationProfile||{},relsPath='word/_rels/document.xml.rels';
  parts[relsPath]=addRelationship(parts[relsPath],'rIdStyles','http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles','styles.xml');
  if(sp.headerText){
    parts['word/header1.xml']=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="left"/></w:pPr><w:r><w:t xml:space="preserve">${xml(sp.headerText)}</w:t></w:r></w:p></w:hdr>`;
    parts[relsPath]=addRelationship(parts[relsPath],'rIdHeader','http://schemas.openxmlformats.org/officeDocument/2006/relationships/header','header1.xml');
    parts['word/document.xml']=parts['word/document.xml'].replace('<w:sectPr>','<w:sectPr><w:headerReference w:type="default" r:id="rIdHeader"/>');
    parts['[Content_Types].xml']=addOverride(parts['[Content_Types].xml'],'/word/header1.xml','application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml');
  }
  if(sp.footerText&&!parts['word/footer1.xml']){
    parts['word/footer1.xml']=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t xml:space="preserve">${xml(sp.footerText)}</w:t></w:r></w:p></w:ftr>`;
    parts[relsPath]=addRelationship(parts[relsPath],'rIdFooter','http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer','footer1.xml');
    parts['word/document.xml']=parts['word/document.xml'].replace('<w:sectPr>','<w:sectPr><w:footerReference w:type="default" r:id="rIdFooter"/>');
    parts['[Content_Types].xml']=addOverride(parts['[Content_Types].xml'],'/word/footer1.xml','application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml');
  }
  if(sp.titlePage){const heading='<w:p><w:pPr><w:pStyle w:val="Heading1"/>';const i=parts['word/document.xml'].indexOf(heading);if(i>=0)parts['word/document.xml']=parts['word/document.xml'].slice(0,i)+'<w:p><w:r><w:br w:type="page"/></w:r></w:p>'+parts['word/document.xml'].slice(i)}
  const bibHeading=publication.bibliographyHeading||'Bibliography',needle=`<w:t xml:space="preserve">${xml(bibHeading)}</w:t>`,bi=parts['word/document.xml'].indexOf(needle);
  if(bi>=0){const before=parts['word/document.xml'].slice(0,bi),after=parts['word/document.xml'].slice(bi).replace(/<w:pStyle w:val="ListParagraph"\/><w:ind w:left="360" w:hanging="180"\/>/g,'<w:pStyle w:val="ListParagraph"/><w:ind w:left="720" w:hanging="720"/>');parts['word/document.xml']=before+after}
  return parts;
}
function generateDocx(args){const parts=hardenDocxParts(args);return base.zipStore(Object.keys(parts).sort().map(name=>({name,data:parts[name]})))}
async function generatePdf(args){
  const sp=base.normalizeProfile(args.submissionProfile),footer=sp.footerText;if(!footer)return originalGeneratePdf(args);const supplied=args.canvasFactory;
  const factory=()=>{const c=supplied?supplied():(()=>{if(typeof document==='undefined')throw new Error('PDF generation requires a browser canvas.');return document.createElement('canvas')})();const original=c.toDataURL.bind(c);let stamped=false;c.toDataURL=(...callArgs)=>{if(!stamped){const ctx=c.getContext('2d'),font=base.FONT_PRESETS[sp.fontPreset],scale=96/72,body=sp.fontSizePt*scale,mmPx=96/25.4,bottom=sp.marginsMm.bottom*mmPx;ctx.save?.();ctx.font=`400 ${body*.8}px ${font.css}`;ctx.fillStyle='#555';ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText(footer,sp.marginsMm.left*mmPx,c.height-bottom+body*.45);ctx.restore?.();stamped=true}return original(...callArgs)};return c};
  return originalGeneratePdf({...args,canvasFactory:factory});
}
async function generatePackage(args){
  const publicationApi=args.publicationApi;if(!publicationApi?.renderMarkdown)throw new Error('V1.12 package generation requires the V1.11 publication renderer.');
  const sp=base.normalizeProfile(args.submissionProfile),markdown=publicationApi.renderMarkdown({dossier:args.dossier,sources:args.sources||[],resolveSource:args.resolveSource,profile:args.publicationProfile}),check=base.preflight({dossier:args.dossier,sources:args.sources||[],publicationProfile:args.publicationProfile,submissionProfile:sp,markdown,gapReport:args.gapReport});if(!check.ready){const e=new Error('Publication package preflight has blocking errors.');e.preflight=check;throw e}
  const stem=base.slug(args.publicationProfile?.document?.title||args.dossier?.title),generatedAt=new Date((args.clock||(()=>new Date()))()).toISOString(),metadata={title:args.publicationProfile?.document?.title||args.dossier?.title||'',author:args.publicationProfile?.document?.author||'',createdAt:generatedAt},files=[];
  if(sp.outputs.docx)files.push({name:`${stem}.docx`,data:generateDocx({markdown,submissionProfile:sp,publicationProfile:args.publicationProfile,metadata})});if(sp.outputs.pdf)files.push({name:`${stem}.pdf`,data:await generatePdf({markdown,submissionProfile:sp,canvasFactory:args.canvasFactory})});if(sp.outputs.markdown)files.push({name:`${stem}.md`,data:markdown});if(sp.outputs.bibtex&&args.sourceLibraryApi?.exportBibTeX)files.push({name:`${stem}-sources.bib`,data:args.sourceLibraryApi.exportBibTeX((args.sources||[]).map(s=>s.id))});if(sp.outputs.ris&&args.sourceLibraryApi?.exportRIS)files.push({name:`${stem}-sources.ris`,data:args.sourceLibraryApi.exportRIS((args.sources||[]).map(s=>s.id))});if(sp.outputs.preflight)files.push({name:'preflight.json',data:JSON.stringify(check,null,2)});
  const manifest=base.buildManifest({dossier:args.dossier,publicationProfile:args.publicationProfile,submissionProfile:sp,files,preflightResult:check,generatedAt});if(sp.outputs.manifest)files.push({name:'manifest.json',data:JSON.stringify(manifest,null,2)});return{fileName:`${stem}-submission-package.zip`,zip:base.zipStore(files.map(f=>({name:f.name,data:f.data}))),files,manifest,preflight:check,markdown};
}
return Object.assign(base,{hardenDocxParts,generateDocx,generatePdf,generatePackage});
});