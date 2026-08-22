window.KOINE_PRONUNCIATION_DATA=Object.freeze({
  version:'bg12.0',defaultProfile:'koine-reconstructed',
  profiles:{
    'koine-reconstructed':{id:'koine-reconstructed',name:'Reconstructed Koinē',period:'Roman-period teaching approximation',historical:true,tts:false,description:'Seven-vowel phonemic teaching profile for Roman-period Koinē. It is a pedagogical reconstruction, not a claim that every first-century speaker sounded identical.',source:'https://www.biblicallanguagecenter.com/koine-greek-pronunciation/'},
    'erasmian':{id:'erasmian',name:'Academic Erasmian',period:'Conventional classroom reading',historical:false,tts:false,description:'A conventional academic reading profile. Regional Erasmian traditions differ; this app uses one explicit internally consistent teaching convention.'},
    'modern':{id:'modern',name:'Modern Greek',period:'Contemporary Greek',historical:false,tts:true,locale:'el-GR',description:'Contemporary Greek pronunciation. Browser speech synthesis is allowed only for this profile and is labeled Modern Greek audio.'}
  },
  alphabet:[
    ['α','alpha'],['β','beta'],['γ','gamma'],['δ','delta'],['ε','epsilon'],['ζ','zeta'],['η','eta'],['θ','theta'],['ι','iota'],['κ','kappa'],['λ','lambda'],['μ','mu'],['ν','nu'],['ξ','xi'],['ο','omicron'],['π','pi'],['ρ','rho'],['σ','sigma'],['τ','tau'],['υ','upsilon'],['φ','phi'],['χ','chi'],['ψ','psi'],['ω','omega']
  ],
  drills:[
    {id:'vowel.ei-i',profile:'koine-reconstructed',prompt:'Which pair is homophonous in this Koinē profile?',choices:['ει / ι','ει / η','ει / ε'],answer:0,focus:'ει and ι → /i/'},
    {id:'vowel.ai-e',profile:'koine-reconstructed',prompt:'Which pair is homophonous in this Koinē profile?',choices:['αι / ε','αι / η','αι / ι'],answer:0,focus:'αι and ε → /ɛ/'},
    {id:'vowel.oi-y',profile:'koine-reconstructed',prompt:'Which pair is homophonous in this Koinē profile?',choices:['οι / υ','οι / ου','οι / ω'],answer:0,focus:'οι and υ → /y/'},
    {id:'vowel.o-omega',profile:'koine-reconstructed',prompt:'Which pair is homophonous in this Koinē profile?',choices:['ο / ω','ο / ου','ω / η'],answer:0,focus:'ο and ω → /o/'},
    {id:'modern.iotacism',profile:'modern',prompt:'Which set shares /i/ in Modern Greek?',choices:['ι η υ ει οι','ε αι η','ο ω ου'],answer:0,focus:'Modern iotacism'},
    {id:'erasmian.distinction',profile:'erasmian',prompt:'Which principle best describes this app’s Erasmian profile?',choices:['It preserves classroom spelling distinctions','It reconstructs one exact first-century dialect','It uses Modern Greek phonology'],answer:0,focus:'Academic convention, not historical reconstruction'}
  ],
  listeningComprehension:[
    {id:'listen.john1.1a',text:'Ἐν ἀρχῇ ἦν ὁ λόγος',prompt:'Which word is the finite verb you heard?',choices:['ἦν','ἀρχῇ','λόγος'],answer:0,source:'John 1:1 excerpt'},
    {id:'listen.1john4.8',text:'ὁ θεὸς ἀγάπη ἐστίν',prompt:'Which word functions as the copular verb?',choices:['θεός','ἀγάπη','ἐστίν'],answer:2,source:'1 John 4:8 excerpt'},
    {id:'listen.phil4.4',text:'χαίρετε ἐν κυρίῳ πάντοτε',prompt:'Which form carries the command?',choices:['χαίρετε','κυρίῳ','πάντοτε'],answer:0,source:'Philippians 4:4 excerpt'}
  ],
  audioPolicy:{historicalProfiles:'No Modern Greek TTS is presented as historical Koinē/Erasmian reference audio.',modernTts:'Uses a browser-provided el-GR voice when available; voice quality is platform-dependent.',recording:'Learner microphone recordings stay local in the browser and are never uploaded by BG12.'}
});