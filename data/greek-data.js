(function(root,factory){
  const data=factory();
  if(typeof module==='object'&&module.exports){module.exports=data;}
  else{root.KOINE_GREEK_DATA=data;}
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const sources={
    sblgnt:{
      id:'sblgnt',
      title:'SBL Greek New Testament',
      role:'canonical-text-snapshot',
      license:'CC BY 4.0',
      licenseUrl:'https://www.sblgnt.com/license/',
      sourceUrl:'https://github.com/LogosBible/SBLGNT',
      attribution:'SBL Greek New Testament (SBLGNT), copyright Society of Biblical Literature and Logos Bible Software.',
      note:'Koinē Path uses the SBLGNT surface text embedded in the pinned MorphGNT revision below. This identifies an exact reader snapshot and does not imply identity with later official SBLGNT releases. The Greek text is licensed CC BY 4.0 with attribution.'
    },
    morphgnt:{
      id:'morphgnt-sblgnt-6.12',
      title:'MorphGNT: SBLGNT Edition',
      role:'morphology-lemma-normalization-and-text-snapshot',
      license:'CC BY-SA 3.0',
      licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/',
      sourceUrl:'https://github.com/morphgnt/sblgnt',
      revision:'aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d',
      citation:'Tauber, J. K., ed. (2017) MorphGNT: SBLGNT Edition. Version 6.12. DOI: 10.5281/zenodo.376200',
      note:'Morphological parsing and lemmatization are licensed separately from the Greek text. The pinned revision also fixes the exact SBLGNT surface snapshot used by the reader.'
    },
    koineEditorial:{
      id:'koine-path-editorial-v1',
      title:'Koinē Path reviewed learning annotations',
      role:'pedagogy',
      license:'project-content',
      note:'Hints and short learning glosses are editorial aids, not canonical lexical definitions.'
    }
  };

  const pos={
    'A-':'adjective','C-':'conjunction','D-':'adverb','I-':'interjection','N-':'noun','P-':'preposition',
    'RA':'article','RD':'demonstrative-pronoun','RI':'interrogative-indefinite-pronoun','RP':'personal-pronoun',
    'RR':'relative-pronoun','V-':'verb','X-':'particle'
  };

  const passages={
    'John.1.1':{
      id:'John.1.1',
      osis:'John.1.1',
      book:'John',chapter:1,verse:1,
      textSource:'sblgnt',
      morphologySource:'morphgnt-sblgnt-6.12',
      sourceRevision:'aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d',
      textSnapshot:'SBLGNT surface embedded in pinned MorphGNT revision aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d',
      unicodeNormalization:'NFC',
      surface:'Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος.',
      tokens:[
        {id:'sblgnt.John.1.1.001',position:1,text:'Ἐν',word:'Ἐν',normalized:'ἐν',lemma:'ἐν',posCode:'P-',parseCode:'--------',morph:{}},
        {id:'sblgnt.John.1.1.002',position:2,text:'ἀρχῇ',word:'ἀρχῇ',normalized:'ἀρχῇ',lemma:'ἀρχή',posCode:'N-',parseCode:'----DSF-',morph:{case:'dative',number:'singular',gender:'feminine'}},
        {id:'sblgnt.John.1.1.003',position:3,text:'ἦν',word:'ἦν',normalized:'ἦν',lemma:'εἰμί',posCode:'V-',parseCode:'3IAI-S--',morph:{person:3,tense:'imperfect',voice:'active',mood:'indicative',number:'singular'}},
        {id:'sblgnt.John.1.1.004',position:4,text:'ὁ',word:'ὁ',normalized:'ὁ',lemma:'ὁ',posCode:'RA',parseCode:'----NSM-',morph:{case:'nominative',number:'singular',gender:'masculine'}},
        {id:'sblgnt.John.1.1.005',position:5,text:'λόγος,',word:'λόγος',normalized:'λόγος',lemma:'λόγος',posCode:'N-',parseCode:'----NSM-',morph:{case:'nominative',number:'singular',gender:'masculine'}},
        {id:'sblgnt.John.1.1.006',position:6,text:'καὶ',word:'καὶ',normalized:'καί',lemma:'καί',posCode:'C-',parseCode:'--------',morph:{}},
        {id:'sblgnt.John.1.1.007',position:7,text:'ὁ',word:'ὁ',normalized:'ὁ',lemma:'ὁ',posCode:'RA',parseCode:'----NSM-',morph:{case:'nominative',number:'singular',gender:'masculine'}},
        {id:'sblgnt.John.1.1.008',position:8,text:'λόγος',word:'λόγος',normalized:'λόγος',lemma:'λόγος',posCode:'N-',parseCode:'----NSM-',morph:{case:'nominative',number:'singular',gender:'masculine'}},
        {id:'sblgnt.John.1.1.009',position:9,text:'ἦν',word:'ἦν',normalized:'ἦν',lemma:'εἰμί',posCode:'V-',parseCode:'3IAI-S--',morph:{person:3,tense:'imperfect',voice:'active',mood:'indicative',number:'singular'}},
        {id:'sblgnt.John.1.1.010',position:10,text:'πρὸς',word:'πρὸς',normalized:'πρός',lemma:'πρός',posCode:'P-',parseCode:'--------',morph:{}},
        {id:'sblgnt.John.1.1.011',position:11,text:'τὸν',word:'τὸν',normalized:'τόν',lemma:'ὁ',posCode:'RA',parseCode:'----ASM-',morph:{case:'accusative',number:'singular',gender:'masculine'}},
        {id:'sblgnt.John.1.1.012',position:12,text:'θεόν,',word:'θεόν',normalized:'θεόν',lemma:'θεός',posCode:'N-',parseCode:'----ASM-',morph:{case:'accusative',number:'singular',gender:'masculine'}},
        {id:'sblgnt.John.1.1.013',position:13,text:'καὶ',word:'καὶ',normalized:'καί',lemma:'καί',posCode:'C-',parseCode:'--------',morph:{}},
        {id:'sblgnt.John.1.1.014',position:14,text:'θεὸς',word:'θεὸς',normalized:'θεός',lemma:'θεός',posCode:'N-',parseCode:'----NSM-',morph:{case:'nominative',number:'singular',gender:'masculine'}},
        {id:'sblgnt.John.1.1.015',position:15,text:'ἦν',word:'ἦν',normalized:'ἦν',lemma:'εἰμί',posCode:'V-',parseCode:'3IAI-S--',morph:{person:3,tense:'imperfect',voice:'active',mood:'indicative',number:'singular'}},
        {id:'sblgnt.John.1.1.016',position:16,text:'ὁ',word:'ὁ',normalized:'ὁ',lemma:'ὁ',posCode:'RA',parseCode:'----NSM-',morph:{case:'nominative',number:'singular',gender:'masculine'}},
        {id:'sblgnt.John.1.1.017',position:17,text:'λόγος.',word:'λόγος',normalized:'λόγος',lemma:'λόγος',posCode:'N-',parseCode:'----NSM-',morph:{case:'nominative',number:'singular',gender:'masculine'}}
      ]
    }
  };

  const learningAnnotations={
    'sblgnt.John.1.1.001':{hint:'A preposition. Ask which case it governs here.',glosses:['in']},
    'sblgnt.John.1.1.002':{hint:'Use both the -ῃ ending and the preceding preposition.',glosses:['beginning']},
    'sblgnt.John.1.1.003':{hint:'Identify the lemma before deciding how to translate the imperfect.',glosses:['was']},
    'sblgnt.John.1.1.004':{hint:'The article gives gender, number, and case.',glosses:['the']},
    'sblgnt.John.1.1.005':{hint:'The article ὁ strongly constrains this noun form.',glosses:['word','message']},
    'sblgnt.John.1.1.006':{hint:'A high-frequency coordinating conjunction.',glosses:['and','also']},
    'sblgnt.John.1.1.007':{hint:'Parse the article before the noun.',glosses:['the']},
    'sblgnt.John.1.1.008':{hint:'Use article agreement and the -ος ending.',glosses:['word','message']},
    'sblgnt.John.1.1.009':{hint:'This is the same form of εἰμί seen earlier in the verse.',glosses:['was']},
    'sblgnt.John.1.1.010':{hint:'A preposition; determine its complement before choosing an English gloss.',glosses:['toward','with']},
    'sblgnt.John.1.1.011':{hint:'The article ending identifies case, number, and gender.',glosses:['the']},
    'sblgnt.John.1.1.012':{hint:'The preceding article τόν strongly constrains the parse.',glosses:['God','god']},
    'sblgnt.John.1.1.013':{hint:'A high-frequency coordinating conjunction.',glosses:['and','also']},
    'sblgnt.John.1.1.014':{hint:'Compare this form with θεόν earlier in the verse.',glosses:['God','god']},
    'sblgnt.John.1.1.015':{hint:'Parse the verb form before translating the clause.',glosses:['was']},
    'sblgnt.John.1.1.016':{hint:'Use the article as a morphology label.',glosses:['the']},
    'sblgnt.John.1.1.017':{hint:'The article and noun ending agree.',glosses:['word','message']}
  };

  const lexemes={};
  Object.values(passages).forEach(p=>p.tokens.forEach(t=>{
    if(!lexemes[t.lemma]) lexemes[t.lemma]={
      id:'lex.'+t.lemma,
      lemma:t.lemma,
      normalizedLemma:t.lemma.normalize('NFC'),
      posFamilies:[pos[t.posCode]||t.posCode],
      frequency:{corpus:'pinned MorphGNT/SBLGNT snapshot',count:null,rank:null,band:null,status:'pending-full-corpus-ingest'}
    };
    else if(!lexemes[t.lemma].posFamilies.includes(pos[t.posCode]||t.posCode)) lexemes[t.lemma].posFamilies.push(pos[t.posCode]||t.posCode);
  }));

  return {
    schemaVersion:1,
    datasetVersion:'bg2.1.0-bg15',
    unicodeNormalization:'NFC',
    generatedFromPinnedSources:true,
    coverage:{status:'foundation-sample',books:1,passages:1,verses:1,tokens:17,fullCorpusIngested:false},
    sources,pos,passages,lexemes,learningAnnotations,
    vocabularyModel:{
      countingUnit:'normalized-lemma',
      corpus:'pinned MorphGNT/SBLGNT snapshot',
      includeProperNames:true,
      tieBreak:'lemma-codepoint-order',
      bands:[{id:'F1',minRank:1,maxRank:100},{id:'F2',minRank:101,maxRank:300},{id:'F3',minRank:301,maxRank:600},{id:'F4',minRank:601,maxRank:1000},{id:'F5',minRank:1001,maxRank:null}],
      rule:'Frequency values are generated only from a complete pinned corpus. Partial passage samples must never be presented as NT-wide frequency data.'
    }
  };
});