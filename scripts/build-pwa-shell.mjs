import fs from 'node:fs/promises';
import path from 'node:path';

const VERSION='bg13.0.0';
const OUT=path.resolve('generated/pwa-shell.json');
const html=await fs.readFile('index.html','utf8');
const attrs=[...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map(m=>m[1]);
const local=attrs.filter(x=>!x.startsWith('http:')&&!x.startsWith('https:')&&!x.startsWith('//')&&!x.startsWith('data:')&&!x.startsWith('#'));
const required=['index.html','manifest.webmanifest','icons/pwa-192.png','icons/pwa-512.png','icons/pwa-maskable-512.png','generated/corpus/manifest.json','generated/corpus/frequency.json'];
const assets=[...new Set([...required,...local])].filter(x=>x!=='sw.js').sort();
for(const asset of assets){
  if(asset.startsWith('/'))throw new Error(`Root-absolute PWA asset is not GitHub Pages project-safe: ${asset}`);
  try{await fs.access(asset)}catch{throw new Error(`PWA shell asset missing: ${asset}`)}
}
await fs.mkdir(path.dirname(OUT),{recursive:true});
const payload={schemaVersion:1,version:VERSION,generatedAt:new Date().toISOString(),scopeMode:'relative-project-path',assets};
await fs.writeFile(OUT,JSON.stringify(payload));
console.log(`BG13 PWA shell built: ${assets.length} assets, version ${VERSION}.`);
