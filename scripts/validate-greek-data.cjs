const data=require('../data/greek-data.js');

const errors=[];
const fail=(message)=>errors.push(message);
const allowedMorph=new Set(['person','tense','voice','mood','case','number','gender','degree']);

if(data.schemaVersion!==1) fail(`Expected schemaVersion 1, got ${data.schemaVersion}`);
if(!data.generatedFromPinnedSources) fail('Dataset must declare generatedFromPinnedSources=true.');
if(data.unicodeNormalization!=='NFC') fail('Dataset normalization must be NFC.');

const sourceIds=new Set(Object.keys(data.sources||{}));
if(!sourceIds.has('sblgnt')) fail('Missing SBLGNT source registry entry.');
if(!sourceIds.has('morphgnt')) fail('Missing MorphGNT source registry key.');

const morphSource=data.sources&&data.sources.morphgnt;
if(!morphSource||!morphSource.revision||!/^[0-9a-f]{40}$/.test(morphSource.revision)) fail('MorphGNT source must be pinned to a 40-character commit SHA.');

const tokenIds=new Set();
const passageIds=new Set();
const tokenIndex=new Map();

for(const [key,passage] of Object.entries(data.passages||{})){
  if(passageIds.has(passage.id)) fail(`Duplicate passage id ${passage.id}`);
  passageIds.add(passage.id);
  if(key!==passage.id) fail(`Passage map key ${key} does not match passage.id ${passage.id}`);
  if(!sourceIds.has(passage.textSource)) fail(`${passage.id}: unknown textSource ${passage.textSource}`);
  const morphRegistryId=Object.values(data.sources).find(s=>s.id===passage.morphologySource);
  if(!morphRegistryId) fail(`${passage.id}: unknown morphologySource ${passage.morphologySource}`);
  if(passage.sourceRevision!==morphSource.revision) fail(`${passage.id}: sourceRevision does not match pinned MorphGNT revision`);
  if(passage.unicodeNormalization!=='NFC') fail(`${passage.id}: passage normalization must be NFC`);
  if(passage.surface!==passage.surface.normalize('NFC')) fail(`${passage.id}: surface is not NFC`);
  if(!Array.isArray(passage.tokens)||!passage.tokens.length) fail(`${passage.id}: no tokens`);

  const reconstructed=passage.tokens.map(t=>t.text).join(' ');
  if(reconstructed!==passage.surface) fail(`${passage.id}: token text does not reconstruct passage surface`);

  passage.tokens.forEach((token,index)=>{
    const expectedPosition=index+1;
    const expectedId=`sblgnt.${passage.id}.${String(expectedPosition).padStart(3,'0')}`;
    if(token.position!==expectedPosition) fail(`${passage.id}: expected position ${expectedPosition}, got ${token.position}`);
    if(token.id!==expectedId) fail(`${passage.id}: expected token id ${expectedId}, got ${token.id}`);
    if(tokenIds.has(token.id)) fail(`Duplicate token id ${token.id}`);
    tokenIds.add(token.id);
    tokenIndex.set(token.id,token);
    for(const field of ['text','word','normalized','lemma']){
      if(typeof token[field]!=='string'||!token[field]) fail(`${token.id}: missing ${field}`);
      else if(token[field]!==token[field].normalize('NFC')) fail(`${token.id}: ${field} is not NFC`);
    }
    if(!data.pos[token.posCode]) fail(`${token.id}: unknown posCode ${token.posCode}`);
    if(typeof token.parseCode!=='string'||token.parseCode.length!==8) fail(`${token.id}: invalid parseCode ${token.parseCode}`);
    if(!token.morph||typeof token.morph!=='object'||Array.isArray(token.morph)) fail(`${token.id}: morph must be an object`);
    else for(const key of Object.keys(token.morph)) if(!allowedMorph.has(key)) fail(`${token.id}: unsupported morph field ${key}`);
    if('translation' in token||'ai' in token||'explanation' in token||'gloss' in token||'hint' in token) fail(`${token.id}: canonical token contains editorial/generative field`);
    if(!data.lexemes[token.lemma]) fail(`${token.id}: missing lexeme record for ${token.lemma}`);
  });
}

for(const [tokenId,annotation] of Object.entries(data.learningAnnotations||{})){
  if(!tokenIndex.has(tokenId)) fail(`Learning annotation references missing token ${tokenId}`);
  if(annotation.glosses&&!Array.isArray(annotation.glosses)) fail(`${tokenId}: glosses must be an array`);
}

for(const [lemma,lexeme] of Object.entries(data.lexemes||{})){
  if(lemma!==lemma.normalize('NFC')) fail(`Lexeme key ${lemma} is not NFC`);
  if(lexeme.lemma!==lemma) fail(`Lexeme ${lemma}: lemma field mismatch`);
  const frequency=lexeme.frequency||{};
  if(!data.coverage.fullCorpusIngested&&(frequency.count!==null||frequency.rank!==null||frequency.band!==null)){
    fail(`Lexeme ${lemma}: NT-wide frequency must remain null before full corpus ingestion`);
  }
}

if(data.coverage.tokens!==tokenIds.size) fail(`Coverage token count ${data.coverage.tokens} does not equal actual ${tokenIds.size}`);
if(data.coverage.fullCorpusIngested===false&&data.coverage.status!=='foundation-sample') fail('Partial coverage must be identified as foundation-sample.');

if(errors.length){
  console.error(`Greek data validation failed with ${errors.length} error(s):`);
  errors.forEach(e=>console.error(`- ${e}`));
  process.exit(1);
}

console.log(`Greek data validation passed: ${passageIds.size} passage(s), ${tokenIds.size} token(s), ${Object.keys(data.lexemes).length} lexeme(s).`);
console.log(`Pinned MorphGNT revision: ${morphSource.revision}`);