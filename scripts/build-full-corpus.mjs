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
let totalTokens=0,totalVerses=0;

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
    totalTokens++;
  }
  const chapterNumbers=Object.keys(chapters).map(Number).sort((a,b)=>a-b);
  const verseCount=chapterNumbers.reduce((sum,c)=>sum+Object.keys(chapters[String(c)]).length,0);
  const book={schemaVersion:1,sourceRevision:REVISION,book:{index:bookIndex+1,id,name,file,chapters:chapterNumbers.length,verses:verseCount,tokens:rows.length},chapters};
  await fs.writeFile(path.join(OUT,'books',`${id}.json`),JSON.stringify(book));
  manifestBooks.push(book.book);
}

const ranked=[...frequency.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'el')).map(([lemma,count],i)=>({lemma,count,rank:i+1,band:i<100?'F1':i<300?'F2':i<600?'F3':i<1000?'F4':'F5'}));
const manifest={
  schemaVersion:1,datasetVersion:'bg6.0.0',generatedAt:new Date().toISOString(),unicodeNormalization:'NFC',
  source:{text:'SBLGNT',morphology:'MorphGNT: SBLGNT Edition 6.12',revision:REVISION,licenseText:'CC BY 4.0',licenseMorphology:'CC BY-SA 3.0'},
  coverage:{books:manifestBooks.length,chapters:manifestBooks.reduce((s,b)=>s+b.chapters,0),verses:totalVerses,tokens:totalTokens,lemmas:ranked.length,fullCorpusIngested:true},
  books:manifestBooks
};
await fs.writeFile(path.join(OUT,'manifest.json'),JSON.stringify(manifest));
await fs.writeFile(path.join(OUT,'frequency.json'),JSON.stringify({schemaVersion:1,sourceRevision:REVISION,countingUnit:'lemma',tokens:totalTokens,entries:ranked}));
console.log(`BG6 corpus built: ${manifest.coverage.books} books, ${manifest.coverage.chapters} chapters, ${manifest.coverage.verses} verses, ${totalTokens} tokens, ${ranked.length} lemmas.`);
