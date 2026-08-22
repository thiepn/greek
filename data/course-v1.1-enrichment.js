(function(root,factory){
  const data=factory();
  if(typeof module==='object'&&module.exports)module.exports=data;
  if(root)root.KOINE_COURSE_ENRICHMENT=data;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const P=(prompt,choices,answer,explanation)=>({prompt,choices,answer,explanation});
  const E=(id,focus,observe,contrast,practice,reasoning)=>({
    id,focus,observe,contrast,
    practice:practice.map((q,i)=>({id:`u${id}.p${i+1}`,...q})),
    reasoning
  });
  const units=[
    E(1,'Make letter recognition automatic enough that attention can move from decoding to morphology.',
      {greek:'λόγος',prompt:'Name the five letters from left to right before saying the word aloud.',explanation:'λ–ό–γ–ο–ς shows ordinary medial letters plus final sigma. The goal is immediate recognition, not transliteration dependence.'},
      {left:'σ',right:'ς',prompt:'What changes between these two shapes?',explanation:'Both are sigma. σ normally appears within a word; ς is the lowercase final form. Position changes the shape, not the identity of the letter.'},[
        P('Which sequence correctly names λογ?',['lambda–omicron–gamma','lambda–omega–gamma','iota–omicron–gamma','lambda–omicron–chi'],0,'λ is lambda, ο is omicron, and γ is gamma.'),
        P('Why should letter naming become fast before heavier grammar?',['It frees attention for endings and relationships','It guarantees translation','It replaces vocabulary study','It determines syntax'],0,'Automatic decoding reduces cognitive load so morphology becomes easier to notice.')
      ],'Explain aloud how you know whether a lowercase sigma should be σ or ς without assigning any grammatical meaning to the choice.'),
    E(2,'Read vowel nuclei and syllables as units rather than decoding one character at a time.',
      {greek:'εἰρήνη',prompt:'Locate the vowel nuclei and divide the word into pronounceable syllables.',explanation:'The initial ει functions as a vowel combination; syllabification should support fluent decoding rather than replace lexical or morphological analysis.'},
      {left:'αι',right:'αϊ',prompt:'Why must the marks and spelling be observed rather than assuming every adjacent vowel is one unit?',explanation:'Greek orthography can signal whether vowels belong together. The learner should read the actual written form consistently within the selected pronunciation profile.'},[
        P('Which pair is a standard basic diphthong?',['ου','οα','αε','ηο'],0,'ου is one of the standard vowel combinations taught for Greek reading.'),
        P('What is the best reason to mark syllables in a new word?',['To improve fluent decoding','To identify case automatically','To choose a lexicon sense','To determine theology'],0,'Syllables support oral and visual fluency; grammar still comes from morphology and syntax.')
      ],'State the vowel nucleus of each syllable before giving any English gloss for the word.'),
    E(3,'Treat breathings, accents, punctuation, and other marks as real orthography without turning them into a shortcut parser.',
      {greek:'ὁ λόγος;',prompt:'Identify the breathing, accent, and punctuation before asking what the phrase means.',explanation:'The rough/smooth breathing and accent belong to the written forms, while ; functions as the Greek question mark. None by itself supplies a complete parse.'},
      {left:'ὁ',right:'ο',prompt:'What extra information is visibly present in the first form?',explanation:'ὁ carries a breathing mark and is a lexical form of the article; the unmarked character ο by itself is merely a letter. Context and morphology still govern analysis.'},[
        P('Which mark functions as the Greek question mark?',[';',':','·','!'],0,'Greek normally uses ; for a question mark.'),
        P('What is unsafe to infer from an accent alone?',['A complete case or tense parse','That the written form has an accent','That pronunciation may be affected','That two spellings can differ'],0,'Accent is one orthographic cue, not a complete morphology engine.')
      ],'Describe one thing an accent or breathing can tell you and one grammatical conclusion it cannot establish by itself.'),
    E(4,'Begin reading in meaningful chunks by recognizing the function words that organize clauses.',
      {greek:'καὶ ὁ λόγος',prompt:'Which element joins material and which element begins a nominal phrase?',explanation:'καί commonly coordinates or adds, while ὁ is an article form. Recognizing these immediately makes the larger clause easier to segment.'},
      {left:'καί',right:'δέ',prompt:'Why should these not be memorized as interchangeable English words?',explanation:'Both are frequent discourse/function words, but their contribution depends on clause and discourse context. A single fixed English gloss is inadequate.'},[
        P('Which item most directly signals a prepositional phrase?',['ἐν','καί','δέ','οὐ'],0,'ἐν is a preposition and commonly governs a dative complement.'),
        P('What is the first benefit of automatic function-word recognition?',['Faster clause segmentation','Automatic exegesis','No need for morphology','Perfect English word order'],0,'Function words expose phrase and clause architecture early.')
      ],'Read a short clause aloud and explain where you would pause based on function words and phrase boundaries rather than punctuation alone.'),
    E(5,'Use the article as a compact agreement map while resisting a one-to-one equation with English “the.”',
      {greek:'τῆς γραφῆς',prompt:'What gender, number, and case information is repeated across the phrase?',explanation:'τῆς and γραφῆς are feminine singular genitive forms. Agreement helps identify the phrase before its specific syntactic relationship is decided.'},
      {left:'ὁ λόγος',right:'λόγος',prompt:'What can article presence help you see without deciding the full semantic effect?',explanation:'The article can mark phrase structure and substantival relations. Its presence or absence should not be reduced mechanically to English definiteness.'},[
        P('Which article form is dative singular masculine or neuter?',['τῷ','τοῦ','τόν','οἱ'],0,'τῷ is dative singular masculine/neuter.'),
        P('What should you do first when you see an article+noun pair?',['Use agreement to predict morphology','Insert English “the” automatically','Assume definiteness is the only issue','Ignore the article'],0,'Agreement is the article’s most reliable early reading value.')
      ],'Explain how the article helps you parse a phrase before you decide whether an English article belongs in translation.'),
    E(6,'Identify subject and object candidates from case morphology and the verb instead of English word order.',
      {greek:'τὸν κύριον βλέπει ὁ μαθητής',prompt:'Identify the likely subject and direct object even though the object comes first.',explanation:'ὁ μαθητής is nominative and is the likely subject; τὸν κύριον is accusative and is the likely object. Position does not reverse the case relationship.'},
      {left:'ὁ μαθητής',right:'τὸν μαθητήν',prompt:'Which morphological change most directly changes the likely clause role?',explanation:'The nominative versus accusative marking changes the available syntactic relation. Word position is secondary evidence.'},[
        P('In τὸν κύριον βλέπει ὁ μαθητής, which phrase is nominative?',['ὁ μαθητής','τὸν κύριον','βλέπει','none'],0,'ὁ μαθητής is nominative singular.'),
        P('Why is “first noun = subject” unsafe in Greek?',['Case morphology allows flexible order','Greek has no subjects','Articles erase syntax','Every noun is nominative'],0,'Greek marks many relationships morphologically, so position alone is insufficient.')
      ],'Give a subject/object analysis and name the specific case clue that supports each choice before translating the sentence.'),
    E(7,'Recognize second-declension masculine endings rapidly enough to separate parsing from interpretation.',
      {greek:'λόγοις',prompt:'Parse the ending before supplying a gloss.',explanation:'-οις marks dative plural in this paradigm. The clause must still show what relationship that dative expresses.'},
      {left:'λόγοι',right:'λόγους',prompt:'What morphological contrast does the ending encode?',explanation:'λόγοι is nominative plural; λόγους is accusative plural. The lexical stem remains recognizable while case changes.'},[
        P('Which form is genitive singular?',['λόγου','λόγον','λόγοι','λόγοις'],0,'λόγου is genitive singular.'),
        P('After recognizing λόγοις as dative plural, what remains to be decided?',['Its syntactic relationship in context','Its number','Its declension','Whether it contains Greek letters'],0,'Morphological identification precedes contextual function.')
      ],'Parse a second-declension form in the order case → number → likely clause relation, and explain why the last step requires context.'),
    E(8,'Handle neuter nominative/accusative syncretism without inventing a distinction the form itself does not show.',
      {greek:'δῶρα',prompt:'List the two case possibilities before using clause syntax.',explanation:'δῶρα can be nominative or accusative plural. Neuter morphology leaves that distinction syncretic here.'},
      {left:'δῶρον',right:'δῶρα',prompt:'What changes clearly, and what remains potentially ambiguous?',explanation:'Number changes singular→plural; nominative versus accusative remains formally identical in both forms.'},[
        P('What can δῶρον be morphologically?',['Nominative or accusative singular','Only nominative singular','Only accusative plural','Genitive singular'],0,'Second-declension neuter nominative and accusative singular are identical.'),
        P('What should resolve the nominative/accusative ambiguity?',['Clause syntax','Accent alone','English position alone','The lexicon gloss'],0,'The clause relation supplies what the syncretic form does not.')
      ],'When a form is syncretic, say the full set of legitimate parses first, then explain which contextual evidence narrows them.'),
    E(9,'Recognize first-declension feminine patterns while using article agreement to avoid overgeneralization.',
      {greek:'ταῖς γραφαῖς',prompt:'What information is shared by article and noun?',explanation:'Both forms are feminine plural dative. Agreement provides a strong cross-check on the noun ending.'},
      {left:'γραφή',right:'γραφήν',prompt:'Which case contrast is visible?',explanation:'γραφή is nominative singular; γραφήν is accusative singular in this paradigm.'},[
        P('Which form is genitive singular feminine?',['γραφῆς','γραφῇ','γραφήν','γραφαί'],0,'γραφῆς is genitive singular.'),
        P('Why should article agreement be checked with first-declension nouns?',['It confirms gender/number/case analysis','It proves every feminine noun is first declension','It fixes English word order','It determines lexical sense'],0,'Agreement provides independent morphological evidence.')
      ],'Parse both the article and noun separately, then show how their agreement increases confidence without proving the noun’s syntactic function.'),
    E(10,'Combine adjective agreement and preposition+case patterns without treating case labels as single fixed meanings.',
      {greek:'ἐν τῷ ἀγαθῷ οἴκῳ',prompt:'Which words agree, and which element governs the case of the phrase?',explanation:'τῷ, ἀγαθῷ, and οἴκῳ agree in dative singular masculine; ἐν commonly governs the dative phrase.'},
      {left:'ἐν τῷ οἴκῳ',right:'εἰς τὸν οἶκον',prompt:'What changes in the preposition+case package?',explanation:'ἐν commonly takes dative, while εἰς takes accusative. The whole construction matters more than an isolated case gloss.'},[
        P('What must an attributive adjective normally agree with?',['Its noun in gender, number, and case','Only its noun’s case','Only its noun’s gender','The finite verb'],0,'Greek adjective agreement involves gender, number, and case.'),
        P('Which analysis is safest for a prepositional phrase?',['Interpret preposition and governed case together','Translate the case first and ignore the preposition','Assume every dative means “to”','Use word order only'],0,'Preposition+case forms a construction whose contextual sense must be read together.')
      ],'Explain the phrase by separating agreement evidence from the semantic contribution of the preposition+case construction.'),
    E(11,'See finite verbs as layered forms whose stem, vowel, and ending jointly support parsing.',
      {greek:'λύομεν',prompt:'Segment the form into stem, connecting vowel, and personal ending.',explanation:'λυ- is the lexical stem, -ο- is the connecting vowel, and -μεν marks first person plural in this present active form.'},
      {left:'λύομεν',right:'λύετε',prompt:'Which part most directly signals the person/number contrast?',explanation:'The personal endings -μεν and -τε distinguish first plural from second plural while the stem remains stable.'},[
        P('In λύομεν, which segment marks first plural most directly?',['-μεν','λυ-','-ο-','the accent'],0,'-μεν is the personal ending.'),
        P('Why segment a verb instead of memorizing it as one block?',['It makes recurring morphology reusable across lexemes','It guarantees the verb’s meaning','It removes the need for principal parts','It decides discourse function'],0,'Recognizing form components supports transfer to new verbs.')
      ],'Take one finite form and name the clue for stem identity separately from the clue for person/number.'),
    E(12,'Retrieve present active endings quickly while keeping tense-form morphology distinct from contextual temporal interpretation.',
      {greek:'λύουσιν',prompt:'Parse person, number, tense-form, voice, and mood before translating.',explanation:'λύουσιν is present active indicative third plural in the taught paradigm. Its contextual English rendering is a later decision.'},
      {left:'λύεις',right:'λύετε',prompt:'What person/number contrast do the endings show?',explanation:'-εις marks second singular; -ετε marks second plural.'},[
        P('Parse λύει.',['Present active indicative 3sg','Present active indicative 2sg','Imperfect active 3sg','Present middle/passive 3sg'],0,'λύει is present active indicative third singular.'),
        P('What should not be inferred from the present tense-form alone?',['One fixed English time/aspect wording in every context','Its person/number ending','Its active morphology','That it is finite'],0,'Context governs temporal reference and translation beyond the morphological tense-form.')
      ],'Give the complete morphological parse first, then state which parts of an English translation remain contextual rather than encoded mechanically.'),
    E(13,'Recognize εἰμί and other frequent irregular presents as forms, not exceptions to be guessed from English.',
      {greek:'ἐσμέν',prompt:'Identify the lemma and person/number without trying to derive it from λύω endings.',explanation:'ἐσμέν is first person plural present indicative of εἰμί. High-frequency irregular forms need direct recognition.'},
      {left:'ἐστίν',right:'εἰσίν',prompt:'What number contrast is expressed?',explanation:'ἐστίν is third singular; εἰσίν is third plural.'},[
        P('Which form is first plural of εἰμί?',['ἐσμέν','ἐστέ','εἰμί','εἰσίν'],0,'ἐσμέν is first person plural.'),
        P('Why learn high-frequency irregulars by recognition?',['They recur too often to re-derive slowly','They have no morphology','They never change','They are always copulas in the same sense'],0,'Automatic recognition protects reading fluency while syntax still determines function.')
      ],'Explain which clue identifies the lemma and which clue identifies person/number when the form does not resemble a regular λύω pattern.'),
    E(14,'Recognize middle/passive morphology while postponing the contextual interpretation of voice.',
      {greek:'λύεται',prompt:'Give the morphological voice label and identify what cannot yet be decided from form alone.',explanation:'λύεται is present middle/passive indicative third singular. The form does not by itself settle whether the contextual interpretation is middle, passive, or lexically specialized.'},
      {left:'λύει',right:'λύεται',prompt:'What formal contrast is visible?',explanation:'Both are third singular present indicative forms, but λύει is active and λύεται carries middle/passive morphology.'},[
        P('Parse λύονται.',['Present middle/passive indicative 3pl','Present active indicative 3pl','Aorist passive 3pl','Present middle/passive 2pl'],0,'-ονται marks third plural present middle/passive indicative.'),
        P('What should decide whether a middle/passive form is translated passively?',['Lexeme, syntax, and context','The ending alone in every case','English preference','Word order'],0,'Morphological voice and contextual voice interpretation are related but not identical questions.')
      ],'State “form” and “contextual interpretation” as two separate claims when explaining a middle/passive verb.'),
    E(15,'Recognize predictable contraction outcomes so surface spelling does not hide familiar stems and endings.',
      {greek:'ἀγαπᾷ',prompt:'What lexical family should you recognize despite the contracted surface form?',explanation:'ἀγαπᾷ belongs to ἀγαπάω. Contract verbs combine stem vowel and ending in regular spelling patterns that should become visually familiar.'},
      {left:'ποιεῖ',right:'λύει',prompt:'Why can these share grammatical features while looking different near the stem-ending boundary?',explanation:'ποιέω contracts its stem vowel with the ending; λύω does not. Both can still be present active indicative third singular.'},[
        P('Which lemma family best matches ἀγαπᾷ?',['ἀγαπάω','λύω','εἰμί','δίδωμι'],0,'The contracted form belongs to ἀγαπάω.'),
        P('What is the main reading skill with contract verbs?',['Recognize the underlying familiar morphology through contraction','Undo every form into Classical spelling before reading','Treat contractions as irregular vocabulary','Ignore endings'],0,'Contraction should become a recognition pattern, not a decoding obstacle.')
      ],'Explain how you recover both lemma family and grammatical ending from a contracted form without calling the form “irregular.”'),
    E(16,'Read whole clauses by locating the finite spine, then attaching subjects, complements, negation, and conjunctions.',
      {greek:'οὐ βλέπει ὁ μαθητής.',prompt:'Find the finite verb, subject candidate, and negator before translating.',explanation:'βλέπει is the finite verb, ὁ μαθητής is nominative and supplies the likely subject, and οὐ negates the indicative clause.'},
      {left:'οὐ βλέπει',right:'μὴ βλέπε',prompt:'What larger grammatical contrast matters more than memorizing “not”?',explanation:'Negation choice interacts with mood/construction. οὐ is common with indicative assertions; μή is common in nonindicative and other contexts.'},[
        P('What should you locate first in a simple finite clause?',['The finite verb','The longest noun','The English subject','The first word'],0,'The finite verb anchors person/number and clause structure.'),
        P('What is the safest way to handle conjunctions such as καί or δέ?',['Use them to map clause relations before forcing an English gloss','Ignore them','Translate both identically every time','Treat them as case markers'],0,'Conjunctions organize discourse and clause relationships.')
      ],'Give a clause map using labels—finite verb, subject candidate, complement, negator, connector—before producing English.'),
    E(17,'Recognize imperfect morphology and its imperfective viewpoint without equating that viewpoint with objective duration or repetition.',
      {greek:'ἔλυον',prompt:'List the legitimate person/number parses before context resolves the form.',explanation:'ἔλυον can be first singular or third plural imperfect active indicative. The augment and ending identify the imperfect system, while person/number remains syncretic.'},
      {left:'ἔλυον',right:'ἔλυσαν',prompt:'What tense-form/aspectual contrast is present?',explanation:'ἔλυον is imperfective imperfect morphology; ἔλυσαν is aorist active third plural. Context—not a slogan about duration versus instant action—interprets the event.'},[
        P('Which feature is a common imperfect-system clue?',['Augment','Reduplication only','Sigma future marker only','Article agreement'],0,'Past indicative systems commonly show augment.'),
        P('Does imperfective viewpoint guarantee the event was objectively long or repeated?',['No','Yes'],0,'Imperfective viewpoint does not mechanically encode event duration, repetition, or incompleteness.')
      ],'Explain the imperfect form in terms of morphology and viewpoint, then name one event-shape claim that must still come from context.'),
    E(18,'Recognize future morphology while noticing forms whose surface shape can overlap with other verbal categories.',
      {greek:'λύσω',prompt:'Give at least two legitimate morphological possibilities for this contextless form.',explanation:'λύσω can be future active indicative first singular or aorist active subjunctive first singular. Clause context and markers must resolve it.'},
      {left:'λύσω',right:'λύσομεν',prompt:'What does the second form make clearer?',explanation:'λύσομεν is future active indicative first plural in the regular pattern; its ending removes the specific λύσω syncretism.'},[
        P('Which marker commonly appears in the regular future system?',['σ','κ','θη only','reduplication'],0,'Sigma is a common future tense formative, though stem changes and irregular futures also occur.'),
        P('How should λύσω be parsed without context?',['Keep future indicative and aorist subjunctive possibilities open','Future indicative only','Aorist indicative only','Present subjunctive only'],0,'The form is syncretic across those two categories.')
      ],'When a future-looking form is syncretic, name the competing parse and the clause evidence you would seek to resolve it.'),
    E(19,'Recognize first-aorist morphology and keep perfective viewpoint distinct from “once-for-all” or simple-past slogans.',
      {greek:'ἔλυσα',prompt:'Identify augment, stem, aorist formative, and personal ending.',explanation:'ἔ- marks augment, λυ- the stem, -σα- the first-aorist formative, and the ending marks first singular in this model.'},
      {left:'ἔλυσα',right:'ἔλυον',prompt:'What is the grammatical contrast?',explanation:'The forms contrast aorist/perfective and imperfect/imperfective indicative systems. Context supplies the discourse and temporal interpretation.'},[
        P('Which sequence most strongly identifies a regular first aorist?',['augment + σα morphology','reduplication + κ','present stem only','article + noun'],0,'First aorists commonly show augment in the indicative and a σα tense formative.'),
        P('Which statement is valid?',['Aorist is a morphological/aspectual category whose contextual interpretation varies','Aorist always means one-time action','Aorist always means simple past in every mood','Aorist proves theological finality'],0,'Aorist morphology must not be turned into an automatic event-type or theological claim.')
      ],'Describe what the aorist form encodes morphologically, then explicitly separate that from claims about how many times an event happened.'),
    E(20,'Recognize second-aorist stem changes so a familiar lexeme remains identifiable even without a σα formative.',
      {greek:'ἔλαβον',prompt:'Identify the lexical family and the system despite the changed stem.',explanation:'ἔλαβον belongs to λαμβάνω and uses the second-aorist stem λαβ-. Second aorists are recognized through principal-part/stem knowledge plus endings.'},
      {left:'λαμβάνει',right:'ἔλαβεν',prompt:'What changed besides the indicative time frame?',explanation:'The lexeme uses a different stem in the aorist. Principal-part recognition therefore matters more than assuming one invariant stem.'},[
        P('Which lemma corresponds to ἔλαβον?',['λαμβάνω','λέγω','γράφω','βάλλω'],0,'ἔλαβον is a second-aorist form of λαμβάνω.'),
        P('Why can second aorists be difficult for beginners?',['The stem may change substantially','They have no endings','They are always passive','They never occur in narrative'],0,'Stem alternation means recognition must extend beyond endings.')
      ],'For a changed-stem aorist, name the principal-part clue that links it back to its present lexical form.'),
    E(21,'Recognize passive-system morphology while avoiding the assumption that every passive-looking English meaning uses the same Greek stem.',
      {greek:'ἐλύθην',prompt:'Identify the passive-system marker and person/number.',explanation:'ἐλύθην is aorist passive indicative first singular in the regular model, with augment and θη passive-system morphology.'},
      {left:'ἐλύθην',right:'λυθήσομαι',prompt:'What system contrast is visible?',explanation:'The first is aorist passive indicative; the second is future passive indicative first singular. Both use the passive-system stem.'},[
        P('Which element is a common aorist-passive marker?',['θη','σα','μεν only','reduplication'],0,'θη is characteristic of many first aorist passive forms.'),
        P('What must still be checked with a passive form?',['The lexeme and contextual sense','Whether θ always means future','Whether every passive is theological','Whether case endings disappear'],0,'Morphological passive form is only one part of contextual interpretation.')
      ],'Parse a passive-system form completely before deciding how naturally English should express the affected participant.'),
    E(22,'Use principal parts as a recognition network connecting stem families rather than as an isolated memorization list.',
      {greek:'λαμβάνω · λήμψομαι · ἔλαβον',prompt:'What reading problem does this principal-part set solve?',explanation:'The forms show that one lexeme can use substantially different stems across systems. Principal parts let the reader recognize family resemblance that endings alone cannot supply.'},
      {left:'γράφω → ἔγραψα',right:'λαμβάνω → ἔλαβον',prompt:'Why do these require different recognition strategies?',explanation:'γράφω has a more predictable first-aorist development; λαμβάνω uses a distinct second-aorist stem. Both belong in a principal-part network.'},[
        P('What is the main purpose of principal parts for a reader?',['Recognize tense-system stems of one lexeme','Replace syntax','Supply every contextual gloss','Determine word order'],0,'Principal parts connect altered stems to a common lexical identity.'),
        P('Which skill is stronger than memorizing one present stem?',['Recognizing the lexeme across multiple principal-part stems','Guessing from English','Ignoring morphology','Using only frequency'],0,'Reading requires recognition across the verb’s recurring stem system.')
      ],'Choose one irregular verb and explain how two principal parts protect you from misidentifying the lexeme in continuous reading.'),
    E(23,'Integrate mixed indicative forms at narrative speed while interpreting tense-form choices within discourse rather than in isolation.',
      {greek:'ἔλεγεν ... εἶπεν',prompt:'What contrast should you notice before assigning narrative effects?',explanation:'The first form is imperfect indicative, the second aorist indicative. Their discourse contribution must be assessed in the local event sequence and clause structure.'},
      {left:'ἔλεγεν',right:'εἶπεν',prompt:'Which difference is grammatical and which is interpretive?',explanation:'The tense-form/aspectual contrast is grammatical; claims such as backgrounding, summary, repetition, or prominence require contextual support.'},[
        P('What is the best first move in a mixed narrative paragraph?',['Identify each finite verb’s system and clause role','Translate every verb with a fixed English tense formula','Assume every aorist advances the plot','Ignore imperfects'],0,'Accurate morphology precedes discourse interpretation.'),
        P('Can tense-form alone prove a clause is background or foreground?',['No','Yes'],0,'Discourse effects emerge from form plus syntax, lexical semantics, and context.')
      ],'Describe one narrative tense-form contrast using separate sentences for morphological fact and discourse interpretation.'),
    E(24,'Recover third-declension stems from oblique forms instead of memorizing nominatives as if they expose the whole paradigm.',
      {greek:'σῶμα · σώματος',prompt:'What stem becomes visible in the genitive?',explanation:'The genitive σώματος exposes the stem σωματ-. Third-declension strategy often depends on learning the genitive or principal stem form.'},
      {left:'σῶμα',right:'σώματος',prompt:'Why is the second form especially informative?',explanation:'The nominative can obscure the stem, while the genitive more clearly reveals the consonantal stem used by other case endings.'},[
        P('What stem is suggested by σώματος?',['σωματ-','σωμα- only','σωμ-','ματ-'],0,'The genitive reveals the stem σωματ-.'),
        P('What is the best third-declension reading habit?',['Use nominative+genitive to recover the stem','Assume nominative ending predicts every form','Ignore the lexicon form','Treat every consonant stem alike'],0,'Stem recovery is the transferable strategy across varied third-declension patterns.')
      ],'Explain how an oblique form can identify a stem that the nominative conceals.'),
    E(25,'Recognize recurring third-declension families without pretending that one paradigm covers every stem type.',
      {greek:'πίστις · πίστεως',prompt:'What stem alternation should become familiar?',explanation:'πίστις uses the stem πιστε-/πιστ- across its paradigm. Third-declension recognition works by families and recurring endings rather than a single universal shape.'},
      {left:'πατήρ · πατρός',right:'πίστις · πίστεως',prompt:'What do these pairs demonstrate?',explanation:'Different third-declension lexemes expose different stem behavior. The learner needs representative families plus common case endings.'},[
        P('Why learn the genitive with a third-declension noun?',['It often reveals the stem','It determines every syntactic function','It proves gender','It replaces article agreement'],0,'Genitive forms are especially useful for identifying stem shape.'),
        P('What is unsafe?',['Forcing all third-declension nouns into one surface pattern','Comparing stem families','Using article agreement','Learning frequent forms'],0,'Third declension contains multiple stem classes and alternations.')
      ],'Name the stable case/number clues and the lexeme-specific stem clues separately when parsing a third-declension form.'),
    E(26,'Resolve pronouns by morphology and discourse reference rather than translating αὐτός with one fixed English word.',
      {greek:'αὐτὸς λέγει',prompt:'What readings of αὐτός become possible depending on syntax and position?',explanation:'αὐτός can function pronominally and can have intensive force in appropriate structures. Its morphology and relation to nearby nouns/articles must be checked.'},
      {left:'αὐτός',right:'αὐτόν',prompt:'What morphological contrast is visible before antecedent resolution?',explanation:'The first is nominative masculine singular; the second accusative masculine singular (with neuter possibilities for αὐτό in other contexts). Case constrains the role.'},[
        P('What should you determine before choosing “he,” “him,” “same,” or intensive “self”?',['Morphology and syntactic position','English preference','Frequency alone','Accent alone'],0,'αὐτός has several common functions that context distinguishes.'),
        P('What is the first antecedent question?',['Which discourse participant matches the pronoun’s features and syntax','Which English noun is nearest','Which word has the same first letter','Which participant is most important theologically'],0,'Reference tracking uses agreement, syntax, and discourse coherence.')
      ],'Explain a pronoun by giving its morphology first and its proposed antecedent second, with one piece of discourse evidence.'),
    E(27,'Distinguish demonstrative reference and discourse deixis without flattening every form into merely “this” or “that.”',
      {greek:'οὗτος ὁ λόγος',prompt:'How does the demonstrative relate to the articular noun phrase?',explanation:'Demonstratives commonly stand in a predicate-like position relative to an articular noun while referring to a discourse entity. Agreement identifies the phrase relation.'},
      {left:'οὗτος',right:'ἐκεῖνος',prompt:'What kind of contrast can these demonstratives contribute?',explanation:'They can distinguish discourse referents or deictic perspective. English “this/that” is a useful starting gloss, not a complete discourse analysis.'},[
        P('What must a demonstrative agree with when modifying/referencing a noun phrase?',['Gender, number, and case','Only case','Only number','Nothing'],0,'Demonstratives inflect and normally agree with the associated nominal referent.'),
        P('What should determine the exact discourse force of οὗτος or ἐκεῖνος?',['Local reference and discourse context','A fixed English gloss alone','Word length','Accent type'],0,'Demonstrative force is contextual beyond the morphology.')
      ],'Identify the demonstrative’s morphology and then point to the exact discourse referent you think it selects.'),
    E(28,'Separate relative-clause linking from interrogative reference by recognizing forms and clause structure.',
      {greek:'ὃς λέγει',prompt:'What structural expectation does the relative pronoun create?',explanation:'ὅς introduces a relative clause and has its own case role inside that clause while agreeing with its antecedent in gender/number.'},
      {left:'ὅς',right:'τίς',prompt:'What clause-level contrast should you notice?',explanation:'ὅς is a relative pronoun; τίς is interrogative. Similar small forms can organize very different clause relationships.'},[
        P('A relative pronoun normally takes its case from what?',['Its role inside the relative clause','Its antecedent’s case automatically','English word order','The article'],0,'Gender/number commonly reflect the antecedent; case reflects the pronoun’s function in its own clause.'),
        P('What should τίς prompt you to look for?',['An interrogative relation','A relative antecedent only','A future marker','A genitive absolute'],0,'τίς is an interrogative pronoun/adjective family.')
      ],'For a relative clause, state antecedent agreement and pronoun case function as two separate relationships.'),
    E(29,'Integrate πᾶς-type adjectives and numerals with ordinary agreement instead of treating them as isolated vocabulary items.',
      {greek:'πᾶς ὁ λαός',prompt:'What does the adjective’s morphology tell you before you choose an English quantifier wording?',explanation:'πᾶς agrees with the masculine singular nominative noun phrase. Position and article pattern help interpret the quantificational relation.'},
      {left:'πᾶς',right:'πάντα',prompt:'What contrasts are possible in the second form?',explanation:'πάντα can be neuter nominative/accusative plural or masculine accusative singular depending on context. Syncretism must be respected.'},[
        P('What can πάντα be?',['Several parses including neuter nom/acc plural','Only nominative masculine singular','Only genitive plural','Only dative singular'],0,'The form is morphologically syncretic across common analyses.'),
        P('How should numeral/quantifier phrases be read?',['With agreement and phrase structure before English wording','By translating the numeral first and ignoring case','As indeclinable by default','By word order alone'],0,'Nominal morphology still governs these constructions.')
      ],'List every legitimate parse of a syncretic πᾶς-form before using syntax to choose among them.'),
    E(30,'Recognize perfect-system morphology while distinguishing resulting state/discourse interpretation from a mechanical English perfect formula.',
      {greek:'γέγραπται',prompt:'Which formal clues identify the perfect system?',explanation:'Reduplication and the perfect middle/passive ending identify a perfect-system form of γράφω. Context determines how best to express the result/state relation.'},
      {left:'ἔγραψεν',right:'γέγραπται',prompt:'What grammatical contrast is present?',explanation:'The first is aorist active indicative; the second perfect middle/passive indicative. Aspect/stem and voice differ, but translation choices remain contextual.'},[
        P('Which feature strongly signals many perfect forms?',['Reduplication','Augment alone','Article doubling','Future sigma only'],0,'Reduplication is a major perfect-system recognition cue.'),
        P('Should every perfect be translated with English “has/have”?',['No','Yes'],0,'English rendering depends on lexeme and context; morphology should be identified first.')
      ],'Explain the perfect form using morphology first, then state what contextual evidence would justify a result-state interpretation.'),
    E(31,'Treat participles as verbal forms with adjectival morphology, not as mysterious English “-ing” words.',
      {greek:'ὁ λέγων',prompt:'Which features are verbal and which are nominal/adjectival?',explanation:'λέγων carries verbal stem/aspect/voice information and participial case/gender/number morphology; the article can substantivize it.'},
      {left:'λέγει',right:'λέγων',prompt:'What changes when the finite verb becomes a participle?',explanation:'λέγει is finite and carries person/number; λέγων is nonfinite and instead inflects for case/gender/number while retaining verbal properties.'},[
        P('Which feature does a participle have that a finite indicative verb normally lacks?',['Case/gender/number inflection','A lexical stem','Voice','Aspectual morphology'],0,'Participles participate in nominal agreement while remaining verbal.'),
        P('What is unsafe?',['Translating every participle with English “-ing” before mapping its syntax','Parsing its case','Identifying its complements','Checking its head noun'],0,'Participles serve multiple syntactic relations that English may express in different ways.')
      ],'For one participle, give two columns: verbal properties and adjectival/nominal properties.'),
    E(32,'Contrast present and aorist participial stems without turning their aspectual difference into a fixed time relation to the main verb.',
      {greek:'λέγων · εἰπών',prompt:'What stem/aspect contrast is visible?',explanation:'λέγων is a present/imperfective participle; εἰπών is an aorist/perfective participle of λέγω. Relative time and semantic relation come from context.'},
      {left:'λύων',right:'λύσας',prompt:'Which morphological change marks the aorist participle?',explanation:'λύσας uses the first-aorist participial stem with σα morphology; λύων is present active participle.'},[
        P('What does the participle’s tense-form most directly contribute?',['Aspect/stem-system morphology','An absolute time on the calendar','Its case','Its antecedent'],0,'Participial tense-form is not a simple finite-tense time label.'),
        P('Which form is aorist active participle in the regular model?',['λύσας','λύων','λυόμενος','λύει'],0,'λύσας is aorist active participle nominative masculine singular.')
      ],'State the participle’s aspectual morphology and then separately argue any temporal relation to the main verb from context.'),
    E(33,'Analyze participial relationships from syntax before choosing labels such as temporal, causal, concessive, or attendant circumstance.',
      {greek:'τοῦ διδασκάλου λέγοντος',prompt:'What construction shape should you test for?',explanation:'A genitive noun/pronoun plus genitive participle can form a genitive-absolute construction when it is syntactically detached from the main clause.'},
      {left:'ὁ λέγων',right:'τοῦ ἀνθρώπου λέγοντος',prompt:'What structural difference matters?',explanation:'The first is an articular participial phrase; the second has the morphology of a genitive noun+participle construction. Their clause relationships differ.'},[
        P('What should be established before calling a participle “causal”?',['Its morphology and syntactic attachment','Its English translation','Its tense-form alone','Its dictionary gloss'],0,'Fine-grained semantic labels require a secure structural analysis first.'),
        P('What is a key test for a genitive absolute?',['A genitive participant+participle relatively detached from the matrix syntax','Any genitive participle anywhere','Any participle after a noun','Any sentence with δέ'],0,'The construction is defined by its genitive participial clause relationship, not case alone.')
      ],'Name the participle’s head/participant and attachment first; only then propose a semantic relation and mark it as contextual.'),
    E(34,'Treat infinitives as verbal heads of nonfinite clauses that can take complements and participate in larger constructions.',
      {greek:'θέλω γράφειν',prompt:'Which verb is finite and which form completes it?',explanation:'θέλω is finite; γράφειν is an infinitive functioning as a verbal complement. The infinitive can still govern its own arguments.'},
      {left:'γράφει',right:'γράφειν',prompt:'What finite/nonfinite contrast is visible?',explanation:'γράφει carries person/number as a finite form; γράφειν is an infinitive and has no personal ending.'},[
        P('What should be mapped inside an infinitival clause?',['The infinitive plus its participants/complements','Only an English “to”','Only the lemma','Only punctuation'],0,'Infinitives retain verbal argument structure.'),
        P('What is unsafe?',['Assuming every Greek infinitive maps to English “to + verb” in the same syntactic way','Identifying the controlling verb','Checking aspectual stem','Mapping complements'],0,'Greek infinitives participate in several constructions that English renders differently.')
      ],'Draw the finite-clause spine first, then indent the infinitival clause beneath the word or construction that governs it.'),
    E(35,'Recognize subjunctive morphology and ἵνα-clauses while allowing purpose, content, and other contextual relations.',
      {greek:'ἵνα πιστεύητε',prompt:'What mood and clause marker should be recognized before translation?',explanation:'ἵνα introduces a dependent clause and πιστεύητε is subjunctive. The clause’s exact semantic relation is established contextually.'},
      {left:'πιστεύετε',right:'πιστεύητε',prompt:'What formal contrast do the vowel/ending patterns signal?',explanation:'The forms contrast indicative and subjunctive morphology in this present-system example.'},[
        P('Which mood commonly occurs with ἵνα?',['Subjunctive','Indicative only','Infinitive only','Participle only'],0,'ἵνα very commonly governs subjunctive forms.'),
        P('Does ἵνα always mean purpose?',['No','Yes'],0,'Purpose is common, but content/complement and other relations also occur depending on context.')
      ],'Identify marker + mood first, then state the clause relation as a contextual judgment rather than a meaning encoded by ἵνα alone.'),
    E(36,'Recognize imperative morphology and analyze commands/prohibitions without importing simplistic aspect-based command rules.',
      {greek:'μὴ φοβοῦ',prompt:'Identify the negator and command form before paraphrasing the force.',explanation:'μή is common in prohibitions and φοβοῦ is an imperative form. Pragmatic force depends on context, relationship, and discourse.'},
      {left:'λύε',right:'λῦσον',prompt:'What verbal-system contrast is present?',explanation:'These model present and aorist active imperative forms. The aspectual contrast should not be reduced to “keep doing” versus “do once” automatically.'},[
        P('Which negator is especially common with prohibitions?',['μή','οὐ only','καί','δέ'],0,'μή is common with imperatives and other nonindicative constructions.'),
        P('What is unsafe with imperative aspect?',['Turning present/aorist into an automatic continuous-vs-once rule','Parsing the form','Checking discourse context','Comparing commands'],0,'Command force depends on more than tense-form morphology.')
      ],'Explain what the imperative morphology tells you, then list the contextual factors needed to describe the command’s pragmatic force.'),
    E(37,'Recognize high-frequency μι-verbs through principal stems and endings instead of forcing them into λύω morphology.',
      {greek:'δίδωμι · ἔδωκεν',prompt:'How do these two forms belong to the same lexical family?',explanation:'δίδωμι uses μι-verb present morphology, while ἔδωκεν belongs to its aorist principal-part family. Principal-part recognition links them.'},
      {left:'δίδωσιν',right:'λύει',prompt:'What do these third-singular forms show?',explanation:'Both can be present active indicative third singular, but μι-verbs and ω-verbs use different surface morphology.'},[
        P('What is the best strategy for frequent μι-verbs?',['Learn their recurring stem/ending families and principal parts','Force them into λύω endings','Treat every form as unrelated vocabulary','Ignore person/number'],0,'A recognition network is more transferable than pretending they are regular ω-verbs.'),
        P('Which form belongs to δίδωμι?',['ἔδωκεν','ἔλαβεν','ἔγραψεν','ἦν'],0,'ἔδωκεν is an aorist form of δίδωμι.')
      ],'Choose one μι-verb and connect a present form to a different principal-part stem, naming the evidence that proves lexical identity.'),
    E(38,'Analyze genitives as noun-to-noun or clause relationships instead of translating the case with a universal “of.”',
      {greek:'ἡ ἀγάπη τοῦ θεοῦ',prompt:'List more than one plausible relationship before context narrows the genitive.',explanation:'The genitive relates τοῦ θεοῦ to ἡ ἀγάπη, but labels such as source, subjective, objective, or possessive require contextual argument.'},
      {left:'τοῦ θεοῦ',right:'ἀπὸ τοῦ θεοῦ',prompt:'Why is the second construction semantically more constrained?',explanation:'The preposition ἀπό adds an explicit relational contribution. A bare genitive has a broader range of possible noun-to-noun relations.'},[
        P('What does the genitive case guarantee?',['A genitive relationship that syntax/context must specify','English “of”','Possession only','Source only'],0,'Case identifies a grammatical relation, not one fixed semantic label.'),
        P('When should a fine-grained genitive label be assigned?',['After head-dependent relation and context are clear','Before parsing','From English translation only','From word order'],0,'Labels summarize contextual analysis; they should not replace it.')
      ],'State the head noun, dependent genitive, and at least two candidate relations before selecting one from context.'),
    E(39,'Treat dative functions as context-sensitive relations and read preposition+dative constructions as constructions.',
      {greek:'τῷ θεῷ',prompt:'What can morphology establish before a semantic label is chosen?',explanation:'The phrase is dative singular masculine. Whether the relation is recipient, sphere, association, instrument-like, or another function depends on the governing construction.'},
      {left:'τῷ θεῷ',right:'ἐν τῷ θεῷ',prompt:'Why does the preposition change the analysis?',explanation:'ἐν contributes lexical/syntactic structure that constrains the dative phrase. The bare dative and prepositional dative are not interchangeable labels.'},[
        P('What is the safest first dative analysis?',['Identify the governing verb/preposition and relation','Translate “to” automatically','Translate “by” automatically','Assume instrument'],0,'Dative functions emerge from construction and context.'),
        P('Does dative morphology by itself distinguish recipient from instrument-like use?',['No','Yes'],0,'The same case form can participate in multiple syntactic/semantic relations.')
      ],'Name the governor of a dative phrase before naming its function, and explain what evidence supports the label.'),
    E(40,'Recognize accusative complements beyond simple direct objects, including predicate/complement and double-accusative patterns.',
      {greek:'διδάσκει αὐτοὺς πολλά',prompt:'Why should both accusative elements be mapped before translation?',explanation:'A verb can govern more than one accusative relation. The learner should identify each complement’s role rather than assuming one must be a subject-like phrase.'},
      {left:'βλέπει αὐτούς',right:'διδάσκει αὐτοὺς πολλά',prompt:'What extra structural problem appears in the second clause?',explanation:'The second contains two accusative constituents whose different complement roles must be distinguished from the verb’s semantics and syntax.'},[
        P('Is every accusative a direct object?',['No','Yes'],0,'Accusative forms serve several complement and adverbial relations.'),
        P('What should be checked in a double-accusative-looking clause?',['The verb’s valency and the relation of each accusative','Which accusative comes first','Which noun is longer','Which one has an article'],0,'Verb semantics and construction determine how multiple accusatives relate.')
      ],'Map each accusative to the verb separately and justify why its role is object, complement, extent, or another relation.'),
    E(41,'Use article position to identify attributive, predicate, and substantival structures without equating anarthrous with indefinite.',
      {greek:'ὁ καλὸς ποιμήν',prompt:'Where is the adjective relative to article and noun?',explanation:'The adjective stands between article and noun, a common first-attributive-position pattern.'},
      {left:'ὁ καλὸς ποιμήν',right:'καλὸς ὁ ποιμήν',prompt:'What syntactic contrast does position suggest?',explanation:'The first is attributive-position morphology; the second is predicate-position structure. Context still determines the complete clause interpretation.'},[
        P('Which phrase is a first attributive-position pattern?',['ὁ καλὸς ποιμήν','καλὸς ὁ ποιμήν','ὁ ποιμὴν καλός','καλὸς ποιμήν'],0,'Article–adjective–noun is a standard first attributive pattern.'),
        P('Does absence of the article automatically mean “a/an”?',['No','Yes'],0,'Greek article usage is broader and structurally different from English article usage.')
      ],'Describe article position structurally first; only afterward discuss definiteness or English article choices.'),
    E(42,'Read participial and infinitival clauses as internal structures attached to a matrix clause.',
      {greek:'θέλω γράφειν λόγον',prompt:'Identify the finite head, nonfinite head, and complement.',explanation:'θέλω is the finite head, γράφειν the infinitive complement, and λόγον can function as the infinitive’s object. Nonfinite clauses retain internal argument structure.'},
      {left:'ὁ πιστεύων',right:'πιστεύων λέγει',prompt:'What changes in the participle’s syntactic attachment?',explanation:'The article can substantivize the first participle; in the second, the participle must be related to the finite clause by context and agreement.'},[
        P('What should be identified before choosing “temporal,” “causal,” or another participial label?',['Head, participants, complements, and attachment','English translation','Tense-form only','Word order only'],0,'Structural mapping precedes fine-grained semantic labeling.'),
        P('Can an infinitive govern its own object?',['Yes','No'],0,'Infinitives remain verbal and can take complements.')
      ],'Bracket the matrix clause and nonfinite clause separately, then draw the dependency that connects them.'),
    E(43,'Bracket subordinate clauses from their markers and mood combinations before assigning semantic labels.',
      {greek:'ἐὰν μένητε ...',prompt:'What construction does ἐάν lead you to expect?',explanation:'ἐάν commonly introduces a conditional protasis with a subjunctive verb. The pragmatic force of the condition must be read in context.'},
      {left:'ἐάν + subjunctive',right:'ἵνα + subjunctive',prompt:'Why does shared mood not make the constructions equivalent?',explanation:'The conjunction/marker contributes different clause relations. Mood is only one part of the construction.'},[
        P('Which pairing is common in conditions?',['ἐάν + subjunctive','ἐάν + participle only','ἵνα + nominative','ὥστε + article only'],0,'ἐάν commonly combines with the subjunctive.'),
        P('What should you do before translating a multi-clause sentence?',['Bracket clause boundaries and identify markers','Translate left-to-right word by word','Ignore conjunctions','Assume punctuation proves the syntax'],0,'Clause architecture should be visible before translation decisions.')
      ],'Name the clause marker, verb mood, and matrix/subordinate relationship before choosing a label such as condition, purpose, content, or result.'),
    E(44,'Use word order as one discourse signal among morphology, connectors, reference tracking, and context.',
      {greek:'θεὸς ἦν ὁ λόγος',prompt:'Which phrase is morphologically marked as the articular subject candidate, and what should not be inferred from initial position alone?',explanation:'ὁ λόγος is the articular nominative phrase; θεός is also nominative and functions predicatively in the clause. Initial position alone does not license a generic “emphasis” claim.'},
      {left:'ὁ λόγος ἦν θεός',right:'θεὸς ἦν ὁ λόγος',prompt:'What can reordered constituents potentially affect without changing their case morphology?',explanation:'Constituent order can contribute to information structure or discourse prominence, but the specific effect must be argued from context rather than assumed.'},[
        P('Does clause-initial position automatically equal emphasis?',['No','Yes'],0,'Prominence claims require discourse evidence beyond position alone.'),
        P('Which evidence set best supports a word-order claim?',['Order + morphology + connectors + discourse context','Order alone','English translation alone','Accent alone'],0,'Information-structure analysis integrates multiple signals.')
      ],'Make one observation about constituent order and one separate interpretation of its discourse effect; state what evidence connects them.'),
    E(45,'Sustain comprehension across 1 John while reducing tool dependence and tracking recurring lexical/syntactic patterns.',
      {greek:'ὁ θεὸς ἀγάπη ἐστίν',prompt:'Read the clause first as structure: subject, predicate nominative, copula.',explanation:'The articular ὁ θεός is the subject candidate; ἀγάπη functions predicatively with ἐστίν. Familiar theology should not replace syntactic analysis.'},
      {left:'single-verse parse',right:'paragraph tracking',prompt:'What new skill defines guided-book reading?',explanation:'The learner must preserve clause-to-clause reference, lexical chains, and argument flow instead of resetting analysis at every verse.'},[
        P('What should happen before opening a full parse in guided reading?',['Attempt the clause and identify the actual blocker','Reveal every word','Translate from memory','Skip the paragraph'],0,'Tool-light reading depends on diagnosing what help is genuinely needed.'),
        P('Why are recurring words in 1 John especially useful?',['They build automatic recognition across discourse','They prove one gloss fits every occurrence','They eliminate syntax','They replace review'],0,'Repeated contextual encounters strengthen fluent lexical and syntactic recognition.')
      ],'After reading a paragraph, summarize its clause flow in Greek-linked terms before consulting an English translation.'),
    E(46,'Maintain narrative flow in Mark while selectively analyzing tense-form shifts, participant reference, and scene boundaries.',
      {greek:'καὶ λέγει αὐτοῖς ...',prompt:'What should you track before explaining the historical present?',explanation:'Identify the speaker, recipients, clause connection, and surrounding verb chain. The historical present’s discourse effect is a contextual question, not an automatic “vividness” label.'},
      {left:'parse every verb',right:'selective blocker analysis',prompt:'Which behavior better supports fluency once forms are familiar?',explanation:'Selective analysis preserves discourse flow while still stopping where morphology or syntax blocks comprehension.'},[
        P('When should a fluent reader stop for a full parse?',['When a form blocks comprehension or is a targeted item','At every finite verb','Never','Only at chapter boundaries'],0,'Selective analysis balances fluency with accuracy.'),
        P('What should a historical present be called before assigning a discourse effect?',['A present-form verb in past narrative context','Automatically vivid','A future','A textual variant'],0,'Morphological identification and discourse interpretation are separate steps.')
      ],'Retell the scene structure from the Greek, naming connectors and speaker changes, before analyzing one selected verb in depth.'),
    E(47,'Read Philippians by finding the finite-clause spine and attaching embedded structures instead of translating a chain of glosses.',
      {greek:'χαίρετε ἐν κυρίῳ',prompt:'Identify the finite command and its prepositional complement before expanding the discourse context.',explanation:'χαίρετε is a finite imperative; ἐν κυρίῳ is a prepositional phrase. Longer Pauline sentences use the same dependency logic at greater depth.'},
      {left:'finite spine',right:'embedded nonfinite material',prompt:'Why should these be separated visually?',explanation:'Finding the finite backbone prevents participles, infinitives, and relative clauses from obscuring the main predication.'},[
        P('What should be located first in a long Pauline sentence?',['Finite-clause spine','Every lexicon sense','Modern punctuation only','The rarest word'],0,'The finite spine anchors the sentence architecture.'),
        P('How should modern punctuation be treated?',['Useful editorial guidance to verify against grammar','Ancient inspired syntax marks','Irrelevant noise','A replacement for morphology'],0,'Modern punctuation helps reading but remains editorial.')
      ],'Diagram one sentence with the finite clause at the left margin and subordinate/nonfinite structures indented beneath their governors.'),
    E(48,'Use lexicons to constrain contextual sense from attested usage rather than to collect every possible gloss.',
      {greek:'κόσμος',prompt:'Why is a lemma lookup only the beginning of interpretation?',explanation:'A lexicon may list several attested senses for κόσμος; syntax, collocation, genre, and local discourse determine which sense is plausible in a particular occurrence.'},
      {left:'semantic range',right:'contextual sense',prompt:'What is the difference?',explanation:'Semantic range summarizes attested possibilities across usage; contextual sense is the narrower meaning licensed in one occurrence.'},[
        P('What is the root fallacy?',['Treating etymology/root history as the controlling contextual meaning','Checking a lexicon','Comparing collocations','Reading the clause'],0,'Historical formation can be interesting without determining synchronic contextual sense.'),
        P('What is illegitimate totality transfer?',['Importing the whole semantic range into one occurrence','Selecting a contextual sense','Checking syntax','Comparing corpus examples'],0,'A single occurrence normally instantiates a contextually constrained sense, not every dictionary possibility.')
      ],'Write a lexical claim in two stages: first list plausible attested senses, then justify why the local construction favors one of them.'),
    E(49,'Keep edition readings, edition comparisons, and manuscript evidence in separate evidence layers.',
      {greek:'John 1:18',prompt:'What can the current edition itself establish, and what would require an apparatus?',explanation:'The edition establishes what it prints. Claims about individual manuscript witnesses, dates, or textual weight require actual apparatus/source evidence, not merely an edition-to-edition difference.'},
      {left:'edition difference',right:'manuscript evidence',prompt:'Why are these not the same kind of evidence?',explanation:'Edition differences compare editorial decisions; manuscript evidence concerns the underlying witnesses and must be sourced independently.'},[
        P('Can an edition diff prove which manuscript supports a reading?',['No','Yes'],0,'Witness claims require manuscript/apparatus data.'),
        P('What should be recorded in tool-assisted textual work?',['Edition/source provenance and evidence level','Only the preferred reading','No uncertainty','Only translation differences'],0,'Provenance makes the textual claim auditable and prevents tools from being treated as anonymous authority.')
      ],'For a variant note, label each statement as edition fact, manuscript evidence, transcriptional judgment, or interpretive consequence.'),
    E(50,'Demonstrate an independent four-pass reading process in which tools verify analysis rather than lead it.',
      {greek:'γραμματική → σύνταξις → λόγος → ἑρμηνεία',prompt:'What order of reasoning does the practicum require?',explanation:'Begin with form and clause structure, then discourse/lexical verification, then bounded interpretation. The learner must distinguish what is certain from what is inferred.'},
      {left:'tool-first reading',right:'attempt → verify',prompt:'Which pattern demonstrates independence?',explanation:'Independent reading starts with the learner’s own morphological and syntactic analysis and uses tools selectively to test unresolved points.'},[
        P('What comes before a theological conclusion in the evidence ladder?',['Grammatical facts and contextual judgments','Nothing','A root study only','English punctuation'],0,'Broader conclusions should be built on explicit lower-level evidence.'),
        P('What should you do when two interpretations remain grammatically possible?',['State the uncertainty and weigh contextual evidence','Pretend the grammar decides one','Choose the familiar theology automatically','Ignore the ambiguity'],0,'Independent exegesis represents uncertainty instead of hiding it.')
      ],'Complete a cold read, morphology pass, syntax pass, and tool pass, then mark every final claim as fact, judgment, possibility, or broader theological conclusion.')
  ];
  return Object.freeze({
    version:'v1.1.0',
    role:'supplementary-unscored-learning-experience',
    policy:Object.freeze({
      masteryEvidence:false,
      practiceItemsPerUnit:2,
      note:'V1.1 enrichment adds observe/contrast/reasoning/re-read practice. Supplementary practice is intentionally unscored; canonical mastery remains owned by the 150 reviewed course checkpoints.'
    }),
    unitCount:units.length,
    units:Object.freeze(units)
  });
});
