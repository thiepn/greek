import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const manifest=JSON.parse(await fs.readFile('manifest.webmanifest','utf8'));
const shell=JSON.parse(await fs.readFile('generated/pwa-shell.json','utf8'));
const sw=await fs.readFile('sw.js','utf8');
const manager=await fs.readFile('pwa-manager.js','utf8');
const offline=await fs.readFile('offline-engine.js','utf8');
const html=await fs.readFile('index.html','utf8');

assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');assert.equal(manifest.display,'standalone');assert.equal(manifest.prefer_related_applications,false);
const iconSizes=new Set(manifest.icons.map(x=>x.sizes));assert(iconSizes.has('192x192'));assert(iconSizes.has('512x512'));assert(manifest.icons.some(x=>x.purpose==='maskable'));
for(const icon of manifest.icons)await fs.access(icon.src);
assert.equal(shell.version,'bg13.0.0');assert(shell.assets.includes('index.html'));assert(shell.assets.includes('generated/corpus/manifest.json'));assert(shell.assets.includes('generated/corpus/frequency.json'));
assert(shell.assets.every(x=>!x.startsWith('/')),'all app-shell paths must remain relative for /greek/ GitHub Pages deployment');
assert.match(sw,/PWA_VERSION='bg13\.0\.0'/);assert.match(sw,/koine-corpus-/);assert.match(sw,/SKIP_WAITING/);assert.doesNotMatch(sw,/localStorage/);
assert.match(manager,/navigator\.storage|requestPersistence/);assert.match(manager,/beforeinstallprompt/);assert.match(manager,/controllerchange/);assert.doesNotMatch(manager,/localStorage\.(?:clear|removeItem)/);
assert.match(offline,/downloadFull/);assert.match(offline,/downloadPack/);assert.match(offline,/clearStale/);assert.doesNotMatch(offline,/localStorage/);
assert.match(html,/rel="manifest" href="manifest\.webmanifest"/);assert.match(html,/pwa\.css/);assert.match(html,/offline-engine\.js/);assert.match(html,/pwa-manager\.js/);
console.log(`BG13 PWA validation passed: ${shell.assets.length} shell assets; install manifest + revision-aware corpus cache verified.`);
