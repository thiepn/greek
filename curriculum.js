window.KOINE_CURRICULUM = Object.freeze({
  version: 'bg15.0',
  title: 'Koinē Path Canonical Curriculum',
  totalUnits: 50,
  principles: [
    'attempt-before-reveal',
    'recognition-before-production',
    'real-text-early',
    'deterministic-grammar-facts',
    'lexical-restraint',
    'tense-form-is-not-a-mechanical-time-or-action-kind',
    'grammar-is-not-theology'
  ],
  mastery: {
    unit: { concept: 80, recognition: 85, application: 80 },
    stageComposite: 85,
    morphologyRecognition: 88,
    minimumRequiredCompetency: 75
  },
  readerLevels: [
    { id: 'R0', name: 'Fully guided' },
    { id: 'R1', name: 'Morphology guided' },
    { id: 'R2', name: 'Syntax guided' },
    { id: 'R3', name: 'Tool-light reading' },
    { id: 'R4', name: 'Independent practicum' }
  ],
  stages: [
    {
      id: 'S0', title: 'Script & Sound', units: [1,2,3,4], vocabTarget: 20, reader: ['R0'],
      outcome: 'Decode Greek script comfortably enough to begin real language learning.',
      unitTitles: [
        'Alphabet recognition',
        'Vowels, diphthongs, consonant combinations & syllables',
        'Breathings, accents, punctuation & orthographic marks',
        'Reading Greek aloud: function words & micro-texts'
      ]
    },
    {
      id: 'S1', title: 'Nominal Foundation', units: [5,6,7,8,9,10], vocabTarget: 80, reader: ['R0'],
      outcome: 'Understand case, agreement, articles, basic nouns, adjectives, and core prepositions.',
      unitTitles: [
        'The article: gender, number & case',
        'Case relationships: nominative & accusative',
        'Second-declension masculine nouns',
        'Second-declension neuter nouns',
        'First-declension feminine nouns',
        'Adjectives, agreement & core prepositions'
      ]
    },
    {
      id: 'S2', title: 'Present-System Verbs', units: [11,12,13,14,15,16], vocabTarget: 180, reader: ['R0','R1'],
      outcome: 'Recognize finite present-system verbs and combine verbal and nominal information in clauses.',
      unitTitles: [
        'Verb anatomy: stem, connecting vowel & ending',
        'Present active indicative',
        'εἰμί and common irregular present forms',
        'Present middle/passive indicative',
        'Contract-verb recognition',
        'Clause reading: subject, predicate, negation & conjunctions'
      ]
    },
    {
      id: 'S3', title: 'Indicative Systems, Aspect & Principal Parts', units: [17,18,19,20,21,22,23], vocabTarget: 320, reader: ['R1'],
      outcome: 'Recognize the major indicative tense-forms and stems, use principal parts as a recognition system, and keep morphological form distinct from contextual temporal/aspectual interpretation.',
      unitTitles: [
        'Imperfect indicative',
        'Future active & middle',
        'First aorist active & middle',
        'Second aorist recognition',
        'Aorist & future passive',
        'Principal parts as a recognition system',
        'Indicative synthesis in narrative'
      ]
    },
    {
      id: 'S4', title: 'Nominal Expansion', units: [24,25,26,27,28,29], vocabTarget: 450, reader: ['R1','R2'],
      outcome: 'Handle the majority of recurring nominal forms and pronoun systems.',
      unitTitles: [
        'Third-declension strategy: identify the stem',
        'Common third-declension patterns',
        'Personal pronouns & αὐτός',
        'Demonstratives and intensive uses',
        'Relative & interrogative pronouns',
        'Numerals, πᾶς-type adjectives & mixed nominal review'
      ]
    },
    {
      id: 'S5', title: 'Nonindicative & Advanced Verbal Forms', units: [30,31,32,33,34,35,36,37], vocabTarget: 600, reader: ['R2'],
      outcome: 'Recognize and interpret major nonindicative forms and high-frequency irregular verbs.',
      unitTitles: [
        'Perfect & pluperfect systems',
        'Participles: morphology and verbal/adjectival nature',
        'Present & aorist participle patterns',
        'Participles in context & genitive absolute',
        'Infinitives and infinitival clauses',
        'Subjunctive and common ἵνα constructions',
        'Imperatives, prohibitions & commands',
        'μι verbs & high-frequency irregulars'
      ]
    },
    {
      id: 'S6', title: 'Syntax & Clause Architecture', units: [38,39,40,41,42,43,44], vocabTarget: 800, reader: ['R2','R3'],
      outcome: 'Read relationships across phrases, clauses, and sentences rather than parsing isolated words.',
      unitTitles: [
        'Genitive functions & noun relationships',
        'Dative functions & prepositional overlap',
        'Accusative functions & complements',
        'Article syntax and attributive/predicative patterns',
        'Participial & infinitival syntax',
        'Conditional, purpose, result & dependent clauses',
        'Word order, information structure & discourse flow'
      ]
    },
    {
      id: 'S7', title: 'Reading Fluency & Exegetical Competence', units: [45,46,47,48,49,50], vocabTarget: 1000, stretchVocabTarget: 1200, reader: ['R3','R4'],
      outcome: 'Transition from grammar student to an increasingly independent and responsible NT reader.',
      unitTitles: [
        'Guided-book reading: 1 John',
        'Narrative fluency: extended Mark reading',
        'Epistolary fluency: Philippians',
        'Lexicon method & responsible word study',
        'Textual variants, edition awareness & tool-assisted exegesis',
        'Independent reading practicum & final assessment'
      ]
    }
  ]
});