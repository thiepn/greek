(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.KoineLearning=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const SCHEMA_VERSION=3;
  const STORAGE_KEY='koine-path-learning-v3';
  const LEGACY_KEY='koine-path-v01';
  const DIMENSIONS=['concept','recognition','application','reading'];
  const DIMENSION_CONFIG={
    concept:{threshold:80,minEvidence:2,weight:.20,graceDays:21,decayPerDay:.20},
    recognition:{threshold:85,minEvidence:4,weight:.30,graceDays:10,decayPerDay:.45},
    application:{threshold:80,minEvidence:3,weight:.25,graceDays:14,decayPerDay:.35},
    reading:{threshold:75,minEvidence:2,weight:.25,graceDays:10,decayPerDay:.50}
  };
  const HINT_FACTORS={none:1,hint:.82,lemma:.55,full:.25};
  const ERROR_TYPES=Object.freeze({
    case_confusion:'Case confusion',gender_number_agreement:'Gender/number agreement',declension_pattern:'Declension pattern',person_number:'Person/number',tense_form:'Tense-form recognition',voice:'Voice recognition',mood:'Mood recognition',principal_part:'Principal-part failure',pronoun_antecedent:'Pronoun/antecedent',syntax_relation:'Syntax relationship',vocabulary_retrieval:'Vocabulary retrieval',preposition_case:'Preposition/case relationship',word_order_overreliance:'Word-order overreliance',translation_overliteral:'Over-literal translation',lexical_overreach:'Lexical overreach',premature_reveal:'Premature answer reveal'
  });
  const PROTOTYPE_UNIT_MAP=Object.freeze({alphabet:1,article:5,nouns:7,verbs:12,john1:16});
  const UNIT_COMPOSITE_THRESHOLD=82,STAGE_COMPOSITE_THRESHOLD=85,STAGE_RECOGNITION_THRESHOLD=88,MIN_STAGE_DIMENSION=75,REVIEW_INTERVAL_DAYS=14,MAX_EVENTS=400;

  const clone=v=>JSON.parse(JSON.stringify(v));
  const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,n));
  const iso=v=>new Date(v).toISOString();
  const daysBetween=(a,b)=>Math.max(0,(new Date(b)-new Date(a))/86400000);
  const addDays=(d,n)=>new Date(new Date(d).getTime()+n*86400000).toISOString();
  const safeParse=raw=>{try{return JSON.parse(raw)}catch{return null}};
  const uid=(prefix,date,n)=>`${prefix}.${new Date(date).getTime()}.${n}`;

  function flattenCurriculum(curriculum){
    const out=[];
    curriculum.stages.forEach((stage,stageIndex)=>stage.units.forEach((id,localIndex)=>out.push({id,stageId:stage.id,stageIndex,localIndex,title:stage.unitTitles[localIndex],reader:stage.reader,vocabTarget:stage.vocabTarget})));
    return out;
  }
  const blankDim=()=>({score:0,evidence:0,correct:0,lastAt:null});
  const blankUnit=meta=>({id:meta.id,stageId:meta.stageId,status:meta.id===1?'available':'locked',dimensions:{concept:blankDim(),recognition:blankDim(),application:blankDim(),reading:blankDim()},firstActivityAt:null,lastActivityAt:null,masteredAt:null,nextReviewAt:null,reviewIntervalDays:REVIEW_INTERVAL_DAYS,attempts:0,hints:{hint:0,lemma:0,full:0},errors:0});

  function initialState(curriculum,date){
    const s={schemaVersion:SCHEMA_VERSION,curriculumVersion:curriculum.version,createdAt:iso(date),updatedAt:iso(date),units:{},stages:{},errors:{},remediation:[],events:[],prototype:{done:[],attempts:0,correct:0,review:[],words:[]},migration:{from:null,at:null,legacyImported:false},settings:{decayEnabled:true},counters:{event:0,remediation:0}};
    flattenCurriculum(curriculum).forEach(meta=>s.units[String(meta.id)]=blankUnit(meta));
    curriculum.stages.forEach(stage=>s.stages[stage.id]={id:stage.id,passedAt:null});
    return s;
  }

  function migrateLegacy(state,legacy,date){
    if(!legacy||typeof legacy!=='object') return state;
    state.prototype={done:Array.isArray(legacy.done)?legacy.done.slice():[],attempts:Number(legacy.attempts)||0,correct:Number(legacy.correct)||0,review:Array.isArray(legacy.review)?clone(legacy.review):[],words:Array.isArray(legacy.words)?legacy.words.slice():[]};
    state.prototype.done.forEach(key=>{
      const unit=state.units[String(PROTOTYPE_UNIT_MAP[key])];if(!unit)return;
      const dim=key==='john1'?'reading':(key==='nouns'||key==='verbs'?'application':'concept');
      unit.dimensions[dim]={score:55,evidence:1,correct:1,lastAt:iso(date)};unit.firstActivityAt=unit.lastActivityAt=iso(date);unit.status='in-progress';
    });
    state.migration={from:LEGACY_KEY,at:iso(date),legacyImported:true};
    return state;
  }

  class MemoryStorage{constructor(seed={}){this.map=new Map(Object.entries(seed))}getItem(k){return this.map.has(k)?this.map.get(k):null}setItem(k,v){this.map.set(k,String(v))}removeItem(k){this.map.delete(k)}}

  class LearningEngine{
    constructor({curriculum,storage,clock}={}){
      if(!curriculum?.stages) throw new Error('LearningEngine requires KOINE_CURRICULUM.');
      this.curriculum=curriculum;this.units=flattenCurriculum(curriculum);this.storage=storage||((typeof localStorage!=='undefined')?localStorage:new MemoryStorage());this.clock=clock||(()=>new Date());this.state=this.load();this.recompute();this.persist();
    }
    now(){return this.clock()}
    load(){
      const saved=safeParse(this.storage.getItem(STORAGE_KEY));
      if(saved?.schemaVersion===SCHEMA_VERSION){
        const base=initialState(this.curriculum,this.now());
        const merged={...base,...saved,units:{...base.units,...(saved.units||{})},stages:{...base.stages,...(saved.stages||{})}};
        this.units.forEach(meta=>{const u=merged.units[String(meta.id)]||blankUnit(meta);u.dimensions={...blankUnit(meta).dimensions,...(u.dimensions||{})};DIMENSIONS.forEach(d=>u.dimensions[d]={...blankDim(),...(u.dimensions[d]||{})});merged.units[String(meta.id)]=u});
        return merged;
      }
      return migrateLegacy(initialState(this.curriculum,this.now()),safeParse(this.storage.getItem(LEGACY_KEY)),this.now());
    }
    persist(){this.state.updatedAt=iso(this.now());this.storage.setItem(STORAGE_KEY,JSON.stringify(this.state))}
    snapshot(){return clone(this.state)}
    getPrototypeState(){return clone(this.state.prototype)}
    updatePrototypeState(next){this.state.prototype={done:Array.isArray(next.done)?next.done.slice():[],attempts:Number(next.attempts)||0,correct:Number(next.correct)||0,review:Array.isArray(next.review)?clone(next.review):[],words:Array.isArray(next.words)?next.words.slice():[]};this.persist()}
    unitMeta(id){return this.units.find(u=>u.id===Number(id))}
    rawUnit(id){return this.state.units[String(id)]||null}
    stageMeta(id){return this.curriculum.stages.find(s=>s.id===id)||null}

    effectiveDimension(unitId,dimension,at=this.now()){
      const rec=this.rawUnit(unitId)?.dimensions[dimension],cfg=DIMENSION_CONFIG[dimension];if(!rec||!cfg)return 0;if(!this.state.settings.decayEnabled||!rec.lastAt)return clamp(rec.score);
      const over=Math.max(0,daysBetween(rec.lastAt,at)-cfg.graceDays);return clamp(rec.score-Math.min(25,over*cfg.decayPerDay));
    }
    unitComposite(unitId,at=this.now()){return DIMENSIONS.reduce((s,d)=>s+this.effectiveDimension(unitId,d,at)*DIMENSION_CONFIG[d].weight,0)}
    dimensionReady(unitId,d,at=this.now()){const r=this.rawUnit(unitId)?.dimensions[d],c=DIMENSION_CONFIG[d];return !!r&&r.evidence>=c.minEvidence&&this.effectiveDimension(unitId,d,at)>=c.threshold}
    unitMasteryReady(unitId,at=this.now()){return DIMENSIONS.every(d=>this.dimensionReady(unitId,d,at))&&this.unitComposite(unitId,at)>=UNIT_COMPOSITE_THRESHOLD}

    localStageMetrics(stageId,at=this.now()){
      const stage=this.stageMeta(stageId);if(!stage)return null;
      const composites=stage.units.map(id=>this.unitComposite(id,at));const recognitions=stage.units.map(id=>this.effectiveDimension(id,'recognition',at));let minimum=100;
      stage.units.forEach(id=>DIMENSIONS.forEach(d=>minimum=Math.min(minimum,this.effectiveDimension(id,d,at))));
      const allReady=stage.units.every(id=>this.unitMasteryReady(id,at));
      const composite=composites.reduce((a,b)=>a+b,0)/composites.length,recognition=recognitions.reduce((a,b)=>a+b,0)/recognitions.length;
      const locallyStrong=allReady&&composite>=STAGE_COMPOSITE_THRESHOLD&&recognition>=STAGE_RECOGNITION_THRESHOLD&&minimum>=MIN_STAGE_DIMENSION;
      return {allReady,composite,recognition,minimum,locallyStrong};
    }
    stageGatePassed(stageId){return !!this.state.stages[stageId]?.passedAt}
    prerequisiteSatisfied(unitId){
      const meta=this.unitMeta(unitId);if(!meta)return false;if(meta.id===1)return true;
      if(meta.localIndex===0){const prev=this.curriculum.stages[meta.stageIndex-1];return !!prev&&this.stageGatePassed(prev.id)}
      return !!this.rawUnit(meta.id-1)?.masteredAt;
    }
    reviewDue(unitId,at=this.now()){
      const u=this.rawUnit(unitId);return !!u?.masteredAt&&(!this.unitMasteryReady(unitId,at)||(u.nextReviewAt&&new Date(u.nextReviewAt)<=new Date(at)));
    }
    getUnit(unitId,at=this.now()){
      const meta=this.unitMeta(unitId),raw=this.rawUnit(unitId);if(!meta||!raw)return null;
      const dimensions={};DIMENSIONS.forEach(d=>dimensions[d]={...clone(raw.dimensions[d]),effective:Math.round(this.effectiveDimension(unitId,d,at)),threshold:DIMENSION_CONFIG[d].threshold,minEvidence:DIMENSION_CONFIG[d].minEvidence});
      const accessible=this.prerequisiteSatisfied(unitId),ready=this.unitMasteryReady(unitId,at),due=this.reviewDue(unitId,at),composite=Math.round(this.unitComposite(unitId,at));let status='locked';
      if(accessible){if(raw.masteredAt)status=due?'review':'mastered';else if(raw.attempts||DIMENSIONS.some(d=>raw.dimensions[d].evidence))status='in-progress';else status='available'}
      return {...clone(raw),...meta,dimensions,accessible,ready,reviewDue:due,composite,status};
    }
    getStage(stageId,at=this.now()){
      const stage=this.stageMeta(stageId);if(!stage)return null;const m=this.localStageMetrics(stageId,at);return {...stage,units:stage.units.map(id=>this.getUnit(id,at)),composite:Math.round(m.composite),recognition:Math.round(m.recognition),minimum:Math.round(m.minimum),allMastered:m.allReady,currentlyStrong:m.locallyStrong,passed:this.stageGatePassed(stageId),passedAt:this.state.stages[stageId]?.passedAt||null};
    }
    updateStagePasses(){
      let priorPassed=true;
      this.curriculum.stages.forEach(stage=>{const rec=this.state.stages[stage.id],m=this.localStageMetrics(stage.id,this.now());if(!rec.passedAt&&priorPassed&&m.locallyStrong){rec.passedAt=iso(this.now());this.pushEvent('stage-passed',{stageId:stage.id})}priorPassed=priorPassed&&!!rec.passedAt});
    }

    pushEvent(type,payload={}){this.state.counters.event=(this.state.counters.event||0)+1;this.state.events.push({id:uid('evt',this.now(),this.state.counters.event),type,at:iso(this.now()),...clone(payload)});if(this.state.events.length>MAX_EVENTS)this.state.events.splice(0,this.state.events.length-MAX_EVENTS)}
    recordError({unitId,type='syntax_relation',itemId=null,source='unknown'}){
      if(!ERROR_TYPES[type])type='syntax_relation';const e=this.state.errors[type]||{type,label:ERROR_TYPES[type],count:0,lastAt:null,units:{}};e.count++;e.lastAt=iso(this.now());e.units[String(unitId)]=(e.units[String(unitId)]||0)+1;this.state.errors[type]=e;const u=this.rawUnit(unitId);if(u)u.errors++;
      const found=this.state.remediation.find(r=>r.status==='open'&&r.unitId===Number(unitId)&&r.type===type&&r.itemId===itemId);if(found){found.occurrences++;found.lastAt=iso(this.now())}else{this.state.counters.remediation++;this.state.remediation.push({id:uid('rem',this.now(),this.state.counters.remediation),unitId:Number(unitId),type,itemId,source,status:'open',occurrences:1,createdAt:iso(this.now()),lastAt:iso(this.now()),resolvedAt:null})}this.pushEvent('error',{unitId:Number(unitId),errorType:type,itemId,source});
    }
    recordEvidence({unitId,dimension,correct,hintLevel='none',errorType=null,itemId=null,source='unknown',confidence=1}){
      unitId=Number(unitId);if(!this.rawUnit(unitId))throw new Error(`Unknown unit ${unitId}`);if(!DIMENSIONS.includes(dimension))throw new Error(`Unknown mastery dimension ${dimension}`);if(!(hintLevel in HINT_FACTORS))throw new Error(`Unknown hint level ${hintLevel}`);
      const u=this.rawUnit(unitId),r=u.dimensions[dimension],wasMastered=!!u.masteredAt,value=correct?100*HINT_FACTORS[hintLevel]:8,alpha=clamp(.18+.12*Number(confidence||1),.12,.38);r.score=clamp(r.evidence===0?value:r.score*(1-alpha)+value*alpha);r.evidence++;if(correct)r.correct++;r.lastAt=iso(this.now());u.attempts++;u.firstActivityAt=u.firstActivityAt||iso(this.now());u.lastActivityAt=iso(this.now());if(hintLevel!=='none')u.hints[hintLevel]=(u.hints[hintLevel]||0)+1;
      if(!correct&&errorType)this.recordError({unitId,type:errorType,itemId,source});if(correct&&hintLevel==='full')this.recordError({unitId,type:'premature_reveal',itemId,source});this.pushEvent('evidence',{unitId,dimension,correct:!!correct,hintLevel,itemId,source,value:Math.round(value)});
      if(this.unitMasteryReady(unitId,this.now())&&!wasMastered){u.masteredAt=iso(this.now());u.reviewIntervalDays=REVIEW_INTERVAL_DAYS;u.nextReviewAt=addDays(this.now(),u.reviewIntervalDays);this.pushEvent('unit-mastered',{unitId})}else if(u.masteredAt&&correct&&this.unitMasteryReady(unitId,this.now())){u.reviewIntervalDays=Math.min(120,Math.max(REVIEW_INTERVAL_DAYS,Math.round((u.reviewIntervalDays||REVIEW_INTERVAL_DAYS)*1.7)));u.nextReviewAt=addDays(this.now(),u.reviewIntervalDays)}
      this.recompute();this.persist();return this.getUnit(unitId);
    }
    recordHint({unitId,itemId=null,level='hint',source='reader'}){const u=this.rawUnit(unitId);if(!u)return;if(level!=='none')u.hints[level]=(u.hints[level]||0)+1;u.lastActivityAt=iso(this.now());this.pushEvent('hint',{unitId:Number(unitId),itemId,level,source});this.persist()}
    recordExposure({unitId,itemId=null,source='reader'}){const u=this.rawUnit(unitId);if(!u)return;u.firstActivityAt=u.firstActivityAt||iso(this.now());u.lastActivityAt=iso(this.now());this.pushEvent('exposure',{unitId:Number(unitId),itemId,source});this.recompute();this.persist()}
    resolveRemediation(id,{correct=true}={}){const item=this.state.remediation.find(r=>r.id===id);if(!item)return false;item.status=correct?'resolved':'open';item.lastAt=iso(this.now());if(correct){item.resolvedAt=iso(this.now());this.recordEvidence({unitId:item.unitId,dimension:'recognition',correct:true,hintLevel:'none',itemId:item.itemId,source:'remediation'})}else this.persist();return true}
    recompute(){this.updateStagePasses();this.units.forEach(meta=>{const u=this.rawUnit(meta.id),c=this.getUnit(meta.id,this.now());if(u&&c)u.status=c.status})}

    recommend(at=this.now()){
      this.recompute();const open=this.state.remediation.filter(r=>r.status==='open').sort((a,b)=>b.occurrences-a.occurrences||new Date(a.createdAt)-new Date(b.createdAt));if(open.length){const r=open[0],u=this.getUnit(r.unitId,at);return{kind:'remediation',unitId:r.unitId,title:`Repair: ${ERROR_TYPES[r.type]}`,reason:`${r.occurrences} unresolved occurrence${r.occurrences===1?'':'s'} in Unit ${r.unitId}`,remediationId:r.id,unit:u}}
      const due=this.units.map(u=>this.getUnit(u.id,at)).filter(u=>u.status==='review').sort((a,b)=>new Date(a.nextReviewAt||0)-new Date(b.nextReviewAt||0));if(due.length)return{kind:'review',unitId:due[0].id,title:`Review Unit ${due[0].id}: ${due[0].title}`,reason:'Mastery evidence is due for reinforcement or has decayed.',unit:due[0]};
      const progress=this.units.map(u=>this.getUnit(u.id,at)).filter(u=>u.status==='in-progress'&&u.accessible).sort((a,b)=>a.composite-b.composite);if(progress.length)return{kind:'continue',unitId:progress[0].id,title:`Continue Unit ${progress[0].id}: ${progress[0].title}`,reason:`Current composite ${progress[0].composite}% — strengthen the weakest mastery dimension.`,unit:progress[0]};
      const next=this.units.map(u=>this.getUnit(u.id,at)).find(u=>u.status==='available');if(next)return{kind:'new-unit',unitId:next.id,title:`Begin Unit ${next.id}: ${next.title}`,reason:'Prerequisites are satisfied.',unit:next};const mastered=this.units.map(u=>this.getUnit(u.id,at)).filter(u=>u.masteredAt);const last=mastered[mastered.length-1]||this.getUnit(1,at);return{kind:'practice',unitId:last.id,title:'Independent reading practice',reason:'No urgent remediation or scheduled review is due.',unit:last};
    }
    getDashboard(at=this.now()){
      const units=this.units.map(u=>this.getUnit(u.id,at)),stages=this.curriculum.stages.map(s=>this.getStage(s.id,at)),mastered=units.filter(u=>u.masteredAt).length,due=units.filter(u=>u.status==='review').length,available=units.filter(u=>u.status==='available'||u.status==='in-progress').length,openRemediation=this.state.remediation.filter(r=>r.status==='open').length,overall=Math.round(units.reduce((s,u)=>s+u.composite,0)/units.length),currentStage=stages.find(s=>!s.passed)||stages[stages.length-1],topErrors=Object.values(this.state.errors).sort((a,b)=>b.count-a.count).slice(0,5).map(clone);return{mastered,total:units.length,due,available,openRemediation,overall,currentStage,recommendation:this.recommend(at),topErrors,stages};
    }
    reset(){this.state=initialState(this.curriculum,this.now());this.storage.removeItem(STORAGE_KEY);this.persist();return this.snapshot()}
  }

  const createBrowserEngine=curriculum=>new LearningEngine({curriculum});
  return{SCHEMA_VERSION,STORAGE_KEY,LEGACY_KEY,DIMENSIONS,DIMENSION_CONFIG,HINT_FACTORS,ERROR_TYPES,PROTOTYPE_UNIT_MAP,LearningEngine,MemoryStorage,createBrowserEngine,flattenCurriculum};
});

if(typeof window!=='undefined'&&window.KOINE_CURRICULUM&&window.KoineLearning)window.KOINE_LEARNING_ENGINE=window.KoineLearning.createBrowserEngine(window.KOINE_CURRICULUM);
