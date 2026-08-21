(function(root,factory){
  const apply=factory();
  if(typeof module==='object'&&module.exports)module.exports=apply;
  else if(root?.KOINE_MORPHOLOGY_DATA)apply(root.KOINE_MORPHOLOGY_DATA);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const additions=[
    {
      id:'morph.bg15.kalon.asm',
      form:'καλόν',lemma:'καλός',family:'adjective',unitId:10,
      features:{partOfSpeech:'adjective',case:'accusative',number:'singular',gender:'masculine',degree:'positive'}
    }
  ];
  return function apply(data){
    if(!data?.items||!data?.source?.id)throw new Error('BG15 morphology corrections require BG4/BG15 morphology data.');
    const signatures=new Set(data.items.map(x=>JSON.stringify([x.form,x.lemma,x.family,x.unitId,x.features])));
    for(const item of additions){
      const signature=JSON.stringify([item.form,item.lemma,item.family,item.unitId,item.features]);
      if(signatures.has(signature))continue;
      data.items.push({...item,sourceId:data.source.id,qaCorrection:'bg15-contextless-syncretism'});
      signatures.add(signature);
    }
    return data;
  };
});