(() => {
  const curriculum = window.KOINE_CURRICULUM;
  const host = document.querySelector('#curriculum-map');
  if (!curriculum || !host) return;

  host.innerHTML = curriculum.stages.map(stage => {
    const first = stage.units[0];
    const last = stage.units[stage.units.length - 1];
    const vocab = stage.stretchVocabTarget
      ? `${stage.vocabTarget} core · ${stage.stretchVocabTarget} stretch`
      : `${stage.vocabTarget}`;

    return `
      <article class="curriculum-stage">
        <header class="curriculum-stage-head">
          <div>
            <span class="curriculum-code">${stage.id} · Units ${first}–${last}</span>
            <h3>${stage.title}</h3>
          </div>
          <div class="curriculum-meta">
            <span>${stage.units.length} units</span>
            <span>${vocab} lemmas</span>
            <span>${stage.reader.join(' → ')}</span>
          </div>
        </header>
        <p>${stage.outcome}</p>
        <ol start="${first}" class="curriculum-units">
          ${stage.unitTitles.map(title => `<li>${title}</li>`).join('')}
        </ol>
      </article>`;
  }).join('');
})();