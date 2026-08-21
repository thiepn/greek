(function(root,factory){
  const data=factory();
  if(typeof module==='object'&&module.exports) module.exports=data;
  else root.KOINE_MORPHOLOGY_DATA=data;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const source={
    id:'koine-reviewed-morphology-v1',
    role:'reviewed-pedagogical-paradigms',
    note:'Reviewed paradigm forms for training. These are pedagogical forms and are not claimed to be corpus occurrences unless corpusTokenId is present.'
  };

  const items=[];
  const add=(form,lemma,family,unitId,features,extra={})=>items.push({
    id:`morph.${items.length+1}`,
    form,lemma,family,unitId,features,sourceId:source.id,...extra
  });

  // Article — Units 5–6.
  [
    ['ὁ','nominative','singular','masculine'],['τοῦ','genitive','singular','masculine'],['τῷ','dative','singular','masculine'],['τόν','accusative','singular','masculine'],
    ['οἱ','nominative','plural','masculine'],['τῶν','genitive','plural','masculine'],['τοῖς','dative','plural','masculine'],['τούς','accusative','plural','masculine'],
    ['ἡ','nominative','singular','feminine'],['τῆς','genitive','singular','feminine'],['τῇ','dative','singular','feminine'],['τήν','accusative','singular','feminine'],
    ['αἱ','nominative','plural','feminine'],['τῶν','genitive','plural','feminine'],['ταῖς','dative','plural','feminine'],['τάς','accusative','plural','feminine'],
    ['τό','nominative','singular','neuter'],['τοῦ','genitive','singular','neuter'],['τῷ','dative','singular','neuter'],['τό','accusative','singular','neuter'],
    ['τά','nominative','plural','neuter'],['τῶν','genitive','plural','neuter'],['τοῖς','dative','plural','neuter'],['τά','accusative','plural','neuter']
  ].forEach(([form,case_,number,gender])=>add(form,'ὁ','article',5,{partOfSpeech:'article',case:case_,number,gender}));

  // Second-declension masculine λόγος — Unit 7.
  [
    ['λόγος','nominative','singular'],['λόγου','genitive','singular'],['λόγῳ','dative','singular'],['λόγον','accusative','singular'],
    ['λόγοι','nominative','plural'],['λόγων','genitive','plural'],['λόγοις','dative','plural'],['λόγους','accusative','plural']
  ].forEach(([form,case_,number])=>add(form,'λόγος','noun-2m',7,{partOfSpeech:'noun',declension:'second',case:case_,number,gender:'masculine'}));

  // Second-declension neuter δῶρον — Unit 8.
  [
    ['δῶρον','nominative','singular'],['δώρου','genitive','singular'],['δώρῳ','dative','singular'],['δῶρον','accusative','singular'],
    ['δῶρα','nominative','plural'],['δώρων','genitive','plural'],['δώροις','dative','plural'],['δῶρα','accusative','plural']
  ].forEach(([form,case_,number])=>add(form,'δῶρον','noun-2n',8,{partOfSpeech:'noun',declension:'second',case:case_,number,gender:'neuter'}));

  // First-declension feminine γραφή — Unit 9.
  [
    ['γραφή','nominative','singular'],['γραφῆς','genitive','singular'],['γραφῇ','dative','singular'],['γραφήν','accusative','singular'],
    ['γραφαί','nominative','plural'],['γραφῶν','genitive','plural'],['γραφαῖς','dative','plural'],['γραφάς','accusative','plural']
  ].forEach(([form,case_,number])=>add(form,'γραφή','noun-1f',9,{partOfSpeech:'noun',declension:'first',case:case_,number,gender:'feminine'}));

  // Adjectives — Unit 10.
  [
    ['καλός','nominative','singular','masculine'],['καλή','nominative','singular','feminine'],['καλόν','nominative','singular','neuter'],
    ['καλοῦ','genitive','singular','masculine'],['καλῆς','genitive','singular','feminine'],['καλοῦ','genitive','singular','neuter'],
    ['καλοί','nominative','plural','masculine'],['καλαί','nominative','plural','feminine'],['καλά','nominative','plural','neuter']
  ].forEach(([form,case_,number,gender])=>add(form,'καλός','adjective',10,{partOfSpeech:'adjective',case:case_,number,gender,degree:'positive'}));

  // Present-system verbs — Units 12–15.
  [
    ['λύω',1,'singular'],['λύεις',2,'singular'],['λύει',3,'singular'],['λύομεν',1,'plural'],['λύετε',2,'plural'],['λύουσιν',3,'plural']
  ].forEach(([form,person,number])=>add(form,'λύω','verb-present-active',12,{partOfSpeech:'verb',tense:'present',voice:'active',mood:'indicative',person,number}));
  [
    ['λύομαι',1,'singular'],['λύῃ',2,'singular'],['λύεται',3,'singular'],['λυόμεθα',1,'plural'],['λύεσθε',2,'plural'],['λύονται',3,'plural']
  ].forEach(([form,person,number])=>add(form,'λύω','verb-present-middle-passive',14,{partOfSpeech:'verb',tense:'present',voice:'middle/passive',mood:'indicative',person,number}));

  // Indicative systems / principal parts — Units 17–23.
  [
    ['ἔλυον','imperfect','active','indicative',1,'singular'],['ἔλυες','imperfect','active','indicative',2,'singular'],['ἔλυε','imperfect','active','indicative',3,'singular'],
    ['λύσω','future','active','indicative',1,'singular'],['λύσεις','future','active','indicative',2,'singular'],['λύσει','future','active','indicative',3,'singular'],
    ['ἔλυσα','aorist','active','indicative',1,'singular'],['ἔλυσας','aorist','active','indicative',2,'singular'],['ἔλυσε','aorist','active','indicative',3,'singular'],
    ['ἐλύθην','aorist','passive','indicative',1,'singular'],['ἐλύθης','aorist','passive','indicative',2,'singular'],['ἐλύθη','aorist','passive','indicative',3,'singular'],
    ['λέλυκα','perfect','active','indicative',1,'singular']
  ].forEach(([form,tense,voice,mood,person,number])=>add(form,'λύω','verb-indicative-systems',tense==='imperfect'?17:tense==='future'?18:tense==='aorist'&&voice==='passive'?21:tense==='aorist'?19:30,{partOfSpeech:'verb',tense,voice,mood,person,number}));

  // Pronouns — Units 26–28.
  [
    ['αὐτός','nominative','singular','masculine'],['αὐτοῦ','genitive','singular','masculine'],['αὐτῷ','dative','singular','masculine'],['αὐτόν','accusative','singular','masculine'],
    ['αὐτή','nominative','singular','feminine'],['αὐτήν','accusative','singular','feminine'],['αὐτό','nominative','singular','neuter'],['αὐτά','nominative','plural','neuter']
  ].forEach(([form,case_,number,gender])=>add(form,'αὐτός','pronoun',26,{partOfSpeech:'pronoun',case:case_,number,gender}));

  // Third declension — Units 24–25.
  [
    ['σάρξ','nominative','singular','feminine'],['σαρκός','genitive','singular','feminine'],['σαρκί','dative','singular','feminine'],['σάρκα','accusative','singular','feminine'],
    ['ὄνομα','nominative','singular','neuter'],['ὀνόματος','genitive','singular','neuter'],['ὀνόματι','dative','singular','neuter'],['ὄνομα','accusative','singular','neuter'],
    ['πίστις','nominative','singular','feminine'],['πίστεως','genitive','singular','feminine'],['πίστει','dative','singular','feminine'],['πίστιν','accusative','singular','feminine']
  ].forEach(([form,case_,number,gender])=>add(form,form.startsWith('σαρ')||form==='σάρξ'||form==='σάρκα'?'σάρξ':form.startsWith('ὀν')||form==='ὄνομα'?'ὄνομα':'πίστις','noun-3',25,{partOfSpeech:'noun',declension:'third',case:case_,number,gender}));

  // Participles, infinitives, subjunctive, imperatives, μι verbs — Units 31–37.
  [
    ['λύων','present','active','participle','nominative','singular','masculine'],['λύουσα','present','active','participle','nominative','singular','feminine'],['λῦον','present','active','participle','nominative','singular','neuter'],
    ['λύσας','aorist','active','participle','nominative','singular','masculine'],['λυθείς','aorist','passive','participle','nominative','singular','masculine']
  ].forEach(([form,tense,voice,mood,case_,number,gender])=>add(form,'λύω','participle',32,{partOfSpeech:'verb',tense,voice,mood,case:case_,number,gender}));
  [
    ['λύειν','present','active'],['λῦσαι','aorist','active'],['λυθῆναι','aorist','passive']
  ].forEach(([form,tense,voice])=>add(form,'λύω','infinitive',34,{partOfSpeech:'verb',tense,voice,mood:'infinitive'}));
  [
    ['λύω',1,'singular'],['λύῃς',2,'singular'],['λύῃ',3,'singular'],['λύωμεν',1,'plural'],['λύητε',2,'plural'],['λύωσιν',3,'plural']
  ].forEach(([form,person,number])=>add(form,'λύω','subjunctive',35,{partOfSpeech:'verb',tense:'present',voice:'active',mood:'subjunctive',person,number}));
  [['λῦε',2,'singular'],['λύετε',2,'plural']].forEach(([form,person,number])=>add(form,'λύω','imperative',36,{partOfSpeech:'verb',tense:'present',voice:'active',mood:'imperative',person,number}));
  [['δίδωμι','δίδωμι'],['τίθημι','τίθημι'],['ἵστημι','ἵστημι']].forEach(([form,lemma])=>add(form,lemma,'mi-verb',37,{partOfSpeech:'verb',tense:'present',voice:'active',mood:'indicative',person:1,number:'singular'}));

  // Principal-part recognition set.
  const principalParts={
    'λύω':['λύω','λύσω','ἔλυσα','λέλυκα','λέλυμαι','ἐλύθην'],
    'γράφω':['γράφω','γράψω','ἔγραψα','γέγραφα','γέγραμμαι','ἐγράφην'],
    'λαμβάνω':['λαμβάνω','λήμψομαι','ἔλαβον','εἴληφα','εἴλημμαι','ἐλήμφθην']
  };

  const featureOrder=['tense','voice','mood','person','number','case','gender','degree'];
  function label(item){
    const f=item.features;
    if(f.partOfSpeech==='article'||f.partOfSpeech==='noun'||f.partOfSpeech==='adjective'||f.partOfSpeech==='pronoun'){
      return [f.case,f.number,f.gender,f.partOfSpeech].filter(Boolean).join(' · ');
    }
    return [f.tense,f.voice,f.mood,f.person?`${f.person}${f.person===1?'st':f.person===2?'nd':'rd'} person`:null,f.number,f.case,f.gender].filter(Boolean).join(' · ');
  }
  function difference(a,b){return featureOrder.filter(k=>(a.features[k]||null)!==(b.features[k]||null));}

  return Object.freeze({version:'bg4.0',source,items,principalParts,featureOrder,label,difference});
});