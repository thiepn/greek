(()=>{
  const data=window.KOINE_MORPHOLOGY_DATA,api=window.KoineMorphologyLab,learning=window.KOINE_LEARNING_ENGINE,host=document.querySelector('#drill');
  if(!data||!api||!host)return;
  const lab=new api.MorphologyLab({data,learningEngine:learning});
  window.KOINE_MORPHOLOGY_LAB=lab;

  host.innerHTML=`
    <div class="eyebrow">Morphology laboratory · BG4</div>
    <h1>Recognize the form before translating it.</h1>
    <p class="lede">Parsing, form building, minimal contrasts, and principal-part recognition feed the canonical BG3 mastery and remediation engine.</p>
    <div class="morph-toolbar">
      <div class="morph-modes" role="group" aria-label="Exercise mode">
        <button data-morph-mode="parse">Parse</button><button data-morph-mode="build">Build</button><button data-morph-mode="contrast">Contrast</button><button data-morph-mode="principal">Principal parts</button>
      </div>
      <label>Focus <select id="morph-focus"><option value="foundation">Foundation</option><option value="nominals">Nominals</option><option value="verbs">Verbs</option><option value="advanced">Advanced</option><option value="all">All reviewed forms</option></select></label>
    </div>
    <div class="morph-layout">
      <article class="panel morph-question">
        <div class="morph-meta"><span id="morph-mode-label">Parse</span><span id="morph-unit">Unit —</span></div>
        <p id="morph-prompt">Parse this form.</p>
        <div class="greek morph-display" id="morph-display">λόγος</div>
        <div class="morph-subprompt" id="morph-subprompt"></div>
        <div id="morph-options" class="options morph-options"></div>
        <div id="morph-feedback" class="feedback" aria-live="polite"></div>
        <div class="morph-actions"><button class="btn" id="morph-hint">Hint</button><button class="btn" id="morph-lemma">Lemma</button><button class="btn" id="morph-reveal">Reveal</button><button class="btn primary" id="morph-next">Next form</button></div>
        <div id="morph-help" class="hint-box">Attempt first; assistance lowers evidence value.</div>
      </article>
      <aside class="panel morph-session">
        <div class="eyebrow">Adaptive session</div><div class="morph-stat-grid">
          <div><span>Accuracy</span><strong id="morph-accuracy">—</strong></div>
          <div><span>Attempts</span><strong id="morph-attempts">0</strong></div>
          <div><span>Streak</span><strong id="morph-streak">0</strong></div>
          <div><span>Best</span><strong id="morph-best">0</strong></div>
        </div>
        <div class="morph-rule"></div><h3>How adaptation works</h3><p>Weak families, review-due units, and units with recurring BG3 errors receive higher probability. Recently seen forms are temporarily down-weighted.</p>
        <div class="morph-rule"></div><small>Source: reviewed pedagogical paradigms. Corpus-derived status is tracked separately; forms are not falsely labeled as NT occurrences.</small>
      </aside>
    </div>`;

  const $=s=>host.querySelector(s);
  let question=null,answered=false;
  function modeName(m){return ({parse:'Parse',build:'Build',contrast:'Minimal contrast',principal:'Principal parts'})[m]||m;}
  function updateStats(){
    const s=lab.stats();$('#morph-accuracy').textContent=s.accuracy==null?'—':s.accuracy+'%';$('#morph-attempts').textContent=s.attempts;$('#morph-streak').textContent=s.streak;$('#morph-best').textContent=s.bestStreak;
    document.querySelector('#m-accuracy').textContent=s.accuracy==null?'—':s.accuracy+'%';
    const pa=document.querySelector('#p-attempts'),pc=document.querySelector('#p-correct');if(pa)pa.textContent=s.attempts;if(pc)pc.textContent=s.correct;
  }
  function renderQuestion(q){
    question=q;answered=false;$('#morph-mode-label').textContent=modeName(q.mode);$('#morph-unit').textContent=`Unit ${q.unitId}`;$('#morph-prompt').textContent=q.prompt;$('#morph-display').textContent=q.display;$('#morph-subprompt').textContent=q.subprompt||'';$('#morph-feedback').textContent='';$('#morph-feedback').className='feedback';$('#morph-help').textContent='Attempt first; assistance lowers evidence value.';
    $('#morph-options').innerHTML=q.options.map(o=>`<button data-option="${o.id}">${o.label}</button>`).join('');
    $('#morph-options').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>submit(b.dataset.option)));
    host.querySelectorAll('[data-morph-mode]').forEach(b=>b.classList.toggle('active',b.dataset.morphMode===lab.state.mode));$('#morph-focus').value=lab.state.focus;
  }
  function submit(id){
    if(answered)return;answered=true;const result=lab.answer(id),buttons=[...$('#morph-options').querySelectorAll('button')];
    buttons.forEach(b=>{const opt=question.options.find(o=>o.id===b.dataset.option);b.disabled=true;if(opt?.correct)b.classList.add('correct');else if(b.dataset.option===id)b.classList.add('incorrect');});
    const f=$('#morph-feedback');f.textContent=result.correct?`Correct. ${question.answer}`:`Not yet. Correct answer: ${question.answer}${result.errorType?' · '+result.errorType.replaceAll('_',' '):''}`;f.className='feedback '+(result.correct?'good':'bad');updateStats();
    if(window.renderLearningEngine)window.renderLearningEngine();
  }
  function assist(level){const text=lab.hint(level);$('#morph-help').textContent=text||'';}
  host.querySelectorAll('[data-morph-mode]').forEach(b=>b.addEventListener('click',()=>renderQuestion(lab.setMode(b.dataset.morphMode))));
  $('#morph-focus').addEventListener('change',e=>renderQuestion(lab.setFocus(e.target.value)));
  $('#morph-hint').addEventListener('click',()=>assist('hint'));$('#morph-lemma').addEventListener('click',()=>assist('lemma'));$('#morph-reveal').addEventListener('click',()=>assist('full'));$('#morph-next').addEventListener('click',()=>renderQuestion(lab.next()));
  updateStats();renderQuestion(lab.next());
})();