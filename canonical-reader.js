(function(){
  'use strict';
  const fixture=globalThis.KOINE_GREEK_DATA;
  const learning=globalThis.KOINE_LEARNING_ENGINE;
  if(!fixture||!learning) throw new Error('BG6 reader requires Greek data and learning engine.');

  const STORAGE_KEY='koine-path-reader-v2';
  const MANIFEST_URL='generated/corpus/manifest.json';
  const FREQUENCY_URL='generated/corpus/frequency.json';
  const bookCache=new Map();
  let manifest=null,frequency=null,currentBook=null,currentChapter=1,selectedWord=null;
  const POS={
    'A-':'adjective','C-':'conjunction','D-':'adverb','I-':'interjection','N-':'noun','P-':'preposition','RA':'article',
    'RD':'demonstrative pronoun','RI':'interrogative / indefinite pronoun','RP':'personal pronoun','RR':'relative pronoun','V-':'verb','X-':'particle'
  };
  const TENSE={P:'present',I:'imperfect',F:'future',A:'aorist',X:'perfect',Y:'pluperfect'};
  const VOICE={A:'active',M:'middle',P:'passive',E:'middle/passive',D:'middle deponent',O:'passive deponent',N:'middle/passive deponent'};
  const MOOD={I:'indicative',S:'subjunctive',O:'optative',M:'imperative',N:'infinitive',P:'participle'};
  const CASE={N:'nominative',G:'genitive',D:'dative',A:'accusative',V:'vocative'};
  const NUMBER={S:'singular',P:'plural'};
  const GENDER={M:'masculine',F:'feminine',N:'neuter'};
  const DEGREE={C:'comparative',S:'superlative'};
  const levelOrder=['R0','R1','R2','R3','R4'];
  const saved=(()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{}}catch{return{}}})();
  const readerState={
    book:saved.book||'John',chapter:Number(saved.chapter)||1,level:saved.level||defaultReaderLevel(),highlight:saved.highlight!==false,
    bookmarks:Array.isArray(saved.bookmarks)?saved.bookmarks:[],history:Array.isArray(saved.history)?saved.history:[],completed:Array.isArray(saved.completed)?saved.completed:[]
  };

  function saveReader(){localStorage.setItem(STORAGE_KEY,JSON.stringify(readerState));}
  function defaultReaderLevel(){const stage=learning.getDashboard().currentStage;return stage?.reader?.slice(-1)[0]||'R0';}
  function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]));}
  function parseMorph(code){
    code=String(code||'--------').padEnd(8,'-');
    return {person:/[123]/.test(code[0])?Number(code[0]):null,tense:TENSE[code[1]]||null,voice:VOICE[code[2]]||null,mood:MOOD[code[3]]||null,case:CASE[code[4]]||null,number:NUMBER[code[5]]||null,gender:GENDER[code[6]]||null,degree:DEGREE[code[7]]||null};
  }
  function formatParse(token){
    const m=parseMorph(token.parseCode),parts=[POS[token.posCode]||token.posCode];
    if(m.tense)parts.push(m.tense);if(m.voice)parts.push(m.voice);if(m.mood)parts.push(m.mood);if(m.person)parts.push(`${m.person}${m.person===1?'st':m.person===2?'nd':'rd'} person`);if(m.case)parts.push(m.case);if(m.number)parts.push(m.number);if(m.gender)parts.push(m.gender);if(m.degree)parts.push(m.degree);
    return parts.join(' · ');
  }
  function unitForToken(token){
    const paradigm=globalThis.KOINE_MORPHOLOGY_DATA?.items?.filter(x=>x.form===token.word&&x.lemma===token.lemma).sort((a,b)=>a.unitId-b.unitId)[0];
    if(paradigm)return paradigm.unitId;
    if(token.posCode==='RA')return 5;
    if(token.posCode==='P-'||token.posCode==='A-')return 10;
    if(token.posCode==='RP')return 26;if(token.posCode==='RD')return 27;if(token.posCode==='RR'||token.posCode==='RI')return 28;
    if(token.posCode==='N-')return 24;
    if(token.posCode==='V-'){
      if(token.lemma==='εἰμί')return 13;
      const m=parseMorph(token.parseCode);
      if(m.mood==='participle')return 31;if(m.mood==='infinitive')return 34;if(m.mood==='subjunctive')return 35;if(m.mood==='imperative')return 36;
      if(m.tense==='imperfect')return 17;if(m.tense==='future'&&m.voice==='passive')return 21;if(m.tense==='future')return 18;
      if(m.tense==='aorist'&&m.voice==='passive')return 21;if(m.tense==='aorist')return 19;
      if(m.tense==='perfect'||m.tense==='pluperfect')return 30;
      if(m.voice&&m.voice!=='active')return 14;
      return 12;
    }
    return 16;
  }
  function rankFor(lemma){return frequency?.byLemma?.get(lemma)||null;}
  function vocabStatus(lemma){
    const vocab=globalThis.KOINE_VOCAB_ENGINE,card=vocab?.state?.cards?.[`vocab.lemma.${lemma}`];
    if(!card)return'unknown';if(card.state==='review')return'known';return'learning';
  }
  function locationId(book=currentBook?.book?.id||readerState.book,chapter=currentChapter,verse=null){return verse?`${book}.${chapter}.${verse}`:`${book}.${chapter}`;}
  function recordHistory(){
    const id=locationId();readerState.history=[id,...readerState.history.filter(x=>x!==id)].slice(0,40);readerState.book=currentBook.book.id;readerState.chapter=currentChapter;saveReader();renderLibraryMeta();
  }
  function isBookmarked(id){return readerState.bookmarks.includes(id);}
  function toggleBookmark(){
    const verse=selectedWord?.verse||null,id=locationId(currentBook.book.id,currentChapter,verse);
    readerState.bookmarks=isBookmarked(id)?readerState.bookmarks.filter(x=>x!==id):[id,...readerState.bookmarks];saveReader();renderLibraryMeta();updateBookmarkButton();
  }
  function updateBookmarkButton(){const b=document.querySelector('#reader-bookmark');if(!b)return;const id=locationId(currentBook?.book?.id||readerState.book,currentChapter,selectedWord?.verse||null);b.textContent=isBookmarked(id)?'Bookmarked':'Bookmark';}

  async function fetchJson(url){const r=await fetch(url,{cache:'force-cache'});if(!r.ok)throw new Error(`${url}: HTTP ${r.status}`);return r.json();}
  async function loadManifest(){
    try{
      const [m,f]=await Promise.all([fetchJson(MANIFEST_URL),fetchJson(FREQUENCY_URL)]);manifest=m;frequency={...f,byLemma:new Map(f.entries.map(e=>[e.lemma,e]))};
      globalThis.KOINE_CANONICAL_FREQUENCY=f;
      globalThis.dispatchEvent(new CustomEvent('koine:canonical-frequency',{detail:f}));
      return true;
    }catch(err){console.warn('BG6 corpus unavailable; using John 1:1 foundation fixture.',err);return false;}
  }
  async function loadBook(id){
    if(bookCache.has(id))return bookCache.get(id);
    if(!manifest)return null;
    const data=await fetchJson(`generated/corpus/books/${encodeURIComponent(id)}.json`);bookCache.set(id,data);return data;
  }

  function buildShell(){
    const host=document.querySelector('#read');
    host.innerHTML=`
      <div class="eyebrow">Greek New Testament reader · BG6</div>
      <div class="reader-title-row"><div><h1 id="reader-heading">Greek New Testament</h1><p class="lede">Read the full pinned SBLGNT with morphology, controlled assistance, vocabulary linkage, and mastery-aware self-checking.</p></div><span class="reader-corpus-status" id="reader-corpus-status">Loading corpus…</span></div>
      <div class="reader-toolbar panel">
        <label>Book<select id="reader-book"></select></label><label>Chapter<select id="reader-chapter"></select></label>
        <button class="btn" id="reader-prev">←</button><button class="btn" id="reader-next">→</button>
        <label>Assistance<select id="reader-level">${levelOrder.map(id=>`<option value="${id}">${id} · ${fixture?globalThis.KOINE_CURRICULUM.readerLevels.find(x=>x.id===id)?.name||id:id}</option>`).join('')}</select></label>
        <label class="reader-check"><input type="checkbox" id="reader-highlight"> Vocabulary status</label><button class="btn" id="reader-bookmark">Bookmark</button><button class="btn primary" id="reader-complete">Mark chapter read</button>
      </div>
      <div class="two-col reader-layout bg6-reader-layout">
        <article class="panel reader-text" id="reader-text"><div class="empty">Loading Greek text…</div></article>
        <aside class="panel word-panel">
          <div class="eyebrow">Word inspector</div><div class="word-form" id="word-form">Select a word</div><p id="word-prompt">Attempt the form and lemma before using assistance.</p>
          <div class="reader-token-meta" id="reader-token-meta"></div><div class="hint-box" id="hint-box">No assistance revealed.</div>
          <div class="hint-actions" id="reader-help-actions"><button class="btn" id="hint-1">Hint</button><button class="btn" id="hint-2">Lemma</button><button class="btn primary" id="hint-3">Full parse</button></div>
          <div id="reader-parse-zone"></div><button class="btn" id="reader-parse">Parse this word</button><button class="btn" id="add-review">Add to review</button>
        </aside>
      </div>
      <div class="reader-bottom-grid">
        <details class="panel"><summary>Reading history</summary><div id="reader-history"></div></details>
        <details class="panel"><summary>Bookmarks</summary><div id="reader-bookmarks"></div></details>
        <details class="panel"><summary>Corpus & assistance policy</summary><p id="reader-source-note">Loading provenance…</p></details>
      </div>`;
    document.querySelector('#reader-level').value=readerState.level;document.querySelector('#reader-highlight').checked=readerState.highlight;
    document.querySelector('#reader-level').addEventListener('change',e=>{readerState.level=e.target.value;saveReader();applyLevel();});
    document.querySelector('#reader-highlight').addEventListener('change',e=>{readerState.highlight=e.target.checked;saveReader();renderChapter();});
    document.querySelector('#reader-book').addEventListener('change',e=>openLocation(e.target.value,1));
    document.querySelector('#reader-chapter').addEventListener('change',e=>openLocation(currentBook.book.id,Number(e.target.value)));
    document.querySelector('#reader-prev').addEventListener('click',()=>stepChapter(-1));document.querySelector('#reader-next').addEventListener('click',()=>stepChapter(1));
    document.querySelector('#reader-bookmark').addEventListener('click',toggleBookmark);document.querySelector('#reader-complete').addEventListener('click',markChapterRead);
    document.querySelector('#hint-1').addEventListener('click',()=>revealReader('hint'));document.querySelector('#hint-2').addEventListener('click',()=>revealReader('lemma'));document.querySelector('#hint-3').addEventListener('click',()=>revealReader('full'));
    document.querySelector('#reader-parse').addEventListener('click',openParseCheck);
    document.querySelector('#add-review').addEventListener('click',()=>{if(!selectedWord)return;learning.recordError({unitId:selectedWord.unitId,type:'syntax_relation',itemId:selectedWord.id,source:'full-reader'});if(!state.review.some(r=>r.form===selectedWord.form)){state.review.push({form:selectedWord.form,answer:selectedWord.parse,reason:'Reader difficulty',unitId:selectedWord.unitId,errorType:'syntax_relation'});save();}});
  }
  function applyLevel(){
    const host=document.querySelector('#read');host.dataset.readerLevel=readerState.level;
    const help=document.querySelector('#reader-help-actions');if(help)help.hidden=readerState.level==='R4';
    const prompt=document.querySelector('#word-prompt');if(prompt&&readerState.level==='R4'&&!selectedWord)prompt.textContent='Independent practicum: read the passage first; select a word only when you need to inspect it.';
  }
  function populateBooks(){const sel=document.querySelector('#reader-book');sel.innerHTML=manifest.books.map(b=>`<option value="${b.id}">${b.name}</option>`).join('');sel.value=readerState.book;}
  function populateChapters(){const sel=document.querySelector('#reader-chapter');sel.innerHTML=Array.from({length:currentBook.book.chapters},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');sel.value=String(currentChapter);}

  async function openLocation(bookId,chapter){
    try{
      const book=await loadBook(bookId);if(!book)throw new Error('book unavailable');currentBook=book;currentChapter=Math.max(1,Math.min(Number(chapter)||1,book.book.chapters));selectedWord=null;
      document.querySelector('#reader-book').value=bookId;populateChapters();renderChapter();recordHistory();
    }catch(err){document.querySelector('#reader-text').innerHTML=`<div class="empty">Unable to load this book. ${escapeHtml(err.message)}</div>`;}
  }
  async function stepChapter(delta){
    const idx=manifest.books.findIndex(b=>b.id===currentBook.book.id);let c=currentChapter+delta,b=idx;if(c<1){b--;if(b<0)return;c=manifest.books[b].chapters}else if(c>currentBook.book.chapters){b++;if(b>=manifest.books.length)return;c=1}await openLocation(manifest.books[b].id,c);
  }
  function renderChapter(){
    if(!currentBook)return;const verses=currentBook.chapters[String(currentChapter)]||{};
    const html=Object.entries(verses).map(([verse,tokens])=>`<p class="reader-verse" data-verse="${verse}"><sup>${verse}</sup> ${tokens.map(token=>{
      const status=readerState.highlight?vocabStatus(token.lemma):'plain';return `<button class="word vocab-${status}" data-token-id="${token.id}" data-verse="${verse}" title="${readerState.level==='R0'?escapeHtml(POS[token.posCode]||token.posCode):''}">${escapeHtml(token.text)}</button>`;
    }).join(' ')}</p>`).join('');
    document.querySelector('#reader-text').innerHTML=html||'<div class="empty">No tokens found.</div>';
    document.querySelector('#reader-heading').textContent=`${currentBook.book.name} ${currentChapter}`;
    document.querySelectorAll('#reader-text .word').forEach(b=>b.addEventListener('click',()=>selectToken(Number(b.dataset.verse),b.dataset.tokenId)));
    document.querySelector('#reader-complete').textContent=readerState.completed.includes(locationId())?'Chapter read ✓':'Mark chapter read';
    updateBookmarkButton();applyLevel();
  }
  function tokenFor(verse,id){return currentBook.chapters[String(currentChapter)]?.[String(verse)]?.find(t=>t.id===id)||null;}
  function selectToken(verse,id){
    const token=tokenFor(verse,id);if(!token)return;const unitId=unitForToken(token),freq=rankFor(token.lemma),status=vocabStatus(token.lemma),annotation=fixture.learningAnnotations?.[token.id];
    selectedWord={id:token.id,token,verse,unitId,form:token.word,lemma:token.lemma,parse:formatParse(token),annotation,assistance:'none'};
    document.querySelectorAll('#reader-text .word').forEach(b=>b.classList.toggle('selected',b.dataset.tokenId===id));
    document.querySelector('#word-form').textContent=token.word;document.querySelector('#word-prompt').textContent=`${currentBook.book.name} ${currentChapter}:${verse} · canonical Unit ${unitId}`;
    document.querySelector('#reader-token-meta').innerHTML=`<span>${escapeHtml(POS[token.posCode]||token.posCode)}</span>${freq?`<span>#${freq.rank} · ${freq.count.toLocaleString()} NT</span>`:''}<span>${status}</span>`;
    document.querySelector('#hint-box').textContent=readerState.level==='R0'?(annotation?.hint||`Use the visible ending and ${POS[token.posCode]||'word class'} before revealing the lemma.`):'No assistance revealed.';
    document.querySelector('#reader-parse-zone').innerHTML='';learning.recordExposure({unitId,itemId:token.id,source:'full-reader'});
    if(!state.words.includes(token.id)){state.words.push(token.id);save();}updateBookmarkButton();
  }
  function revealReader(level){
    if(!selectedWord)return;selectedWord.assistance=level;learning.recordHint({unitId:selectedWord.unitId,itemId:selectedWord.id,level,source:'full-reader'});
    const box=document.querySelector('#hint-box'),freq=rankFor(selectedWord.lemma),vocab=globalThis.KOINE_VOCAB_ENGINE?.entry?.(selectedWord.lemma);
    if(level==='hint')box.textContent=selectedWord.annotation?.hint||`Start with ${POS[selectedWord.token.posCode]||selectedWord.token.posCode}; identify the ending before translating.`;
    if(level==='lemma')box.innerHTML=`Lemma: <span class="greek">${escapeHtml(selectedWord.lemma)}</span>${vocab?.referenceGloss?`<br><small>Reference gloss: ${escapeHtml(vocab.referenceGloss)} — a recall prompt, not a contextual definition.</small>`:''}`;
    if(level==='full')box.innerHTML=`<strong>${escapeHtml(selectedWord.parse)}</strong><br><small>Source parse ${escapeHtml(selectedWord.token.parseCode)}${freq?` · lemma rank #${freq.rank}`:''}. Morphology does not by itself determine contextual meaning.</small>`;
    if(window.renderLearningEngineUI)window.renderLearningEngineUI();
  }
  function diagnoseParse(correct,chosen){const order=['person_number','tense_form','voice','mood','case_confusion','gender_number_agreement','gender_number_agreement'];for(let i=0;i<7;i++)if(correct[i]!==chosen[i]&&correct[i]!=='-'&&chosen[i]!=='-')return order[i];return'syntax_relation';}
  function openParseCheck(){
    if(!selectedWord)return;const verseTokens=currentBook.chapters[String(currentChapter)][String(selectedWord.verse)],correct=formatParse(selectedWord.token);
    const candidates=[selectedWord.token,...verseTokens.filter(t=>formatParse(t)!==correct)].filter((t,i,a)=>a.findIndex(x=>formatParse(x)===formatParse(t))===i).slice(0,4);
    while(candidates.length<4){const fake={...selectedWord.token,parseCode:selectedWord.token.parseCode.split('').map((c,i)=>i===4?(c==='N'?'A':'N'):c).join('')};if(!candidates.some(x=>formatParse(x)===formatParse(fake)))candidates.push(fake);else break;}
    candidates.sort((a,b)=>a.parseCode.localeCompare(b.parseCode));
    document.querySelector('#reader-parse-zone').innerHTML=`<div class="reader-parse-options"><small>Choose before revealing help.</small>${candidates.map((t,i)=>`<button class="btn" data-parse-option="${i}">${escapeHtml(formatParse(t))}</button>`).join('')}</div>`;
    document.querySelectorAll('[data-parse-option]').forEach(b=>b.addEventListener('click',()=>{
      const chosen=candidates[Number(b.dataset.parseOption)],ok=formatParse(chosen)===correct,u=learning.getUnit(selectedWord.unitId),error=ok?null:diagnoseParse(selectedWord.token.parseCode,chosen.parseCode);
      if(u?.accessible)learning.recordEvidence({unitId:selectedWord.unitId,dimension:'recognition',correct:ok,hintLevel:selectedWord.assistance,errorType:error,itemId:selectedWord.id,source:'reader-parse',confidence:.7});else learning.recordExposure({unitId:selectedWord.unitId,itemId:selectedWord.id,source:'reader-parse-preview'});
      document.querySelector('#reader-parse-zone').innerHTML=`<div class="feedback ${ok?'good':'bad'}">${ok?'Correct.':'Not yet.'} ${escapeHtml(correct)}${!ok?` · ${escapeHtml(error.replaceAll('_',' '))}`:''}</div>`;if(window.renderLearningEngineUI)window.renderLearningEngineUI();
    }));
  }
  function readingUnit(){const id=currentBook.book.id;if(id==='1John')return 45;if(id==='Mark')return 46;if(id==='Phil')return 47;return 50;}
  function markChapterRead(){
    const id=locationId();if(!readerState.completed.includes(id))readerState.completed.push(id);const unitId=readingUnit(),u=learning.getUnit(unitId);if(u?.accessible)learning.recordEvidence({unitId,dimension:'reading',correct:true,hintLevel:readerState.level==='R4'?'none':readerState.level==='R3'?'hint':'lemma',itemId:id,source:'chapter-reading',confidence:.45});else learning.recordExposure({unitId,itemId:id,source:'chapter-reading-preview'});saveReader();renderChapter();
  }
  function renderLibraryMeta(){
    const hist=document.querySelector('#reader-history'),marks=document.querySelector('#reader-bookmarks');if(!hist||!marks)return;
    hist.innerHTML=readerState.history.length?readerState.history.map(x=>`<button class="reader-loc-link" data-reader-loc="${x}">${x}</button>`).join(''):'<small>No reading history yet.</small>';
    marks.innerHTML=readerState.bookmarks.length?readerState.bookmarks.map(x=>`<button class="reader-loc-link" data-reader-loc="${x}">${x}</button>`).join(''):'<small>No bookmarks yet.</small>';
    document.querySelectorAll('[data-reader-loc]').forEach(b=>b.addEventListener('click',()=>{const p=b.dataset.readerLoc.split('.'),book=p[0],chapter=Number(p[1]);openLocation(book,chapter).then(()=>{if(p[2])document.querySelector(`[data-verse="${p[2]}"]`)?.scrollIntoView({behavior:'smooth',block:'center'});});}));
  }
  function renderFallback(){
    const passage=fixture.passages['John.1.1'];currentBook={book:{id:'John',name:'John',chapters:1},chapters:{'1':{'1':passage.tokens}}};currentChapter=1;
    document.querySelector('#reader-corpus-status').textContent='Foundation fixture';document.querySelector('#reader-book').innerHTML='<option value="John">John</option>';populateChapters();renderChapter();
    document.querySelector('#reader-source-note').textContent='Full generated corpus is unavailable in this environment. John 1:1 is being served from the validated BG2 fixture.';
  }

  async function init(){
    buildShell();applyLevel();renderLibraryMeta();const ok=await loadManifest();
    if(!ok){renderFallback();return;}
    document.querySelector('#reader-corpus-status').textContent=`${manifest.coverage.books} books · ${manifest.coverage.tokens.toLocaleString()} tokens`;
    document.querySelector('#reader-source-note').textContent=`SBLGNT text (CC BY 4.0) + MorphGNT morphology/lemmatization (CC BY-SA 3.0), pinned revision ${manifest.source.revision}. ${manifest.coverage.books} books, ${manifest.coverage.chapters} chapters, ${manifest.coverage.verses} verses, ${manifest.coverage.tokens.toLocaleString()} tokens. Assistance is learner-state data and never modifies the canonical parse.`;
    populateBooks();if(!manifest.books.some(b=>b.id===readerState.book))readerState.book='John';await openLocation(readerState.book,readerState.chapter);
  }

  globalThis.KOINE_FULL_READER={init,parseMorph,formatParse,unitForToken,get state(){return readerState},get manifest(){return manifest},get frequency(){return frequency}};
  init();
})();