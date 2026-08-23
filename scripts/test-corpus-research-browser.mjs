import {chromium} from 'playwright';
const url=process.env.KOINE_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:900},acceptDownloads:true});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto(url,{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.KOINE_FULL_READER?.manifest?.books?.length===27&&window.KOINE_CORPUS_RESEARCH_UI&&window.KOINE_PASSAGE_WORKBENCH,{timeout:18000});
const learningBefore=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));
await page.evaluate(()=>window.KOINE_PASSAGE_WORKBENCH.createProject({book:'John',chapter:1,startVerse:1,endVerse:4},{title:'John 1 research project'}));
await page.evaluate(()=>window.KOINE_APP_OPEN_VIEW('research'));
await page.getByRole('heading',{name:'Compare evidence without losing provenance.',exact:true}).waitFor();
await page.locator('#research-mode').selectOption('lemma');
await page.locator('#research-query').fill('λόγος');
await page.locator('#research-book').selectOption('');
await page.locator('#research-run').click();
await page.locator('#research-search-status').filter({hasText:/exact hit/}).waitFor({timeout:20000});
const resultCount=await page.locator('.research-result').count();if(resultCount<20)throw new Error(`Expected many λόγος corpus hits, found ${resultCount}.`);
let learningAfter=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));if(learningAfter!==learningBefore)throw new Error('Corpus search mutated canonical learning state.');

await page.locator('#research-save-search').click();
await page.locator('[data-research-save-hit]').first().click();
await page.locator('.research-notebook-list .research-entry').first().waitFor();
const savedSearches=await page.evaluate(()=>window.KOINE_CORPUS_RESEARCH.snapshot().savedSearches);if(savedSearches.length!==1||savedSearches[0].query!=='λόγος'||savedSearches[0].resultCount<20)throw new Error('Saved corpus search did not preserve query/result metadata.');

const compareButtons=page.locator('[data-research-compare]');await compareButtons.nth(0).click();for(let i=1;i<Math.min(8,await compareButtons.count());i++){await compareButtons.nth(i).click();const chips=await page.locator('.research-compare-chip').count();if(chips>=2)break}if(await page.locator('.research-compare-chip').count()<2)throw new Error('Unable to build a two-passage comparison from corpus hits.');
await page.locator('#research-analyze-compare').click();
await page.locator('#research-compare-analysis .research-compare-card').first().waitFor({timeout:10000});
await page.locator('#research-compare-note').fill('Shared lemma evidence is descriptive; contextual sense must still be argued passage by passage.');
await page.locator('#research-save-comparison-entry').click();

await page.locator('#research-ext-title').fill('Reference grammar');
await page.locator('#research-ext-citation').fill('Example Author, Reference Grammar, 2nd ed.');
await page.locator('#research-ext-locator').fill('§12');
await page.locator('#research-ext-url').fill('https://example.com/grammar');
await page.locator('#research-ext-note').fill('External terminology note; not canonical corpus evidence.');
await page.locator('#research-add-external').click();
await page.locator('#research-learner-title').fill('Working observation');
await page.locator('#research-learner-note').fill('The repeated lemma invites comparison, but identical lemma does not guarantee identical contextual sense.');
await page.locator('#research-add-learner').click();
const provenance=await page.evaluate(()=>window.KOINE_CORPUS_RESEARCH.snapshot().entries.map(e=>e.provenance));for(const type of ['corpus','external','learner'])if(!provenance.includes(type))throw new Error(`Missing ${type} provenance entry.`);
const linked=await page.evaluate(()=>{const p=window.KOINE_PASSAGE_WORKBENCH.getProject();return window.KOINE_CORPUS_RESEARCH.entriesForProject(p.id)});if(linked.length<3)throw new Error('Research notebook entries were not linked to the active V1.7 project.');
learningAfter=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));if(learningAfter!==learningBefore)throw new Error('Saving research notes mutated canonical learning state.');

const malformedRejected=await page.evaluate(()=>{try{window.KoineDataPortability.validateStores({'koine-path-corpus-research-v1':JSON.stringify({schemaVersion:99,savedSearches:[],comparisons:[],entries:[]})});return false}catch{return true}});if(!malformedRejected)throw new Error('V1.8 portability guard accepted malformed research state.');
const backupState=await page.evaluate(()=>({backup:JSON.parse(window.KoineDataPortability.serializeBackup(localStorage,{appVersion:'old'})),hasSynthesis:Boolean(window.KoineResearchSynthesis),hasSourceLibrary:Boolean(window.KoineSourceLibrary)}));
const expectedBackupVersion=backupState.hasSourceLibrary?'v1.10-feature':backupState.hasSynthesis?'v1.9-feature':'v1.8-feature';if(backupState.backup.appVersion!==expectedBackupVersion||!backupState.backup.stores['koine-path-corpus-research-v1'])throw new Error(`V1.8 backup export did not preserve research state/current feature version: expected ${expectedBackupVersion}, got ${backupState.backup.appVersion}.`);

const downloadPromise=page.waitForEvent('download');await page.locator('#research-export').click();const download=await downloadPromise;if(!download.suggestedFilename().endsWith('.md'))throw new Error('Research export was not Markdown.');

await page.evaluate(()=>{window.KOINE_APP_OPEN_VIEW('workbench');window.KOINE_PASSAGE_WORKBENCH_UI.render()});
await page.locator('#wb-title-live').waitFor({timeout:10000});
if(await page.locator('#wb-title-live').inputValue()!=='John 1 research project')throw new Error('V1.7 active project did not render before research-bridge validation.');
await page.locator('#workbench-research-panel').getByRole('heading',{name:'Research notebook',exact:true}).waitFor();
if(await page.locator('#workbench-research-panel .workbench-research-link').count()<3)throw new Error('V1.7 workbench bridge did not surface linked V1.8 research.');
learningAfter=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));if(learningAfter!==learningBefore)throw new Error('Workbench research bridge mutated canonical learning state.');

await page.evaluate(()=>window.KOINE_APP_OPEN_VIEW('research'));
await page.setViewportSize({width:320,height:844});
const overflow=await page.evaluate(()=>({doc:document.documentElement.scrollWidth-window.innerWidth,research:document.querySelector('#research').scrollWidth-document.querySelector('#research').clientWidth}));if(overflow.doc>1||overflow.research>1)throw new Error(`V1.8 introduced 320px horizontal overflow: ${JSON.stringify(overflow)}`);
if(errors.length)throw new Error(`Browser errors: ${errors.join(' | ')}`);
await browser.close();
console.log('V1.8 browser corpus search, comparison, provenance notebook, project bridge, backup guard, mastery firewall, export, and 320px reflow: PASS');