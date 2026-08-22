(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.KoineGuidance=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

const STATE_KEY='koine-path-guidance-v1';
const SCHEMA_VERSION=1;
const GOALS=['read-nt','course-mastery','grammar-refresh','exegesis'];
const EXPERIENCE=['new','alphabet','coursework','returning-reader'];
const SESSION_MINUTES=[10,25,45];
const QUESTIONS=Object.freeze([
  {id:'p01',stage:'S0',prompt:'Which letter is omega?',options:['ο','ω','η','ε'],correct:1,rationale:'ω is omega; ο is omicron.'},
  {id:'p02',stage:'S0',prompt:'Which form begins with a rough breathing?',options:['ἀ','ἁ','ἄ','ἂ'],correct:1,rationale:'The reversed-comma mark in ἁ is the rough breathing.'},
  {id:'p03',stage:'S1',prompt:'Parse the article ὁ.',options:['nominative singular masculine','accusative singular masculine','nominative plural masculine','genitive singular masculine'],correct:0,rationale:'ὁ is nominative singular masculine.'},
  {id:'p04',stage:'S1',prompt:'In βλέπω τὸν λόγον, what is the most direct grammatical role of τὸν λόγον?',options:['subject','direct object','possessor','vocative'],correct:1,rationale:'The accusative phrase functions as the direct object of βλέπω.'},
  {id:'p05',stage:'S2',prompt:'Parse λύομεν for person and number.',options:['1st singular','2nd plural','1st plural','3rd plural'],correct:2,rationale:'-ομεν marks first-person plural in this present active indicative form.'},
  {id:'p06',stage:'S2',prompt:'What is the lemma of ἐστίν?',options:['ἔρχομαι','εἰμί','ἔχω','γίνομαι'],correct:1,rationale:'ἐστίν is a form of εἰμί.'},
  {id:'p07',stage:'S3',prompt:'Which tense-form is ἔλυον?',options:['present active indicative','imperfect active indicative','future active indicative','perfect active indicative'],correct:1,rationale:'The augment plus secondary ending identifies the imperfect form here.'},
  {id:'p08',stage:'S3',prompt:'How is ἔλαβον from λαμβάνω commonly classified morphologically?',options:['second aorist','perfect middle/passive','future passive','present subjunctive'],correct:0,rationale:'ἔλαβον uses the second-aorist stem λαβ-.'},
  {id:'p09',stage:'S4',prompt:'What case and number is αὐτοῖς?',options:['genitive singular','dative plural','accusative plural','nominative plural'],correct:1,rationale:'αὐτοῖς is dative plural; gender depends on context.'},
  {id:'p10',stage:'S4',prompt:'The genitive σαρκός most directly helps you identify which stem for σάρξ?',options:['σαρξ-','σαρκ-','σαρκο-','σαρ-'],correct:1,rationale:'The third-declension stem is σαρκ-.'},
  {id:'p11',stage:'S5',prompt:'What kind of form is λύσαντες?',options:['present infinitive','aorist active participle','perfect passive participle','aorist imperative'],correct:1,rationale:'λύσαντες is an aorist active participial form.'},
  {id:'p12',stage:'S5',prompt:'Which mood commonly follows ἵνα in the Greek New Testament?',options:['indicative','imperative','subjunctive','optative only'],correct:2,rationale:'ἵνα commonly governs a subjunctive verb, while the clause relation still depends on context.'},
  {id:'p13',stage:'S6',prompt:'In ὁ ἀγαθὸς ἄνθρωπος, how does ἀγαθός function?',options:['attributively','as a direct object','as a genitive modifier','as an adverb'],correct:0,rationale:'The article-adjective-noun pattern is attributive.'},
  {id:'p14',stage:'S6',prompt:'A clause introduced by εἰ most characteristically marks which relationship?',options:['condition','direct address','comparison only','simple coordination'],correct:0,rationale:'εἰ characteristically introduces a conditional protasis.'},
  {id:'p15',stage:'S7',prompt:'Which is the most responsible first move in a lexical word study?',options:['derive meaning from the word root','choose the longest dictionary definition','compare plausible senses with the immediate context and actual usage','assume one English gloss fits every occurrence'],correct:2,rationale:'Lexical meaning is constrained by usage and context, not by root-based shortcuts.'},
  {id:'p16',stage:'S7',prompt:'What does an edition-comparison apparatus establish by itself?',options:['the complete manuscript history','differences among the editions/readings it reports','the original wording with certainty','the theology of a variant'],correct:1,rationale:'An edition-comparison apparatus reports its declared comparison data; it is not automatically a complete manuscript apparatus.'}
]);

const clone=v=>JSON.parse(JSON.stringify(v));
const safe=v=>{try{return JSON.parse(v)}catch{return null}};
const iso=d=>new Date(d).toISOString();
class MemoryStorage{constructor(seed={}){this.map=new Map(Object.entries(seed))}getItem(k){return this.map.has(k)?this.map.get(k):null}setItem(k,v){this.map.set(k,String(v))}removeItem(k){this.map.delete(k)}}

function initialState(now=new Date()){
  return{schemaVersion:SCHEMA_VERSION,createdAt:iso(now),updatedAt:iso(now),onboarding:{status:'new',completedAt:null,skipped:false},profile:{experience:'new',goal:'read-nt',sessionMinutes:25,daysPerWeek:5},placement:{status:'not-started',answers:{},score:null,total:QUESTIONS.length,stageId:null,stageIndex:null,completedAt:null},plan:{lastGeneratedAt:null}};
}
function stageForScore(score){if(score>=14)return 7;if(score>=12)return 6;if(score>=10)return 5;if(score>=8)return 4;if(score>=6)return 3;if(score>=4)return 2;if(score>=2)return 1;return 0}
function normalizeProfile(input,current){const next={...current,...input};if(!EXPERIENCE.includes(next.experience))next.experience='new';if(!GOALS.includes(next.goal))next.goal='read-nt';next.sessionMinutes=SESSION_MINUTES.includes(Number(next.sessionMinutes))?Number(next.sessionMinutes):25;next.daysPerWeek=Math.max(1,Math.min(7,Math.round(Number(next.daysPerWeek)||5)));return next}

class GuidanceEngine{
  constructor({curriculum,learningEngine=null,storage=null,clock=()=>new Date()}={}){
    if(!curriculum?.stages?.length)throw new Error('GuidanceEngine requires KOINE_CURRICULUM.');this.curriculum=curriculum;this.learningEngine=learningEngine;this.storage=storage||((typeof localStorage!=='undefined')?localStorage:new MemoryStorage());this.clock=clock;
    const raw=safe(this.storage.getItem(STATE_KEY)),base=initialState(this.clock());this.state=raw?.schemaVersion===SCHEMA_VERSION?{...base,...raw,onboarding:{...base.onboarding,...raw.onboarding},profile:normalizeProfile(raw.profile||{},base.profile),placement:{...base.placement,...raw.placement,answers:{...(raw.placement?.answers||{})}},plan:{...base.plan,...raw.plan}}:base;this.persist();
  }
  persist(){this.state.updatedAt=iso(this.clock());this.storage.setItem(STATE_KEY,JSON.stringify(this.state))}
  snapshot(){return clone(this.state)}
  questions(){return QUESTIONS.map(clone)}
  saveProfile(profile){this.state.profile=normalizeProfile(profile,this.state.profile);if(this.state.onboarding.status==='new')this.state.onboarding.status='profile';this.persist();return clone(this.state.profile)}
  startPlacement(){this.state.placement={status:'in-progress',answers:{},score:null,total:QUESTIONS.length,stageId:null,stageIndex:null,completedAt:null};this.state.onboarding.status='placement';this.persist();return this.placementProgress()}
  answerPlacement(questionId,optionIndex){const q=QUESTIONS.find(x=>x.id===questionId);if(!q)throw new Error('Unknown placement question.');const n=Number(optionIndex);if(!Number.isInteger(n)||n<0||n>=q.options.length)throw new Error('Unknown placement option.');if(this.state.placement.status!=='in-progress')this.startPlacement();this.state.placement.answers[questionId]=n;this.persist();return this.placementProgress()}
  placementProgress(){const answered=Object.keys(this.state.placement.answers||{}).length;return{answered,total:QUESTIONS.length,complete:answered===QUESTIONS.length}}
  completePlacement(){const progress=this.placementProgress();if(!progress.complete)throw new Error(`Placement is incomplete (${progress.answered}/${progress.total}).`);let score=0;QUESTIONS.forEach(q=>{if(this.state.placement.answers[q.id]===q.correct)score++});const stageIndex=stageForScore(score),stage=this.curriculum.stages[stageIndex];this.state.placement={...this.state.placement,status:'complete',score,total:QUESTIONS.length,stageIndex,stageId:stage.id,completedAt:iso(this.clock())};this.state.onboarding.status='ready';this.persist();return this.getPlacementResult()}
  skipPlacement(){this.state.placement={status:'skipped',answers:{},score:null,total:QUESTIONS.length,stageId:null,stageIndex:null,completedAt:iso(this.clock())};this.state.onboarding.status='ready';this.persist();return this.snapshot()}
  finishOnboarding({skipped=false}={}){this.state.onboarding={status:'complete',completedAt:iso(this.clock()),skipped:!!skipped};this.persist();return this.snapshot()}
  getPlacementResult(){const p=this.state.placement;if(p.status!=='complete')return null;const stage=this.curriculum.stages[p.stageIndex];const byStage=this.curriculum.stages.map(s=>{const qs=QUESTIONS.filter(q=>q.stage===s.id),correct=qs.filter(q=>p.answers[q.id]===q.correct).length;return{id:s.id,title:s.title,correct,total:qs.length}});return{score:p.score,total:p.total,stageIndex:p.stageIndex,stageId:p.stageId,stageTitle:stage.title,outcome:stage.outcome,byStage,notice:'Placement is provisional routing evidence only. It does not mark units mastered, pass stage gates, or unlock course content.'}}
  routeForRecommendation(rec){if(!rec)return{view:'learn',label:'Learn'};if(rec.kind==='remediation'||rec.kind==='review')return{view:'review',label:'Review'};if(rec.kind==='reading')return{view:'read',label:'Read'};return{view:'learn',label:'Learn',unitId:rec.unitId}}
  getGuidedPlan(){
    const dash=this.learningEngine?.getDashboard?.()||null,profile=this.state.profile,placement=this.getPlacementResult(),minutes=profile.sessionMinutes;if(this.state.onboarding.status!=='complete')return{status:'setup',title:'Set up your study path',summary:'Choose your goal and workload, then use the optional placement diagnostic to calibrate the path.',minutes,tasks:[{kind:'setup',view:'setup',minutes:Math.min(10,minutes),title:'Complete study setup'}]};
    const rec=dash?.recommendation||null,primaryRoute=this.routeForRecommendation(rec),currentUnit=rec?.unitId||1,currentStageIndex=Math.max(0,this.curriculum.stages.findIndex(s=>s.id===dash?.currentStage?.id)),placementAhead=!!placement&&placement.stageIndex>currentStageIndex;
    const primaryMinutes=minutes===10?10:minutes===25?15:25,tasks=[{kind:'primary',view:primaryRoute.view,unitId:primaryRoute.unitId,minutes:primaryMinutes,title:rec?.title||`Begin Unit ${currentUnit}`,reason:rec?.reason||'Continue the canonical course.'}];
    if(minutes>=25){if(profile.goal==='grammar-refresh')tasks.push({kind:'support',view:'drill',minutes:5,title:'Morphology retrieval'});else if(profile.goal==='read-nt'||profile.goal==='exegesis')tasks.push({kind:'transfer',view:'read',minutes:5,title:'Greek text transfer'});else tasks.push({kind:'support',view:'review',minutes:5,title:'Targeted review'});tasks.push({kind:'vocabulary',view:'review',minutes:5,title:'Vocabulary / due review'})}
    if(minutes>=45)tasks.push({kind:'transfer',view:profile.goal==='exegesis'?'tutor':'read',minutes:10,title:profile.goal==='exegesis'?'Explain one difficult construction':'Sustained reading'});
    const mode=placementAhead?'accelerated-validation':'canonical-path',summary=placementAhead?`Placement suggests ${placement.stageId} (${placement.stageTitle}), but the mastery engine remains authoritative. Move quickly through earlier units by using their canonical checks; no placement answer has unlocked content.`:`Follow the mastery engine from ${dash?.currentStage?.id||'S0'} with a ${minutes}-minute session budget.`;this.state.plan.lastGeneratedAt=iso(this.clock());this.persist();return{status:'ready',mode,title:mode==='accelerated-validation'?'Accelerated validation path':'Guided study path',summary,minutes,goal:profile.goal,experience:profile.experience,placement,tasks};
  }
  reset(){this.storage.removeItem(STATE_KEY);this.state=initialState(this.clock());this.persist();return this.snapshot()}
}
return{STATE_KEY,SCHEMA_VERSION,GOALS,EXPERIENCE,SESSION_MINUTES,QUESTIONS,MemoryStorage,GuidanceEngine,stageForScore};
});
if(typeof window!=='undefined'&&window.KOINE_CURRICULUM&&window.KoineGuidance)window.KOINE_GUIDANCE_ENGINE=new window.KoineGuidance.GuidanceEngine({curriculum:window.KOINE_CURRICULUM,learningEngine:window.KOINE_LEARNING_ENGINE});
