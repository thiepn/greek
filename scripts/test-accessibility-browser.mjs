import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const URL=process.env.KOINE_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
async function openContext(viewport,{mobile=false}={}){
  const context=await browser.newContext({viewport,hasTouch:mobile,isMobile:mobile,serviceWorkers:'block'});
  await context.addInitScript(()=>{if(!localStorage.getItem('koine-path-accessibility-v1'))localStorage.setItem('koine-path-accessibility-v1',JSON.stringify({motion:'on',contrast:'system',textSize:'normal'}))});
  const page=await context.newPage();await page.goto(URL,{waitUntil:'networkidle'});await page.waitForTimeout(250);return{context,page};
}
async function axe(page,label){
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).disableRules(['target-size']).analyze();
  assert.equal(result.violations.length,0,`${label} axe violations:\n${result.violations.map(v=>`${v.id}: ${v.help}\n${v.nodes.map(n=>n.target.join(' ')).join('\n')}`).join('\n\n')}`);
}
{
  const {context,page}=await openContext({width:1280,height:900});
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.classList.contains('skip-link')),true,'first Tab stop should be Skip to main content');
  await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement?.id),'main-content');
  await page.evaluate(()=>window.openView('read'));await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>document.activeElement?.tagName),'H1','view changes should focus the active heading');
  assert.equal(await page.locator('#reader-text').getAttribute('lang'),'grc','reader Greek must expose Ancient Greek language metadata');
  await axe(page,'desktop Read');
  await page.evaluate(()=>window.openView('today'));await page.waitForTimeout(60);await axe(page,'desktop Today');
  await page.getByRole('button',{name:'Accessibility settings'}).click();await page.locator('#a11y-text').selectOption('large');await page.getByRole('button',{name:'Close accessibility settings'}).click();assert.equal(await page.evaluate(()=>document.documentElement.dataset.textSize),'large');
  await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>document.documentElement.dataset.textSize),'large','accessibility preferences should survive reload');
  await context.close();
}
{
  const {context,page}=await openContext({width:390,height:844},{mobile:true});
  const trigger=page.getByRole('button',{name:'Menu'});assert.equal(await trigger.isVisible(),true,'mobile menu trigger must be visible');await trigger.click();
  const dialog=page.locator('#mobile-nav-dialog');assert.equal(await dialog.evaluate(el=>el.open),true,'mobile nav should use an open modal dialog');assert.equal(await trigger.getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>{const dialog=document.querySelector('#mobile-nav-dialog'),trigger=document.querySelector('.mobile-nav-trigger');return dialog&&!dialog.open&&trigger?.getAttribute('aria-expanded')==='false'&&document.activeElement===trigger});
  assert.equal(await dialog.evaluate(el=>el.open),false);assert.equal(await trigger.getAttribute('aria-expanded'),'false');assert.equal(await page.evaluate(()=>document.activeElement?.classList.contains('mobile-nav-trigger')),true,'closing mobile navigation should restore trigger focus');
  const visibleTargets=await page.locator('button:visible,select:visible,input:visible,summary:visible').evaluateAll(nodes=>nodes.map(el=>({tag:el.tagName,cls:el.className,w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height,text:(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,40)})).filter(x=>!String(x.cls).includes('word')&&!String(x.cls).includes('fluency-token')&&(x.w<24||x.h<24)));
  assert.deepEqual(visibleTargets,[],`visible non-inline pointer targets under 24px: ${JSON.stringify(visibleTargets)}`);
  await axe(page,'mobile Today');await context.close();
}
{
  const {context,page}=await openContext({width:320,height:800},{mobile:true});
  const views=await page.evaluate(()=>[...new Set([...document.querySelectorAll('.nav button[data-view]')].map(b=>b.dataset.view))]);
  const failures=[];
  for(const id of views){await page.evaluate(id=>window.openView(id),id);await page.waitForTimeout(90);const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));if(overflow.scroll>overflow.client+2)failures.push({id,...overflow})}
  assert.deepEqual(failures,[],`320px reflow failures: ${JSON.stringify(failures)}`);
  await page.evaluate(()=>window.openView('review'));await page.waitForTimeout(60);await axe(page,'320px Review');
  await context.close();
}
await browser.close();console.log('BG14 browser accessibility tests passed: focus, mobile dialog, touch targets, axe, preference persistence, and 320px reflow.');