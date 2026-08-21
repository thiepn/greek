import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const manifest=JSON.parse(await fs.readFile('manifest.webmanifest','utf8'));
const shell=JSON.parse(await fs.readFile('generated/pwa-shell.json','utf8'));
const versionScript=await fs.readFile('generated/pwa-version.js','utf8');
const sw=await fs.readFile('sw.js','utf8');
const manager=await fs.readFile('pwa-manager.js','utf8');
const offline=await fs.readFile('offline-engine.js','utf8');
const html=await fs.readFile('index.html','utf8');

assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');assert.equal(manifest.display,'standalone');assert.equal(manifest.prefer_related_applications,false);
const iconSizes=new Set(manifest.icons.map(x=>x.sizes));assert(iconSizes.has('192x192'));assert(iconSizes.has('512x512'));assert(manifest.icons.some(x=>x.purpose==='maskable'));
for(const icon of manifest.icons){const buf=await fs.readFile(icon.src);assert.equal(buf.toString('hex',0,8),'89504e470d0a1a0a',`${icon.src} must be PNG`);const [w,h]=[buf.readUInt32BE(16),buf.readUInt32BE(20)];const expected=icon.sizes.split('x').map(Number);assert.deepEqual([w,h],expected,`${icon.src} dimensions must match manifest`)}
assert.match(shell.version,/^bg13-(?:[0-9a-f]{12}|dev)$/);assert(versionScript.includes(JSON.stringify(shell.version)),'service-worker imported version must match shell version');
assert(shell.assets.includes('index.html'));assert(shell.assets.includes('generated/corpus/manifest.json'));assert(shell.assets.includes('generated/corpus/frequency.json'));
assert(shell.assets.every(x=>!x.startsWith('/')),'all app-shell paths must remain relative for /greek/ GitHub Pages deployment');
assert.match(sw,/importScripts\('\.\/generated\/pwa-version\.js'\)/);assert.match(sw,/koine-corpus-/);assert.match(sw,/SKIP_WAITING/);assert.doesNotMatch(sw,/localStorage/);
assert.match(manager,/updateViaCache:'none'/);assert.match(manager,/navigator\.storage|requestPersistence/);assert.match(manager,/beforeinstallprompt/);assert.match(manager,/controllerchange/);assert.doesNotMatch(manager,/localStorage\.(?:clear|removeItem)/);
assert.match(offline,/downloadFull/);assert.match(offline,/downloadPack/);assert.match(offline,/clearStale/);assert.doesNotMatch(offline,/localStorage/);
assert.match(html,/rel="manifest" href="manifest\.webmanifest"/);assert.match(html,/pwa\.css/);assert.match(html,/offline-engine\.js/);assert.match(html,/pwa-manager\.js/);
console.log(`BG13 PWA validation passed: ${shell.assets.length} shell assets; install manifest + deployment-aware updates + revision-aware corpus cache verified.`);
