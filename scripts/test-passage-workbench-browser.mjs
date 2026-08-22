import {chromium} from 'playwright';
const url=process.env.KOINE_TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto(url,{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.KOINE_FULL_READER?.manifest?.books?.length===27&&window.KOINE_PASSAGE_WORKBENCH_UI&&window.KOINE_READING_FLUENCY,{timeout:15000});
const learningBefore=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));

await page.evaluate(()=>window.KOINE_APP_OPEN_VIEW('workbench'));
await page.getByRole('heading',{name:'Turn one passage into a persistent study project.',exact:true}).waitFor();
await page.locator('#wb-book').selectOption('John');
await page.locator('#wb-chapter').fill('1');
await page.locator('#wb-chapter').dispatchEvent('change');
await page.locator('#wb-start').fill('1');
await page.locator('#wb-end').fill('4');
await page.locator('#wb-title').fill('John 1 Prologue Project');
await page.locator('#wb-create').click();
await page.getByRole('heading',{name:'John 1 Prologue Project',exact:true}).waitFor({timeout:10000});
const tokenCount=await page.locator('#workbench .workbench-token').count();if(tokenCount<10)throw new Error(`Expected canonical John 1:1–4 tokens, found ${tokenCount}.`);
let learningAfter=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));if(learningAfter!==learningBefore)throw new Error('Creating/materializing a workbench project mutated canonical learning state.');

await page.locator('#workbench .workbench-token').first().click();
await page.locator('#wb-token-inspector .greek').first().waitFor();
await page.locator('#wb-token-note').fill('Track this form only insofar as it affects the passage argument.');
await page.locator('#wb-add-token-note').click();
await page.locator('.workbench-lexical-note').getByText('Track this form only insofar as it affects the passage argument.',{exact:true}).waitFor({timeout:5000});

const tabs={
  'Observations':'Repeated wording and participant relationships should be established before interpretation.',
  'Morphology':'Record only forms that materially constrain the reading.',
  'Syntax':'Trace clause relationships and modifier scope before synthesis.',
  'Lexical study':'Glosses are starting points; contextual use must be argued from the passage.',
  'Discourse / argument flow':'The prologue develops claims in a deliberate sequence rather than isolated propositions.',
  'Exegetical synthesis':'The passage presents the Word in relation to God and creation, then develops the claim toward incarnation.',
  'Evidence & interpretation boundary':'Morphology and syntax constrain readings, but grammar alone does not establish the complete theological synthesis.'
};
for(const [label,note] of Object.entries(tabs)){
  await page.locator('[data-wb-tab]').filter({hasText:label}).click();
  await page.locator('#wb-note').fill(note);
  const step=page.locator('#wb-step');if(await step.count())await step.check();
  await page.locator('#wb-save-note').click();
}
await page.locator('#wb-new-question').fill('Which claims come directly from syntax, and which require broader context?');
await page.locator('#wb-add-question').click();
await page.locator('.workbench-question').getByText('Which claims come directly from syntax, and which require broader context?',{exact:true}).waitFor();
learningAfter=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));if(learningAfter!==learningBefore)throw new Error('Workbench notes/checkpoints/questions mutated canonical learning state.');

await page.locator('#wb-complete').click();
await page.locator('.workbench-status').filter({hasText:'complete'}).waitFor();
const state=await page.evaluate(()=>window.KOINE_PASSAGE_WORKBENCH.snapshot());const active=state.projects.find(p=>p.id===state.activeProjectId);if(!active||active.status!=='complete'||active.lexicalNotes.length!==1||active.questions.length!==1)throw new Error('Completed workbench project did not persist structured project state.');
if(Object.values(active.steps).filter(Boolean).length!==7)throw new Error('Project completion did not preserve all seven workflow checkpoints.');
learningAfter=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));if(learningAfter!==learningBefore)throw new Error('Completing a workbench project mutated canonical learning state.');

const downloadPromise=page.waitForEvent('download');await page.locator('#wb-export').click();const download=await downloadPromise;if(!download.suggestedFilename().endsWith('.md'))throw new Error('Workbench export was not a Markdown file.');

await page.locator('#wb-tutor').click();
await page.locator('#tutor.active').waitFor({timeout:10000});
const tutorPrompt=await page.locator('#ai-input').inputValue();if(!/John 1:1–4/.test(tutorPrompt)||!/My current synthesis:/.test(tutorPrompt)||!/evidence\/interpretation boundary/i.test(tutorPrompt))throw new Error('Grounded tutor handoff did not carry the bounded project analysis prompt.');
learningAfter=await page.evaluate(()=>localStorage.getItem('koine-path-learning-v3'));if(learningAfter!==learningBefore)throw new Error('Workbench tutor handoff mutated canonical learning state.');

await page.evaluate(()=>window.KOINE_APP_OPEN_VIEW('workbench'));
await page.getByRole('heading',{name:'John 1 Prologue Project',exact:true}).waitFor();
await page.setViewportSize({width:320,height:844});
const overflow=await page.evaluate(()=>({doc:document.documentElement.scrollWidth-window.innerWidth,view:document.querySelector('#workbench').scrollWidth-document.querySelector('#workbench').clientWidth}));
if(overflow.doc>1||overflow.view>1)throw new Error(`V1.7 introduced 320px horizontal overflow: ${JSON.stringify(overflow)}`);
if(errors.length)throw new Error(`Browser errors: ${errors.join(' | ')}`);
await browser.close();
console.log('V1.7 browser passage materialization, structured notebook, token notes, project completion, Markdown export, tutor handoff, mastery firewall, and 320px reflow: PASS');