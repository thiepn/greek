(() => {
  'use strict';
  const course=window.KOINE_COURSE_CONTENT;
  const enrichment=window.KOINE_COURSE_ENRICHMENT;
  const curriculum=window.KOINE_CURRICULUM;
  const learning=window.KOINE_LEARNING_ENGINE;
  const list=document.querySelector('#lesson-list');
  const stage=document.querySelector('#lesson-stage');
  if(!course||!curriculum||!learning||!list||!stage)return;

  const answered=new Map();
  const practiceAnswered=new Map();
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const metaByUnit=new Map();
  curriculum.stages.forEach(s=>s.units.forEach((id,i)=>metaByUnit.set(id,{stage:s,title:s.unitTitles[i]})));
  const item=id=>course.units.find(u=>u.id===Number(id));
  const experience=id=>enrichment?.units?.find(u=>u.id===Number(id))||null;
  const statusText=u=>u.status==='mastered'?'Mastered':u.status==='review'?'Review due':u.status==='in-progress'?'In progress':u.status==='available'?'Available':'Preview';

  function updateMetric(){
    const mastered=course.units.filter(u=>learning.getUnit(u.id)?.masteredAt).length;
    const metric=document.querySelector('#m-lessons');
    if(metric)metric.textContent=`${mastered} / ${course.unitCount}`;
  }

  function renderList(){
    stage.innerHTML='';
    stage.hidden=true;
    list.hidden=false;
    list.style.display='block';
    list.innerHTML=curriculum.stages.map(s=>{
      const units=s.units.map(id=>{
        const c=item(id),u=learning.getUnit(id),locked=!u.accessible;
        return `<li class="course-unit ${esc(u.status)}">
          <button class="course-unit-open" data-course-unit="${id}" aria-label="${locked?'Preview':'Open'} Unit ${id}: ${esc(c.title)}">
            <span class="course-unit-no">${id}</span>
            <span class="course-unit-copy"><strong>${esc(c.title)}</strong><small>${esc(c.objective)}</small></span>
            <span class="course-unit-state">${esc(statusText(u))}</span>
          </button>
        </li>`;
      }).join('');
      const passed=learning.getStage(s.id).passed;
      return `<section class="course-stage" aria-labelledby="course-${s.id}">
        <header><div><span>${esc(s.id)} · Units ${s.units[0]}–${s.units.at(-1)}</span><h2 id="course-${s.id}">${esc(s.title)}</h2></div><small>${passed?'Stage passed':esc(s.outcome)}</small></header>
        <ol class="course-unit-list">${units}</ol>
      </section>`;
    }).join('');
    list.querySelectorAll('[data-course-unit]').forEach(b=>b.addEventListener('click',()=>openUnit(Number(b.dataset.courseUnit))));
    updateMetric();
  }

  function formMarkup(forms){return forms?.length?`<div class="course-forms">${forms.map(f=>`<code lang="grc">${esc(f)}</code>`).join('')}</div>`:''}
  function scriptureMarkup(refs){return `<div class="course-scripture">${refs.map(r=>`<article><strong>${esc(r.ref)}</strong><p>${esc(r.task)}</p><button class="btn" data-course-reader="${esc(r.ref)}">Open reader</button></article>`).join('')}</div>`}

  function orientationMarkup(c,e){
    if(!e)return '';
    return `<section class="course-orientation" aria-labelledby="course-orientation-title">
      <div class="course-section-kicker">Reading problem</div>
      <h2 id="course-orientation-title">What this unit should make easier</h2>
      <p>${esc(e.focus)}</p>
      <p class="course-orientation-link">Target outcome: ${esc(c.objective)}</p>
    </section>`;
  }

  function observeMarkup(e){
    if(!e?.observe)return '';
    const o=e.observe;
    return `<section class="course-observe" aria-labelledby="course-observe-title">
      <div class="course-section-kicker">Attempt before explanation</div>
      <h2 id="course-observe-title">Observe</h2>
      <div class="course-observe-card">
        <div class="course-observe-greek" lang="grc">${esc(o.greek)}</div>
        <p>${esc(o.prompt)}</p>
        <details><summary>Compare your observation</summary><p>${esc(o.explanation)}</p></details>
      </div>
    </section>`;
  }

  function contrastMarkup(e){
    if(!e?.contrast)return '';
    const c=e.contrast;
    return `<section class="course-contrast" aria-labelledby="course-contrast-title">
      <div class="course-section-kicker">Minimal pair</div>
      <h2 id="course-contrast-title">Contrast</h2>
      <div class="course-contrast-pair"><code lang="grc">${esc(c.left)}</code><span aria-hidden="true">↔</span><code lang="grc">${esc(c.right)}</code></div>
      <p>${esc(c.prompt)}</p>
      <details><summary>Reveal the discriminating clue</summary><p>${esc(c.explanation)}</p></details>
    </section>`;
  }

  function practiceMarkup(e){
    if(!e?.practice?.length)return '';
    return `<section class="course-practice" aria-labelledby="course-practice-title">
      <div class="course-section-kicker">Retrieval rehearsal · unscored</div>
      <h2 id="course-practice-title">Practice before the checkpoint</h2>
      <p class="course-practice-policy">These questions are for learning, not mastery. Correct or incorrect answers never write canonical evidence.</p>
      <div class="course-practice-items">${e.practice.map((q,qi)=>{
        const prior=practiceAnswered.get(q.id);
        const options=q.choices.map((choice,ci)=>`<button class="course-choice ${prior!=null?(ci===q.answer?'correct':ci===prior?'incorrect':''):''}" data-course-practice="${esc(q.id)}" data-choice="${ci}" ${prior!=null?'disabled':''}>${esc(choice)}</button>`).join('');
        const feedback=prior==null?'':`<p class="course-feedback ${prior===q.answer?'good':'bad'}"><strong>${prior===q.answer?'Correct.':'Not yet.'}</strong> ${esc(q.explanation)}</p>`;
        return `<fieldset class="course-checkpoint course-practice-item"><legend><span>P${qi+1}</span>${esc(q.prompt)}</legend><div class="course-choices">${options}</div>${feedback}</fieldset>`;
      }).join('')}</div>
    </section>`;
  }

  function reasoningMarkup(id,e){
    if(!e?.reasoning)return '';
    return `<section class="course-reasoning" aria-labelledby="course-reasoning-title">
      <div class="course-section-kicker">Generation effect</div>
      <h2 id="course-reasoning-title">Explain your reasoning</h2>
      <p>${esc(e.reasoning)}</p>
      <label class="course-reasoning-label" for="course-reasoning-${id}">Your explanation <span>not saved or graded</span></label>
      <textarea id="course-reasoning-${id}" class="course-reasoning-input" rows="4" placeholder="Name the form clue, the grammatical relationship, the contextual evidence, and any remaining uncertainty."></textarea>
      <details><summary>Reasoning checklist</summary><ul><li>Name the visible Greek clue.</li><li>State the grammatical fact before interpretation.</li><li>Use context only for claims the form does not settle.</li><li>Keep genuine ambiguity visible.</li></ul></details>
    </section>`;
  }

  function rereadMarkup(c,e){
    if(!e||!c.scripture?.length)return '';
    const first=c.scripture[0];
    return `<section class="course-reread" aria-labelledby="course-reread-title">
      <div class="course-section-kicker">Transfer after retrieval</div>
      <h2 id="course-reread-title">Read again</h2>
      <p>Return to <strong>${esc(first.ref)}</strong> after the checkpoint. Read once without the forms list. Name one clue you now recognize faster, then identify one unresolved point you would verify rather than guess.</p>
      <button class="btn" data-course-reader="${esc(first.ref)}">Re-open ${esc(first.ref)}</button>
    </section>`;
  }

  function checkpointMarkup(c){
    return `<div class="course-checkpoints">${c.checks.map((q,qi)=>{
      const prior=answered.get(q.id);
      const options=q.choices.map((choice,ci)=>`<button class="course-choice ${prior!=null?(ci===q.answer?'correct':ci===prior?'incorrect':''):''}" data-course-q="${esc(q.id)}" data-choice="${ci}" ${prior!=null?'disabled':''}>${esc(choice)}</button>`).join('');
      const feedback=prior==null?'':`<p class="course-feedback ${prior===q.answer?'good':'bad'}"><strong>${prior===q.answer?'Correct.':'Not yet.'}</strong> ${esc(q.explanation)}</p>`;
      return `<fieldset class="course-checkpoint"><legend><span>${qi+1}</span>${esc(q.prompt)}</legend><div class="course-choices">${options}</div>${feedback}</fieldset>`;
    }).join('')}</div>`;
  }

  function openUnit(id){
    const c=item(id),u=learning.getUnit(id),meta=metaByUnit.get(id),e=experience(id);
    if(!c||!u||!meta)return;
    list.hidden=true;
    list.style.display='none';
    stage.hidden=false;
    stage.innerHTML=`<article class="course-lesson">
      <button class="btn course-back">← All units</button>
      <header class="course-lesson-head">
        <div><span>${esc(meta.stage.id)} · Unit ${id} · ${u.accessible?esc(statusText(u)):'Preview'}</span><h1 tabindex="-1">${esc(c.title)}</h1><p>${esc(c.objective)}</p></div>
        <div class="course-mastery"><strong>${u.composite}%</strong><small>mastery composite</small></div>
      </header>
      ${!u.accessible?'<div class="course-preview-note"><strong>Preview mode.</strong> This unit is readable now, but canonical checkpoint attempts record exposure only until its prerequisite gate is met. V1.1 practice remains unscored in every state.</div>':''}
      ${orientationMarkup(c,e)}
      ${observeMarkup(e)}
      <section class="course-teaching"><div class="course-section-kicker">Model</div><h2>Learn</h2>${c.teach.map((p,i)=>`<div class="course-movement"><span>0${i+1}</span><p>${esc(p)}</p></div>`).join('')}</section>
      <section><h2>Forms & patterns</h2>${formMarkup(c.forms)}</section>
      ${contrastMarkup(e)}
      ${practiceMarkup(e)}
      <aside class="course-caution"><strong>Do not overread the form.</strong><p>${esc(c.caution)}</p></aside>
      ${reasoningMarkup(id,e)}
      <section><div class="course-section-kicker">Authentic transfer</div><h2>Return to Scripture</h2>${scriptureMarkup(c.scripture)}</section>
      <section><div class="course-section-kicker">Canonical mastery evidence</div><h2>Checkpoint</h2><p class="course-checkpoint-intro">Answer from memory. Only these reviewed checkpoint attempts feed the canonical evidence/remediation model when the unit is accessible.</p>${checkpointMarkup(c)}</section>
      ${rereadMarkup(c,e)}
      <footer class="course-lesson-nav">
        <button class="btn" data-course-prev="${id-1}" ${id===1?'disabled':''}>← Previous</button>
        <button class="btn primary" data-course-next="${id+1}" ${id===course.unitCount?'disabled':''}>Next unit →</button>
      </footer>
    </article>`;
    stage.querySelector('.course-back').addEventListener('click',renderList);
    stage.querySelectorAll('[data-course-q]').forEach(b=>b.addEventListener('click',()=>answer(id,b.dataset.courseQ,Number(b.dataset.choice))));
    stage.querySelectorAll('[data-course-practice]').forEach(b=>b.addEventListener('click',()=>answerPractice(id,b.dataset.coursePractice,Number(b.dataset.choice))));
    stage.querySelectorAll('[data-course-reader]').forEach(b=>b.addEventListener('click',()=>openReader(b.dataset.courseReader)));
    stage.querySelector('[data-course-prev]')?.addEventListener('click',e=>{const n=Number(e.currentTarget.dataset.coursePrev);if(n>=1)openUnit(n)});
    stage.querySelector('[data-course-next]')?.addEventListener('click',e=>{const n=Number(e.currentTarget.dataset.courseNext);if(n<=course.unitCount)openUnit(n)});
    if(!u.accessible)learning.recordExposure({unitId:id,itemId:`course.u${id}`,source:'course-preview'});
    stage.querySelector('h1')?.focus?.();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function answerPractice(unitId,qid,choice){
    if(practiceAnswered.has(qid))return;
    const e=experience(unitId),q=e?.practice.find(x=>x.id===qid);
    if(!q)return;
    practiceAnswered.set(qid,choice);
    openUnit(unitId);
  }

  function answer(unitId,qid,choice){
    if(answered.has(qid))return;
    const c=item(unitId),q=c?.checks.find(x=>x.id===qid),u=learning.getUnit(unitId);
    if(!q||!u)return;
    answered.set(qid,choice);
    const correct=choice===q.answer;
    if(u.accessible){
      learning.recordEvidence({unitId,dimension:q.dimension,correct,hintLevel:'none',errorType:correct?null:q.errorType,itemId:qid,source:'canonical-course'});
      window.renderLearningEngineUI?.();
      window.refreshAdaptiveReview?.();
    }else{
      learning.recordExposure({unitId,itemId:qid,source:'course-preview-checkpoint'});
    }
    openUnit(unitId);
    updateMetric();
  }

  function openReader(ref){
    const match=String(ref).match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
    document.querySelector('[data-view="read"]')?.click();
    if(!match)return;
    const [,book,chapter,verse]=match;
    window.KOINE_READER_UI?.openReference?.({book,chapter:Number(chapter),verse:verse?Number(verse):null});
  }

  window.renderCourseUI=renderList;
  window.KOINE_COURSE_UI=Object.freeze({renderList,openUnit});
  renderList();
})();