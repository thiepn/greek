import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const BASE=process.env.KOINE_LEARNING_URL||'http://127.0.0.1:4173/greek/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
const page=await context.newPage();
const pageErrors=[];
page.on('pageerror',e=>pageErrors.push(String(e)));

await page.goto(BASE,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.KOINE_COURSE_UI&&window.KOINE_COURSE_ENRICHMENT?.unitCount===50&&typeof window.openView==='function');
await page.evaluate(()=>{window.openView('learn');window.KOINE_COURSE_UI.openUnit(1)});
await page.waitForSelector('#learn.active .course-observe-card');

assert.equal(await page.locator('[data-course-practice]').count(),8,'Unit 1 should render two four-choice supplementary practice items');
assert.equal(await page.locator('.course-practice-item').count(),2,'Unit 1 should render exactly two supplementary practice items');
assert.equal(await page.locator('.course-observe-card').count(),1,'Unit 1 missing Observe');
assert.equal(await page.locator('.course-contrast-pair').count(),1,'Unit 1 missing Contrast');
assert.equal(await page.locator('.course-reasoning-input').count(),1,'Unit 1 missing reasoning generation');
assert.equal(await page.locator('.course-reread').count(),1,'Unit 1 missing read-again transfer');

const beforePractice=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));
await page.locator('[data-course-practice="u1.p1"]').first().click();
await page.waitForSelector('.course-practice-item .course-feedback');
const afterPractice=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));
assert.equal(afterPractice,beforePractice,'supplementary practice must not alter canonical learner evidence');

await page.locator('[data-course-q="u1.q1"]').first().click();
await page.waitForSelector('.course-checkpoint .course-feedback');
const afterCanonical=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));
assert.notEqual(afterCanonical,beforePractice,'canonical checkpoint should still write learner evidence');

for(let id=1;id<=50;id++){
  await page.evaluate(unit=>window.KOINE_COURSE_UI.openUnit(unit),id);
  await page.waitForFunction(unit=>document.querySelector('.course-lesson-head span')?.textContent.includes(`Unit ${unit} `),id);
  assert.equal(await page.locator('.course-practice-item').count(),2,`Unit ${id} supplementary practice count`);
  assert.equal(await page.locator('.course-observe-card').count(),1,`Unit ${id} Observe count`);
  assert.equal(await page.locator('.course-contrast-pair').count(),1,`Unit ${id} Contrast count`);
  assert.equal(await page.locator('.course-reasoning-input').count(),1,`Unit ${id} reasoning count`);
  assert.equal(await page.locator('.course-reread').count(),1,`Unit ${id} reread count`);
}

await page.setViewportSize({width:390,height:844});
for(const id of [1,25,50]){
  await page.evaluate(unit=>window.KOINE_COURSE_UI.openUnit(unit),id);
  await page.waitForTimeout(40);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert(overflow<=2,`Unit ${id} causes mobile horizontal overflow: ${overflow}px`);
}

assert.deepEqual(pageErrors,[],`uncaught browser errors: ${pageErrors.join(' | ')}`);
await browser.close();
console.log('V1.1 browser certification passed: all 50 Learn experiences render; supplementary practice leaves mastery untouched; mobile reflow holds.');