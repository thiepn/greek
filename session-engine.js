(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.KoineSessions=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

const STATE_KEY='koine-path-sessions-v1';
const SCHEMA_VERSION=1;
const MAX_HISTORY=400;
const VIEW_IDS=['today','learn','drill','read','tutor','review','progress'];
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const clone=v=>JSON.parse(JSON.stringify(v));
const safe=v=>{try{return JSON.parse(v)}catch{return null}};
const iso=d=>new Date(d).toISOString();
const pad=n=>String(n).padStart(2,'0');
function dayKey(date){const d=new Date(date);return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function startOfDay(date){const d=new Date(date);d.setHours(0,0,0,0);return d}
function startOfWeek(date){const d=startOfDay(date),day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return d}
function addDays(date,days){const d=new Date(date);d.setDate(d.getDate()+days);return d}
function uid(now,count){return `ses-${new Date(now).getTime().toString(36)}-${count.toString(36)}`}
class MemoryStorage{
  constructor(seed={}){this.map=new Map(Object.entries(seed))}
  get length(){return this.map.size}
  key(i){return [...this.map.keys()][i]??null}
  getItem(k){return this.map.has(k)?this.map.get(k):null}
  setItem(k,v){this.map.set(k,String(v))}
  removeItem(k){this.map.delete(k)}
}
function initialState(now=new Date()){return{schemaVersion:SCHEMA_VERSION,createdAt:iso(now),updatedAt:iso(now),counter:0,active:null,history:[]}}
function normalizeTask(task,index){return{id:`task-${index+1}`,kind:String(task.kind||'study'),view:VIEW_IDS.includes(task.view)?task.view:'learn',unitId:Number.isFinite(Number(task.unitId))?Number(task.unitId):null,title:String(task.title||`Study task ${index+1}`),reason:task.reason?String(task.reason):null,plannedMinutes:Math.max(1,Math.round(Number(task.minutes)||5)),completedAt:null}}
function normalizeState(raw,now){const base=initialState(now);if(raw?.schemaVersion!==SCHEMA_VERSION)return base;const history=Array.isArray(raw.history)?raw.history.slice(-MAX_HISTORY):[];return{...base,...raw,counter:Math.max(0,Number(raw.counter)||0),active:raw.active&&typeof raw.active==='object'?raw.active:null,history}}
function sessionDoneCount(session){return(session?.tasks||[]).filter(t=>!!t.completedAt).length}
function sessionTaskCount(session){return(session?.tasks||[]).length}
function completionRatio(session){const taskRatio=sessionTaskCount(session)?sessionDoneCount(session)/sessionTaskCount(session):0;const timeRatio=session?.plannedMinutes?Number(session.engagedSeconds||0)/(session.plannedMinutes*60):0;return clamp(Math.max(taskRatio,timeRatio),0,1)}

class SessionEngine{
  constructor({storage=null,clock=()=>new Date()}={}){this.storage=storage||((typeof localStorage!=='undefined')?localStorage:new MemoryStorage());this.clock=clock;const raw=safe(this.storage.getItem(STATE_KEY));this.state=normalizeState(raw,this.clock());this.persist()}
  persist(){this.state.updatedAt=iso(this.clock());this.storage.setItem(STATE_KEY,JSON.stringify(this.state))}
  snapshot(){return clone(this.state)}
  getActiveSession(){return this.state.active?clone(this.state.active):null}
  startSession(plan,{goal=null}={}){
    if(this.state.active)return this.getActiveSession();
    if(plan?.status!=='ready'||!Array.isArray(plan.tasks)||!plan.tasks.length)throw new Error('A ready guided study plan is required to start a session.');
    const now=this.clock();this.state.counter++;
    const tasks=plan.tasks.map(normalizeTask),plannedMinutes=tasks.reduce((s,t)=>s+t.plannedMinutes,0);
    this.state.active={id:uid(now,this.state.counter),status:'active',startedAt:iso(now),updatedAt:iso(now),pausedAt:null,plannedMinutes,goal:goal||plan.goal||null,planMode:plan.mode||'canonical-path',contextView:'today',engagedSeconds:0,byView:{},tasks};
    this.persist();return this.getActiveSession();
  }
  setContextView(view){if(!this.state.active||!VIEW_IDS.includes(view)||this.state.active.contextView===view)return this.getActiveSession();this.state.active.contextView=view;this.state.active.updatedAt=iso(this.clock());this.persist();return this.getActiveSession()}
  recordEngagement(seconds,view=null){const a=this.state.active;if(!a||a.status!=='active')return 0;const n=clamp(Math.round(Number(seconds)||0),0,30);if(!n)return 0;const v=VIEW_IDS.includes(view)?view:(VIEW_IDS.includes(a.contextView)?a.contextView:'today');a.engagedSeconds=Math.max(0,Number(a.engagedSeconds)||0)+n;a.byView[v]=(Number(a.byView[v])||0)+n;a.updatedAt=iso(this.clock());this.persist();return n}
  markTaskComplete(taskId,completed=true){const a=this.state.active;if(!a)throw new Error('No active study session.');const task=a.tasks.find(t=>t.id===taskId);if(!task)throw new Error('Unknown session task.');task.completedAt=completed?iso(this.clock()):null;a.updatedAt=iso(this.clock());this.persist();return clone(task)}
  pause(){const a=this.state.active;if(!a)return null;if(a.status==='paused')return this.getActiveSession();a.status='paused';a.pausedAt=iso(this.clock());a.updatedAt=a.pausedAt;this.persist();return this.getActiveSession()}
  resume(){const a=this.state.active;if(!a)return null;if(a.status==='active')return this.getActiveSession();a.status='active';a.pausedAt=null;a.updatedAt=iso(this.clock());this.persist();return this.getActiveSession()}
  finishSession({reason='manual'}={}){const a=this.state.active;if(!a)throw new Error('No active study session.');const now=this.clock(),finished={...clone(a),status:'finished',endedAt:iso(now),finishReason:String(reason||'manual'),completedTasks:sessionDoneCount(a),totalTasks:sessionTaskCount(a),completionRatio:completionRatio(a)};delete finished.pausedAt;this.state.history.push(finished);if(this.state.history.length>MAX_HISTORY)this.state.history.splice(0,this.state.history.length-MAX_HISTORY);this.state.active=null;this.persist();return clone(finished)}
  clearHistory(){this.state.history=[];this.persist()}
  analytics(profile={},at=this.clock()){
    const now=new Date(at),active=this.state.active?clone(this.state.active):null,all=[...this.state.history.map(clone),...(active?[active]:[])];
    const today=dayKey(now),weekStart=startOfWeek(now),weekEnd=addDays(weekStart,7),since28=addDays(startOfDay(now),-27);
    const inRange=(s,start,end)=>{const d=new Date(s.startedAt);return d>=start&&d<end};
    const todaySessions=all.filter(s=>dayKey(s.startedAt)===today),weekSessions=all.filter(s=>inRange(s,weekStart,weekEnd)),recent=all.filter(s=>new Date(s.startedAt)>=since28&&new Date(s.startedAt)<=now);
    const sumSec=list=>list.reduce((n,s)=>n+Math.max(0,Number(s.engagedSeconds)||0),0),sumTasks=list=>list.reduce((a,s)=>({done:a.done+sessionDoneCount(s),total:a.total+sessionTaskCount(s)}),{done:0,total:0});
    const weekTasks=sumTasks(weekSessions),recentTasks=sumTasks(recent),sessionMinutes=Math.max(1,Math.round(Number(profile.sessionMinutes)||25)),daysPerWeek=clamp(Math.round(Number(profile.daysPerWeek)||5),1,7),weeklyTargetMinutes=sessionMinutes*daysPerWeek;
    const qualifies=s=>(Number(s.engagedSeconds)||0)>=60||sessionDoneCount(s)>0,weekStudyDays=new Set(weekSessions.filter(qualifies).map(s=>dayKey(s.startedAt))).size,recentStudyDays=new Set(recent.filter(qualifies).map(s=>dayKey(s.startedAt))).size;
    const earliest=recent.length?recent.reduce((m,s)=>Math.min(m,new Date(s.startedAt).getTime()),Infinity):now.getTime(),observedDays=recent.length?Math.max(1,Math.ceil((startOfDay(now)-startOfDay(new Date(earliest)))/86400000)+1):1,observedWeeks=clamp(Math.ceil(observedDays/7),1,4),consistencyTarget=daysPerWeek*observedWeeks;
    const finishedRecent=this.state.history.filter(s=>new Date(s.startedAt)>=since28&&new Date(s.startedAt)<=now),avgSessionMinutes=finishedRecent.length?Math.round(sumSec(finishedRecent)/60/finishedRecent.length):0;
    const recentFour=finishedRecent.slice(-4),avgFit=recentFour.length?recentFour.reduce((n,s)=>n+completionRatio(s),0)/recentFour.length:null;let suggestedMinutes=null;if(recentFour.length>=3&&avgFit<0.6){if(sessionMinutes===45)suggestedMinutes=25;else if(sessionMinutes===25)suggestedMinutes=10}
    const byView={};for(const s of recent)for(const [view,seconds] of Object.entries(s.byView||{}))if(VIEW_IDS.includes(view))byView[view]=(byView[view]||0)+Number(seconds||0);
    const totalViewSeconds=Object.values(byView).reduce((a,b)=>a+b,0),activityMix=Object.entries(byView).sort((a,b)=>b[1]-a[1]).map(([view,seconds])=>({view,minutes:Math.round(seconds/60),percent:totalViewSeconds?Math.round(seconds/totalViewSeconds*100):0}));
    const trend7=[];for(let i=6;i>=0;i--){const d=addDays(startOfDay(now),-i),key=dayKey(d),sessions=all.filter(s=>dayKey(s.startedAt)===key),tasks=sumTasks(sessions);trend7.push({date:key,minutes:Math.round(sumSec(sessions)/60),completedTasks:tasks.done,totalTasks:tasks.total})}
    return{
      today:{minutes:Math.round(sumSec(todaySessions)/60),sessions:todaySessions.length,...sumTasks(todaySessions)},
      week:{minutes:Math.round(sumSec(weekSessions)/60),targetMinutes:weeklyTargetMinutes,progressPercent:weeklyTargetMinutes?Math.min(100,Math.round(sumSec(weekSessions)/60/weeklyTargetMinutes*100)):0,studyDays:weekStudyDays,targetDays:daysPerWeek,completedTasks:weekTasks.done,totalTasks:weekTasks.total},
      recent28:{minutes:Math.round(sumSec(recent)/60),studyDays:recentStudyDays,targetStudyDays:consistencyTarget,consistencyPercent:consistencyTarget?Math.min(100,Math.round(recentStudyDays/consistencyTarget*100)):0,completionPercent:recentTasks.total?Math.round(recentTasks.done/recentTasks.total*100):0,averageSessionMinutes:avgSessionMinutes,sessions:finishedRecent.length},
      workloadSuggestion:suggestedMinutes?{currentMinutes:sessionMinutes,suggestedMinutes,reason:`Recent sessions have averaged ${Math.round((avgFit||0)*100)}% of their planned workload. A shorter default may fit better.`}:null,
      activityMix,trend7,active,history:this.state.history.slice(-5).reverse().map(clone)
    };
  }
  reset(){this.storage.removeItem(STATE_KEY);this.state=initialState(this.clock());this.persist();return this.snapshot()}
}

return{STATE_KEY,SCHEMA_VERSION,MAX_HISTORY,VIEW_IDS,MemoryStorage,SessionEngine,dayKey,startOfWeek,completionRatio};
});
if(typeof window!=='undefined'&&window.KoineSessions)window.KOINE_SESSION_ENGINE=new window.KoineSessions.SessionEngine();
