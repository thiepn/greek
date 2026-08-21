(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.KoineMorphologyLab=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const STORAGE_KEY='koine-path-morphology-lab-v1';
  const MODES=['parse','build','contrast','principal'];
  const FOCI=['foundation','verbs','nominals','advanced','all'];
  const FEATURE_LABELS={case:'case',number:'number',gender:'gender',tense:'tense',voice:'voice',mood:'mood',person:'person',degree:'degree'};
  const ERROR_BY_FEATURE={case:'case_confusion',number:'gender_number_agreement',gender:'gender_number_agreement',tense:'tense_form',voice:'voice',mood:'mood',person:'person_number'};
  const SLOT_LABELS=['present / lexical','future','aorist active/middle','perfect active','perfect middle/passive','aorist passive'];

  function clone(v){return JSON.parse(JSON.stringify(v));}
  function safeParse(v){try{return JSON.parse(v);}catch{return null;}}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  class MemoryStorage{
    constructor(seed={}){this.map=new Map(Object.entries(seed));}
    getItem(k){return this.map.has(k)?this.map.get(k):null;}
    setItem(k,v){this.map.set(k,String(v));}
    removeItem(k){this.map.delete(k);}
  }
  function defaultState(){return {version:1,attempts:0,correct:0,streak:0,bestStreak:0,mode:'parse',focus:'foundation',assistance:'none',byFamily:{},recent:[]};}
  function shuffle(list,rng){const out=list.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
  function unique(list){return [...new Set(list)];}

  class MorphologyLab{
    constructor({data,learningEngine=null,storage=null,rng=Math.random}={}){
      if(!data||!Array.isArray(data.items)) throw new Error('MorphologyLab requires KOINE_MORPHOLOGY_DATA.');
      this.data=data;this.learningEngine=learningEngine;this.storage=storage||((typeof localStorage!=='undefined')?localStorage:new MemoryStorage());this.rng=rng;
      this.state={...defaultState(),...(safeParse(this.storage.getItem(STORAGE_KEY))||{})};
      if(!MODES.includes(this.state.mode)) this.state.mode='parse';
      if(!FOCI.includes(this.state.focus)) this.state.focus='foundation';
      this.current=null;this.persist();
    }
    persist(){this.storage.setItem(STORAGE_KEY,JSON.stringify(this.state));}
    snapshot(){return clone(this.state);}
    setMode(mode){if(!MODES.includes(mode)) throw new Error(`Unknown morphology mode ${mode}`);this.state.mode=mode;this.persist();return this.next();}
    setFocus(focus){if(!FOCI.includes(focus)) throw new Error(`Unknown morphology focus ${focus}`);this.state.focus=focus;this.persist();return this.next();}
    resetAssistance(){this.state.assistance='none';this.persist();}
    allowedItems(){
      let items=this.data.items.slice();
      const f=this.state.focus;
      if(f==='foundation') items=items.filter(x=>x.unitId<=16);
      if(f==='verbs') items=items.filter(x=>x.features.partOfSpeech==='verb');
      if(f==='nominals') items=items.filter(x=>['article','noun','adjective','pronoun'].includes(x.features.partOfSpeech));
      if(f==='advanced') items=items.filter(x=>x.unitId>=24);
      return items;
    }
    familyWeight(item){
      const stats=this.state.byFamily[item.family]||{attempts:0,correct:0};
      const accuracy=stats.attempts?stats.correct/stats.attempts:.72;
      let weight=1+(1-accuracy)*2;
      if(this.learningEngine){
        const u=this.learningEngine.getUnit(item.unitId);
        if(u&&u.accessible) weight+=1.2;
        if(u&&u.status==='review') weight+=2;
        const errors=this.learningEngine.snapshot().errors||{};
        Object.values(errors).forEach(e=>{if(e.units&&e.units[String(item.unitId)]) weight+=Math.min(2,e.units[String(item.unitId)]*.25);});
      }
      if(this.state.recent.includes(item.id)) weight*=.25;
      return Math.max(.05,weight);
    }
    weightedPick(items){
      const weights=items.map(i=>this.familyWeight(i)),total=weights.reduce((a,b)=>a+b,0);let r=this.rng()*total;
      for(let i=0;i<items.length;i++){r-=weights[i];if(r<=0)return items[i];}return items[items.length-1];
    }
    parseVariants(item){return this.data.items.filter(x=>x.form===item.form&&x.lemma===item.lemma);}
    combinedParse(item){
      const labels=unique(this.parseVariants(item).map(x=>this.data.label(x)));
      return labels.length===1?labels[0]:labels.join(' / ');
    }
    distractorItems(target,pool,count=3){
      const scored=pool.filter(x=>x.id!==target.id&&x.form!==target.form).map(x=>({x,d:this.data.difference(target,x).length})).sort((a,b)=>a.d-b.d||a.x.unitId-b.x.unitId);
      const labels=new Set(),out=[];
      for(const {x} of scored){const label=this.data.label(x);if(label===this.combinedParse(target)||labels.has(label))continue;labels.add(label);out.push(x);if(out.length===count)break;}
      return out;
    }
    makeParse(){
      const pool=this.allowedItems(),target=this.weightedPick(pool),answer=this.combinedParse(target);
      const distractors=this.distractorItems(target,pool,5).map(x=>this.data.label(x));
      const options=shuffle(unique([answer,...distractors]).slice(0,4),this.rng).map((label,i)=>({id:`o${i}`,label,correct:label===answer}));
      return {id:`q.parse.${target.id}`,mode:'parse',unitId:target.unitId,item:target,prompt:'Parse this form.',display:target.form,subprompt:`lemma: ${target.lemma}`,answer,options,dimension:'recognition'};
    }
    makeBuild(){
      const pool=this.allowedItems(),target=this.weightedPick(pool),answer=target.form;
      const near=this.distractorItems(target,pool,5).map(x=>x.form);
      const options=shuffle(unique([answer,...near]).slice(0,4),this.rng).map((label,i)=>({id:`o${i}`,label,correct:label===answer}));
      return {id:`q.build.${target.id}`,mode:'build',unitId:target.unitId,item:target,prompt:'Choose the form that matches this morphology.',display:this.data.label(target),subprompt:`lemma: ${target.lemma}`,answer,options,dimension:'application'};
    }
    makeContrast(){
      const pool=this.allowedItems();
      const candidates=[];
      pool.forEach(a=>pool.forEach(b=>{if(a.id>=b.id||a.lemma!==b.lemma)return;const diff=this.data.difference(a,b);if(diff.length===1)candidates.push({a,b,feature:diff[0]});}));
      if(!candidates.length) return this.makeParse();
      const pick=candidates[Math.floor(this.rng()*candidates.length)],answer=FEATURE_LABELS[pick.feature]||pick.feature;
      const distractors=shuffle(Object.values(FEATURE_LABELS).filter(x=>x!==answer),this.rng).slice(0,3);
      const options=shuffle([answer,...distractors],this.rng).map((label,i)=>({id:`o${i}`,label,correct:label===answer}));
      return {id:`q.contrast.${pick.a.id}.${pick.b.id}`,mode:'contrast',unitId:Math.max(pick.a.unitId,pick.b.unitId),item:pick.a,comparison:pick.b,prompt:'What morphological feature changes?',display:`${pick.a.form} → ${pick.b.form}`,subprompt:`same lemma: ${pick.a.lemma}`,answer,options,dimension:'recognition',changedFeature:pick.feature};
    }
    makePrincipal(){
      const lemmas=Object.keys(this.data.principalParts),lemma=lemmas[Math.floor(this.rng()*lemmas.length)],parts=this.data.principalParts[lemma],slot=Math.floor(this.rng()*parts.length),form=parts[slot],answer=SLOT_LABELS[slot];
      const options=shuffle(SLOT_LABELS.map((label,i)=>({id:`o${i}`,label,correct:i===slot})),this.rng).slice(0,4);
      if(!options.some(o=>o.correct)) options[0]={id:options[0].id,label:answer,correct:true};
      return {id:`q.principal.${lemma}.${slot}`,mode:'principal',unitId:22,item:{id:`principal.${lemma}.${slot}`,form,lemma,family:'principal-parts',unitId:22,features:{partOfSpeech:'verb'}},prompt:'Identify this principal-part slot.',display:form,subprompt:`lexeme: ${lemma}`,answer,options,dimension:'recognition'};
    }
    next(){
      this.resetAssistance();
      this.current=this.state.mode==='build'?this.makeBuild():this.state.mode==='contrast'?this.makeContrast():this.state.mode==='principal'?this.makePrincipal():this.makeParse();
      this.state.recent=[...this.state.recent.filter(x=>x!==this.current.item.id),this.current.item.id].slice(-8);this.persist();return clone(this.current);
    }
    hint(level='hint'){
      if(!this.current)return null;
      if(!['hint','lemma','full'].includes(level))throw new Error(`Unknown assistance ${level}`);
      this.state.assistance=level;this.persist();
      if(this.learningEngine)this.learningEngine.recordHint({unitId:this.current.unitId,itemId:this.current.item.id,level,source:'morphology-lab'});
      if(level==='hint'){
        const f=this.current.item.features||{};
        if(this.current.mode==='principal')return 'Think in the six principal-part slots rather than translating the form.';
        if(this.current.mode==='contrast')return `Compare endings first; only one feature changes.`;
        return `Start with ${f.partOfSpeech||'form class'}, then identify the most visible ending signal.`;
      }
      if(level==='lemma')return `Lemma: ${this.current.item.lemma}`;
      return `Answer: ${this.current.answer}`;
    }
    diagnose(option){
      const q=this.current;if(!q)return 'syntax_relation';
      if(q.mode==='principal')return 'principal_part';
      if(q.mode==='contrast')return ERROR_BY_FEATURE[q.changedFeature]||'declension_pattern';
      if(q.mode==='build')return q.item.features.partOfSpeech==='verb'?'tense_form':'declension_pattern';
      const chosen=this.data.items.find(x=>this.data.label(x)===option.label);
      if(!chosen)return q.item.features.partOfSpeech==='verb'?'tense_form':'declension_pattern';
      const diff=this.data.difference(q.item,chosen);
      return ERROR_BY_FEATURE[diff[0]]||(q.item.features.partOfSpeech==='verb'?'tense_form':'declension_pattern');
    }
    answer(optionId){
      if(!this.current)throw new Error('No current morphology question.');
      const option=this.current.options.find(o=>o.id===optionId);if(!option)throw new Error('Unknown option.');
      const correct=!!option.correct,errorType=correct?null:this.diagnose(option),family=this.current.item.family;
      this.state.attempts++;if(correct){this.state.correct++;this.state.streak++;this.state.bestStreak=Math.max(this.state.bestStreak,this.state.streak);}else this.state.streak=0;
      const fs=this.state.byFamily[family]||(this.state.byFamily[family]={attempts:0,correct:0});fs.attempts++;if(correct)fs.correct++;
      if(this.learningEngine)this.learningEngine.recordEvidence({unitId:this.current.unitId,dimension:this.current.dimension,correct,hintLevel:this.state.assistance,errorType,itemId:this.current.item.id,source:'morphology-lab'});
      this.persist();
      return {correct,errorType,answer:this.current.answer,selected:option.label,assistance:this.state.assistance,unitId:this.current.unitId};
    }
    stats(){const s=this.snapshot();return {...s,accuracy:s.attempts?Math.round(s.correct/s.attempts*100):null};}
  }

  return {STORAGE_KEY,MODES,FOCI,FEATURE_LABELS,ERROR_BY_FEATURE,SLOT_LABELS,MemoryStorage,MorphologyLab};
});