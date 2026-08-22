(function(){
  const engine=window.KOINE_LEARNING_ENGINE;
  if(!engine) return;

  function pct(value){return `${Math.round(value)}%`;}
  function statusLabel(status){return ({locked:'Locked',available:'Available','in-progress':'In progress',mastered:'Mastered',review:'Review due'})[status]||status;}

  function renderEngineSummary(){
    const host=document.querySelector('#learning-engine-summary');
    if(!host) return;
    const d=engine.getDashboard();
    const r=d.recommendation;
    host.innerHTML=`
      <div class="engine-strip">
        <div><span>Canonical units mastered</span><strong>${d.mastered} / ${d.total}</strong></div>
        <div><span>Review due</span><strong>${d.due}</strong></div>
        <div><span>Open remediation</span><strong>${d.openRemediation}</strong></div>
        <div><span>Evidence composite</span><strong>${pct(d.overall)}</strong></div>
      </div>
      <article class="engine-next">
        <div class="eyebrow">Engine recommendation</div>
        <h3>${r.title}</h3>
        <p>${r.reason}</p>
        <small>Unit ${r.unitId} · ${statusLabel(r.unit.status)} · composite ${r.unit.composite}%</small>
      </article>
      <div class="engine-stage">
        <div><span>Current stage</span><strong>${d.currentStage.id} · ${d.currentStage.title}</strong></div>
        <div><span>Stage composite</span><strong>${pct(d.currentStage.composite)}</strong></div>
        <div><span>Recognition</span><strong>${pct(d.currentStage.recognition)}</strong></div>
        <div><span>Gate</span><strong>${d.currentStage.passed?'Passed':'Not yet'}</strong></div>
      </div>
      ${d.topErrors.length?`<div class="engine-errors"><strong>Most frequent error types</strong>${d.topErrors.map(e=>`<span>${e.label} · ${e.count}</span>`).join('')}</div>`:''}
    `;
  }

  function decorateCurriculum(){
    const stages=document.querySelectorAll('.curriculum-stage');
    stages.forEach((stageEl,stageIndex)=>{
      const stageMeta=window.KOINE_CURRICULUM.stages[stageIndex];
      const stage=engine.getStage(stageMeta.id);
      stageEl.dataset.engineStatus=stage.passed?'passed':'active';
      let gate=stageEl.querySelector('.engine-gate');
      if(!gate){gate=document.createElement('div');gate.className='engine-gate';stageEl.querySelector('.curriculum-stage-head').appendChild(gate);}
      gate.textContent=stage.passed?'Stage gate passed':`Gate ${stage.composite}% · recognition ${stage.recognition}%`;
      stageEl.querySelectorAll('.curriculum-units li').forEach((li,index)=>{
        const unitId=stageMeta.units[index],unit=engine.getUnit(unitId);
        li.dataset.status=unit.status;
        li.title=`${statusLabel(unit.status)} · composite ${unit.composite}%`;
        let badge=li.querySelector('.unit-state');
        if(!badge){badge=document.createElement('span');badge.className='unit-state';li.appendChild(badge);}
        badge.textContent=statusLabel(unit.status);
      });
    });
  }

  window.renderLearningEngineUI=function(){renderEngineSummary();decorateCurriculum();};
  renderLearningEngineUI();
})();
