(function(){
  const dataset=globalThis.KOINE_GREEK_DATA;
  const learning=globalThis.KOINE_LEARNING_ENGINE;
  if(!dataset) throw new Error('KOINE_GREEK_DATA is required before canonical-reader.js');
  if(!learning) throw new Error('KOINE_LEARNING_ENGINE is required before canonical-reader.js');
  const passage=dataset.passages['John.1.1'];
  if(!passage) throw new Error('Canonical passage John.1.1 is missing.');

  function ordinalPerson(n){return n===1?'1st person':n===2?'2nd person':n===3?'3rd person':String(n);}
  function formatParse(token){
    const parts=[dataset.pos[token.posCode]||token.posCode];
    const m=token.morph||{};
    if(m.tense) parts.push(m.tense);if(m.voice) parts.push(m.voice);if(m.mood) parts.push(m.mood);if(m.person) parts.push(ordinalPerson(m.person));if(m.case) parts.push(m.case);if(m.number) parts.push(m.number);if(m.gender) parts.push(m.gender);if(m.degree) parts.push(m.degree);
    return parts.join(' · ');
  }
  function unitForToken(token){
    if(token.posCode==='RA') return 5;
    if(token.posCode==='N-') return 7;
    if(token.posCode==='P-') return 10;
    if(token.posCode==='V-'&&token.lemma==='εἰμί') return 13;
    if(token.posCode==='V-') return 12;
    return 16;
  }

  renderReader=function(){
    const html=passage.tokens.map((token,index)=>`<button class="word" data-reader="${index}" data-token-id="${token.id}">${token.text}</button>`).join(' ');
    document.querySelector('#reader-text').innerHTML=`<p><sup>${passage.verse}</sup> ${html}</p><small class="reader-source">SBLGNT · MorphGNT ${dataset.sources.morphgnt.revision.slice(0,7)} · mastery-aware hints</small>`;
    document.querySelectorAll('[data-reader]').forEach(button=>button.addEventListener('click',()=>selectWord(Number(button.dataset.reader))));
  };

  selectWord=function(index){
    const token=passage.tokens[index];
    const annotation=dataset.learningAnnotations[token.id]||{hint:'Attempt the morphology from the form and context before revealing more.',glosses:[]};
    const unitId=unitForToken(token);
    selectedWord={id:token.id,token,annotation,unitId,form:token.word,lemma:token.lemma,hint:annotation.hint,parse:formatParse(token),gloss:annotation.glosses.join(' / ')||'—'};
    document.querySelectorAll('.word').forEach(button=>button.classList.toggle('selected',button.dataset.tokenId===token.id));
    document.querySelector('#word-form').textContent=token.word;
    document.querySelector('#word-prompt').textContent=`Token ${token.position} · ${passage.id} · linked to canonical Unit ${unitId}.`;
    document.querySelector('#hint-box').textContent='No hint revealed.';
    learning.recordExposure({unitId,itemId:token.id,source:'canonical-reader'});
    if(!state.words.includes(token.id)){state.words.push(token.id);save();}
  };

  reveal=function(level){
    if(!selectedWord)return;
    const box=document.querySelector('#hint-box');
    const hintLevel=level===1?'hint':level===2?'lemma':'full';
    learning.recordHint({unitId:selectedWord.unitId,itemId:selectedWord.id,level:hintLevel,source:'canonical-reader'});
    if(level===1) box.textContent=selectedWord.hint;
    if(level===2) box.innerHTML=`Lemma: <span class="greek">${selectedWord.lemma}</span>`;
    if(level===3) box.innerHTML=`<strong>${selectedWord.parse}</strong><br>Learning gloss: ${selectedWord.gloss}<br><small>Source parse: ${selectedWord.token.parseCode} · Unit ${selectedWord.unitId}</small>`;
    if(window.renderLearningEngineUI) window.renderLearningEngineUI();
  };

  renderReader();
})();