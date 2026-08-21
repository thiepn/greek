(function(root,factory){
  const apply=factory();
  if(typeof module==='object'&&module.exports)module.exports=apply;
  else if(root?.KOINE_MORPHOLOGY_DATA)apply(root.KOINE_MORPHOLOGY_DATA);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const additions=[
    {id:'morph.bg15.elyon.3pl',form:'ἔλυον',lemma:'λύω',family:'verb-indicative-systems',unitId:17,features:{partOfSpeech:'verb',tense:'imperfect',voice:'active',mood:'indicative',person:3,number:'plural'}},
    {id:'morph.bg15.kalon.asm',form:'καλόν',lemma:'καλός',family:'adjective',unitId:10,features:{partOfSpeech:'adjective',case:'accusative',number:'singular',gender:'masculine',degree:'positive'}},
    {id:'morph.bg15.kalon.asn',form:'καλόν',lemma:'καλός',family:'adjective',unitId:10,features:{partOfSpeech:'adjective',case:'accusative',number:'singular',gender:'neuter',degree:'positive'}},
    {id:'morph.bg15.auto.asn',form:'αὐτό',lemma:'αὐτός',family:'pronoun',unitId:26,features:{partOfSpeech:'pronoun',case:'accusative',number:'singular',gender:'neuter'}},
    {id:'morph.bg15.auta.apn',form:'αὐτά',lemma:'αὐτός',family:'pronoun',unitId:26,features:{partOfSpeech:'pronoun',case:'accusative',number:'plural',gender:'neuter'}},
    {id:'morph.bg15.lyon.asn',form:'λῦον',lemma:'λύω',family:'participle',unitId:32,features:{partOfSpeech:'verb',tense:'present',voice:'active',mood:'participle',case:'accusative',number:'singular',gender:'neuter'}}
  ];
  return function apply(data){
    if(!data?.items||!data?.source?.id)throw new Error('BG15 morphology corrections require BG4 morphology data.');
    const ids=new Set(data.items.map(x=>x.id));
    for(const item of additions){
      if(ids.has(item.id))continue;
      data.items.push({...item,sourceId:data.source.id,qaCorrection:'bg15-contextless-syncretism'});
      ids.add(item.id);
    }
    return data;
  };
});