import assert from 'node:assert/strict';
import {chromium,firefox,webkit} from 'playwright';

const BASE=process.env.KOINE_RELEASE_URL||'http://127.0.0.1:4173/greek/';
const engines=[['chromium',chromium],['firefox',firefox],['webkit',webkit]];

async function workspaceSmoke(page,name){
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#main-content');
  await page.waitForTimeout(700);
  const views=await page.locator('.nav button[data-view]').evaluateAll(nodes=>[...new Set(nodes.map(n=>n.dataset.view))]);
  assert(views.length>=12,`${name}: expected expanded BG1–BG14 workspace navigation, got ${views.length}`);
  for(const id of views){
    const button=page.locator(`.nav button[data-view="${id}"]`).first();
    await button.click();
    const host=page.locator(`#${id}`);
    await host.waitFor({state:'visible'});
    assert(await host.evaluate(el=>el.classList.contains('active')),`${name}: ${id} did not become active`);
  }
  return views;
}

async function persistenceSmoke(page,name){
  await page.evaluate(()=>localStorage.setItem('bg16-release-sentinel','preserve'));await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.evaluate(()=>localStorage.getItem('bg16-release-sentinel')),'preserve',`${name}: localStorage state did not survive reload`);
  const learning=await page.evaluate(()=>JSON.parse(localStorage.getItem('koine-path-learning-v3')||'null'));
  assert(learning?.schemaVersion===3,`${name}: canonical learning state missing after reload`);
}

async function legacyMigrationSmoke(browserType,name){
  const browser=await browserType.launch({headless:true});
  const context=await browser.newContext();
  await context.addInitScript(()=>{
    if(!localStorage.getItem('bg16-legacy-seeded')){
      localStorage.removeItem('koine-path-learning-v3');
      localStorage.setItem('koine-path-v01',JSON.stringify({done:['alphabet','article','nouns','verbs','john1'],attempts:11,correct:8,review:[],words:['λόγος']}));
      localStorage.setItem('bg16-legacy-seeded','1');
    }
  });
  const page=await context.newPage();
  await page.goto(BASE,{waitUntil:'domcontentloaded'});await page.waitForSelector('#main-content');
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('koine-path-learning-v3')));
  assert.equal(state.migration.legacyImported,true,`${name}: legacy browser migration did not run`);
  for(const id of ['1','5','7','12','16'])assert.equal(state.units[id].masteredAt,null,`${name}: legacy migration falsely mastered Unit ${id}`);
  await browser.close();
}

async function chromiumOfflineSmoke(page,context){
  const swSupported=await page.evaluate(()=>('serviceWorker'in navigator));
  assert(swSupported,'chromium: Service Worker API unavailable on localhost');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('#main-content');
  assert(await page.evaluate(()=>!!navigator.serviceWorker.controller),'chromium: page is not controlled by service worker after reload');
  await page.locator('.nav button[data-view="read"]').first().click();
  await page.waitForSelector('#reader-text .reader-verse',{timeout:15000});
  const before=await page.locator('#reader-text .reader-verse').count();assert(before>0,'chromium: reader did not render online before offline transition');
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded',timeout:15000});await page.waitForSelector('#main-content',{timeout:15000});
  await page.locator('.nav button[data-view="read"]').first().click();
  await page.waitForSelector('#reader-text .reader-verse',{timeout:15000});
  assert((await page.locator('#reader-text .reader-verse').count())>0,'chromium: cached reader did not recover offline');
  assert.equal(await page.evaluate(()=>localStorage.getItem('bg16-release-sentinel')),'preserve','chromium: offline transition damaged learner-local state');
  await context.setOffline(false);
}

for(const [name,browserType] of engines){
  const browser=await browserType.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await context.newPage();
  const pageErrors=[];page.on('pageerror',err=>pageErrors.push(String(err)));
  await workspaceSmoke(page,name);
  await persistenceSmoke(page,name);
  if(name==='chromium')await chromiumOfflineSmoke(page,context);
  assert.deepEqual(pageErrors,[],`${name}: uncaught page errors: ${pageErrors.join(' | ')}`);
  await browser.close();
  await legacyMigrationSmoke(browserType,name);
  console.log(`BG16 ${name} release smoke passed.`);
}

console.log('BG16 cross-browser release matrix passed: Chromium, Firefox, WebKit; Chromium service-worker/offline recovery verified.');
