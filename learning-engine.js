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
  const UNIT_COMPOSITE_THRESHOLD=82;
  const STAGE_COMPOSITE_THRESHOLD=85;
  const STAGE_RECOGNITION_THRESHOLD=88;
  const MINIMUM_STAGE_DIMENSION=75;
  const REVIEW_INTERVAL_DAYS=14;
  const MAX_EVENTS=400;

  const ERROR_TYPES=Object.freeze({
    case_confusion:'Case confusion',
    gender_number_agreement:'Gender/number agreement',
    declension_pattern:'Declension pattern',
    person_number:'Person/number',
    tense_form:'Tense-form recognition',
    voice:'Voice recognition',
    mood:'Mood recognition',
    principal_part:'Principal-part failure',
    pronoun_antecedent:'Pronoun/antecedent',
    syntax_relation:'Syntax relationship',
    vocabulary_retrieval:'Vocabulary retrieval',
    preposition_case:'Preposition/case relationship',
    word_order_overreliance:'Word-order overreliance',
    translation_overliteral:'Over-literal translation',
    lexical_overreach:'Lexical overreach',
    premature_reveal:'Premature answer reveal'
  });

  const PROTOTYPE_UNIT_MAP=Object.freeze({
    alphabet:1, article:5, nouns:7, verbs:12, john1:16
  });

  function clone(value){return JSON.parse(JSON.stringify(value));}
  function clamp(n,min=0,max=100){return Math.max(min,Math.min(max,n));}
  function iso(value){return new Date(value).toISOString();}
  function daysBetween(a,b){return Math.max(0,(new Date(b)-new Date(a))/86400000);}
  function addDays(date,days){return new Date(new Date(date).getTime()+days*86400000).toISOString();}
  function nowFn(){return new Date();}
  function safeParse(raw){try{return JSON.parse(raw);}catch{return null;}}
  function uid(prefix,date,index){return `${prefix}.${new Date(date).getTime()}.${index}`;}

  function flattenCurriculum(curriculum){
    const units=[];
    curriculum.stages.forEach((stage,stageIndex)=>stage.units.forEach((unitNumber,localIndex)=>{
      units.push({
        id:unitNumber,
        stageId:stage.id,
        stageIndex,
        localIndex,
        title:stage.unitTitles[localIndex],
        reader:stage.reader,
        vocabTarget:stage.vocabTarget
      });
    }));
    return units;
  }

  function blankDimension(){return {score:0,evidence:0,correct:0,lastAt:null};}
  function blankUnit(unit){
    return {
      id:unit.id,
      stageId:unit.stageId,
      status:unit.id===1?'available':'locked',
      dimensions:{concept:blankDimension(),recognition:blankDimension(),application:blankDimension(),reading:blankDimension()},
      firstActivityAt:null,lastActivityAt:null,masteredAt:null,nextReviewAt:null,reviewIntervalDays:REVIEW_INTERVAL_DAYS,
      attempts:0,hints:{hint:0,lemma:0,full:0},errors:0
    };
  }

  function createInitialState(curriculum,date){
    const units=flattenCurriculum(curriculum);
    const timestamp=iso(date);
    const state={
      schemaVersion:SCHEMA_VERSION,
      curriculumVersion:curriculum.version,
      createdAt:timestamp,updatedAt:timestamp,
      units:{},
      errors:{},
      remediation:[],
      events:[],
      prototype:{done:[],attempts:0,correct:0,review:[],words:[]},
      migration:{from:null,at:null,legacyImported:false},
      settings:{decayEnabled:true},
      counters:{event:0,remediation:0}
    };
    units.forEach(unit=>state.units[String(unit.id)]=blankUnit(unit));
    return state;
  }

  function seedLegacy(state,legacy,date){
    if(!legacy||typeof legacy!=='object') return state;
    state.prototype={
      done:Array.isArray(legacy.done)?legacy.done.slice():[],
      attempts:Number(legacy.attempts)||0,
      correct:Number(legacy.correct)||0,
      review:Array.isArray(legacy.review)?clone(legacy.review):[],
      words:Array.isArray(legacy.words)?legacy.words.slice():[]
    };
    state.prototype.done.forEach(key=>{
      const unitId=PROTOTYPE_UNIT_MAP[key];
      const unit=state.units[String(unitId)];
      if(!unit) return;
      const dim=key==='john1'?'reading':(key==='nouns'||key==='verbs'?'application':'concept');
      unit.dimensions[dim]={score:55,evidence:1,correct:1,lastAt:iso(date)};
      unit.firstActivityAt=unit.lastActivityAt=iso(date);
      unit.status='in-progress';
    });
    state.migration={from:LEGACY_KEY,at:iso(date),legacyImported:true};
    return state;
  }

  class MemoryStorage{
    constructor(seed={}){this.map=new Map(Object.entries(seed));}
    getItem(key){return this.map.has(key)?this.map.get(key):null;}
    setItem(key,value){this.map.set(key,String(value));}
    removeItem(key){this.map.delete(key);}
  }

  class LearningEngine{
    constructor({curriculum,storage,clock}={}){
      if(!curriculum||!Array.isArray(curriculum.stages)) throw new Error('LearningEngine requires KOINE_CURRICULUM.');
      this.curriculum=curriculum;
      this.units=flattenCurriculum(curriculum);
      this.storage=storage||((typeof localStorage!=='undefined')?localStorage:new MemoryStorage());
      this.clock=clock||nowFn;
      this.state=this.load();
      this.recompute();
      this.persist();
    }

    now(){return this.clock();}
    load(){
      const saved=safeParse(this.storage.getItem(STORAGE_KEY));
      if(saved&&saved.schemaVersion===SCHEMA_VERSION){
        const initial=createInitialState(this.curriculum,this.now());
        const merged={...initial,...saved,units:{...initial.units,...saved.units}};
        this.units.forEach(unit=>{
          const key=String(unit.id),existing=merged.units[key]||blankUnit(unit);
          existing.dimensions={...blankUnit(unit).dimensions,...(existing.dimensions||{})};
          DIMENSIONS.forEach(d=>existing.dimensions[d]={...blankDimension(),...(existing.dimensions[d]||{})});
          merged.units[key]=existing;
        });
        return merged;
      }
      const fresh=createInitialState(this.curriculum,this.now());
      const legacy=safeParse(this.storage.getItem(LEGACY_KEY));
      return seedLegacy(fresh,legacy,this.now());
    }

    persist(){
      this.state.updatedAt=iso(this.now());
      this.storage.setItem(STORAGE_KEY,JSON.stringify(this.state));
    }

    snapshot(){return clone(this.state);}
    getPrototypeState(){return clone(this.state.prototype);}
    updatePrototypeState(next){
      this.state.prototype={
        done:Array.isArray(next.done)?next.done.slice():[],
        attempts:Number(next.attempts)||0,
        correct:Number(next.correct)||0,
        review:Array.isArray(next.review)?clone(next.review):[],
        words:Array.isArray(next.words)?next.words.slice():[]
      };
      this.persist();
    }

    unitMeta(unitId){return this.units.find(u=>u.id===Number(unitId));}
    rawUnit(unitId){return this.state.units[String(unitId)]||null;}
    stageMeta(stageId){return this.curriculum.stages.find(s=>s.id===stageId)||null;}

    effectiveDimension(unitId,dimension,at=this.now()){
      const unit=this.rawUnit(unitId),cfg=DIMENSION_CONFIG[dimension];
      if(!unit||!cfg) return 0;
      const rec=unit.dimensions[dimension];
      if(!this.state.settings.decayEnabled||!rec.lastAt) return clamp(rec.score);
      const age=daysBetween(rec.lastAt,at),over=Math.max(0,age-cfg.graceDays);
      return clamp(rec.score-Math.min(25,over*cfg.decayPerDay));
    }

    unitComposite(unitId,at=this.now()){
      return DIMENSIONS.reduce((sum,d)=>sum+this.effectiveDimension(unitId,d,at)*DIMENSION_CONFIG[d].weight,0);
    }

    dimensionReady(unitId,dimension,at=this.now()){
      const rec=this.rawUnit(unitId)?.dimensions[dimension],cfg=DIMENSION_CONFIG[dimension];
      return !!rec&&rec.evidence>=cfg.minEvidence&&this.effectiveDimension(unitId,dimension,at)>=cfg.threshold;
    }

    unitMasteryReady(unitId,at=this.now()){
      return DIMENSIONS.every(d=>this.dimensionReady(unitId,d,at))&&this.unitComposite(unitId,at)>=UNIT_COMPOSITE_THRESHOLD;
    }

    previousStage(stageId){
      const i=this.curriculum.stages.findIndex(s=>s.id===stageId);
      return i>0?this.curriculum.stages[i-1]:null;
    }

    prerequisiteSatisfied(unitId,at=this.now()){
      const meta=this.unitMeta(unitId);
      if(!meta) return false;
      if(meta.id===1) return true;
      if(meta.localIndex===0){
        const previous=this.previousStage(meta.stageId);
        return previous?this.getStage(previous.id,at).passed:false;
      }
      return this.getUnit(meta.id-1,at).status==='mastered';
    }

    getUnit(unitId,at=this.now()){
      const meta=this.unitMeta(unitId),raw=this.rawUnit(unitId);
      if(!meta||!raw) return null;
      const dimensions={};
      DIMENSIONS.forEach(d=>dimensions[d]={...clone(raw.dimensions[d]),effective:Math.round(this.effectiveDimension(unitId,d,at)),threshold:DIMENSION_CONFIG[d].threshold,minEvidence:DIMENSION_CONFIG[d].minEvidence});
      const composite=Math.round(this.unitComposite(unitId,at));
      const accessible=this.prerequisiteSatisfied(unitId,at);
      const ready=this.unitMasteryReady(unitId,at);
      const reviewDue=!!raw.masteredAt&&(!ready||(raw.nextReviewAt&&new Date(raw.nextReviewAt)<=new Date(at)));
      let status='locked';
      if(accessible){
        if(ready&&!reviewDue) status='mastered';
        else if(raw.masteredAt&&reviewDue) status='review';
        else if(raw.attempts||DIMENSIONS.some(d=>raw.dimensions[d].evidence>0)) status='in-progress';
        else status='available';
      }
      return {...clone(raw),...meta,dimensions,composite,accessible,ready,reviewDue,status};
    }

    getStage(stageId,at=this.now()){
      const stage=this.stageMeta(stageId);
      if(!stage) return null;
      const units=stage.units.map(id=>this.getUnit(id,at));
      const composite=units.reduce((s,u)=>s+u.composite,0)/units.length;
      const recognition=units.reduce((s,u)=>s+u.dimensions.recognition.effective,0)/units.length;
      let minimum=100;
      units.forEach(u=>DIMENSIONS.forEach(d=>minimum=Math.min(minimum,u.dimensions[d].effective)));
      const allMastered=units.every(u=>u.status==='mastered');
      const passed=allMastered&&composite>=STAGE_COMPOSITE_THRESHOLD&&recognition>=STAGE_RECOGNITION_THRESHOLD&&minimum>=MINIMUM_STAGE_DIMENSION;
      return {...stage,units,composite:Math.round(composite),recognition:Math.round(recognition),minimum:Math.round(minimum),allMastered,passed};
    }

    pushEvent(type,payload={}){
      this.state.counters.event=(this.state.counters.event||0)+1;
      this.state.events.push({id:uid('evt',this.now(),this.state.counters.event),type,at:iso(this.now()),...clone(payload)});
      if(this.state.events.length>MAX_EVENTS) this.state.events.splice(0,this.state.events.length-MAX_EVENTS);
    }

    recordError({unitId,type='syntax_relation',itemId=null,source='unknown'}){
      if(!ERROR_TYPES[type]) type='syntax_relation';
      const entry=this.state.errors[type]||{type,label:ERROR_TYPES[type],count:0,lastAt:null,units:{}};
      entry.count++;entry.lastAt=iso(this.now());entry.units[String(unitId)]=(entry.units[String(unitId)]||0)+1;
      this.state.errors[type]=entry;
      const raw=this.rawUnit(unitId);if(raw) raw.errors=(raw.errors||0)+1;
      const existing=this.state.remediation.find(r=>r.status==='open'&&r.unitId===Number(unitId)&&r.type===type&&r.itemId===itemId);
      if(existing){existing.occurrences++;existing.lastAt=iso(this.now());}
      else{
        this.state.counters.remediation=(this.state.counters.remediation||0)+1;
        this.state.remediation.push({id:uid('rem',this.now(),this.state.counters.remediation),unitId:Number(unitId),type,itemId,source,status:'open',occurrences:1,createdAt:iso(this.now()),lastAt:iso(this.now()),resolvedAt:null});
      }
      this.pushEvent('error',{unitId:Number(unitId),errorType:type,itemId,source});
    }

    recordEvidence({unitId,dimension,correct,hintLevel='none',errorType=null,itemId=null,source='unknown',confidence=1}){
      unitId=Number(unitId);
      if(!this.rawUnit(unitId)) throw new Error(`Unknown unit ${unitId}`);
      if(!DIMENSIONS.includes(dimension)) throw new Error(`Unknown mastery dimension ${dimension}`);
      if(!Object.prototype.hasOwnProperty.call(HINT_FACTORS,hintLevel)) throw new Error(`Unknown hint level ${hintLevel}`);
      const unit=this.rawUnit(unitId),rec=unit.dimensions[dimension],beforeReady=this.unitMasteryReady(unitId,this.now());
      const factor=HINT_FACTORS[hintLevel];
      const evidenceValue=correct?100*factor:8;
      const alpha=clamp(.18+.12*Number(confidence||1),.12,.38);
      rec.score=rec.evidence===0?evidenceValue:(rec.score*(1-alpha)+evidenceValue*alpha);
      rec.score=clamp(rec.score);rec.evidence++;if(correct)rec.correct++;rec.lastAt=iso(this.now());
      unit.attempts++;unit.firstActivityAt=unit.firstActivityAt||iso(this.now());unit.lastActivityAt=iso(this.now());
      if(hintLevel!=='none') unit.hints[hintLevel]=(unit.hints[hintLevel]||0)+1;
      if(!correct&&errorType) this.recordError({unitId,type:errorType,itemId,source});
      if(correct&&hintLevel==='full') this.recordError({unitId,type:'premature_reveal',itemId,source});
      this.pushEvent('evidence',{unitId,dimension,correct:!!correct,hintLevel,itemId,source,value:Math.round(evidenceValue)});
      const afterReady=this.unitMasteryReady(unitId,this.now());
      if(afterReady&&!beforeReady){
        unit.masteredAt=iso(this.now());
        unit.reviewIntervalDays=REVIEW_INTERVAL_DAYS;
        unit.nextReviewAt=addDays(this.now(),unit.reviewIntervalDays);
        this.pushEvent('unit-mastered',{unitId});
      }else if(afterReady&&unit.masteredAt&&correct){
        unit.reviewIntervalDays=Math.min(120,Math.max(REVIEW_INTERVAL_DAYS,Math.round((unit.reviewIntervalDays||REVIEW_INTERVAL_DAYS)*1.7)));
        unit.nextReviewAt=addDays(this.now(),unit.reviewIntervalDays);
      }
      this.recompute();this.persist();
      return this.getUnit(unitId);
    }

    recordHint({unitId,itemId=null,level='hint',source='reader'}){
      const unit=this.rawUnit(unitId);if(!unit) return;
      if(level!=='none') unit.hints[level]=(unit.hints[level]||0)+1;
      unit.lastActivityAt=iso(this.now());
      this.pushEvent('hint',{unitId:Number(unitId),itemId,level,source});
      this.persist();
    }

    recordExposure({unitId,itemId=null,source='reader'}){
      const unit=this.rawUnit(unitId);if(!unit) return;
      unit.firstActivityAt=unit.firstActivityAt||iso(this.now());unit.lastActivityAt=iso(this.now());
      this.pushEvent('exposure',{unitId:Number(unitId),itemId,source});
      this.recompute();this.persist();
    }

    resolveRemediation(id,{correct=true}={}){
      const item=this.state.remediation.find(r=>r.id===id);
      if(!item) return false;
      item.status=correct?'resolved':'open';
      item.lastAt=iso(this.now());
      if(correct){item.resolvedAt=iso(this.now());this.recordEvidence({unitId:item.unitId,dimension:'recognition',correct:true,hintLevel:'none',itemId:item.itemId,source:'remediation'});}
      else this.persist();
      return true;
    }

    recompute(){
      this.units.forEach(meta=>{
        const raw=this.rawUnit(meta.id),computed=this.getUnit(meta.id,this.now());
        if(raw&&computed) raw.status=computed.status;
      });
    }

    recommend(at=this.now()){
      this.recompute();
      const open=this.state.remediation.filter(r=>r.status==='open').sort((a,b)=>b.occurrences-a.occurrences||new Date(a.createdAt)-new Date(b.createdAt));
      if(open.length){
        const r=open[0],u=this.getUnit(r.unitId,at);
        return {kind:'remediation',unitId:r.unitId,title:`Repair: ${ERROR_TYPES[r.type]}`,reason:`${r.occurrences} unresolved occurrence${r.occurrences===1?'':'s'} in Unit ${r.unitId}`,remediationId:r.id,unit:u};
      }
      const due=this.units.map(u=>this.getUnit(u.id,at)).filter(u=>u.status==='review').sort((a,b)=>new Date(a.nextReviewAt||0)-new Date(b.nextReviewAt||0));
      if(due.length) return {kind:'review',unitId:due[0].id,title:`Review Unit ${due[0].id}: ${due[0].title}`,reason:'Mastery evidence is due for reinforcement or has decayed.',unit:due[0]};
      const progress=this.units.map(u=>this.getUnit(u.id,at)).filter(u=>u.status==='in-progress'&&u.accessible).sort((a,b)=>a.composite-b.composite);
      if(progress.length) return {kind:'continue',unitId:progress[0].id,title:`Continue Unit ${progress[0].id}: ${progress[0].title}`,reason:`Current composite ${progress[0].composite}% — strengthen the weakest mastery dimension.`,unit:progress[0]};
      const next=this.units.map(u=>this.getUnit(u.id,at)).find(u=>u.status==='available');
      if(next) return {kind:'new-unit',unitId:next.id,title:`Begin Unit ${next.id}: ${next.title}`,reason:'Prerequisites are satisfied.',unit:next};
      const mastered=this.units.map(u=>this.getUnit(u.id,at)).filter(u=>u.status==='mastered');
      const last=mastered[mastered.length-1]||this.getUnit(1,at);
      return {kind:'practice',unitId:last.id,title:'Independent reading practice',reason:'No urgent remediation or scheduled review is due.',unit:last};
    }

    getDashboard(at=this.now()){
      const units=this.units.map(u=>this.getUnit(u.id,at));
      const stages=this.curriculum.stages.map(s=>this.getStage(s.id,at));
      const mastered=units.filter(u=>u.status==='mastered').length;
      const due=units.filter(u=>u.status==='review').length;
      const available=units.filter(u=>u.status==='available'||u.status==='in-progress').length;
      const openRemediation=this.state.remediation.filter(r=>r.status==='open').length;
      const overall=Math.round(units.reduce((s,u)=>s+u.composite,0)/units.length);
      const currentStage=stages.find(s=>!s.passed)||stages[stages.length-1];
      const topErrors=Object.values(this.state.errors).sort((a,b)=>b.count-a.count).slice(0,5).map(clone);
      return {mastered,total:units.length,due,available,openRemediation,overall,currentStage,recommendation:this.recommend(at),topErrors,stages};
    }

    reset(){
      this.state=createInitialState(this.curriculum,this.now());
      this.storage.removeItem(STORAGE_KEY);this.persist();return this.snapshot();
    }
  }

  function createBrowserEngine(curriculum){return new LearningEngine({curriculum});}

  return {SCHEMA_VERSION,STORAGE_KEY,LEGACY_KEY,DIMENSIONS,DIMENSION_CONFIG,HINT_FACTORS,ERROR_TYPES,PROTOTYPE_UNIT_MAP,LearningEngine,MemoryStorage,createBrowserEngine,flattenCurriculum};
});

if(typeof window!=='undefined'&&window.KOINE_CURRICULUM&&window.KoineLearning){
  window.KOINE_LEARNING_ENGINE=window.KoineLearning.createBrowserEngine(window.KOINE_CURRICULUM);
}
