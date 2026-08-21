const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p));
const readText=p=>read(p).toString('utf8');
const json=p=>JSON.parse(readText(p));
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const loadWindow=(file,key)=>{const context={window:{}};vm.createContext(context);vm.runInContext(readText(file),context,{filename:file});return context.window[key]};

const curriculum=loadWindow('curriculum.js','KOINE_CURRICULUM');
const morph=require('../data/morphology-lab-data.js');require('../data/morphology-bg15-corrections.js')(morph);
const vocab=require('../data/vocabulary-seed.js');
const syntax=require('../data/syntax-lab-data.js');
const fluency=require('../data/fluency-programs.js');
const exegesis=require('../data/exegesis-lab-data.js');
const pronunciation=loadWindow('data/pronunciation-profiles.js','KOINE_PRONUNCIATION_DATA');
const greek=require('../data/greek-data.js');

const sourcePaths=[
  'curriculum.js','data/greek-data.js','data/morphology-lab-data.js','data/morphology-bg15-corrections.js',
  'data/vocabulary-seed.js','data/syntax-lab-data.js','data/fluency-programs.js','data/exegesis-lab-data.js',
  'data/pronunciation-profiles.js','scripts/build-full-corpus.mjs','ATTRIBUTION.md','CONTENT_QA.md'
].sort();
const sourceFiles=Object.fromEntries(sourcePaths.map(p=>{const b=read(p);return[p,{sha256:sha(b),bytes:b.length}]}));

const corpusManifest=json('generated/corpus/manifest.json');
const frequencyBytes=read('generated/corpus/frequency.json');
const lexicalBytes=read('generated/corpus/lexical-index.json');
const semanticManifest=JSON.parse(JSON.stringify(corpusManifest));delete semanticManifest.generatedAt;
const books=corpusManifest.books.map(b=>{const bytes=read(`generated/corpus/books/${b.id}.json`);return{id:b.id,sha256:sha(bytes),bytes:bytes.length}});
const bookSetSha256=sha(books.map(x=>`${x.id}:${x.sha256}`).join('\n'));

const manifest={
  schemaVersion:1,
  contentQaVersion:'bg15.0',
  policy:{
    status:'deterministic-content-QA-snapshot',
    externalPeerReview:false,
    note:'Passing this manifest/CI means the declared reviewed content, source provenance, normalization, and pedagogical safeguards match the BG15 contract. It is not a claim of external scholarly peer review.'
  },
  sourceRevisions:{
    morphgnt:greek.sources.morphgnt.revision,
    coreGntVocab:vocab.source.commit,
    sblgntEditionComparison:exegesis.apparatus.revision
  },
  counts:{
    curriculumUnits:curriculum.stages.reduce((n,s)=>n+s.units.length,0),
    morphologyParses:morph.items.length,
    principalPartLexemes:Object.keys(morph.principalParts).length,
    syntaxExercises:syntax.exercises.length,
    fluencyCheckpoints:fluency.passages.length,
    exegesisCases:exegesis.cases.length,
    textualVariantCases:exegesis.cases.filter(x=>x.variant).length,
    pronunciationProfiles:Object.keys(pronunciation.profiles).length,
    pronunciationDrills:pronunciation.drills.length,
    listeningCheckpoints:pronunciation.listeningComprehension.length,
    vocabularyFallbackEntries:vocab.entries.length
  },
  sourceFiles,
  corpus:{
    sourceRevision:corpusManifest.source.revision,
    coverage:corpusManifest.coverage,
    semanticManifestSha256:sha(JSON.stringify(semanticManifest)),
    frequencySha256:sha(frequencyBytes),
    lexicalIndexSha256:sha(lexicalBytes),
    bookSetSha256,
    books
  }
};
manifest.certifiedContentFingerprint=sha(JSON.stringify(manifest));
const out=path.join(ROOT,'generated','content-qa-manifest.json');
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(manifest,null,2)+'\n');
console.log(`BG15 content QA manifest generated: ${manifest.certifiedContentFingerprint}`);
console.log(`Coverage: ${manifest.counts.curriculumUnits} units, ${manifest.counts.morphologyParses} morphology parses, ${manifest.counts.syntaxExercises} syntax exercises, ${manifest.counts.fluencyCheckpoints} fluency checkpoints, ${manifest.counts.exegesisCases} exegesis cases.`);