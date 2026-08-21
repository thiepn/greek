const learning=window.KOINE_LEARNING_ENGINE;
if(!learning) throw new Error('KOINE_LEARNING_ENGINE must load before app.js');
let state=learning.getPrototypeState();
let currentDrill=null,selectedWord=null,sessionAttempts=0,sessionCorrect=0;
function save(){learning.updatePrototypeState(state);renderAll();if(window.renderLearningEngineUI)window.renderLearningEngineUI();}

const lessonEvidence={
  alphabet:{unitId:1,dimension:'concept',errorType:'declension_pattern'},
  article:{unitId:5,dimension:'concept',errorType:'case_confusion'},
  nouns:{unitId:7,dimension:'application',errorType:'case_confusion'},
  verbs:{unitId:12,dimension:'application',errorType:'person_number'},
  john1:{unitId:16,dimension:'reading',errorType:'syntax_relation'}
};

const lessons=[
{id:'alphabet',title:'Alphabet & recognition',desc:'Letters, names, and fast recognition.',content:`<div class="lesson-body"><button class="btn back">← Lessons</button><div class="eyebrow">Prototype lesson · canonical Unit 1</div><h1>Alphabet & recognition</h1><p class="lede">Aim for immediate recognition before memorizing complex morphology.</p><div class="greek-big">α β γ δ ε · λ μ ν ξ ο · π ρ σ τ υ · φ χ ψ ω</div><div class="callout"><strong>Method:</strong> scan, name, and pronounce. Recognition speed matters more than copying a chart.</div><div class="quiz"><strong>Which letter is lambda?</strong><div class="answers"><button data-correct>λ</button><button>γ</button><button>ρ</button><button>χ</button></div><div class="feedback"></div></div></div>`},
{id:'article',title:'Article, gender & case',desc:'ὁ, ἡ, τό and case signals.',content:`<div class="lesson-body"><button class="btn back">← Lessons</button><div class="eyebrow">Prototype lesson · canonical Unit 5</div><h1>The article is a morphology guide.</h1><p class="lede">The article frequently exposes gender, number, and case before the noun ending is familiar.</p><div class="table-wrap"><table><tr><th></th><th>Masc.</th><th>Fem.</th><th>Neut.</th></tr><tr><td>Nom. sg.</td><td class="greek">ὁ</td><td class="greek">ἡ</td><td class="greek">τό</td></tr><tr><td>Gen. sg.</td><td class="greek">τοῦ</td><td class="greek">τῆς</td><td class="greek">τοῦ</td></tr><tr><td>Dat. sg.</td><td class="greek">τῷ</td><td class="greek">τῇ</td><td class="greek">τῷ</td></tr><tr><td>Acc. sg.</td><td class="greek">τόν</td><td class="greek">τήν</td><td class="greek">τό</td></tr></table></div><div class="quiz"><strong>τοῦ most directly signals...</strong><div class="answers"><button>Nominative singular</button><button data-correct>Genitive singular masculine/neuter</button><button>Accusative plural</button><button>Dative feminine</button></div><div class="feedback"></div></div></div>`},
{id:'nouns',title:'Second-declension nouns',desc:'Use λόγος as a working pattern.',content:`<div class="lesson-body"><button class="btn back">← Lessons</button><div class="eyebrow">Prototype lesson · canonical Unit 7</div><h1>λόγος as a pattern.</h1><div class="table-wrap"><table><tr><th>Case</th><th>Singular</th><th>Plural</th></tr><tr><td>Nominative</td><td class="greek">λόγος</td><td class="greek">λόγοι</td></tr><tr><td>Genitive</td><td class="greek">λόγου</td><td class="greek">λόγων</td></tr><tr><td>Dative</td><td class="greek">λόγῳ</td><td class="greek">λόγοις</td></tr><tr><td>Accusative</td><td class="greek">λόγον</td><td class="greek">λόγους</td></tr></table></div><div class="quiz"><strong>Parse λόγῳ.</strong><div class="answers"><button>Genitive singular</button><button data-correct>Dative singular</button><button>Nominative plural</button><button>Accusative singular</button></div><div class="feedback"></div></div></div>`},
{id:'verbs',title:'Present active indicative',desc:'Person, number, and verb endings.',content:`<div class="lesson-body"><button class="btn back">← Lessons</button><div class="eyebrow">Prototype lesson · canonical Unit 12</div><h1>Present active indicative.</h1><div class="table-wrap"><table><tr><th>Person</th><th>Form</th></tr><tr><td>1 sg</td><td class="greek">λύω</td></tr><tr><td>2 sg</td><td class="greek">λύεις</td></tr><tr><td>3 sg</td><td class="greek">λύει</td></tr><tr><td>1 pl</td><td class="greek">λύομεν</td></tr><tr><td>2 pl</td><td class="greek">λύετε</td></tr><tr><td>3 pl</td><td class="greek">λύουσι(ν)</td></tr></table></div><div class="quiz"><strong>λύομεν is...</strong><div class="answers"><button>2nd plural</button><button data-correct>1st plural</button><button>3rd singular</button><button>1st singular</button></div><div class="feedback"></div></div></div>`},
{id:'john1',title:'Read John 1:1',desc:'Apply grammar to an actual verse.',content:`<div class="lesson-body"><button class="btn back">← Lessons</button><div class="eyebrow">Prototype lesson · canonical Unit 16</div><h1>Read a real sentence.</h1><div class="greek-big">Ἐν ἀρχῇ ἦν ὁ λόγος.</div><div class="callout">ἐν governs the dative here, so <strong>ἀρχῇ</strong> is dative. The article <strong>ὁ</strong> strongly signals that <strong>λόγος</strong> is nominative masculine singular.</div><div class="quiz"><strong>What most directly helps parse λόγος here?</strong><div class="answers"><button data-correct>The article ὁ</button><button>The preposition ἐν</button><button>Word order alone</button><button>The accent alone</button></div><div class="feedback"></div></div></div>`}
];

const drills=[
{form:'λόγῳ',ask:'Parse this noun.',answer:'Dative singular masculine',opts:['Dative singular masculine','Genitive singular masculine','Nominative plural masculine','Accusative singular masculine'],why:'-ῳ marks dative singular in this pattern.',unitId:7,errorType:'case_confusion'},
{form:'λόγων',ask:'Parse this noun.',answer:'Genitive plural masculine',opts:['Accusative plural masculine','Genitive plural masculine','Dative plural masculine','Nominative singular masculine'],why:'-ων marks genitive plural.',unitId:7,errorType:'case_confusion'},
{form:'λύομεν',ask:'Identify person and number.',answer:'1st person plural',opts:['1st person plural','2nd person plural','3rd person plural','1st person singular'],why:'-ομεν signals first person plural.',unitId:12,errorType:'person_number'},
{form:'λύει',ask:'Identify person and number.',answer:'3rd person singular',opts:['2nd person singular','3rd person singular','1st person plural','3rd person plural'],why:'-ει signals third person singular.',unitId:12,errorType:'person_number'},
{form:'τοῦ',ask:'Identify this article.',answer:'Genitive singular masculine/neuter',opts:['Nominative masculine singular','Genitive singular masculine/neuter','Dative feminine singular','Accusative neuter plural'],why:'τοῦ is genitive singular masculine or neuter.',unitId:5,errorType:'case_confusion'}
];

const titles={today:['Today','Your next highest-value Greek task.'],learn:['Learn','Structured foundation curriculum.'],drill:['Drill','Recall morphology quickly.'],read:['Read','Guided New Testament reading.'],tutor:['Tutor','Socratic grammar assistance.'],review:['Review','Repair weak forms.'],progress:['Progress','Track reading competence.']};
function openView(id){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));document.querySelector('#top-title').textContent=titles[id][0];document.querySelector('#top-sub').textContent=titles[id][1];window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>openView(b.dataset.view)));

function renderLessons(){const list=document.querySelector('#lesson-list'),stage=document.querySelector('#lesson-stage');list.style.display='grid';stage.innerHTML='';list.innerHTML=lessons.map((l,i)=>`<article class="lesson ${state.done.includes(l.id)?'done':''}"><span class="lesson-no">${state.done.includes(l.id)?'✓':i+1}</span><div><h3>${l.title}</h3><p>${l.desc}</p></div><button data-open-lesson="${l.id}">${state.done.includes(l.id)?'Review':'Open'} →</button></article>`).join('');list.querySelectorAll('[data-open-lesson]').forEach(b=>b.addEventListener('click',()=>openLesson(b.dataset.openLesson)))}
function openLesson(id){
  const l=lessons.find(x=>x.id===id),list=document.querySelector('#lesson-list'),stage=document.querySelector('#lesson-stage');
  list.style.display='none';stage.innerHTML=l.content;stage.querySelector('.back').addEventListener('click',renderLessons);
  stage.querySelectorAll('.answers button').forEach(btn=>btn.addEventListener('click',()=>{
    const fb=stage.querySelector('.feedback'),ok=btn.hasAttribute('data-correct'),map=lessonEvidence[id];
    fb.textContent=ok?'Correct. Evidence recorded.':'Not yet. This error has been added to targeted remediation.';fb.className='feedback '+(ok?'good':'bad');
    learning.recordEvidence({unitId:map.unitId,dimension:map.dimension,correct:ok,hintLevel:'none',errorType:ok?null:map.errorType,itemId:`prototype.${id}`,source:'prototype-lesson'});
    if(ok&&!state.done.includes(id))state.done.push(id);
    save();
  }));
}

function newDrill(){currentDrill=drills[Math.floor(Math.random()*drills.length)];document.querySelector('#drill-form').textContent=currentDrill.form;document.querySelector('#drill-ask').textContent=currentDrill.ask;document.querySelector('#drill-feedback').textContent='';document.querySelector('#drill-feedback').className='feedback';document.querySelector('#drill-options').innerHTML=currentDrill.opts.map(o=>`<button>${o}</button>`).join('');document.querySelectorAll('#drill-options button').forEach(b=>b.addEventListener('click',()=>answerDrill(b.textContent)))}
function answerDrill(value){
  state.attempts++;sessionAttempts++;const ok=value===currentDrill.answer;if(ok){state.correct++;sessionCorrect++}
  else addReview(currentDrill.form,currentDrill.answer,'Parsing error',currentDrill.unitId,currentDrill.errorType);
  learning.recordEvidence({unitId:currentDrill.unitId,dimension:'recognition',correct:ok,hintLevel:'none',errorType:ok?null:currentDrill.errorType,itemId:`drill.${currentDrill.form}`,source:'morphology-drill'});
  const fb=document.querySelector('#drill-feedback');fb.textContent=(ok?'Correct. ':'Incorrect. ')+currentDrill.why;fb.className='feedback '+(ok?'good':'bad');save();
}
document.querySelector('#new-drill').addEventListener('click',newDrill);

// Reader functions are supplied by canonical-reader.js after app.js loads.
function renderReader(){}
function selectWord(){}
function reveal(){}
document.querySelector('#hint-1').addEventListener('click',()=>reveal(1));
document.querySelector('#hint-2').addEventListener('click',()=>reveal(2));
document.querySelector('#hint-3').addEventListener('click',()=>reveal(3));
document.querySelector('#add-review').addEventListener('click',()=>{if(selectedWord){const unitId=selectedWord.unitId||16;addReview(selectedWord.form,selectedWord.parse,'Reader difficulty',unitId,'syntax_relation');learning.recordError({unitId,type:'syntax_relation',itemId:selectedWord.id,source:'reader'});save();}});
document.querySelector('#show-translation').addEventListener('click',()=>{learning.recordHint({unitId:16,itemId:'John.1.1',level:'full',source:'translation-reveal'});document.querySelector('#translation').hidden=false;});

function addReview(form,answer,reason,unitId=null,errorType=null){if(!state.review.some(r=>r.form===form))state.review.push({form,answer,reason,unitId,errorType})}
function renderReview(){
  const el=document.querySelector('#review-list');if(!state.review.length){el.innerHTML='<div class="empty">No review items. Wrong drill answers and difficult reader words will appear here.</div>';return}
  el.innerHTML=state.review.map((r,i)=>`<div class="review-item"><div><strong class="greek">${r.form}</strong><small>${r.reason} · ${r.answer}</small></div><button class="btn" data-clear="${i}">Got it now</button></div>`).join('');
  el.querySelectorAll('[data-clear]').forEach(b=>b.addEventListener('click',()=>{const item=state.review[Number(b.dataset.clear)];if(item?.unitId)learning.recordEvidence({unitId:item.unitId,dimension:'recognition',correct:true,hintLevel:'none',itemId:`review.${item.form}`,source:'prototype-review'});state.review.splice(Number(b.dataset.clear),1);save()}));
}

function tutorReply(q){const s=q.toLowerCase();if(s.includes('ἀρχ')||s.includes('dative'))return 'Start with the preposition ἐν. What case does ἐν normally govern in this construction? Use that before looking at the noun ending.';if(s.includes('λόγ')||s.includes('logos'))return 'Look immediately to the article ὁ. What gender, number, and case does ὁ mark? Then compare the -ος ending.';if(s.includes('article')||s.includes('τοῦ')||s.includes('τῇ'))return 'Treat the article as a morphology label. First identify case, then number, then gender.';if(s.includes('verb')||s.includes('λύ'))return 'Ignore translation for a moment. Identify the ending first: -ω, -εις, -ει, -ομεν, -ετε, or -ουσι(ν). What person and number does it signal?';return 'Try to identify one concrete clue first: article, ending, preposition, or verb stem. Tell me which clue you see, and we can reason from it.'}
document.querySelector('#send-tutor').addEventListener('click',sendTutor);document.querySelector('#tutor-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendTutor()}});
function sendTutor(){const input=document.querySelector('#tutor-input'),q=input.value.trim();if(!q)return;const chat=document.querySelector('#chat');chat.insertAdjacentHTML('beforeend',`<div class="bubble user">${escapeHtml(q)}</div><div class="bubble ai">${tutorReply(q)}</div>`);input.value=''}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

function renderProgress(){
  const dash=learning.getDashboard(),mastery=Math.round(dash.mastered/dash.total*100),reading=Math.round(window.KoineLearning.flattenCurriculum(window.KOINE_CURRICULUM).reduce((s,u)=>s+learning.getUnit(u.id).dimensions.reading.effective,0)/dash.total);
  document.querySelector('#p-mastery').textContent=mastery+'%';document.querySelector('#p-attempts').textContent=state.attempts;document.querySelector('#p-correct').textContent=state.correct;document.querySelector('#p-reading').textContent=reading+'%';
  const focus=dash.recommendation.unit;document.querySelector('#competencies').innerHTML=window.KoineLearning.DIMENSIONS.map(d=>`<div class="competency"><strong>${d[0].toUpperCase()+d.slice(1)}</strong><span>${focus.dimensions[d].effective}%</span><small>Unit ${focus.id} · ${focus.title} · ${focus.dimensions[d].evidence}/${focus.dimensions[d].minEvidence} minimum evidence events</small></div>`).join('');
}
function renderToday(){
  const dash=learning.getDashboard(),accuracy=state.attempts?Math.round(state.correct/state.attempts*100)+'%':'—',r=dash.recommendation;
  document.querySelector('#m-lessons').textContent=`${state.done.length} / ${lessons.length}`;document.querySelector('#m-accuracy').textContent=accuracy;document.querySelector('#m-review').textContent=dash.due+dash.openRemediation;document.querySelector('#m-words').textContent=state.words.length;
  document.querySelector('#side-pct').textContent=dash.overall+'%';document.querySelector('#side-bar').style.width=dash.overall+'%';document.querySelector('#total-attempts').textContent=state.attempts;document.querySelector('#total-correct').textContent=state.correct;document.querySelector('#session-accuracy').textContent=sessionAttempts?Math.round(sessionCorrect/sessionAttempts*100)+'%':'—';
  document.querySelector('#next-title').textContent=r.title;document.querySelector('#next-text').textContent=r.reason;document.querySelector('#next-btn').onclick=()=>{if(r.kind==='remediation'||r.kind==='review')openView('review');else if([1,5,7,12].includes(r.unitId))openView(r.unitId===1||r.unitId===5||r.unitId===7||r.unitId===12?'learn':'progress');else if(r.unitId===16)openView('read');else openView('progress')};
}
function renderAll(){state=learning.getPrototypeState();renderToday();renderLessons();renderReview();renderProgress();if(window.renderLearningEngineUI)window.renderLearningEngineUI();}
newDrill();renderAll();
