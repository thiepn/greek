(function(){
  const dataset=globalThis.KOINE_GREEK_DATA;
  if(!dataset) throw new Error('KOINE_GREEK_DATA is required before canonical-reader.js');
  const passage=dataset.passages['John.1.1'];
  if(!passage) throw new Error('Canonical passage John.1.1 is missing.');

  function ordinalPerson(n){return n===1?'1st person':n===2?'2nd person':n===3?'3rd person':String(n);}
  function formatParse(token){
    const parts=[dataset.pos[token.posCode]||token.posCode];
    const m=token.morph||{};
    if(m.tense) parts.push(m.tense);
    if(m.voice) parts.push(m.voice);
    if(m.mood) parts.push(m.mood);
    if(m.person) parts.push(ordinalPerson(m.person));
    if(m.case) parts.push(m.case);
    if(m.number) parts.push(m.number);
    if(m.gender) parts.push(m.gender);
    if(m.degree) parts.push(m.degree);
    return parts.join(' · ');
  }

  renderReader=function(){
    const html=passage.tokens.map((token,index)=>`<button class="word" data-reader="${index}" data-token-id="${token.id}">${token.text}</button>`).join(' ');
    document.querySelector('#reader-text').innerHTML=`<p><sup>${passage.verse}</sup> ${html}</p><small class="reader-source">SBLGNT · MorphGNT ${dataset.sources.morphgnt.revision.slice(0,7)}</small>`;
    document.querySelectorAll('[data-reader]').forEach(button=>button.addEventListener('click',()=>selectWord(Number(button.dataset.reader))));
  };

  selectWord=function(index){
    const token=passage.tokens[index];
    const annotation=dataset.learningAnnotations[token.id]||{hint:'Attempt the morphology from the form and context before revealing more.',glosses:[]};
    selectedWord={
      id:token.id,
      token,
      annotation,
      form:token.word,
      lemma:token.lemma,
      hint:annotation.hint,
      parse:formatParse(token),
      gloss:annotation.glosses.join(' / ')||'—'
    };
    document.querySelectorAll('.word').forEach(button=>button.classList.toggle('selected',button.dataset.tokenId===token.id));
    document.querySelector('#word-form').textContent=token.word;
    document.querySelector('#word-prompt').textContent=`Token ${token.position} · ${passage.id} · attempt before reveal.`;
    document.querySelector('#hint-box').textContent='No hint revealed.';
    if(!state.words.includes(token.id)){state.words.push(token.id);save();}
  };

  reveal=function(level){
    if(!selectedWord)return;
    const box=document.querySelector('#hint-box');
    if(level===1) box.textContent=selectedWord.hint;
    if(level===2) box.innerHTML=`Lemma: <span class="greek">${selectedWord.lemma}</span>`;
    if(level===3) box.innerHTML=`<strong>${selectedWord.parse}</strong><br>Learning gloss: ${selectedWord.gloss}<br><small>Source parse: ${selectedWord.token.parseCode}</small>`;
  };

  renderReader();
})();