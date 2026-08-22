import fs from 'node:fs/promises';
import path from 'node:path';

const REVISION='aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d';
const BASE=`https://raw.githubusercontent.com/morphgnt/sblgnt/${REVISION}`;
const OUT=path.resolve('generated/corpus');
const BOOKS=[
  ['61-Mt-morphgnt.txt','Matt','Matthew'],['62-Mk-morphgnt.txt','Mark','Mark'],['63-Lk-morphgnt.txt','Luke','Luke'],['64-Jn-morphgnt.txt','John','John'],['65-Ac-morphgnt.txt','Acts','Acts'],['66-Ro-morphgnt.txt','Rom','Romans'],['67-1Co-morphgnt.txt','1Cor','1 Corinthians'],['68-2Co-morphgnt.txt','2Cor','2 Corinthians'],['69-Ga-morphgnt.txt','Gal','Galatians'],['70-Eph-morphgnt.txt','Eph','Ephesians'],['71-Php-morphgnt.txt','Phil','Philippians'],['72-Col-morphgnt.txt','Col','Colossians'],['73-1Th-morphgnt.txt','1Thess','1 Thessalonians'],['74-2Th-morphgnt.txt','2Thess','2 Thessalonians'],['75-1Ti-morphgnt.txt','1Tim','1 Timothy'],['76-2Ti-morphgnt.txt','2Tim','2 Timothy'],['77-Tit-morphgnt.txt','Titus','Titus'],['78-Phm-morphgnt.txt','Phlm','Philemon'],['79-Heb-morphgnt.txt','Heb','Hebrews'],['80-Jas-morphgnt.txt','Jas','James'],['81-1Pe-morphgnt.txt','1Pet','1 Peter'],['82-2Pe-morphgnt.txt','2Pet','2 Peter'],['83-1Jn-morphgnt.txt','1John','1 John'],['84-2Jn-morphgnt.txt','2John','2 John'],['85-3Jn-morphgnt.txt','3John','3 John'],['86-Jud-morphgnt.txt','Jude','Jude'],['87-Re-morphgnt.txt','Rev','Revelation']
];

const ensure=async p=>fs.mkdir(p,{recursive:true});
const nfc=s=>s.normalize('NFC');
function codepointCompare(a,b){const A=Array.from(a),B=Array.from(b),n=Math.min(A.length,B.length);for(let i=0;i<n;i++){const x=A[i].codePointAt(0),y=B[i].codePointAt(0);if(x!==y)return x-y}return A.length-B.length}

function parseRow(line,bookId){
  const parts=line.trim().split(/\s+/);
  if(parts.length<7) throw new Error(`Malformed MorphGNT row: ${line}`);
  const [ref,posCode,parseCode,text,word,normalized,...lemmaParts]=parts;
  const lemma=nfc(lemmaParts.join(' '));
  const chapter=Number(ref.slice(2,4));
  const verse=Number(ref.slice(4,6));
  if(!chapter||!verse) throw new Error(`Bad reference ${ref}`);
  return {chapter,verse,posCode,parseCode,text:nfc(text),word:nfc(word),normalized:nfc(normalized),lemma};
}

async function fetchText(file){
  const response=await fetch(`${BASE}/${file}`);
  if(!response.ok) throw new Error(`Failed ${file}: HTTP ${response.status}`);
  return response.text();
}

await fs.rm(OUT,{recursive:true,force:true});
await ensure(path.join(OUT,'books'));
const manifestBooks=[];
const frequency=new Map();
const lexical=new Map();
let totalTokens=0,totalVerses=0;

function lexemeRecord(lemma){
  if(!lexical.has(lemma))lexical.set(lemma,{count:0,books:new Map(),sampleRefs:[],sampleRefSet:new Set(),nearby:new Map()});
  return lexical.get(lemma);
}
function recordLexeme(token,bookId){
  const x=lexemeRecord(token.lemma),ref=`${bookId}.${token.chapter}.${token.verse}`;
  x.count++;x.books.set(bookId,(x.books.get(bookId)||0)+1);
  if(x.sampleRefs.length<40&&!x.sampleRefSet.has(ref)){x.sampleRefSet.add(ref);x.sampleRefs.push(ref)}
}
function recordNearby(tokens){
  const window=3;
  for(let i=0;i<tokens.length;i++){
    const x=lexemeRecord(tokens[i].lemma);
    for(let j=Math.max(0,i-window);j<=Math.min(tokens.length-1,i+window);j++){
      if(i===j||tokens[j].lemma===tokens[i].lemma)continue;
      x.nearby.set(tokens[j].lemma,(x.nearby.get(tokens[j].lemma)||0)+1);
    }
  }
}

for(let bookIndex=0;bookIndex<BOOKS.length;bookIndex++){
  const [file,id,name]=BOOKS[bookIndex];
  const raw=await fetchText(file);
  const rows=raw.split(/\r?\n/).filter(Boolean).map(line=>parseRow(line,id));
  const chapters={};
  let lastVerseKey=null,verseTokenPosition=0;
  for(const row of rows){
    const c=String(row.chapter),v=String(row.verse),verseKey=`${c}.${v}`;
    chapters[c]??={};chapters[c][v]??=[];
    if(verseKey!==lastVerseKey){verseTokenPosition=0;totalVerses++;lastVerseKey=verseKey;}
    verseTokenPosition++;
    const token={
      id:`sblgnt.${id}.${row.chapter}.${row.verse}.${String(verseTokenPosition).padStart(3,'0')}`,
      position:verseTokenPosition,
      text:row.text,word:row.word,normalized:row.normalized,lemma:row.lemma,
      posCode:row.posCode,parseCode:row.parseCode
    };
    chapters[c][v].push(token);
    frequency.set(row.lemma,(frequency.get(row.lemma)||0)+1);
    recordLexeme({...token,chapter:row.chapter,verse:row.verse},id);
    totalTokens++;
  }
  for(const chapter of Object.values(chapters))for(const verseTokens of Object.values(chapter))recordNearby(verseTokens);
  const chapterNumbers=Object.keys(chapters).map(Number).sort((a,b)=>a-b);
  const verseCount=chapterNumbers.reduce((sum,c)=>sum+Object.keys(chapters[String(c)]).length,0);
  const book={schemaVersion:1,sourceRevision:REVISION,book:{index:bookIndex+1,id,name,file,chapters:chapterNumbers.length,verses:verseCount,tokens:rows.length},chapters};
  await fs.writeFile(path.join(OUT,'books',`${id}.json`),JSON.stringify(book));
  manifestBooks.push(book.book);
}

const ranked=[...frequency.entries()].sort((a,b)=>b[1]-a[1]||codepointCompare(a[0],b[0])).map(([lemma,count],i)=>({lemma,count,rank:i+1,band:i<100?'F1':i<300?'F2':i<600?'F3':i<1000?'F4':'F5'}));
const lexicalEntries=ranked.map(r=>{const x=lexical.get(r.lemma);return{...r,books:[...x.books.entries()].sort((a,b)=>b[1]-a[1]||codepointCompare(a[0],b[0])).map(([book,count])=>({book,count})),sampleRefs:x.sampleRefs,nearbyLemmas:[...x.nearby.entries()].sort((a,b)=>b[1]-a[1]||codepointCompare(a[0],b[0])).slice(0,12).map(([lemma,count])=>({lemma,count}))}});
const manifest={
  schemaVersion:1,datasetVersion:'bg6.0.0',generatedAt:new Date().toISOString(),unicodeNormalization:'NFC',
  source:{text:'SBLGNT surface embedded in pinned MorphGNT snapshot',morphology:'MorphGNT: SBLGNT Edition 6.12',revision:REVISION,snapshotLabel:`MorphGNT ${REVISION}`,snapshotNote:'This reader reproduces the SBLGNT surface text present in the pinned MorphGNT revision. It is not an assertion that the snapshot equals the latest official SBLGNT release.',licenseText:'CC BY 4.0',licenseMorphology:'CC BY-SA 3.0'},
  coverage:{books:manifestBooks.length,chapters:manifestBooks.reduce((s,b)=>s+b.chapters,0),verses:totalVerses,tokens:totalTokens,lemmas:ranked.length,fullCorpusIngested:true},
  vocabularyOrdering:{primary:'occurrence-count-descending',tieBreak:'normalized-lemma-codepoint-order'},
  books:manifestBooks
};
await fs.writeFile(path.join(OUT,'manifest.json'),JSON.stringify(manifest));
await fs.writeFile(path.join(OUT,'frequency.json'),JSON.stringify({schemaVersion:1,sourceRevision:REVISION,countingUnit:'lemma',tieBreak:'normalized-lemma-codepoint-order',tokens:totalTokens,entries:ranked}));
await fs.writeFile(path.join(OUT,'lexical-index.json'),JSON.stringify({schemaVersion:1,datasetVersion:'bg11.0.0',sourceRevision:REVISION,countingUnit:'lemma',tieBreak:'normalized-lemma-codepoint-order',nearbyWindowTokens:3,sampleRefsLimit:40,note:'nearbyLemmas are raw ±3-token co-occurrence counts, not semantic definitions or normalized association scores',entries:lexicalEntries}));
console.log(`BG6 corpus built: ${manifest.coverage.books} books, ${manifest.coverage.chapters} chapters, ${manifest.coverage.verses} verses, ${totalTokens} tokens, ${ranked.length} lemmas. BG11 lexical index generated.`);