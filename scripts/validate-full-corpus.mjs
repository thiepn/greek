import fs from 'node:fs/promises';
import path from 'node:path';
const ROOT=path.resolve('generated/corpus');
const read=async p=>JSON.parse(await fs.readFile(path.join(ROOT,p),'utf8'));
const manifest=await read('manifest.json');
const frequency=await read('frequency.json');
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
function codepointCompare(a,b){const A=Array.from(a),B=Array.from(b),n=Math.min(A.length,B.length);for(let i=0;i<n;i++){const x=A[i].codePointAt(0),y=B[i].codePointAt(0);if(x!==y)return x-y}return A.length-B.length}

const EXPECTED={books:27,chapters:260,verses:7927,tokens:137554,lemmas:5461};
assert(manifest.schemaVersion===1,'unexpected manifest schema');
assert(manifest.source.revision==='aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d','wrong MorphGNT revision');
assert(/pinned MorphGNT revision/i.test(manifest.source.snapshotNote),'corpus must identify itself as a pinned text snapshot');
assert(manifest.vocabularyOrdering?.tieBreak==='normalized-lemma-codepoint-order','canonical frequency tie-break contract changed');
assert(manifest.coverage.fullCorpusIngested===true,'corpus must declare full ingestion');
for(const [key,value] of Object.entries(EXPECTED))assert(manifest.coverage[key]===value,`pinned corpus ${key} changed: expected ${value}, got ${manifest.coverage[key]}`);
assert(manifest.books.length===27,'manifest book list incomplete');
assert(new Set(manifest.books.map(b=>b.id)).size===27,'book ids must be unique');

let counted=0,countedVerses=0;
for(const meta of manifest.books){
  const book=await read(`books/${meta.id}.json`);
  assert(book.sourceRevision===manifest.source.revision,`${meta.id}: source revision mismatch`);
  assert(book.book.id===meta.id,`${meta.id}: book id mismatch`);
  assert(Object.keys(book.chapters).length===meta.chapters,`${meta.id}: chapter count mismatch`);
  let tokenCount=0,verseCount=0;
  for(const [chapter,verses] of Object.entries(book.chapters)){
    const verseNos=Object.keys(verses).map(Number).sort((a,b)=>a-b);
    assert(verseNos.length>0,`${meta.id} ${chapter}: chapter has no token-bearing verses`);
    assert(verseNos.every((v,i)=>Number.isInteger(v)&&v>0&&(i===0||v>verseNos[i-1])),`${meta.id} ${chapter}: invalid verse numbering`);
    for(const [verse,tokens] of Object.entries(verses)){
      assert(tokens.length>0,`${meta.id} ${chapter}:${verse}: empty verse`);verseCount++;
      tokens.forEach((token,i)=>{
        assert(token.position===i+1,`${token.id}: non-contiguous token position`);
        assert(token.id===`sblgnt.${meta.id}.${chapter}.${verse}.${String(i+1).padStart(3,'0')}`,`${token.id}: unstable token id`);
        for(const key of ['text','word','normalized','lemma'])assert(token[key]===token[key].normalize('NFC'),`${token.id}: ${key} is not NFC`);
        assert(/^[A-Z-]{2}$/.test(token.posCode),`${token.id}: malformed POS code`);
        assert(/^[0-9A-Z-]{8}$/.test(token.parseCode),`${token.id}: malformed parse code`);
      });
      tokenCount+=tokens.length;
    }
  }
  assert(tokenCount===meta.tokens,`${meta.id}: token count mismatch`);
  assert(verseCount===meta.verses,`${meta.id}: verse count mismatch`);
  counted+=tokenCount;countedVerses+=verseCount;
}
assert(counted===manifest.coverage.tokens,'manifest token total mismatch');
assert(countedVerses===manifest.coverage.verses,'manifest verse total mismatch');

const john=await read('books/John.json');
const john11=john.chapters['1']['1'];
assert(john11.length===17,'John 1:1 must have 17 tokens');
assert(john11.map(t=>t.text).join(' ')==='Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος.','John 1:1 surface reconstruction mismatch');
assert(john11[1].lemma==='ἀρχή'&&john11[1].parseCode==='----DSF-','John 1:1 morphology fixture mismatch');
assert(!john.chapters['8']['1']&&!john.chapters['8']['11']&&john.chapters['8']['12'],'pinned MorphGNT/SBLGNT snapshot John 8 invariant changed');

assert(frequency.sourceRevision===manifest.source.revision,'frequency revision mismatch');
assert(frequency.tieBreak==='normalized-lemma-codepoint-order','frequency tie-break metadata mismatch');
assert(frequency.tokens===manifest.coverage.tokens,'frequency token total mismatch');
assert(frequency.entries.length===manifest.coverage.lemmas,'lemma count mismatch');
assert(frequency.entries[0].lemma==='ὁ','expected article ὁ to be most frequent lemma');
assert(frequency.entries[0].count===19769,'top lemma count changed unexpectedly');
frequency.entries.forEach((e,i)=>{
  assert(e.rank===i+1,'frequency ranks must be contiguous');
  if(!i)return;
  const prev=frequency.entries[i-1];
  assert(prev.count>=e.count,'frequency must be descending');
  if(prev.count===e.count)assert(codepointCompare(prev.lemma,e.lemma)<=0,`equal-frequency lemmas violate code-point tie-break: ${prev.lemma} / ${e.lemma}`);
});
console.log(`BG6 full-corpus validation passed: ${manifest.coverage.tokens} tokens, ${manifest.coverage.verses} token-bearing verses, ${manifest.coverage.lemmas} lemmas across 27 books.`);