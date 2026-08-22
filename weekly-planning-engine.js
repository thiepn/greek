(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.KoineWeeklyPlanning=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

const STATE_KEY='koine-path-weekly-plan-v1';
const SCHEMA_VERSION=1;
const HEURISTIC_MINUTES_PER_UNIT={fast:45,slow:90};
const GOAL_MIX={
  'read-nt':{learn:50,read:25,review:15,vocabulary:10},
  'course-mastery':{learn:65,review:20,read:10,vocabulary:5},
  'grammar-refresh':{learn:40,drill:30,review:20,read:10},
  exegesis:{learn:40,read:25,review:15,tutor:15,vocabulary:5}
};
const clone=v=>JSON.parse(JSON.stringify(v));
const safe=v=>{try{return JSON.parse(v)}catch{return null}};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const iso=d=>new Date(d).toISOString();
const pad=n=>String(n).padStart(2,'0');
function dayKey(date){const d=new Date(date);return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function startOfDay(date){const d=new Date(date);d.setHours(0,0,0,0);return d}
function startOfWeek(date){const d=startOfDay(date),day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return d}
function addDays(date,days){const d=new Date(date);d.setDate(d.getDate()+days);return d}
function weekKey(date){return dayKey(startOfWeek(date))}
function weekLabel(date){const start=startOfWeek(date),end=addDays(start,6);return `${start.toLocaleDateString(undefined,{month:'short',day:'numeric'})}–${end.toLocaleDateString(undefined,{month:'short',day:'numeric'})}`}
function profileSignature(profile={}){return `${Number(profile.sessionMinutes)||25}:${Number(profile.daysPerWeek)||5}:${profile.goal||'read-nt'}`}
class MemoryStorage{constructor(seed={}){this.map=new Map(Object.entries(seed))}get length(){return this.map.size}key(i){return [...this.map.keys()][i]??null}getItem(k){return this.map.has(k)?this.map.get(k):null}setItem(k,v){this.map.set(k,String(v))}removeItem(k){this.map.delete(k)}}
function initialState(now=new Date()){return{schemaVersion:SCHEMA_VERSION,createdAt:iso(now),updatedAt:iso(now),current:null,archive:[]}}
function normalizeState(raw,now){const base=initialState(now);if(raw?.schemaVersion!==SCHEMA_VERSION)return base;return{...base,...raw,current:raw.current&&typeof raw.current==='object'?raw.current:null,archive:Array.isArray(raw.archive)?raw.archive.slice(-20):[]}}
function distributeMinutes(total,mix){const entries=Object.entries(mix),out=[];let used=0;entries.forEach(([view,pct],i)=>{const minutes=i===entries.length-1?total-used:Math.round(total*pct/100);used+=minutes;out.push({view,minutes,percent:pct})});return out.filter(x=>x.minutes>0)}
function scheduleDays(daysPerWeek){const n=clamp(Math.round(Number(daysPerWeek)||5),1,7),seen=new Set(),days=[];for(let i=0;i<n;i++){let idx=Math.min(6,Math.round(i*6/Math.max(1,n-1)));while(seen.has(idx)&&idx<6)idx++;while(seen.has(idx)&&idx>0)idx--;seen.add(idx);days.push(idx)}return days.sort((a,b)=>a-b)}
function viewLabel(view){return({learn:'Canonical course',read:'Greek text transfer',review:'Review & remediation',drill:'Morphology retrieval',tutor:'Exegetical reasoning',vocabulary:'Vocabulary retrieval'})[view]||'Study'}
function milestoneList(curriculum,learningEngine){
  const dashboard=learningEngine?.getDashboard?.()||{mastered:0,total:50};
  const stages=(curriculum?.stages||[]).map((stage,index)=>{const live=learningEngine?.getStage?.(stage.id)||null,units=Array.isArray(live?.units)?live.units:stage.units.map(id=>learningEngine?.getUnit?.(id)).filter(Boolean),mastered=units.filter(u=>u?.masteredAt||u?.status==='mastered').length,total=stage.units.length;return{id:`stage-${stage.id}`,kind:'stage',stageId:stage.id,index,title:`${stage.id} · ${stage.title}`,mastered,total,progressPercent:total?Math.round(mastered/total*100):0,complete:!!live?.passed,completedAt:live?.passedAt||null}}
  const course={id:'course-complete',kind:'course',title:'50-unit canonical course',mastered:Number(dashboard.mastered)||0,total:Number(dashboard.total)||50,progressPercent:dashboard.total?Math.round(dashboard.mastered/dashboard.total*100):0,complete:Number(dashboard.mastered)===Number(dashboard.total)&&stages.every(s=>s.complete),completedAt:null};
  return[...stages,course];
}
function completedWeekMinutes(sessionState,now){
  const currentStart=startOfWeek(now),weeks=new Map();for(const s of sessionState?.history||[]){const started=new Date(s.startedAt);if(started>=currentStart)continue;const key=weekKey(started);weeks.set(key,(weeks.get(key)||0)+Math.max(0,Number(s.engagedSeconds)||0)/60)}
  return[...weeks.entries()].sort((a,b)=>a[0].localeCompare(b[0])).slice(-4).map(([key,minutes])=>({key,minutes:Math.round(minutes)}));
}
function recentMasteries(learningState,now,days=28){const since=addDays(startOfDay(now),-(days-1));return Object.values(learningState?.units||{}).filter(u=>u?.masteredAt&&new Date(u.masteredAt)>=since&&new Date(u.masteredAt)<=new Date(now)).length}
function forecastRange({remainingUnits,weeklyTargetMinutes,learningState,sessionState,now=new Date()}={}){
  const remaining=Math.max(0,Math.round(Number(remainingUnits)||0));if(!remaining)return{status:'complete',remainingUnits:0,confidence:'high',method:'complete',earliestWeeks:0,latestWeeks:0,earliestDate:iso(now),latestDate:iso(now)};
  const completedWeeks=completedWeekMinutes(sessionState,now),masteries=recentMasteries(learningState,now),observedMinutes=completedWeeks.reduce((a,w)=>a+w.minutes,0),planned=Math.max(30,Math.round(Number(weeklyTargetMinutes)||125));
  let weeklyCapacity=planned,fastMpu=HEURISTIC_MINUTES_PER_UNIT.fast,slowMpu=HEURISTIC_MINUTES_PER_UNIT.slow,method='workload heuristic',confidence='low';
  if(completedWeeks.length>=2){weeklyCapacity=Math.max(30,Math.round(completedWeeks.reduce((a,w)=>a+w.minutes,0)/completedWeeks.length));}
  if(masteries>=2&&observedMinutes>=60&&completedWeeks.length>=2){const observedMpu=observedMinutes/masteries;fastMpu=Math.max(25,observedMpu*.75);slowMpu=Math.max(fastMpu+10,observedMpu*1.35);method='recent mastery and active-time evidence';confidence=masteries>=4&&completedWeeks.length>=3?'high':'medium';}
  const fastUnitsPerWeek=Math.max(.1,weeklyCapacity/fastMpu),slowUnitsPerWeek=Math.max(.05,weeklyCapacity/slowMpu),earliestWeeks=Math.max(1,Math.ceil(remaining/fastUnitsPerWeek)),latestWeeks=Math.max(earliestWeeks,Math.ceil(remaining/slowUnitsPerWeek));
  return{status:'forecast',remainingUnits:remaining,confidence,method,weeklyCapacityMinutes:weeklyCapacity,minutesPerUnitRange:[Math.round(fastMpu),Math.round(slowMpu)],earliestWeeks,latestWeeks,earliestDate:iso(addDays(startOfWeek(now),earliestWeeks*7)),latestDate:iso(addDays(startOfWeek(now),latestWeeks*7)),notice:'Forecasts are planning ranges, not promised completion dates. Canonical mastery evidence remains authoritative.'};
}
function previousWeekGap(sessionEngine,profile,now){const prevStart=addDays(startOfWeek(now),-7),prevEnd=startOfWeek(now),history=sessionEngine?.snapshot?.().history||[],actual=history.filter(s=>new Date(s.startedAt)>=prevStart&&new Date(s.startedAt)<prevEnd).reduce((n,s)=>n+(Number(s.engagedSeconds)||0)/60,0),target=(Number(profile.sessionMinutes)||25)*(Number(profile.daysPerWeek)||5);return{targetMinutes:target,actualMinutes:Math.round(actual),unusedMinutes:Math.max(0,Math.round(target-actual))}}
function nextMilestone(milestones){return milestones.find(m=>m.kind==='stage'&&!m.complete)||milestones.find(m=>!m.complete)||milestones[milestones.length-1]||null}
function createWeeklyPlan({curriculum,learningEngine,sessionEngine,profile={},guidancePlan=null,now=new Date(),reason='auto'}={}){
  const minutes=clamp(Math.round(Number(profile.sessionMinutes)||25),10,120),daysPerWeek=clamp(Math.round(Number(profile.daysPerWeek)||5),1,7),targetMinutes=minutes*daysPerWeek,mix=GOAL_MIX[profile.goal]||GOAL_MIX['read-nt'],priorities=distributeMinutes(targetMinutes,mix),milestones=milestoneList(curriculum,learningEngine),milestone=nextMilestone(milestones),gap=previousWeekGap(sessionEngine,profile,now),dayOffsets=scheduleDays(daysPerWeek),sessions=dayOffsets.map((offset,index)=>{const primary=priorities[index%priorities.length],secondary=priorities[(index+1)%priorities.length];return{id:`${weekKey(now)}-${index+1}`,dayOffset:offset,date:dayKey(addDays(startOfWeek(now),offset)),minutes,focus:[viewLabel(primary.view),viewLabel(secondary.view)],primaryView:primary.view}}),dashboard=learningEngine?.getDashboard?.()||{mastered:0,total:50},learningState=learningEngine?.snapshot?.()||{},sessionState=sessionEngine?.snapshot?.()||{history:[]},courseForecast=forecastRange({remainingUnits:Math.max(0,(Number(dashboard.total)||50)-(Number(dashboard.mastered)||0)),weeklyTargetMinutes:targetMinutes,learningState,sessionState,now}),milestoneForecast=milestone?forecastRange({remainingUnits:Math.max(0,milestone.total-milestone.mastered),weeklyTargetMinutes:targetMinutes,learningState,sessionState,now}):null;
  return{schemaVersion:SCHEMA_VERSION,weekKey:weekKey(now),weekLabel:weekLabel(now),generatedAt:iso(now),reason,profile:{sessionMinutes:minutes,daysPerWeek,goal:profile.goal||'read-nt'},profileSignature:profileSignature(profile),targetMinutes,targetDays:daysPerWeek,priorities,sessions,milestone,milestones,courseForecast,milestoneForecast,priorWeek:gap,backlogPolicy:gap.unusedMinutes>0?`${gap.unusedMinutes} unused minutes from last week are not added to this week's target. Earlier priorities stay ahead of novelty within the same ${targetMinutes}-minute capacity.`:'No unused capacity from the previous week is being carried as debt.',guidanceMode:guidancePlan?.mode||null};
}
class WeeklyPlanningEngine{
  constructor({curriculum,learningEngine,sessionEngine,storage=null,clock=()=>new Date()}={}){if(!curriculum?.stages?.length)throw new Error('WeeklyPlanningEngine requires KOINE_CURRICULUM.');this.curriculum=curriculum;this.learningEngine=learningEngine;this.sessionEngine=sessionEngine;this.storage=storage||((typeof localStorage!=='undefined')?localStorage:new MemoryStorage());this.clock=clock;this.state=normalizeState(safe(this.storage.getItem(STATE_KEY)),this.clock());this.persist()}
  persist(){this.state.updatedAt=iso(this.clock());this.storage.setItem(STATE_KEY,JSON.stringify(this.state))}
  snapshot(){return clone(this.state)}
  getPlan(profile={},guidancePlan=null){const current=this.state.current,needs=!current||current.weekKey!==weekKey(this.clock())||current.profileSignature!==profileSignature(profile);if(needs)return this.recalibrate(profile,guidancePlan,'auto');return clone(current)}
  recalibrate(profile={},guidancePlan=null,reason='manual'){if(this.state.current&&this.state.current.weekKey!==weekKey(this.clock())){this.state.archive.push(this.state.current);if(this.state.archive.length>20)this.state.archive.splice(0,this.state.archive.length-20)}this.state.current=createWeeklyPlan({curriculum:this.curriculum,learningEngine:this.learningEngine,sessionEngine:this.sessionEngine,profile,guidancePlan,now:this.clock(),reason});this.persist();return clone(this.state.current)}
  forecast(profile={}){const dash=this.learningEngine?.getDashboard?.()||{mastered:0,total:50};return forecastRange({remainingUnits:Math.max(0,(Number(dash.total)||50)-(Number(dash.mastered)||0)),weeklyTargetMinutes:(Number(profile.sessionMinutes)||25)*(Number(profile.daysPerWeek)||5),learningState:this.learningEngine?.snapshot?.()||{},sessionState:this.sessionEngine?.snapshot?.()||{},now:this.clock()})}
  reset(){this.storage.removeItem(STATE_KEY);this.state=initialState(this.clock());this.persist();return this.snapshot()}
}
return{STATE_KEY,SCHEMA_VERSION,HEURISTIC_MINUTES_PER_UNIT,GOAL_MIX,MemoryStorage,WeeklyPlanningEngine,createWeeklyPlan,milestoneList,forecastRange,weekKey,startOfWeek,scheduleDays,profileSignature};
});
if(typeof window!=='undefined'&&window.KoineWeeklyPlanning&&window.KOINE_CURRICULUM)window.KOINE_WEEKLY_PLANNER=new window.KoineWeeklyPlanning.WeeklyPlanningEngine({curriculum:window.KOINE_CURRICULUM,learningEngine:window.KOINE_LEARNING_ENGINE,sessionEngine:window.KOINE_SESSION_ENGINE});
