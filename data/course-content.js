(function(root,factory){
  const data=factory();
  if(typeof module==='object'&&module.exports)module.exports=data;
  if(root)root.KOINE_COURSE_CONTENT=data;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const source=Object.freeze({
    id:'koine-path-course-v1',
    role:'reviewed-pedagogical-course-content',
    status:'internal-editorial-review',
    note:'Deterministic instructional content authored for Koinē Path. CI validates structure, Greek normalization, safeguards, and answer integrity; this is not a claim of external scholarly peer review.'
  });
  const Q=(dimension,prompt,choices,answer,explanation,errorType='syntax_relation')=>({dimension,prompt,choices,answer,explanation,errorType});
  const U=(id,title,objective,teach,forms,caution,scripture,checks)=>({id,title,objective,teach,forms,caution,scripture,checks:checks.map((q,i)=>({id:`u${id}.q${i+1}`,...q}))});
  const units=[
    U(1,'Alphabet recognition','Recognize the twenty-four Greek letters rapidly in upper/lowercase forms and distinguish medial/final sigma.',[
      'Reading begins with immediate symbol recognition. Learn each letter as a sound-bearing character rather than as a picture to decode through English.',
      'Sigma has two lowercase shapes: σ within a word and ς at the end. The letter is still sigma; the shape changes by position.',
      'Speed matters because morphology becomes visible only when letter recognition stops consuming attention.'
    ],['λ = lambda','γ = gamma','σ / ς = sigma','ω = omega'],'Do not attach grammatical meaning to a letter shape by itself.',[{ref:'John 1:1',task:'Scan the verse and name every letter before thinking about translation.'}],[
      Q('recognition','Which character is lambda?',['λ','γ','ρ','χ'],0,'λ is lambda.','declension_pattern'),
      Q('recognition','Which lowercase sigma normally appears at the end of a word?',['σ','ς','ζ','ξ'],1,'Final sigma is written ς.','declension_pattern'),
      Q('reading','What is the best first task when a Greek word still feels visually unfamiliar?',['Guess the English meaning','Name its letters accurately','Look for theology','Ignore the ending'],1,'Stable decoding precedes grammatical interpretation.','word_order_overreliance')
    ]),
    U(2,'Vowels, diphthongs, consonant combinations & syllables','Recognize common vowel combinations, consonant clusters, and syllable boundaries used in Greek reading.',[
      'The basic vowels are α ε η ι ο υ ω. Common diphthongs include αι, ει, οι, αυ, ευ, ου, and υι.',
      'Some consonant combinations affect pronunciation. For example γ before another velar such as γ, κ, χ, or ξ is commonly pronounced with a nasal quality in historical/reconstructed systems.',
      'Syllabification helps reading rhythm: a Greek word normally has one vowel or diphthong nucleus per syllable.'
    ],['αι','ει','οι','ου','λόγος → λό-γος'],'Pronunciation systems differ in exact sound values; keep one system internally consistent rather than treating spelling as unstable.',[{ref:'Mark 1:1',task:'Mark the vowel nuclei and read the line by syllables.'}],[
      Q('recognition','Which pair is normally treated as a diphthong in basic Koine reading?',['αι','αε','οα','ηα'],0,'αι is a standard diphthong.','declension_pattern'),
      Q('concept','What normally determines the nucleus of a Greek syllable?',['A consonant cluster','A vowel or diphthong','An accent mark alone','Word position'],1,'Each syllable is organized around a vowel sound or diphthong.','declension_pattern'),
      Q('reading','Why practice syllabification?',['To replace morphology','To make decoding and oral reading more automatic','To decide theology','To translate without syntax'],1,'Syllabification supports fluent decoding, not interpretation by itself.','word_order_overreliance')
    ]),
    U(3,'Breathings, accents, punctuation & orthographic marks','Read breathing marks, accents, punctuation, iota subscript, and movable nu without assigning them false grammatical force.',[
      'A rough breathing ( ̔ ) historically signals initial /h/ where the pronunciation system preserves it; a smooth breathing ( ̓ ) does not.',
      'Acute, grave, and circumflex accents are part of the written word. They can matter for pronunciation and occasionally distinction, but they are not a substitute for morphology or syntax.',
      'Greek uses ; as a question mark and · as a raised stop. Iota subscript appears in forms such as τῷ; movable ν may appear in forms such as ἐστίν.'
    ],['ὁ / ἡ','τῷ','ἐστίν','; = question mark'],'Do not infer case, tense, or meaning from an accent mark alone.',[{ref:'John 1:1-2',task:'Identify breathings, accents, punctuation, and any iota subscript before parsing.'}],[
      Q('recognition','Which symbol functions as the Greek question mark?',[';','·',':',','],0,'Greek uses ; where English normally uses ?.','declension_pattern'),
      Q('concept','What does a rough breathing most directly mark historically?',['Plural number','An initial /h/ sound','Past time','A direct object'],1,'The rough breathing is an orthographic/pronunciation mark.','declension_pattern'),
      Q('reading','Which approach is safest when an accented form is unfamiliar?',['Let the accent decide the parse','Use ending, lemma, and context together','Ignore spelling','Assume it is a verb'],1,'Accent is one cue among others, not a complete parser.','word_order_overreliance')
    ]),
    U(4,'Reading Greek aloud: function words & micro-texts','Read short Greek chunks smoothly and recognize high-frequency function words before translating.',[
      'Function words create the skeleton of clauses. Early examples include καί, δέ, γάρ, ὁ/ἡ/τό, ἐν, εἰς, οὐ, and μή.',
      'Read in phrases rather than isolated letters. A phrase such as ἐν τῷ λόγῳ should become one visual and oral unit even before every detail is mastered.',
      'Fluent oral reading is not exegesis, but it reduces decoding load so grammatical relationships are easier to see.'
    ],['καί = and/also','δέ = and/but/now (context-sensitive)','ἐν + dative','εἰς + accusative'],'Do not force one English gloss onto every occurrence of a function word.',[{ref:'Mark 1:1-3',task:'Circle function words, then read each clause aloud without stopping at every word.'}],[
      Q('recognition','Which word commonly functions as “and/also”?',['καί','μή','ἐν','τίς'],0,'καί is a very frequent conjunction/adverb.','vocabulary_retrieval'),
      Q('concept','Why learn function words early?',['They determine every theological conclusion','They expose clause structure and recur constantly','They are always accented the same way','They remove the need for vocabulary'],1,'Function words help reveal relationships between larger content words.','syntax_relation'),
      Q('reading','What is the preferred oral-reading unit once letters are known?',['One letter at a time','Meaningful word groups and clauses','Only nouns','Only accented syllables'],1,'Chunked reading supports fluency and syntactic awareness.','word_order_overreliance')
    ]),
    U(5,'The article: gender, number & case','Recognize the Greek article as a major signal of gender, number, case, and phrase structure.',[
      'The article inflects for gender, number, and case. Learn it as a compact morphology map because nearby nouns and adjectives frequently agree with it.',
      'Singular nominatives are ὁ, ἡ, τό; genitives τοῦ, τῆς, τοῦ; datives τῷ, τῇ, τῷ; accusatives τόν, τήν, τό.',
      'The article does more than translate English “the.” It marks substantives, organizes attributive phrases, and participates in discourse structure.'
    ],['ὁ λόγος','τῆς γραφῆς','τῷ θεῷ','τὸ δῶρον'],'Do not equate presence of the article with definiteness in every context or absence of the article with indefiniteness.',[{ref:'John 1:1',task:'Use each article to predict the morphology of the expression it introduces.'}],[
      Q('recognition','Parse τῆς.',['Genitive singular feminine','Dative singular feminine','Accusative plural feminine','Nominative singular neuter'],0,'τῆς is genitive singular feminine.','case_confusion'),
      Q('recognition','Which article form can be genitive singular masculine or neuter?',['τοῦ','τόν','τῇ','οἱ'],0,'τοῦ serves masculine and neuter genitive singular.','gender_number_agreement'),
      Q('reading','What is a strong first use of an article while reading?',['Assume an English “the” must appear','Use it to predict agreement and phrase boundaries','Ignore the following noun','Treat it as a verb'],1,'The article is a high-value morphological and syntactic cue.','syntax_relation')
    ]),
    U(6,'Case relationships: nominative & accusative','Distinguish nominative and accusative forms and use clause structure to identify likely syntactic roles.',[
      'The nominative commonly marks the subject and predicate nominative; the accusative commonly marks a direct object and several other functions.',
      'Case is a relationship marker, not an English word-order label. Greek can move constituents without changing their case morphology.',
      'Start with the finite verb, identify possible nominatives, then ask what accusative phrase—if present—completes the verb.'
    ],['ὁ μαθητὴς βλέπει τὸν κύριον','ὁ λόγος ἐστὶν ἀληθής'],'Do not translate “first noun = subject, second noun = object.” Morphology and syntax outrank position.',[{ref:'Mark 1:16-18',task:'Locate finite verbs, then identify nominative and accusative participants.'}],[
      Q('concept','Which case most commonly marks the subject of a finite verb?',['Nominative','Genitive','Dative','Accusative'],0,'The nominative is the default subject case.','case_confusion'),
      Q('application','In ὁ μαθητὴς βλέπει τὸν κύριον, which phrase is the likely direct object?',['ὁ μαθητής','βλέπει','τὸν κύριον','none'],2,'τὸν κύριον is accusative and completes βλέπει as object.','case_confusion'),
      Q('reading','When Greek word order changes, what should control subject/object identification first?',['English expectations','Case morphology and the verb','The longest word','Accent type'],1,'Greek case marking permits word-order flexibility.','word_order_overreliance')
    ]),
    U(7,'Second-declension masculine nouns','Recognize the common second-declension masculine paradigm and parse forms by ending.',[
      'λόγος supplies a useful pattern: λόγος, λόγου, λόγῳ, λόγον in the singular and λόγοι, λόγων, λόγοις, λόγους in the plural.',
      'The stem is usually visible once the ending is removed. Agreement with an article or adjective confirms gender, number, and case.',
      'Parse before translating: identify case and number, then ask what role the form has in the clause.'
    ],['λόγος','λόγου','λόγῳ','λόγον','λόγοι','λόγων','λόγοις','λόγους'],'An ending identifies morphology more directly than syntactic function; the same case can serve several functions.',[{ref:'John 1:1',task:'Parse every occurrence of λόγος and explain its clause role.'}],[
      Q('recognition','Parse λόγῳ.',['Dative singular','Genitive singular','Nominative plural','Accusative plural'],0,'-ῳ is the second-declension dative singular ending.','case_confusion'),
      Q('recognition','Which form is accusative plural?',['λόγοι','λόγων','λόγους','λόγοις'],2,'λόγους is accusative plural.','declension_pattern'),
      Q('application','After parsing λόγων as genitive plural, what is the next question?',['Which syntactic relationship the genitive expresses','Whether it is automatically possessive','Whether it must precede its head noun','Whether it is a verb'],0,'Parsing and syntactic function are separate steps.','syntax_relation')
    ]),
    U(8,'Second-declension neuter nouns','Recognize second-declension neuter morphology, especially nominative/accusative identity.',[
      'Neuter nouns such as δῶρον share many second-declension endings with masculine nouns but have distinctive nominative/accusative forms.',
      'In the singular, nominative and accusative are both δῶρον; in the plural they are both δῶρα. This nominative/accusative identity is a core neuter pattern.',
      'Because form alone may leave nominative versus accusative ambiguous, clause syntax must finish the parse.'
    ],['δῶρον','δώρου','δώρῳ','δῶρα','δώρων','δώροις'],'Do not force a neuter nominative/accusative form into one case without using its clause role.',[{ref:'James 1:17',task:'Observe the neuter noun δώρημα/δώρημα-related forms and identify how syntax establishes role.'}],[
      Q('recognition','Which statement is true of second-declension neuter nouns?',['Nominative and accusative often share a form','Genitive and dative are always identical','They have no plural','They never take an article'],0,'Neuter nominative and accusative are regularly identical.','case_confusion'),
      Q('recognition','What can δῶρα be?',['Only nominative singular','Nominative or accusative plural','Only genitive plural','Dative plural'],1,'δῶρα is nominative/accusative plural.','declension_pattern'),
      Q('reading','How do you decide whether δῶρον is nominative or accusative in a sentence?',['Accent alone','Clause syntax and agreement','English word order alone','You cannot ever decide'],1,'Syncretic forms require contextual syntax.','syntax_relation')
    ]),
    U(9,'First-declension feminine nouns','Recognize common first-declension feminine endings using γραφή as a working paradigm.',[
      'A common pattern is γραφή, γραφῆς, γραφῇ, γραφήν; plural γραφαί, γραφῶν, γραφαῖς, γραφάς.',
      'First-declension stems show several vowel patterns, so learn representative paradigms while paying attention to article agreement.',
      'The genitive plural -ῶν is shared widely across declensions; the surrounding article and lexical form help identify the paradigm.'
    ],['γραφή','γραφῆς','γραφῇ','γραφήν','γραφαί','γραφῶν','γραφαῖς','γραφάς'],'Do not assume every feminine noun belongs to the first declension.',[{ref:'2 Timothy 3:16',task:'Identify the case and syntactic role of γραφή.'}],[
      Q('recognition','Parse γραφῇ.',['Dative singular feminine','Genitive singular feminine','Accusative singular feminine','Nominative plural feminine'],0,'-ῇ marks this first-declension dative singular.','case_confusion'),
      Q('recognition','Which form is accusative plural?',['γραφαί','γραφῶν','γραφαῖς','γραφάς'],3,'γραφάς is accusative plural.','declension_pattern'),
      Q('reading','What nearby form often confirms the parse of a first-declension noun?',['A matching article or adjective','Any conjunction','A punctuation mark alone','The first verb in the book'],0,'Agreement provides strong corroborating evidence.','gender_number_agreement')
    ]),
    U(10,'Adjectives, agreement & core prepositions','Recognize adjective agreement and the case requirements of high-frequency prepositions.',[
      'Adjectives agree with the nouns they modify in gender, number, and case, though their declension pattern need not look identical to the noun.',
      'Common 2-1-2 adjectives such as καλός, καλή, καλόν provide a basic agreement model.',
      'Core prepositions constrain case: ἐν normally takes the dative, εἰς the accusative, and ἐκ/ἀπό the genitive. Some prepositions take more than one case with meaning shaped by construction and context.'
    ],['ὁ καλὸς λόγος','ἡ καλὴ γραφή','τὸ καλὸν δῶρον','ἐν + dat.','εἰς + acc.','ἐκ + gen.'],'Do not reduce a preposition to one English gloss; case and context determine its relation.',[{ref:'John 1:1',task:'Identify the case governed by ἐν and πρός, then note adjective/article agreement elsewhere in the chapter.'}],[
      Q('concept','What must an attributive adjective normally share with its noun?',['Gender, number, and case','Person and tense','Mood and voice','Only word order'],0,'Adjectival agreement is gender-number-case agreement.','gender_number_agreement'),
      Q('recognition','Which case normally follows ἐν?',['Genitive','Dative','Accusative','Nominative'],1,'ἐν normally governs the dative.','preposition_case'),
      Q('application','What is the safest way to interpret a preposition?',['Memorize one English equivalent','Use the preposition, its governed case, and context together','Ignore its object','Translate by word order'],1,'Prepositional meaning is construction-sensitive.','preposition_case')
    ]),
    U(11,'Verb anatomy: stem, connecting vowel & ending','Segment common finite verb forms into stem, thematic vowel, and personal ending.',[
      'A thematic present form such as λύομεν can be viewed pedagogically as λυ- + ο + μεν: lexical stem, connecting/thematic vowel, and personal ending.',
      'The ending carries person and number; stem changes and tense-form markers contribute additional morphology.',
      'Segmentation is a recognition tool, not a claim that every surface form can be mechanically split without phonological change.'
    ],['λύ-ο-μεν','λύ-ε-τε','λύ-ουσι(ν)'],'Do not expect every verb—especially contract and μι verbs—to display each piece transparently on the surface.',[{ref:'John 1:1-5',task:'Identify each finite verb and isolate the ending before translating it.'}],[
      Q('recognition','In λύομεν, which element most directly signals 1st person plural?',['λυ-','-ο-','-μεν','the accent'],2,'-μεν is the personal ending.','person_number'),
      Q('concept','What is the main value of segmenting a verb?',['It replaces the lexicon','It makes morphological signals easier to recognize','It proves aspect from spelling alone','It fixes English word order'],1,'Segmentation helps identify form-building components.','tense_form'),
      Q('reading','When segmentation is unclear, what should you do?',['Invent a stem','Consult lemma/principal parts and context','Assume the word is not a verb','Use only accent'],1,'Irregular and contracted forms require broader lexical evidence.','principal_part')
    ]),
    U(12,'Present active indicative','Recognize and parse the present active indicative endings of regular thematic verbs.',[
      'The basic λύω paradigm is λύω, λύεις, λύει, λύομεν, λύετε, λύουσι(ν).',
      'Person and number come from the ending. An explicit subject pronoun is therefore often unnecessary unless emphasis or contrast calls for it.',
      'The present tense-form commonly presents an event with imperfective viewpoint, but contextual interpretation must not be reduced to “continuous action.”'
    ],['λύω','λύεις','λύει','λύομεν','λύετε','λύουσι(ν)'],'Do not translate every present as English present progressive; aspect and temporal reference are context-sensitive.',[{ref:'1 John 1:5-10',task:'Parse finite present forms, then ask how each functions in its discourse context.'}],[
      Q('recognition','Parse λύομεν.',['1st plural present active indicative','2nd plural present active indicative','3rd singular','1st singular'],0,'-ομεν marks first plural in this paradigm.','person_number'),
      Q('recognition','Which form is 3rd person plural?',['λύεις','λύει','λύετε','λύουσι(ν)'],3,'λύουσι(ν) is third plural.','person_number'),
      Q('concept','What does present tense-form guarantee about English translation?',['It must be progressive','It must be present-time','Neither; context still controls temporal/translation choices','It must be habitual'],2,'Morphological form is not a one-to-one English tense label.','tense_form')
    ]),
    U(13,'εἰμί and common irregular present forms','Recognize the present indicative of εἰμί and treat frequent irregulars as lexical paradigms rather than failed regular verbs.',[
      'The present indicative of εἰμί is εἰμί, εἶ, ἐστίν, ἐσμέν, ἐστέ, εἰσίν.',
      'Because εἰμί is highly frequent and irregular, direct recognition is more efficient than forcing it into the λύω pattern.',
      'Copular clauses link subjects with predicates. Case and article patterns often matter more than English word order.'
    ],['εἰμί','εἶ','ἐστίν','ἐσμέν','ἐστέ','εἰσίν'],'Do not assume every form of εἰμί must be translated with the same English form of “be.”', [{ref:'John 1:1',task:'Locate ἦν and identify its person, number, and relationship to εἰμί.'}],[
      Q('recognition','Which form is 2nd person plural present of εἰμί?',['εἶ','ἐστέ','εἰσίν','ἐσμέν'],1,'ἐστέ is second plural.','person_number'),
      Q('recognition','Which form is 3rd person singular?',['ἐστίν','εἰμί','ἐσμέν','εἰσίν'],0,'ἐστίν is third singular.','person_number'),
      Q('reading','What is the best strategy for very frequent irregular verbs?',['Force regular endings onto them','Memorize their principal/high-frequency forms and parse in context','Ignore them','Translate by position'],1,'High-frequency irregulars deserve direct lexical recognition.','principal_part')
    ]),
    U(14,'Present middle/passive indicative','Recognize present middle/passive forms and defer precise voice interpretation to lexical and contextual evidence.',[
      'A common paradigm is λύομαι, λύῃ, λύεται, λυόμεθα, λύεσθε, λύονται.',
      'The same present-system morphology serves middle and passive categories on the surface. The lexeme and context determine how a particular occurrence functions.',
      'Voice is not merely an English active/passive switch; middle semantics can involve subject participation, affectedness, or lexical convention.'
    ],['λύομαι','λύῃ','λύεται','λυόμεθα','λύεσθε','λύονται'],'Do not label every -ομαι form “passive” without examining the verb and context.',[{ref:'Mark 1:5',task:'Identify middle/passive morphology and decide whether the context supports passive or middle interpretation.'}],[
      Q('recognition','Parse λύονται for person and number.',['1st plural','2nd plural','3rd plural','3rd singular'],2,'-ονται marks third plural.','person_number'),
      Q('concept','Can present middle and passive always be distinguished by surface endings alone?',['Yes','No'],1,'The present middle/passive endings are formally shared.','voice'),
      Q('reading','What evidence should decide voice interpretation?',['Ending alone','Lexical usage plus syntax and context','English word order','Accent alone'],1,'Morphology identifies the form; interpretation uses broader evidence.','voice')
    ]),
    U(15,'Contract-verb recognition','Recognize common α-, ε-, and ο-contract surface forms and recover their lexical forms.',[
      'Contract verbs combine a stem-final vowel with thematic vowels/endings, producing contracted surfaces such as ἀγαπῶ, ποιῶ, and πληρῶ.',
      'Recognition improves when you learn common contracted endings as patterns rather than trying to reverse every historical contraction during reading.',
      'Lexicon lookup should use the uncontracted lexical form, for example ἀγαπάω, ποιέω, πληρόω.'
    ],['ἀγαπάω → ἀγαπῶ','ποιέω → ποιῶ','πληρόω → πληρῶ'],'Do not assume every omega-ending form is a contract verb; identify the lemma.',[{ref:'John 21:15-17',task:'Observe forms of ἀγαπάω and practice recovering the lexical form from contracted surfaces.'}],[
      Q('recognition','Which lexical form underlies ἀγαπῶ?',['ἀγαπάω','ἀγαπίζω','ἀγάπη','ἄγω'],0,'ἀγαπῶ is a contracted form of ἀγαπάω.','principal_part'),
      Q('concept','Why learn contracted endings as patterns?',['To avoid all morphology','To recognize high-frequency surface forms quickly','To prove a word’s meaning','To eliminate lexical lookup'],1,'Pattern recognition reduces unnecessary decontraction work.','tense_form'),
      Q('reading','When encountering ποιεῖ, what should you recover before translating?',['Its likely lemma ποιέω and parse','A theology of creation','Only its accent','An English cognate'],0,'Lemma recovery plus morphology precedes contextual translation.','principal_part')
    ]),
    U(16,'Clause reading: subject, predicate, negation & conjunctions','Combine nominal and verbal morphology to read basic clauses as structured wholes.',[
      'Begin with the finite verb, then identify its subject, complements, modifiers, and connectors. Greek often omits an explicit subject pronoun because the verb ending supplies person and number.',
      'οὐ is common with indicative negation; μή is common in nonindicative and other marked environments. The distribution is syntactic and pragmatic, not a simple “fact versus wish” formula.',
      'Conjunctions such as καί, δέ, γάρ, and ἀλλά connect clauses and often signal discourse relationships that one English gloss cannot capture.'
    ],['οὐ βλέπει','μὴ φοβοῦ','καὶ λέγει','δὲ ἀκούει'],'Do not translate by isolated words and then try to repair the sentence; identify clause relationships first.',[{ref:'1 John 1:5-7',task:'Bracket each finite clause and label subjects, predicates, negators, and conjunctions.'}],[
      Q('concept','What is the best first anchor in a basic clause?',['The finite verb','The longest noun','The first word','The punctuation only'],0,'The finite verb organizes person, number, and expected complements.','syntax_relation'),
      Q('recognition','Which negator is especially common with indicative clauses?',['οὐ','μή','ἵνα','εἰ'],0,'οὐ is the normal indicative negator in many contexts.','syntax_relation'),
      Q('reading','Why not assign δέ one fixed English word?',['It has no meaning','Its discourse relation is context-sensitive','It is always untranslated','It is a noun'],1,'Connectors often require contextual English rendering.','translation_overliteral')
    ]),
    U(17,'Imperfect indicative','Recognize imperfect indicative morphology and interpret it as past indicative with imperfective viewpoint without mechanical English labels.',[
      'The imperfect typically combines augment with present-system stem and secondary endings, as in ἔλυον.',
      'In indicative narrative it normally locates the situation in past time while presenting it with imperfective viewpoint.',
      'Context decides whether English renders it as “was doing,” “used to do,” “kept doing,” simple past, or another natural equivalent.'
    ],['ἔλυον','ἔλυες','ἔλυε(ν)','ἐλύομεν','ἐλύετε','ἔλυον'],'Imperfective viewpoint does not mean an action was objectively long, repeated, or incomplete.',[{ref:'Mark 1:21-34',task:'Compare imperfects with aorists and ask what each form contributes to narrative presentation.'}],[
      Q('recognition','Which feature commonly marks an imperfect indicative?',['Augment plus present-system stem','Sigma aorist marker only','Reduplication only','No personal ending'],0,'Imperfects typically use augment with present-system morphology.','tense_form'),
      Q('concept','What viewpoint is conventionally associated with the imperfect tense-form?',['Imperfective','Perfective','No aspectual contribution ever','Future'],0,'The imperfect is an imperfective past indicative form.','tense_form'),
      Q('reading','Does an imperfect always require “was ___ing” in English?',['Yes','No; translation depends on context'],1,'English rendering must fit the discourse context.','translation_overliteral')
    ]),
    U(18,'Future active & middle','Recognize future active/middle morphology and common stem changes.',[
      'Many futures use a sigma marker: λύσω, λύσεις, λύσει; middle λύσομαι and related forms.',
      'Future stems can be irregular or lexically middle. Principal parts are therefore more reliable than assuming every future is built transparently from the present stem.',
      'Future indicative normally has future temporal reference, while exact modal/pragmatic force is contextual.'
    ],['λύσω','λύσεις','λύσει','λύσομαι','λήμψομαι'],'Do not infer active meaning merely because the dictionary form ends in -ω; some verbs use middle future forms lexically.',[{ref:'Matthew 1:21',task:'Parse the future verb and identify person, number, voice, and contextual force.'}],[
      Q('recognition','Which form is a future active 1st singular of λύω?',['λύω','λύσω','ἔλυσα','λέλυκα'],1,'λύσω is future active indicative first singular.','tense_form'),
      Q('concept','Why are principal parts useful for futures?',['Future stems may change irregularly','They replace syntax','They determine theology','They remove endings'],0,'Stem alternations are lexeme-specific.','principal_part'),
      Q('reading','What does future morphology most directly establish in the indicative?',['A future-oriented tense-form','A command','A participle','A genitive relation'],0,'The future indicative is morphologically future; contextual force may still vary.','tense_form')
    ]),
    U(19,'First aorist active & middle','Recognize first-aorist stems, augment, sigma, and secondary endings.',[
      'A regular first aorist active such as ἔλυσα combines augment, aorist stem with σ, and secondary endings. Middle forms include ἐλυσάμην.',
      'The aorist presents a situation with perfective viewpoint in the indicative system; it does not encode “once-for-all” action.',
      'Translate according to discourse and English idiom, often with a simple past in narrative but not because “aorist = simple past” is a universal rule.'
    ],['ἔλυσα','ἔλυσας','ἔλυσε(ν)','ἐλυσάμην'],'Do not use aorist morphology to claim an action happened only once, instantly, or permanently.',[{ref:'Mark 1:9-11',task:'Identify aorist forms and compare their narrative role with surrounding imperfective forms.'}],[
      Q('recognition','Which marker is characteristic of many first aorists?',['σ','reduplication only','-μεν only','the article'],0,'Many first-aorist stems contain σ.','tense_form'),
      Q('concept','Which viewpoint is conventionally associated with the aorist?',['Perfective','Imperfective','Future-only','No viewpoint'],0,'The aorist characteristically presents the event as a whole.','tense_form'),
      Q('reading','Which inference is invalid from aorist morphology alone?',['The form is aorist','The event happened once-for-all','The stem may differ from the present','The context still matters'],1,'Once-for-all claims require contextual evidence, not tense-form alone.','lexical_overreach')
    ]),
    U(20,'Second aorist recognition','Recognize aorists built from a changed stem rather than the first-aorist sigma pattern.',[
      'Second aorists use a distinct aorist stem with secondary endings, often resembling imperfect endings. ἔλαβον belongs to λαμβάνω.',
      'The difference between first and second aorist is primarily morphological formation, not a different semantic category.',
      'Principal parts allow rapid recovery of the lexical item when the present and aorist stems look unlike one another.'
    ],['λαμβάνω → ἔλαβον','ἔρχομαι → ἦλθον','λέγω → εἶπον (lexically irregular)'],'Do not assign a different aspect merely because an aorist is “second” rather than “first.”', [{ref:'Mark 1:18',task:'Locate an aorist, recover its lemma, and explain which stem clue identifies it.'}],[
      Q('recognition','What is the lemma of ἔλαβον?',['λύω','λαμβάνω','λέγω','ἔχω'],1,'ἔλαβον is the second aorist of λαμβάνω.','principal_part'),
      Q('concept','What mainly distinguishes first and second aorist?',['Morphological formation','One is repeated and one is once','One is active and one passive','One is always earlier'],0,'Both are aorist tense-forms with different stem formation.','tense_form'),
      Q('reading','When a changed aorist stem is unfamiliar, what tool is most direct?',['Principal parts','English word order','Accent alone','Article chart'],0,'Principal parts connect irregular stems to the lemma.','principal_part')
    ]),
    U(21,'Aorist & future passive','Recognize passive aorist/future morphology, including θη/η stem formations.',[
      'A common first aorist passive is ἐλύθην; future passive uses the passive stem plus future morphology, as in λυθήσομαι.',
      'Not every passive stem contains θ; some are second-aorist passive formations. Principal parts remain essential.',
      'Passive morphology marks voice form, but English translation and agency depend on the verb and syntax.'
    ],['ἐλύθην','ἐλύθης','ἐλύθη','λυθήσομαι'],'Do not assume a passive verb must express a named external agent in the sentence.',[{ref:'Matthew 3:16',task:'Identify passive morphology and note whether an agent is explicit or implicit.'}],[
      Q('recognition','Which form is aorist passive?',['ἔλυσα','ἐλύθην','λύομαι','λέλυκα'],1,'ἐλύθην is aorist passive indicative first singular.','voice'),
      Q('recognition','Which form is future passive?',['λυθήσομαι','ἐλυσάμην','λύσω','ἔλυον'],0,'λυθήσομαι is future passive.','voice'),
      Q('reading','What does passive morphology itself guarantee?',['A passive-form verb','An explicit agent phrase','One English translation','A theological claim'],0,'Morphology identifies voice form, not every contextual implication.','voice')
    ]),
    U(22,'Principal parts as a recognition system','Use six principal parts to connect unpredictable stems across tense and voice systems.',[
      'A standard six-part sequence is present, future, aorist active/middle, perfect active, perfect middle/passive, and aorist passive.',
      'Principal parts are a recognition map: they expose stem changes that cannot be reliably guessed from the lexical form.',
      'Learn high-frequency verbs by families of stems, then attach endings you already know.'
    ],['λύω · λύσω · ἔλυσα · λέλυκα · λέλυμαι · ἐλύθην','λαμβάνω · λήμψομαι · ἔλαβον · εἴληφα · εἴλημμαι · ἐλήμφθην'],'Principal parts identify morphological stems; they do not predetermine contextual meaning.',[{ref:'John 1:11-13',task:'For each finite verb, identify the principal-part stem before parsing the ending.'}],[
      Q('concept','What is the main purpose of principal parts?',['Connect unpredictable stems to one lexeme','Replace all endings','Determine syntax alone','Supply English word order'],0,'Principal parts organize stem alternations.','principal_part'),
      Q('recognition','Which slot is ἔλυσα in the traditional six-part list?',['Present','Future','Aorist active/middle','Perfect active'],2,'The third principal part is the aorist active/middle stem.','principal_part'),
      Q('application','If you meet ἔλαβον, which learned information links it to λαμβάνω?',['The aorist principal part','The article','A dative ending','Punctuation'],0,'The principal-part map supplies the changed aorist stem.','principal_part')
    ]),
    U(23,'Indicative synthesis in narrative','Parse mixed indicative tense-forms and interpret their contribution to narrative without mechanical aspect slogans.',[
      'Narrative reading requires simultaneous attention to augment, stem, tense-form marker, voice, and personal ending.',
      'Aorist and imperfect often contrast perfective and imperfective presentation, while historical presents can shift discourse vividness or organization.',
      'Aspectual viewpoint is a grammatical contribution, not a complete description of the event’s real-world duration, repetition, or importance.'
    ],['ἔλυον = imperfect','ἔλυσα = aorist','λύσω = future','λέλυκα = perfect'],'Do not turn tense-form contrasts into automatic claims about whether an event was brief, repeated, important, or completed forever.',[{ref:'Mark 1:29-39',task:'Color-code tense-forms and describe how the narrative moves without assigning one English gloss mechanically.'}],[
      Q('application','Which pair most directly contrasts imperfective and perfective past indicative presentation?',['Imperfect and aorist','Future and infinitive','Genitive and dative','Article and pronoun'],0,'Imperfect/aorist often provide that viewpoint contrast in past narrative.','tense_form'),
      Q('concept','Does grammatical aspect describe real-world duration by itself?',['Yes','No'],1,'Viewpoint and event duration are distinct questions.','lexical_overreach'),
      Q('reading','What is the best narrative workflow?',['Parse form, then interpret in clause/discourse context','Translate tense by a fixed English rule','Ignore the stem','Use word order only'],0,'Form identification precedes contextual interpretation.','translation_overliteral')
    ]),
    U(24,'Third-declension strategy: identify the stem','Use the genitive singular and lexical information to recover third-declension stems.',[
      'Third-declension nominatives often hide the stem. The genitive singular exposes it more clearly: σάρξ, σαρκός points to σαρκ-.',
      'Another pattern is ὄνομα, ὀνόματος, revealing an ὀνοματ- stem in the inflectional system.',
      'The strategy is lexical: learn nominative plus genitive and gender, then recognize endings on the recovered stem.'
    ],['σάρξ, σαρκός → σαρκ-','ὄνομα, ὀνόματος → ὀνοματ-'],'Do not guess a third-declension stem from the nominative ending alone.',[{ref:'John 1:14',task:'Parse σάρξ and compare its nominative surface with its genitive stem.'}],[
      Q('recognition','Which form most clearly exposes the stem of σάρξ?',['σάρξ','σαρκός','σάρκα? without comparison','the article alone'],1,'σαρκός shows σαρκ- directly.','declension_pattern'),
      Q('concept','What should be learned with a third-declension nominative?',['Genitive singular and gender','Only an English gloss','Only accent','Only plural'],0,'Genitive and gender are key lexical data.','declension_pattern'),
      Q('application','What stem is suggested by ὄνομα, ὀνόματος?',['ὀνοματ-','ὀνομο-','ὀν-','ματ- only'],0,'The genitive reveals the dental stem ὀνοματ-.','declension_pattern')
    ]),
    U(25,'Common third-declension patterns','Recognize recurring consonant, dental, and -ι/-ευ-type third-declension behavior without forcing one paradigm onto all nouns.',[
      'Third declension is a collection of stem patterns rather than one uniform set of surface endings.',
      'Representative lexical pairs such as σάρξ/σαρκός, ὄνομα/ὀνόματος, and πίστις/πίστεως train stem recognition.',
      'Once the stem is known, case endings and phonological changes become easier to recognize across singular and plural forms.'
    ],['σάρξ / σαρκός','ὄνομα / ὀνόματος','πίστις / πίστεως'],'Gender and stem class must be learned lexically; surface shape does not always predict them.',[{ref:'Romans 3:22',task:'Locate πίστις-family forms and parse case/number from morphology and syntax.'}],[
      Q('concept','Why is “the third-declension paradigm” an oversimplification?',['Several stem classes behave differently','Third declension has no endings','All forms are irregular','It contains only neuters'],0,'Multiple stem types produce different surface patterns.','declension_pattern'),
      Q('recognition','Which lexical pair belongs together?',['πίστις / πίστεως','πίστις / λόγου','σάρξ / γραφῆς','ὄνομα / λόγοι'],0,'πίστεως is the genitive singular of πίστις.','declension_pattern'),
      Q('reading','What should confirm a difficult third-declension parse?',['Stem knowledge plus ending, agreement, and syntax','English word order only','Accent only','One dictionary gloss'],0,'Multiple converging cues provide the reliable parse.','case_confusion')
    ]),
    U(26,'Personal pronouns & αὐτός','Parse first/second-person pronouns and distinguish major uses of αὐτός.',[
      'First-person forms include ἐγώ, μου, μοι, με; second-person σύ, σου, σοι, σε, with plural forms learned alongside them.',
      'αὐτός inflects like an adjective and commonly functions as a third-person pronoun in oblique cases.',
      'In appropriate position αὐτός can be intensive (“self/same person”), while with the article it can participate in “same” constructions.'
    ],['ἐγώ · μου · μοι · με','σύ · σου · σοι · σε','αὐτός · αὐτοῦ · αὐτῷ · αὐτόν'],'Do not translate αὐτός as “he” in every position; identify its syntactic use.',[{ref:'John 1:2-4',task:'Track antecedents of αὐτός forms and explain their case roles.'}],[
      Q('recognition','Which form is first-person dative singular?',['μου','μοι','με','ἐγώ'],1,'μοι is dative singular.','case_confusion'),
      Q('concept','Can αὐτός function only as a third-person pronoun?',['Yes','No; it also has intensive/same-related uses'],1,'Its syntactic position matters.','pronoun_antecedent'),
      Q('reading','What should you identify before translating αὐτός?',['Case, agreement, position, and antecedent','Only English word order','Only accent','Only frequency rank'],0,'Pronoun interpretation is syntactic and discourse-sensitive.','pronoun_antecedent')
    ]),
    U(27,'Demonstratives and intensive uses','Recognize οὗτος/ἐκεῖνος and use article/position patterns to distinguish demonstrative and intensive structures.',[
      'Demonstratives such as οὗτος and ἐκεῖνος inflect for gender, number, and case and point to discourse entities.',
      'With an articulated noun, demonstratives commonly stand in a predicate-position pattern such as οὗτος ὁ λόγος or ὁ λόγος οὗτος.',
      'Intensive αὐτός typically emphasizes identity (“he himself,” “the man himself”) and must be distinguished from ordinary pronominal use.'
    ],['οὗτος ὁ λόγος','ὁ λόγος οὗτος','αὐτὸς ὁ κύριος'],'Word position provides a pattern, but discourse context still decides what is being contrasted or pointed out.',[{ref:'John 1:2',task:'Observe οὗτος and identify its antecedent and discourse function.'}],[
      Q('recognition','Which word is a common demonstrative?',['οὗτος','ἐγώ','καί','εἰμί'],0,'οὗτος is a demonstrative pronoun/adjective.','pronoun_antecedent'),
      Q('concept','Where does a demonstrative often appear with an articulated noun?',['In predicate-position order around the article+noun phrase','Only between article and noun','Only after verbs','Never with an article'],0,'Demonstratives commonly occur outside the article+noun attributive slot.','syntax_relation'),
      Q('reading','What must be established for οὗτος in a paragraph?',['Its antecedent/referent','Its English cognate','A fixed theological meaning','Its principal part'],0,'Demonstratives are discourse-referential forms.','pronoun_antecedent')
    ]),
    U(28,'Relative & interrogative pronouns','Parse relative and interrogative pronouns and distinguish antecedent agreement from clause-internal case.',[
      'The relative pronoun ὅς, ἥ, ὅ normally agrees with its antecedent in gender and number.',
      'Its case is determined by its function inside the relative clause, not mechanically copied from the antecedent.',
      'Interrogative τίς, τί asks “who?/what?”; the enclitic indefinite τις, τι means “someone/something” and differs in accentuation/use.'
    ],['ὅς · ἥ · ὅ','τίς; = who?/what?','τις = someone/anyone'],'Do not force the relative pronoun into the same case as its antecedent.',[{ref:'John 1:9-13',task:'Find relative-pronoun-like clause links and identify antecedent versus clause role.'}],[
      Q('concept','What does a relative pronoun normally copy from its antecedent?',['Gender and number','Case necessarily','Person and tense','Mood'],0,'Gender and number normally agree with the antecedent.','pronoun_antecedent'),
      Q('concept','What determines the relative pronoun’s case?',['Its role inside the relative clause','The antecedent’s case automatically','English word order','Accent alone'],0,'Clause-internal syntax determines case.','case_confusion'),
      Q('recognition','Which form is the accented interrogative “who?/what?”',['τίς','τις','ὅς','αὐτός'],0,'τίς is interrogative.','vocabulary_retrieval')
    ]),
    U(29,'Numerals, πᾶς-type adjectives & mixed nominal review','Recognize frequent numeral and πᾶς constructions and integrate nominal parsing across declensions.',[
      'High-frequency numerals include εἷς, μία, ἕν; δύο; τρεῖς/τρία; τέσσαρες/τέσσαρα.',
      'πᾶς, πᾶσα, πᾶν agrees with its substantive, but article patterns influence whether English idiom tends toward “every,” “all,” or “the whole.”',
      'Mixed review should now identify article, noun/pronoun class, gender, number, case, and syntactic role without relying on one paradigm.'
    ],['εἷς · μία · ἕν','πᾶς · πᾶσα · πᾶν','πᾶς ἄνθρωπος','ὁ πᾶς κόσμος / ὁ κόσμος πᾶς (context-sensitive)'],'Do not assign πᾶς one English gloss solely from its lexical entry; construction and context matter.',[{ref:'John 1:9',task:'Parse πάντα/πᾶς-family morphology and explain the scope of the phrase in context.'}],[
      Q('recognition','Which is the neuter singular form of εἷς?',['ἕν','μία','δύο','πᾶν'],0,'ἕν is neuter singular “one.”','gender_number_agreement'),
      Q('concept','What does πᾶς agree with?',['Its substantive in gender, number, and case','The nearest verb in tense','Only the article in case','Nothing'],0,'πᾶς is adjectival and agrees normally.','gender_number_agreement'),
      Q('reading','What helps decide whether πᾶς is best rendered “every,” “all,” or “whole”?',['Article pattern and context','Accent alone','Word length','A fixed rule independent of syntax'],0,'Construction and discourse context shape the natural rendering.','translation_overliteral')
    ]),
    U(30,'Perfect & pluperfect systems','Recognize perfect-system morphology and interpret it without reducing the perfect to a single English formula.',[
      'Perfect forms often show reduplication, as in λέλυκα (perfect active) and λέλυμαι (perfect middle/passive).',
      'The pluperfect adds past indicative morphology to the perfect stem, e.g. ἐλελύκειν in a regular model.',
      'The Greek perfect frequently presents a state or situation connected with a prior event, but lexical semantics and discourse context determine the exact construal.'
    ],['λέλυκα','λέλυμαι','ἐλελύκειν'],'Do not teach “perfect = completed action with continuing results” as an exceptionless semantic equation.',[{ref:'John 19:30',task:'Identify the perfect form and discuss what the context—not the label alone—contributes to its interpretation.'}],[
      Q('recognition','Which feature often signals a perfect stem?',['Reduplication','Only augment','Only sigma','A dative article'],0,'Reduplication is a common perfect-system marker.','tense_form'),
      Q('recognition','Which form is perfect middle/passive?',['λέλυμαι','ἔλυσα','λύσομαι','ἐλύθην'],0,'λέλυμαι is perfect middle/passive.','voice'),
      Q('concept','Can the perfect be translated by one fixed English formula?',['Yes','No; lexical and discourse context matter'],1,'Perfect interpretation is context-sensitive.','translation_overliteral')
    ]),
    U(31,'Participles: morphology and verbal/adjectival nature','Parse participles as forms that combine verbal categories with adjectival inflection.',[
      'A participle carries tense-form and voice like a verb, while also inflecting for gender, number, and case like an adjective.',
      'Participles do not carry grammatical person. Their subject may be expressed by agreement, a related noun/pronoun, or clause structure.',
      'Before assigning a syntactic label, parse the participle fully: lemma, tense-form, voice, case, gender, number.'
    ],['λύων = present active participle nom. masc. sg.','λυόμενος = present middle/passive participle nom. masc. sg.'],'Participial tense-form primarily contributes aspectual relation; it does not mechanically encode absolute time.',[{ref:'Mark 1:16',task:'Parse a participle completely before explaining how it relates to the finite verb.'}],[
      Q('concept','Which categories does a participle share with adjectives?',['Case, gender, number','Person, tense, mood','Only voice','Only person'],0,'Participles inflect adjectivally for case, gender, and number.','gender_number_agreement'),
      Q('concept','Does a participle have grammatical person?',['Yes','No'],1,'Participles are nonfinite and have no person category.','person_number'),
      Q('reading','What should come before naming a participle “temporal” or “causal”?',['Full morphological parse and clause relation','English translation guess','Theological conclusion','Accent alone'],0,'Morphology precedes syntactic/semantic classification.','syntax_relation')
    ]),
    U(32,'Present & aorist participle patterns','Recognize common present and aorist participial paradigms and preserve the aspect/time distinction.',[
      'Present active participles include λύων, λύουσα, λῦον; first-aorist active forms include λύσας, λύσασα, λῦσαν.',
      'Second-aorist participles use changed stems, e.g. λαβών from λαμβάνω.',
      'Relative time readings often emerge from context, but present/aorist participle morphology should first be identified as imperfective/perfective tense-form contrast.'
    ],['λύων · λύουσα · λῦον','λύσας · λύσασα · λῦσαν','λαβών'],'Do not translate every aorist participle automatically as “after doing” or every present participle as “while doing.”',[{ref:'Mark 1:10',task:'Parse participial tense-form and then decide its temporal relation from the clause context.'}],[
      Q('recognition','Which is an aorist active participle?',['λύων','λύσας','λυόμενος','λύειν'],1,'λύσας is aorist active participle nominative masculine singular.','tense_form'),
      Q('recognition','What is the lemma of λαβών?',['λαμβάνω','λέγω','βαίνω','λύω'],0,'λαβών uses the second-aorist stem of λαμβάνω.','principal_part'),
      Q('reading','How should temporal relation of a participle be established?',['From tense-form plus clause/discourse context','From tense-form by itself','From word order only','From article presence only'],0,'Context establishes temporal relation; tense-form contributes viewpoint.','translation_overliteral')
    ]),
    U(33,'Participles in context & genitive absolute','Distinguish attributive, substantival, circumstantial, and genitive-absolute participial constructions.',[
      'An attributive participle modifies a substantive; a substantival participle functions as a substantive; a circumstantial participle relates adverbially to the main clause.',
      'A genitive absolute typically contains a genitive noun/pronoun plus a genitive participle whose subject is relatively independent of the main clause.',
      'Labels such as temporal, causal, concessive, or conditional describe contextual relationships and should be justified rather than guessed from tense-form.'
    ],['ὁ λέγων = the one who says / the saying one','τοῦ ἀνθρώπου λέγοντος = genitive-absolute-shaped phrase'],'Do not assign a circumstantial category solely from an English translation; explain the Greek relationship.',[{ref:'Matthew 8:1',task:'Identify participial constructions and ask whether each modifies a noun, stands substantivally, or relates to the main verb.'}],[
      Q('concept','What characterizes a genitive absolute?',['A genitive subject-like element plus genitive participle relatively independent of the main clause','Any genitive noun','Any participle after a verb','An infinitive with article'],0,'The construction is defined structurally.','syntax_relation'),
      Q('recognition','In ὁ λέγων, what role can the article+participle have?',['Substantival','Finite verb','Preposition','Conjunction'],0,'The article can substantivize the participle.','syntax_relation'),
      Q('reading','How should you justify “causal” for a circumstantial participle?',['By the clause context and logical relationship','By aorist tense-form alone','By case alone','By English word order'],0,'Circumstantial semantics are contextual.','syntax_relation')
    ]),
    U(34,'Infinitives and infinitival clauses','Recognize major infinitive forms and analyze their verbal complements and clause-like functions.',[
      'Common infinitives include λύειν (present active), λῦσαι (aorist active), λυθῆναι (aorist passive), and εἶναι.',
      'Infinitives are nonfinite: they have tense-form and voice but no grammatical person. Their understood subject may be controlled by context or expressed in accusative constructions.',
      'Articular infinitives can function in noun-like syntactic positions while retaining verbal complements.'
    ],['λύειν','λῦσαι','λυθῆναι','εἶναι'],'Do not infer absolute time directly from infinitive tense-form; aspect and matrix-clause context are central.',[{ref:'Philippians 1:21-24',task:'Identify infinitives, their governing expressions, and any complements/subjects.'}],[
      Q('recognition','Which form is an aorist active infinitive?',['λῦσαι','λύειν','λύων','λῦσον'],0,'λῦσαι is aorist active infinitive.','mood'),
      Q('concept','Does an infinitive have grammatical person?',['Yes','No'],1,'Infinitives are nonfinite.','person_number'),
      Q('reading','What should you identify for an infinitive in a sentence?',['Its governing construction, subject if expressed, and complements','Only an English “to” phrase','Only tense','Only accent'],0,'Infinitives function within larger syntactic structures.','syntax_relation')
    ]),
    U(35,'Subjunctive and common ἵνα constructions','Recognize subjunctive morphology and analyze common dependent-clause environments such as ἵνα.',[
      'The subjunctive commonly uses lengthened thematic vowels and primary endings: λύω, λύῃς, λύῃ, λύωμεν, λύητε, λύωσι(ν).',
      'Aorist subjunctives use the aorist stem without indicative augment, e.g. λύσω in a context where morphology/syntax identifies subjunctive.',
      'ἵνα + subjunctive frequently expresses purpose, but it also appears in content/result-like complements depending on governing construction.'
    ],['ἵνα λύῃ','ἵνα λύσω','μὴ + subjunctive'],'Do not label every ἵνα clause “purpose” without examining the governing verb and discourse relation.',[{ref:'John 3:16-17',task:'Identify ἵνα clauses, parse the subjunctives, and classify their relationship to the main clause.'}],[
      Q('recognition','Which feature is common in thematic subjunctive endings?',['Lengthened thematic vowel','Indicative augment','Perfect reduplication only','Genitive ending'],0,'Subjunctive morphology characteristically uses ω/η thematic vowels.','mood'),
      Q('concept','Can ἵνα introduce only purpose clauses?',['Yes','No; its complement functions are broader'],1,'ἵνα has several dependent-clause uses in Koine.','syntax_relation'),
      Q('reading','How can λύσω be distinguished as future indicative versus aorist subjunctive?',['Syntactic environment plus paradigm/context','Spelling always differs','Accent alone','Word order alone'],0,'Some surface forms are syncretic; syntax disambiguates.','mood')
    ]),
    U(36,'Imperatives, prohibitions & commands','Recognize present/aorist imperative morphology and interpret command/prohibition force contextually.',[
      'Present active imperatives include λῦε and λύετε; aorist active forms include λῦσον and λύσατε.',
      'Commands may use imperatives or other constructions. Prohibitions commonly involve μή with imperative or subjunctive forms.',
      'Present-versus-aorist command contrasts involve aspectual presentation, but pragmatic nuance cannot be reduced to “keep doing” versus “do once.”'
    ],['λῦε','λύετε','λῦσον','λύσατε','μὴ φοβοῦ'],'Do not claim an aorist imperative commands a one-time action by grammar alone.',[{ref:'Mark 1:15',task:'Parse the commands and discuss aspectual form separately from the pragmatic force of the exhortation.'}],[
      Q('recognition','Which form is aorist active imperative 2nd singular?',['λῦσον','λύεις','ἔλυσα','λύσει'],0,'λῦσον is aorist active imperative second singular.','mood'),
      Q('concept','Which particle commonly marks prohibitions?',['μή','καί','γάρ','ἐν'],0,'μή is standard in prohibitive constructions.','syntax_relation'),
      Q('reading','Can imperative tense-form alone prove “once” versus “continuous” action?',['Yes','No'],1,'Pragmatic force requires context.','lexical_overreach')
    ]),
    U(37,'μι verbs & high-frequency irregulars','Recognize common μι-verb present forms and use principal parts for irregular systems.',[
      'High-frequency μι verbs include δίδωμι, τίθημι, and ἵστημι. Their present-system endings and stem behavior differ from ordinary thematic verbs.',
      'Learn representative forms and principal parts rather than treating them as exceptions to be reconstructed on every encounter.',
      'Some stems alternate or reduplicate; lexical familiarity is therefore essential for rapid reading.'
    ],['δίδωμι','τίθημι','ἵστημι','δίδομεν / δίδοτε (representative forms)'],'Do not force μι verbs into the λύω paradigm when the morphology is visibly different.',[{ref:'John 10:28',task:'Identify δίδωμι-family forms and recover their lemma/principal-part information.'}],[
      Q('recognition','Which is a μι verb?',['δίδωμι','λύω','γράφω','ἀκούω'],0,'δίδωμι is a high-frequency μι verb.','principal_part'),
      Q('concept','What is the efficient learning strategy for μι verbs?',['Representative paradigms plus principal parts','Ignore endings','Translate only from context','Treat every form as regular λύω'],0,'Direct pattern learning is more reliable.','principal_part'),
      Q('reading','When a μι form is unfamiliar, which evidence should converge?',['Stem/principal part, ending, and syntax','English cognate only','Article only','Punctuation'],0,'Irregular recognition still uses multiple grammatical cues.','principal_part')
    ]),
    U(38,'Genitive functions & noun relationships','Identify major genitive relationships while resisting a one-gloss “of” analysis.',[
      'The genitive marks a range of noun-to-noun and clause relationships: possession/association, source, partitive relation, description, and others.',
      'With verbal nouns, labels such as subjective or objective genitive can be useful when the context supports an underlying participant relationship.',
      'Prepositions also govern the genitive, so not every genitive should be analyzed as an independent noun modifier.'
    ],['ἡ ἀγάπη τοῦ θεοῦ','ἐκ τοῦ κόσμου','εἷς τῶν μαθητῶν'],'The genitive is not semantically equal to English “of”; name the relationship only when context supports it.',[{ref:'Romans 5:5',task:'List possible relationships for genitive phrases, then choose the best-supported one from context.'}],[
      Q('concept','Which statement is safest?',['Genitive marks several relationships that context specifies','Genitive always means possession','Genitive always means “from”','Genitive is only used after prepositions'],0,'Genitive syntax is multifunctional.','case_confusion'),
      Q('application','In εἷς τῶν μαθητῶν, what relationship is most natural?',['Partitive','Direct object','Dative of means','Predicate nominative'],0,'One out of the disciples is a partitive relation.','syntax_relation'),
      Q('reading','What should precede assigning “subjective genitive”?',['Analysis of the head noun and contextual participant relation','A fixed translation rule','Word order only','Accent type'],0,'Functional labels require syntactic/semantic justification.','syntax_relation')
    ]),
    U(39,'Dative functions & prepositional overlap','Identify common dative relationships including indirect object, sphere/location, means, and association.',[
      'The Koine dative inherits functions historically associated with dative, locative, and instrumental domains.',
      'Common contextual labels include recipient/indirect object, means/instrument, sphere/location, association, and respect.',
      'Prepositions such as ἐν also govern the dative; distinguish prepositional constructions from independent case functions.'
    ],['δίδωμι τῷ μαθητῇ','ἐν τῷ κόσμῳ','πίστει (possible means/sphere by context)'],'Do not decide “dative of means” from morphology alone; the verb and proposition must support the relation.',[{ref:'Ephesians 2:8',task:'Analyze dative/prepositional phrases and distinguish grammatical form from interpretive label.'}],[
      Q('concept','Which is a common dative role?',['Recipient/indirect object','Finite subject by default','Possessor only','Tense marker'],0,'The dative commonly marks a recipient.','case_confusion'),
      Q('recognition','Which preposition normally takes a dative complement?',['ἐν','εἰς','ἐκ','ἀπό'],0,'ἐν normally governs the dative.','preposition_case'),
      Q('reading','How should “means” versus “sphere” be decided?',['By lexical and clause context','By the dative ending alone','By English word order','By accent'],0,'Functional sublabels are contextual analyses.','syntax_relation')
    ]),
    U(40,'Accusative functions & complements','Recognize direct-object, extent, adverbial, and complement uses of the accusative.',[
      'The accusative most often marks a direct object, but it also expresses extent, specification, and various adverbial relations.',
      'Some verbs take two accusatives or an object plus predicate complement. Identify the governing verb before labeling each accusative.',
      'Many prepositions govern the accusative, especially motion/direction constructions such as εἰς.'
    ],['βλέπει τὸν κύριον','εἰς τὸν κόσμον','διδάσκει αὐτοὺς πολλά (double-accusative-shaped pattern)'],'Do not call every accusative “the direct object.”', [{ref:'Mark 1:38',task:'Identify accusative phrases and determine whether each is object, prepositional complement, or another relation.'}],[
      Q('concept','Which is the most frequent accusative role?',['Direct object','Subject','Possessor','Finite predicate'],0,'Direct object is a central accusative function.','case_confusion'),
      Q('recognition','Which preposition normally governs the accusative?',['εἰς','ἐκ','ἀπό','χωρίς'],0,'εἰς normally takes the accusative.','preposition_case'),
      Q('reading','What should you inspect before labeling two accusatives in one clause?',['The governing verb and complement structure','Only their order','Only the article','Only English translation'],0,'Verb valency/complement structure controls the analysis.','syntax_relation')
    ]),
    U(41,'Article syntax and attributive/predicative patterns','Use article position to distinguish attributive and predicate adjective structures and substantival uses.',[
      'First attributive position places the adjective inside the article phrase: ὁ καλὸς ἄνθρωπος. Second attributive position repeats the article: ὁ ἄνθρωπος ὁ καλός.',
      'Predicate position places the adjective outside the article+noun phrase: καλὸς ὁ ἄνθρωπος or ὁ ἄνθρωπος καλός.',
      'The article can substantivize adjectives, participles, prepositional phrases, and other expressions.'
    ],['ὁ καλὸς ἄνθρωπος','ὁ ἄνθρωπος ὁ καλός','καλὸς ὁ ἄνθρωπος','ὁ λέγων'],'Anarthrous does not automatically mean indefinite; article syntax is broader than English “the.”', [{ref:'John 1:1',task:'Analyze article position and predicate nominative structure without importing an English article rule.'}],[
      Q('recognition','Which phrase is first attributive position?',['ὁ καλὸς ἄνθρωπος','καλὸς ὁ ἄνθρωπος','ὁ ἄνθρωπος καλός','καλὸς ἄνθρωπος ὁ'],0,'The adjective sits between article and noun.','syntax_relation'),
      Q('recognition','Which phrase is predicate position?',['ὁ καλὸς ἄνθρωπος','ὁ ἄνθρωπος ὁ καλός','ὁ ἄνθρωπος καλός','none'],2,'The adjective lies outside the article+noun phrase.','syntax_relation'),
      Q('reading','What inference is unsafe from absence of the article alone?',['That a noun must be indefinite','That article syntax matters','That context matters','That predicates can be anarthrous'],0,'Greek article use is not a direct mirror of English articles.','lexical_overreach')
    ]),
    U(42,'Participial & infinitival syntax','Analyze nonfinite clauses by identifying their head form, participants, complements, and relationship to the matrix clause.',[
      'Participles may modify nouns, function substantivally, or form adverbial subordinate relations; infinitives may complete verbs, express purpose/result in constructions, or function articularly.',
      'Nonfinite forms still take objects, modifiers, and other complements. Treat them as miniature verbal structures rather than single translated words.',
      'The syntactic relation to the main clause must be argued from construction and context after morphology is established.'
    ],['ὁ πιστεύων','θέλω γράφειν','πρὸ τοῦ ἐλθεῖν (articular-infinitive-shaped construction)'],'Do not choose a participial or infinitival label simply because one English translation sounds natural.',[{ref:'Philippians 2:6-8',task:'Map participles/infinitives to their subjects, complements, and controlling finite clauses.'}],[
      Q('concept','What should be mapped inside a nonfinite clause?',['Head form, participants, and complements','Only its English gloss','Only word order','Only article presence'],0,'Nonfinite forms retain verbal argument structure.','syntax_relation'),
      Q('recognition','What is ὁ πιστεύων structurally?',['An article plus substantival/attributive participle','A finite verb','A preposition','An infinitive'],0,'The article can substantivize the participle.','syntax_relation'),
      Q('reading','When should you decide whether a participle is causal or temporal?',['After morphology and clause relation are clear','Before parsing','From tense-form alone','From case alone'],0,'Semantic relation is a contextual second step.','syntax_relation')
    ]),
    U(43,'Conditional, purpose, result & dependent clauses','Recognize major subordinate-clause markers and analyze form combinations without simplistic condition-class labels.',[
      'εἰ commonly introduces conditional protases with indicative forms; ἐάν commonly combines with subjunctive. The exact pragmatic force depends on context.',
      'ἵνα + subjunctive is frequent for purpose and content/complement relations; ὥστε often introduces result or consequence constructions.',
      'Relative clauses and other dependent structures should be bracketed before translation so their governing relationship remains visible.'
    ],['εἰ + indicative','ἐάν + subjunctive','ἵνα + subjunctive','ὥστε + infinitive/indicative (construction-dependent)'],'Do not map Greek condition patterns mechanically to “real/unreal” English categories without contextual analysis.',[{ref:'John 15:7',task:'Bracket the condition and main clause, then parse mood and explain the logical relation.'}],[
      Q('recognition','Which pairing is especially common?',['ἐάν + subjunctive','ἐάν + imperative only','ἵνα + nominative','εἰ + infinitive only'],0,'ἐάν commonly introduces subjunctive conditions.','mood'),
      Q('concept','Can ἵνα clauses serve functions beyond purpose?',['Yes','No'],0,'Content/complement uses are well established.','syntax_relation'),
      Q('reading','What is the first step with a long dependent sentence?',['Bracket clause boundaries and markers','Translate every word independently','Ignore conjunctions','Assume English word order'],0,'Clause architecture controls interpretation.','syntax_relation')
    ]),
    U(44,'Word order, information structure & discourse flow','Read flexible Greek word order as an information-structuring resource rather than as a hidden English sentence order.',[
      'Case and verbal morphology allow Greek constituents to move more freely than in English. Position can contribute to topic, focus, prominence, continuity, or contrast.',
      'Fronting may be meaningful, but no single position automatically equals “emphasis.” Compare alternatives inside the local discourse.',
      'Particles, conjunctions, repeated lexical chains, reference tracking, and clause boundaries help reveal discourse flow.'
    ],['fronted constituent ≠ automatic emphasis','δέ / γάρ / οὖν as discourse connectors','pronoun/participant tracking'],'Do not explain every unusual word order as “emphasis”; specify what discourse contrast or continuity supports that claim.',[{ref:'Philippians 1:3-11',task:'Track fronted constituents and connectors across the paragraph before translating sentence-by-sentence.'}],[
      Q('concept','Why can Greek word order be flexible?',['Morphology carries many syntactic relations','Greek has no syntax','Every word is optional','Punctuation determines case'],0,'Case and verb morphology reduce dependence on fixed position.','word_order_overreliance'),
      Q('concept','Does clause-initial position automatically mean emphasis?',['Yes','No'],1,'Prominence must be argued from discourse context.','word_order_overreliance'),
      Q('reading','Which evidence best supports discourse analysis?',['Constituent order plus connectors, reference tracking, and context','Word order alone','English translation alone','Accent alone'],0,'Discourse claims should integrate multiple signals.','syntax_relation')
    ]),
    U(45,'Guided-book reading: 1 John','Read sustained sections of 1 John with decreasing assistance while tracking recurring vocabulary, syntax, and discourse chains.',[
      '1 John is well suited to transition reading because vocabulary and constructions recur while theological argument develops across paragraphs.',
      'Read first for clause boundaries and repeated lexical chains such as μένω, ἀγάπη, φῶς/σκοτία, γινώσκω, and πιστεύω-family language.',
      'Move from R2 toward R3 assistance: attempt the paragraph, mark unresolved forms, then consult morphology/lexicon only where needed.'
    ],['1 John 1:1-4','1 John 2:1-6','1 John 4:7-12'],'Do not let familiar theological content replace grammatical analysis of the Greek wording.',[{ref:'1 John 1:1-4',task:'Read the paragraph without translation aids first; then justify clause boundaries and unresolved forms.'},{ref:'1 John 2:1-6',task:'Track pronouns and repeated lexical chains across sentences.'}],[
      Q('concept','What is the main goal of the guided-book stage?',['Sustained reading with decreasing assistance','Memorizing isolated paradigms only','Replacing grammar with theology','Using an interlinear immediately'],0,'The stage transfers grammar into continuous reading.','premature_reveal'),
      Q('application','What should you do before opening a lexical aid?',['Attempt the clause and identify what is actually blocking comprehension','Reveal every gloss','Skip morphology','Translate from memory'],0,'Attempt-before-reveal preserves retrieval practice.','premature_reveal'),
      Q('reading','What should repeated vocabulary in 1 John help you build?',['Automatic lexical/syntactic recognition across discourse','A root-fallacy word study','One gloss per lemma','No need for context'],0,'Repeated encounters build contextual fluency.','vocabulary_retrieval')
    ]),
    U(46,'Narrative fluency: extended Mark reading','Read extended Markan narrative while tracking participants, tense-form shifts, connectors, and scene structure.',[
      'Narrative fluency means following events without stopping to fully analyze every familiar form.',
      'Mark frequently uses aorists, imperfects, historical presents, καί, and εὐθύς. Treat these as discourse resources, not mechanical labels of event type.',
      'Track scene changes, participant reference, direct speech, and verb chains before consulting tools.'
    ],['Mark 1:1-15','Mark 2:1-12','Mark 4:35-41'],'Do not explain every historical present as “more vivid” without local discourse evidence.',[{ref:'Mark 1:1-15',task:'Read for scene progression, then mark tense-form transitions and connectors.'},{ref:'Mark 4:35-41',task:'Track speaker changes and participant reference through the scene.'}],[
      Q('concept','What distinguishes fluency reading from a parsing drill?',['Maintaining discourse comprehension while selectively analyzing blockers','Ignoring grammar','Translating from English memory','Never using tools'],0,'Fluency integrates grammar into sustained comprehension.','syntax_relation'),
      Q('reading','How should historical presents be treated?',['As discourse forms whose effect must be assessed in context','Always as dramatic emphasis','As future tense','As errors'],0,'Their discourse function cannot be reduced to one slogan.','tense_form'),
      Q('application','When should you stop for a full parse during fluency reading?',['When a form blocks clause/discourse comprehension or is a targeted learning item','At every word','Never','Only at punctuation'],0,'Selective analysis protects both accuracy and reading flow.','premature_reveal')
    ]),
    U(47,'Epistolary fluency: Philippians','Read longer Pauline sentences by mapping clause hierarchy, nonfinite structures, argument flow, and discourse connectors.',[
      'Epistolary prose often embeds participles, infinitives, relative clauses, and prepositional phrases within long sentence units.',
      'Map the finite-clause spine first, then attach subordinate and nonfinite structures. This prevents translation from becoming a chain of disconnected glosses.',
      'Track argument signals, repeated vocabulary, participant shifts, and rhetorical contrasts across paragraph boundaries.'
    ],['Philippians 1:3-11','Philippians 2:1-11','Philippians 3:7-14'],'Do not assume punctuation in a modern edition is itself ancient syntax evidence; use it as editorial help, then verify the grammar.',[{ref:'Philippians 2:1-11',task:'Identify the finite-clause spine before attaching participles, infinitives, and subordinate clauses.'}],[
      Q('application','What should be identified first in a long epistolary sentence?',['The finite-clause spine','Every dictionary gloss','The theological conclusion','English punctuation'],0,'Finite clauses provide the sentence backbone.','syntax_relation'),
      Q('concept','What role does modern punctuation play?',['Helpful editorial guidance, not independent ancient syntactic proof','Infallible syntax','No value at all','Morphology'],0,'Edition punctuation is interpretive assistance.','syntax_relation'),
      Q('reading','What should paragraph reading track beyond individual sentences?',['Argument flow, connectors, lexical chains, and participant reference','Only aorist forms','Only vocabulary rank','Only article use'],0,'Epistolary fluency is discourse-level comprehension.','syntax_relation')
    ]),
    U(48,'Lexicon method & responsible word study','Use lexicons and corpus evidence to establish contextual sense without root fallacies or totality transfer.',[
      'Begin with the lemma and local syntax, then consult a lexicon for attested senses rather than treating the first English gloss as the meaning.',
      'Compare relevant occurrences and collocations. Frequency, register, genre, and construction help narrow which part of a semantic range is plausible.',
      'Etymology can illuminate historical formation but does not control synchronic contextual meaning. A word does not carry all of its possible senses into one occurrence.'
    ],['lemma → lexical range → local construction → contextual sense','root history ≠ contextual definition','frequency ≠ meaning by itself'],'Do not commit the root fallacy, illegitimate totality transfer, or “one Greek word = one exact English word.”', [{ref:'Philippians 2:5',task:'Choose one content word, list plausible lexicon senses, then eliminate senses that do not fit the local construction/context.'}],[
      Q('concept','What should a lexicon provide first?',['A range of attested senses and usage information','One inspired English gloss','A theological conclusion','The word’s root as its meaning'],0,'Lexicons describe usage and semantic range.','lexical_overreach'),
      Q('concept','What is illegitimate totality transfer?',['Importing an entire semantic range into one occurrence','Comparing contexts','Checking morphology','Reading a lexicon entry'],0,'One occurrence normally activates a contextually constrained sense.','lexical_overreach'),
      Q('reading','What best selects a contextual sense?',['Local syntax, discourse, and attested usage together','Etymology alone','Frequency alone','An English cognate'],0,'Contextual meaning emerges from usage in construction.','lexical_overreach')
    ]),
    U(49,'Textual variants, edition awareness & tool-assisted exegesis','Distinguish edition text, edition-comparison data, manuscript evidence, and responsible tool use.',[
      'A printed/digital Greek text is an edited text. Different editions can differ at specific readings, punctuation, or presentation choices.',
      'Koinē Path may compare pinned edition data for learning, but edition comparison is not itself a manuscript apparatus and must not be represented as one.',
      'Responsible textual criticism requires manuscript and versional evidence, transcriptional considerations, and explicit source provenance beyond a simple edition diff.'
    ],['edition reading','edition-comparison record','manuscript apparatus = separate evidence layer'],'Do not claim a manuscript is present, absent, early, or weighty unless the actual apparatus/source data supplies that evidence.',[{ref:'John 1:18',task:'Separate what the current edition prints from any edition-comparison note and from claims that would require manuscript evidence.'}],[
      Q('concept','Is an edition-to-edition diff a manuscript apparatus?',['No','Yes'],0,'It compares editorial outputs, not manuscript witnesses directly.','lexical_overreach'),
      Q('concept','What is required before making manuscript-weight claims?',['Actual apparatus/source evidence','A translation difference only','A lexicon gloss','Word order'],0,'Witness claims require witness data.','lexical_overreach'),
      Q('reading','What should a tool-assisted exegete record?',['Edition/source provenance and the level of evidence used','Only the preferred conclusion','No uncertainty','Only English translations'],0,'Provenance keeps textual and interpretive claims auditable.','syntax_relation')
    ]),
    U(50,'Independent reading practicum & final assessment','Demonstrate independent GNT reading by separating grammatical facts, contextual judgments, interpretive possibilities, and theological conclusions.',[
      'The final practicum begins with unaided reading: establish text, morphology, clause structure, and discourse flow before opening aids.',
      'Then use tools selectively to verify difficult forms, lexical range, and textual issues. Record where a conclusion is certain, probable, possible, or unresolved.',
      'A disciplined exegetical ladder keeps categories distinct: grammatical fact → contextual judgment → interpretive possibility → theological conclusion.'
    ],['parse → syntax → discourse → lexical verification → interpretation','fact ≠ inference ≠ theology'],'Do not let a desired theological conclusion retroactively determine a parse or lexical sense.',[{ref:'Mark 1:14-15',task:'Produce a complete independent analysis: text, morphology, syntax, discourse, translation, lexical checks, and bounded interpretation.'},{ref:'John 1:1',task:'Revisit the verse and distinguish predicate-nominative grammar from larger theological conclusions.'}],[
      Q('concept','What comes first in the exegetical ladder?',['Grammatical fact','Theological conclusion','Application','Word-root speculation'],0,'Establish what the Greek form/structure warrants before broader inference.','syntax_relation'),
      Q('application','What should you do when two interpretations remain grammatically possible?',['State the uncertainty and weigh contextual evidence','Pretend grammar decides one','Choose the preferred theology automatically','Ignore the alternatives'],0,'Responsible exegesis represents the strength of evidence.','lexical_overreach'),
      Q('reading','What marks successful independent reading?',['Sustained comprehension with selective, transparent tool use and justified analysis','Never consulting a tool','Translating every word literally','Memorizing all paradigms without reading'],0,'Independence means the learner leads the analysis and uses tools critically.','premature_reveal')
    ])
  ];

  return Object.freeze({
    version:'bg16-b001.0',
    source,
    unitCount:units.length,
    minimumTeachingMovements:3,
    minimumCheckpoints:3,
    units:Object.freeze(units)
  });
});
