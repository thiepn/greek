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
    await page.waitForFunction(viewId=>{
      const el=document.getElementById(viewId);
      return !!el&&el.classList.contains('active')&&el.getAttribute('aria-hidden')!=='true'&&!el.hasAttribute('inert');
    },id);
    const state=await page.locator(`#${id}`).evaluate(el=>({active:el.classList.contains('active'),ariaHidden:el.getAttribute('aria-hidden'),inert:el.hasAttribute('inert')}));
    assert(state.active&&state.ariaHidden!=='true'&&!state.inert,`${name}: ${id} did not become the accessible active workspace`);
  }
  return views;
}

async function courseSmoke(page,name,allUnits=false){
  await page.locator('.nav button[data-view="learn"]').first().click();
  await page.waitForSelector('#lesson-list [data-course-unit]');
  const unitCount=await page.locator('#lesson-list [data-course-unit]').count();
  assert.equal(unitCount,50,`${name}: Learn workspace must expose exactly 50 canonical units`);

  const unitIds=allUnits?Array.from({length:50},(_,i)=>i+1):[1,12,30,50];
  for(const id of unitIds){
    await page.locator(`#lesson-list [data-course-unit="${id}"]`).click();
    await page.waitForSelector('#lesson-stage:not([hidden]) .course-lesson');
    assert.equal(await page.locator('#lesson-stage .course-checkpoint').count(),3,`${name}: Unit ${id} must render exactly three deterministic checkpoints`);
    assert((await page.locator('#lesson-stage .course-teaching .course-movement').count())>=3,`${name}: Unit ${id} must render substantive teaching movements`);
    assert((await page.locator('#lesson-stage .course-scripture article').count())>=1,`${name}: Unit ${id} must render Scripture transfer`);
    if(id===1)assert.equal(await page.locator('#lesson-stage .course-preview-note').count(),0,`${name}: Unit 1 must be accessible on a clean learner state`);
    if(id>1)assert.equal(await page.locator('#lesson-stage .course-preview-note').count(),1,`${name}: locked Unit ${id} must render preview mode on a clean learner state`);
    await page.locator('#lesson-stage .course-back').click();
    await page.waitForSelector('#lesson-list [data-course-unit]');
  }

  // A locked checkpoint must remain exposure-only and never manufacture mastery.
  await page.locator('#lesson-list [data-course-unit="50"]').click();
  await page.waitForSelector('#lesson-stage:not([hidden]) .course-lesson');
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('koine-path-learning-v3')).units['50']);
  await page.locator('#lesson-stage [data-course-q="u50.q1"]').first().click();
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('koine-path-learning-v3')).units['50']);
  assert.equal(after.masteredAt,null,`${name}: preview checkpoint must not master Unit 50`);
  assert.deepEqual(after.dimensions,before.dimensions,`${name}: preview checkpoint must not alter Unit 50 mastery dimensions`);
  await page.locator('#lesson-stage .course-back').click();
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
  await courseSmoke(page,name,name==='chromium');
  await persistenceSmoke(page,name);
  if(name==='chromium')await chromiumOfflineSmoke(page,context);
  assert.deepEqual(pageErrors,[],`${name}: uncaught page errors: ${pageErrors.join(' | ')}`);
  await browser.close();
  await legacyMigrationSmoke(browserType,name);
  console.log(`BG16 ${name} release smoke passed.`);
}

console.log('BG16-B001 cross-browser release matrix passed: Chromium exercised all 50 course units; Firefox/WebKit representative course views; Chromium service-worker/offline recovery verified.');
