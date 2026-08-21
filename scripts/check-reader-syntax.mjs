import {execFileSync} from 'node:child_process';
for(const file of ['canonical-reader.js','vocabulary-ui.js','scripts/build-full-corpus.mjs','scripts/validate-full-corpus.mjs']){
  execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
}
console.log('BG6 reader/runtime syntax checks passed.');
