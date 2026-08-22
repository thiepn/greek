import {chromium} from 'playwright';
const url=process.env.KOINE_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto(url,{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.KOINE_FULL_READER?.manifest?.books?.length===27&&window.KOINE_READING_GOALS_UI&&window.KOINE_READING_FLUENCY,{timeout:15000});
await page.evaluate(()=>window.KOINE_APP_OPEN_VIEW('read'));
await page.locator('#reading-goals').getByRole('heading',{name:'Choose a corpus reading goal',exact:true}).waitFor();

const learningBefore=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));
await page.locator('#rg-kind').selectOption('track');
await page.locator('#rg-track').selectOption('first-epistle');
await page.locator('#rg-create').click();
await page.locator('#reading-goals').getByRole('heading',{name:'First Epistle Track',exact:true}).waitFor();
let task=await page.evaluate(()=>window.KOINE_READING_GOALS_UI.currentTask());
if(task?.title!=='Prologue'||task?.assistance!=='R1'||task?.item?.ref?.book!=='1John'||task?.item?.ref?.startVerse!==1||task?.item?.ref?.endVerse!==4)throw new Error('First Epistle Track did not start at 1 John 1:1–4 with R1 assistance.');
let learningAfter=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));if(learningAfter!==learningBefore)throw new Error('Creating a V1.6 reading goal mutated canonical learning state.');

await page.locator('#rg-analysis').getByText('Intrinsic difficulty',{exact:true}).waitFor({timeout:10000});
const scores=await page.evaluate(()=>{const task=window.KOINE_READING_GOALS_UI.currentTask();return window.KOINE_READING_FLUENCY.materialize({id:'test.v16',program:'test',unitId:50,level:'custom',ref:task.item.ref,prompt:null,choices:[],answer:null,focus:'test',source:'test'}).then(m=>window.KoineReadingGoals.difficulty(m,{knownLemma:l=>window.KOINE_READING_FLUENCY.knownLemma(l),unitReady:id=>{const u=window.KOINE_LEARNING_ENGINE.getUnit(id);return !!(u?.masteredAt||u?.status==='mastered')},unitForToken:t=>window.KOINE_FULL_READER.unitForToken(t)}))});
if(!(scores.intrinsic.score>=0&&scores.intrinsic.score<=100&&scores.preparedness.score>=0&&scores.preparedness.score<=100))throw new Error('Corpus difficulty/preparedness scores are outside supported bounds.');
if(!scores.intrinsic.band||!scores.preparedness.band)throw new Error('Difficulty and preparedness bands were not independently produced.');

await page.locator('#rg-open-next').click();
await page.getByRole('heading',{name:'1 John 1',exact:true}).waitFor({timeout:10000});
learningAfter=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));if(learningAfter!==learningBefore)throw new Error('Opening/scanning a V1.6 passage mutated canonical learning state.');

await page.locator('#rg-mark-passage').click();
await page.locator('#reading-goals').getByText('Light and confession',{exact:true}).first().waitFor();
task=await page.evaluate(()=>window.KOINE_READING_GOALS_UI.currentTask());if(task?.title!=='Light and confession')throw new Error('Passage coverage did not advance to the second track milestone.');
const state=await page.evaluate(()=>window.KOINE_READING_GOALS.snapshot());const active=state.goals.find(g=>g.id===state.activeGoalId);const progress=await page.evaluate(()=>{const g=window.KOINE_READING_GOALS.getGoal();return window.KOINE_READING_GOALS.progress(g,window.KOINE_FULL_READER.state.completed)});
if(active?.trackId!=='first-epistle'||progress.completed!==1||progress.total!==8)throw new Error('Reading-track coverage did not persist as 1/8.');
learningAfter=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));if(learningAfter!==learningBefore)throw new Error('Marking V1.6 focused-passage coverage mutated canonical learning state.');

const decorated=await page.evaluate(()=>window.KOINE_READING_GOALS_UI.sessionTask({id:'read-task',view:'read',title:'Read Greek',plannedMinutes:5}));if(!/Light and confession/.test(decorated.title)||decorated.readingAssistance!=='R1')throw new Error('V1.4 daily-session decoration did not use the active V1.6 passage.');
const weekly=await page.evaluate(()=>window.KOINE_READING_GOALS_UI.weeklyLabel());if(!/Light and confession/.test(weekly))throw new Error('V1.5 weekly planning label did not use the active V1.6 passage.');

await page.evaluate(()=>{window.KOINE_READING_GOALS.createBookGoal('Phil');window.KOINE_READING_GOALS_UI.render()});
const book=await page.evaluate(()=>window.KOINE_READING_GOALS.getGoal());if(book.kind!=='book'||book.items.length!==4||book.items[0].label!=='Philippians 1')throw new Error('Whole-book goal did not derive four canonical Philippians chapters from the manifest.');
learningAfter=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));if(learningAfter!==learningBefore)throw new Error('Creating a whole-book goal mutated canonical learning state.');

await page.evaluate(()=>window.KOINE_APP_OPEN_VIEW('progress'));
await page.locator('#reading-goal-progress').getByRole('heading',{name:'Reading goals & corpus tracks',exact:true}).waitFor();
await page.locator('#reading-goal-progress').getByText('Read Philippians · active',{exact:true}).waitFor();
const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('koine-path-reading-goals-v1')));if(stored?.schemaVersion!==1||stored.goals.length<2)throw new Error('V1.6 reading-goal state did not persist.');

await page.setViewportSize({width:320,height:844});
const overflow=await page.evaluate(()=>({doc:document.documentElement.scrollWidth-window.innerWidth,read:document.querySelector('#read').scrollWidth-document.querySelector('#read').clientWidth,progress:document.querySelector('#progress').scrollWidth-document.querySelector('#progress').clientWidth}));
if(overflow.doc>1||overflow.read>1||overflow.progress>1)throw new Error(`V1.6 introduced 320px horizontal overflow: ${JSON.stringify(overflow)}`);
if(errors.length)throw new Error(`Browser errors: ${errors.join(' | ')}`);
await browser.close();
console.log('V1.6 browser reading goals, corpus analysis, passage routing, coverage firewall, planner bridges, persistence, and 320px reflow: PASS');
