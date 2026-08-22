import assert from 'node:assert/strict';
import {chromium,firefox,webkit} from 'playwright';

const BASE=process.env.KOINE_RELEASE_URL||'http://127.0.0.1:4173/greek/';
const engines=[['chromium',chromium],['firefox',firefox],['webkit',webkit]];
const REQUIRED_VIEWS=['today','learn','drill','vocab','read','syntax','fluency','exegesis','audio','tutor','review','progress'];

async function workspaceSmoke(page,name){
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#main-content');
  try{await page.waitForFunction(required=>required.every(id=>document.querySelector(`.nav button[data-view="${id}"]`)&&document.getElementById(id)),REQUIRED_VIEWS,{timeout:5000});}catch{}
  const views=await page.locator('.nav button[data-view]').evaluateAll(nodes=>[...new Set(nodes.map(n=>n.dataset.view))]);
  const missing=REQUIRED_VIEWS.filter(id=>!views.includes(id));
  assert.deepEqual(missing,[],`${name}: missing mandatory workspace(s): ${missing.join(', ')||'none'}; registered: ${views.join(', ')}`);
  for(const id of REQUIRED_VIEWS){
    const button=page.locator(`.nav button[data-view="${id}"]`).first();
    await button.click();
    await page.waitForFunction(viewId=>{const el=document.getElementById(viewId);return !!el&&el.classList.contains('active')&&el.getAttribute('aria-hidden')!=='true'&&!el.hasAttribute('inert');},id);
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
    assert.equal(await page.locator('#lesson-stage .course-checkpoints > .course-checkpoint').count(),3,`${name}: Unit ${id} must render exactly three canonical mastery checkpoints`);
    assert.equal(await page.locator('#lesson-stage .course-practice-item').count(),2,`${name}: Unit ${id} must render exactly two V1.1 supplementary practice items`);
    assert.equal(await page.locator('#lesson-stage .course-practice-item [data-course-q]').count(),0,`${name}: Unit ${id} supplementary practice must not masquerade as canonical checkpoint evidence`);
    assert.equal(await page.locator('#lesson-stage .course-checkpoints [data-course-practice]').count(),0,`${name}: Unit ${id} canonical checkpoint region must not contain supplementary practice controls`);
    assert((await page.locator('#lesson-stage .course-teaching .course-movement').count())>=3,`${name}: Unit ${id} must render substantive teaching movements`);
    assert((await page.locator('#lesson-stage .course-scripture article').count())>=1,`${name}: Unit ${id} must render Scripture transfer`);
    if(id===1)assert.equal(await page.locator('#lesson-stage .course-preview-note').count(),0,`${name}: Unit 1 must be accessible on a clean learner state`);
    if(id>1)assert.equal(await page.locator('#lesson-stage .course-preview-note').count(),1,`${name}: locked Unit ${id} must render preview mode on a clean learner state`);
    await page.locator('#lesson-stage .course-back').click();
    await page.waitForSelector('#lesson-list [data-course-unit]');
  }
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
  await page.evaluate(()=>localStorage.setItem('bg16-release-sentinel','preserve'));
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.evaluate(()=>localStorage.getItem('bg16-release-sentinel')),'preserve',`${name}: localStorage state did not survive reload`);
  const learning=await page.evaluate(()=>JSON.parse(localStorage.getItem('koine-path-learning-v3')||'null'));
  assert(learning?.schemaVersion===3,`${name}: canonical learning state missing after reload`);
}

async function legacyMigrationSmoke(browserType,name){
  const browser=await browserType.launch({headless:true});
  const context=await browser.newContext();
  await context.addInitScript(()=>{if(!localStorage.getItem('bg16-legacy-seeded')){localStorage.removeItem('koine-path-learning-v3');localStorage.setItem('koine-path-v01',JSON.stringify({done:['alphabet','article','nouns','verbs','john1'],attempts:11,correct:8,review:[],words:['λόγος']}));localStorage.setItem('bg16-legacy-seeded','1');}});
  const page=await context.newPage();
  await page.goto(BASE,{waitUntil:'domcontentloaded'});await page.waitForSelector('#main-content');
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('koine-path-learning-v3')));
  assert.equal(state.migration.legacyImported,true,`${name}: legacy browser migration did not run`);
  for(const id of ['1','5','7','12','16'])assert.equal(state.units[id].masteredAt,null,`${name}: legacy migration falsely mastered Unit ${id}`);
  await browser.close();
}

async function chromiumOfflineSmoke(){
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const bootstrap=await context.newPage();
  await bootstrap.goto(BASE,{waitUntil:'domcontentloaded'});await bootstrap.waitForSelector('#main-content');
  assert(await bootstrap.evaluate(()=>('serviceWorker'in navigator)),'chromium-offline: Service Worker API unavailable on localhost');
  await bootstrap.evaluate(async()=>{await navigator.serviceWorker.ready;});

  const page=await context.newPage();
  const pageErrors=[],requestFailures=[],corpusResponses=[];
  page.on('pageerror',err=>pageErrors.push(String(err)));
  page.on('requestfailed',req=>requestFailures.push({url:req.url(),error:req.failure()?.errorText||'unknown'}));
  page.on('response',res=>{if(res.url().includes('/generated/corpus/'))corpusResponses.push({url:res.url(),status:res.status(),ok:res.ok()});});
  await page.goto(BASE,{waitUntil:'domcontentloaded'});await page.waitForSelector('#main-content');
  assert(await page.evaluate(()=>!!navigator.serviceWorker.controller),'chromium-offline: fresh installed launch is not controlled by service worker');
  await bootstrap.close().catch(()=>{});
  await page.evaluate(()=>localStorage.setItem('bg16-release-sentinel','preserve'));

  const probes=await page.evaluate(async()=>{
    const targets=['./generated/corpus/manifest.json','./generated/corpus/frequency.json','./generated/corpus/books/John.json'];
    return Promise.all(targets.map(async url=>{
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5000);const started=performance.now();
      try{const r=await fetch(url,{signal:controller.signal});const text=await r.text();return{url,status:r.status,ok:r.ok,bytes:text.length,ms:Math.round(performance.now()-started)}}
      catch(err){return{url,error:String(err),ms:Math.round(performance.now()-started)}}finally{clearTimeout(timer)}
    }));
  });
  console.log('BG16 controlled corpus probes:',JSON.stringify(probes));

  await page.locator('.nav button[data-view="read"]').first().click();
  try{await page.waitForSelector('#reader-text .reader-verse',{timeout:15000});}
  catch(err){
    const diagnostic=await page.evaluate(()=>({
      online:navigator.onLine,
      controlled:!!navigator.serviceWorker.controller,
      controller:navigator.serviceWorker.controller?.scriptURL||null,
      readActive:document.getElementById('read')?.classList.contains('active')||false,
      readerStatus:document.getElementById('reader-corpus-status')?.textContent||null,
      readerText:document.getElementById('reader-text')?.textContent?.slice(0,500)||null,
      selectedBook:document.getElementById('reader-book')?.value||null,
      selectedChapter:document.getElementById('reader-chapter')?.value||null,
      api:Object.keys(globalThis.KOINE_FULL_READER||{})
    }));
    console.error('BG16 controlled reader diagnostics:',JSON.stringify({diagnostic,pageErrors,requestFailures,corpusResponses,probes},null,2));
    throw err;
  }
  assert((await page.locator('#reader-text .reader-verse').count())>0,'chromium-offline: reader did not render online under service-worker control');

  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});await page.waitForSelector('#main-content',{timeout:30000});
  assert(await page.evaluate(()=>!!navigator.serviceWorker.controller),'chromium-offline: offline reload lost service-worker control');
  await page.locator('.nav button[data-view="read"]').first().click();
  await page.waitForSelector('#reader-text .reader-verse',{timeout:30000});
  assert((await page.locator('#reader-text .reader-verse').count())>0,'chromium-offline: cached reader did not recover offline');
  assert.equal(await page.evaluate(()=>localStorage.getItem('bg16-release-sentinel')),'preserve','chromium-offline: offline transition damaged learner-local state');
  assert.deepEqual(pageErrors,[],`chromium-offline: uncaught page errors: ${pageErrors.join(' | ')}`);
  await context.setOffline(false);await browser.close();
  console.log('BG16 chromium isolated service-worker/offline reader smoke passed.');
}

for(const [name,browserType] of engines){
  const browser=await browserType.launch({headless:true});const context=await browser.newContext({viewport:{width:1280,height:900}});const page=await context.newPage();
  const pageErrors=[];page.on('pageerror',err=>pageErrors.push(String(err)));
  await workspaceSmoke(page,name);await courseSmoke(page,name,name==='chromium');await persistenceSmoke(page,name);
  assert.deepEqual(pageErrors,[],`${name}: uncaught page errors: ${pageErrors.join(' | ')}`);
  await browser.close();await legacyMigrationSmoke(browserType,name);console.log(`BG16 ${name} release smoke passed.`);
}

await chromiumOfflineSmoke();
console.log('V1.1.0 cross-browser release matrix passed: all 12 mandatory workspaces in Chromium/Firefox/WebKit; canonical mastery checkpoints remain distinct from V1.1 supplementary practice; Chromium exercised all 50 course units; Firefox/WebKit representative course views; isolated Chromium service-worker/offline recovery verified.');
