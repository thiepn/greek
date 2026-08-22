const learning=window.KOINE_LEARNING_ENGINE;
if(!learning)throw new Error('KOINE_LEARNING_ENGINE must load before app.js');

const titles={
  today:['Today','Your next highest-value Greek task.'],
  learn:['Learn','Canonical 50-unit Biblical Greek course.'],
  drill:['Morphology','Adaptive morphology practice.'],
  read:['Read','Guided New Testament reading.'],
  tutor:['Tutor','Socratic grammar assistance.'],
  review:['Review','Repair weak forms.'],
  progress:['Progress','Track reading competence.']
};

function openView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));
  document.querySelectorAll('.nav button').forEach(b=>{const active=b.dataset.view===id;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  const title=titles[id];
  if(title){document.querySelector('#top-title')?.replaceChildren(title[0]);document.querySelector('#top-sub')?.replaceChildren(title[1]);}
  window.scrollTo({top:0,behavior:'smooth'});
}

document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>openView(b.dataset.view)));

function setText(selector,value){const el=document.querySelector(selector);if(el)el.textContent=value;}

function renderProgress(){
  const dash=learning.getDashboard();
  const mastery=Math.round(dash.mastered/dash.total*100);
  const reading=Math.round(window.KoineLearning.flattenCurriculum(window.KOINE_CURRICULUM).reduce((sum,u)=>sum+learning.getUnit(u.id).dimensions.reading.effective,0)/dash.total);
  setText('#p-mastery',`${mastery}%`);
  setText('#p-reading',`${reading}%`);
  const focus=dash.recommendation?.unit,host=document.querySelector('#competencies');
  if(host&&focus)host.innerHTML=window.KoineLearning.DIMENSIONS.map(d=>`<div class="competency"><strong>${d[0].toUpperCase()+d.slice(1)}</strong><span>${focus.dimensions[d].effective}%</span><small>Unit ${focus.id} · ${focus.title} · ${focus.dimensions[d].evidence}/${focus.dimensions[d].minEvidence} minimum evidence events</small></div>`).join('');
}

function renderToday(){
  const dash=learning.getDashboard(),prototype=learning.getPrototypeState(),r=dash.recommendation;
  setText('#m-lessons',`${dash.mastered} / ${dash.total}`);
  setText('#m-review',dash.due+dash.openRemediation);
  setText('#m-words',prototype.words.length);
  setText('#side-pct',`${dash.overall}%`);
  const bar=document.querySelector('#side-bar');if(bar)bar.style.width=`${dash.overall}%`;
  if(r){setText('#next-title',r.title);setText('#next-text',r.reason);}
  const next=document.querySelector('#next-btn');
  if(next&&r)next.onclick=()=>{
    if(r.kind==='remediation'||r.kind==='review'){openView('review');return;}
    if(r.kind==='reading'){openView('read');return;}
    openView('learn');
    if(r.unitId)window.KOINE_COURSE_UI?.openUnit?.(r.unitId);
  };
}

function renderAll(){renderToday();renderProgress();window.renderLearningEngineUI?.();window.renderCourseUI?.();window.KOINE_GUIDANCE_UI?.render?.();}
window.KOINE_APP_OPEN_VIEW=openView;
window.KOINE_APP_RENDER=renderAll;
renderAll();
