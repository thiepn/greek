# BG1 — Full Curriculum Architecture

## Product learning goal

Koinē Path exists to move a learner from zero Greek to increasingly independent New Testament reading. The course is not considered successful merely because a learner has completed grammar chapters or memorized paradigms.

The primary exit outcome is that the learner can:

1. read continuous New Testament Greek with substantially reduced dependence on interlinear help;
2. identify common morphology accurately and quickly;
3. follow clause structure and major syntactic relationships;
4. use vocabulary, lexicons, and parsing tools responsibly;
5. distinguish grammatical observation from interpretive inference;
6. recognize when a form or construction is genuinely ambiguous;
7. continue improving through independent reading after the structured course ends.

The learning sequence therefore follows the loop:

**Learn → Retrieve → Parse → Read → Explain → Review → Read again**

Reading appears from the beginning and becomes progressively less assisted.

---

## Curriculum invariants

These rules apply to every stage and future lesson.

### 1. Attempt before reveal

Help must be progressive:

**attempt → light cue → stronger cue → lemma → full parse → translation**

The app should not train a tap-to-English habit.

### 2. Recognition before production

The primary goal is reading. Greek-to-analysis recognition, parsing, and comprehension therefore outrank English-to-Greek composition. Limited production exercises are permitted when they improve recognition of morphology.

### 3. Real text early

Every stage includes authentic New Testament reading. Early passages may be highly scaffolded, but the learner should repeatedly encounter forms in context instead of only in paradigms and artificial sentences.

### 4. Grammar facts are deterministic

Canonical forms, lemma IDs, morphology, vocabulary frequency, passage text, and accepted answer sets belong in verified data. Generative AI may explain or coach those facts but may not become the source of truth for them.

### 5. No simplistic tense/aspect slogans

The course must not teach rules such as “aorist means once-for-all action” or treat tense forms as mechanical theological signals. Tense, aspect, discourse context, Aktionsart, and temporal reference must be kept distinct where relevant.

### 6. Lexical restraint

Glosses are learning aids, not definitions. The system must discourage illegitimate totality transfer, etymological fallacies, and the assumption that every possible gloss is present in every occurrence.

### 7. Grammar is not theology

The tutor and lesson system must distinguish statements such as:

- **Morphology:** what the form is.
- **Syntax:** what relationships the construction permits or favors.
- **Semantics:** what meaning is plausible in context.
- **Interpretation:** what the author likely intends.
- **Theology:** how a passage relates to broader doctrinal claims.

AI explanations should explicitly mark when they move beyond grammar into interpretation.

### 8. Edition transparency

Passages must carry an explicit Greek-text edition identifier. The initial open-text target is SBLGNT-compatible content. Variant readings must never be silently merged or harmonized.

### 9. Pronunciation is configurable

Pronunciation supports memory and oral fluency but is not a doctrinal competency. The architecture must support multiple consistent profiles later, including a reconstructed Koine-oriented profile and an Erasmian profile. A learner should not be blocked for using another consistent system.

### 10. Mastery can decay

A completed lesson is not permanently mastered. Long-term performance, review history, reading accuracy, and repeated errors may lower competency estimates and trigger remediation.

---

# Course structure

The canonical course contains **50 units across 8 stages**.

## Stage 0 — Script & Sound

**Units 1–4**  
**Target:** decode Greek script comfortably enough to begin real language learning.  
**Vocabulary target:** 0–20 recognition words from examples only.

1. Alphabet recognition
2. Vowels, diphthongs, consonant combinations, and syllables
3. Breathings, accents, punctuation, iota subscript, and movable nu awareness
4. Reading Greek aloud: names, high-frequency function words, and micro-texts

### Stage gate

- ≥95% letter recognition
- read an unfamiliar short Greek line without transliteration
- recognize common punctuation and breathing marks
- no requirement to reproduce every accent from memory

---

## Stage 1 — Nominal Foundation

**Units 5–10**  
**Target:** understand case, agreement, articles, basic nouns, and prepositions.  
**Cumulative vocabulary target:** ~80 lemmas.

5. The article: gender, number, and case
6. Case as grammatical relationship: nominative and accusative
7. Second-declension masculine nouns
8. Second-declension neuter nouns and neuter agreement
9. First-declension feminine nouns
10. Adjectives, agreement, and core prepositions by case

### Reading focus

Highly scaffolded clauses from John, Mark, and 1 John emphasizing articles, noun phrases, prepositions, and simple copular clauses.

### Stage gate

- ≥90% on article recognition
- ≥90% on taught first/second-declension parsing over recent items
- identify subject/object candidates without relying only on word order
- explain agreement in simple article–adjective–noun groups

---

## Stage 2 — Present-System Verbs

**Units 11–16**  
**Target:** recognize finite present-system verbs and combine verbal and nominal information in clauses.  
**Cumulative vocabulary target:** ~180 lemmas.

11. Verb anatomy: stem, connecting vowel, personal ending
12. Present active indicative
13. εἰμί and common irregular present forms
14. Present middle/passive indicative and voice awareness
15. Contract-verb recognition and common spelling changes
16. Clause reading: subject, predicate, complements, negation, conjunctions

### Reading focus

Short present-heavy passages from John 1, 1 John, and selected sayings in the Synoptics.

### Stage gate

- ≥90% person/number recognition for taught present forms
- identify likely subject and main verb in simple clauses
- distinguish form/voice from contextual meaning
- translate short clauses without word-for-word English order dependence

---

## Stage 3 — Indicative Timeframes & Principal Parts

**Units 17–23**  
**Target:** recognize the major indicative systems and begin thinking in stems/principal parts rather than isolated endings.  
**Cumulative vocabulary target:** ~320 lemmas.

17. Imperfect active and middle/passive indicative
18. Future active and middle; future morphology
19. First aorist active and middle
20. Second aorist recognition
21. Aorist and future passive
22. Principal parts as a recognition system
23. Indicative synthesis: present, imperfect, future, aorist in narrative

### Reading focus

Narrative selections from Mark and Luke with increasing removal of morphological hints.

### Stage gate

- ≥88% tense-form identification on known vocabulary
- ≥85% complete parsing of mixed indicative forms
- recognize augment, tense formative, and major stem changes
- narratively distinguish imperfective/perfective choices without simplistic “kind of action” rules

---

## Stage 4 — Nominal Expansion

**Units 24–29**  
**Target:** handle the majority of recurring nominal forms and pronoun systems.  
**Cumulative vocabulary target:** ~450 lemmas.

24. Third-declension noun strategy: stem recognition
25. Common third-declension patterns
26. Personal pronouns and αὐτός
27. Demonstratives and intensive uses
28. Relative and interrogative pronouns
29. Numerals, πᾶς-type adjectives, and mixed nominal review

### Reading focus

John, 1 John, and Mark passages containing dense pronoun reference and third-declension forms.

### Stage gate

- ≥85% third-declension recognition on taught patterns
- resolve pronoun antecedents in straightforward contexts
- identify substantive adjective/pronoun behavior
- maintain ≥85% combined nominal parsing accuracy

---

## Stage 5 — Nonindicative & Advanced Verbal Forms

**Units 30–37**  
**Target:** recognize and interpret the major nonindicative verbal systems and high-frequency irregular verbs.  
**Cumulative vocabulary target:** ~600 lemmas.

30. Perfect and pluperfect systems; reduplication
31. Participles: morphology and verbal/adjectival nature
32. Participles: present and aorist patterns
33. Participles: genitive absolute and major contextual functions
34. Infinitives and infinitival clauses
35. Subjunctive and common ἵνα constructions
36. Imperatives, prohibitions, and commands
37. μι verbs and high-frequency irregular verbal forms

### Reading focus

Mixed selections from Mark, John, Philippians, and Ephesians. Reader hints now default to syntax cues rather than full morphology.

### Stage gate

- ≥85% mixed participle parsing
- identify infinitive/subjunctive/imperative morphology reliably
- recognize major μι-verb forms without requiring exhaustive paradigm production
- explain a participle’s grammatical relationship before assigning a fine-grained semantic label

---

## Stage 6 — Syntax & Clause Architecture

**Units 38–44**  
**Target:** move from parsing individual words to reading relationships across phrases, clauses, and sentences.  
**Cumulative vocabulary target:** ~800 lemmas.

38. Genitive functions and noun-to-noun relationships
39. Dative functions and prepositional overlap
40. Accusative functions, complements, and double-accusative awareness
41. Article syntax, substantives, and attributive/predicative patterns
42. Participial and infinitival syntax in context
43. Conditional, purpose, result, and dependent clauses
44. Word order, information structure, conjunctions, discourse flow, and sentence diagramming

### Reading focus

Paragraph-level reading from Philippians, Ephesians, 1 John, and narrative contrast passages.

### Stage gate

- identify main clause and subordinate structures in a multi-clause sentence
- explain major case relationships in context without reducing them to one English gloss
- distinguish morphology from syntactic function
- achieve ≥80% syntax-question accuracy across unfamiliar passages at the current difficulty level

---

## Stage 7 — Reading Fluency & Exegetical Competence

**Units 45–50**  
**Target:** transition from “student working through a grammar” to “reader who can continue independently.”  
**Core cumulative vocabulary target:** ~1,000 lemmas.  
**Stretch target:** ~1,200 lemmas, passage-driven.

45. Guided-book reading: 1 John
46. Narrative fluency: extended Mark reading
47. Epistolary fluency: Philippians
48. Lexicon method, semantic range, collocations, and responsible word study
49. Textual variants, edition awareness, and tool-assisted exegesis
50. Independent reading practicum and final competency assessment

### Final practicum

The learner receives an unfamiliar NT passage at an appropriate difficulty and completes four passes:

1. **Cold read:** identify what can be understood without tools.
2. **Morphology pass:** parse only forms genuinely needed.
3. **Syntax pass:** map major clause relationships.
4. **Tool pass:** consult lexicon/notes selectively and revise the translation/explanation.

The learner must then explain which conclusions are grammatical facts, which are contextual judgments, and which are interpretive possibilities.

---

# Vocabulary architecture

Vocabulary is frequency-first but passage-sensitive.

## Cumulative recognition targets

| Stage | Approx. target |
|---|---:|
| 0 | 0–20 exposure words |
| 1 | 80 lemmas |
| 2 | 180 lemmas |
| 3 | 320 lemmas |
| 4 | 450 lemmas |
| 5 | 600 lemmas |
| 6 | 800 lemmas |
| 7 | 1,000 core / 1,200 stretch |

Rules:

- High-frequency function words are introduced very early.
- Passage-critical lower-frequency words may be temporarily pre-taught.
- Vocabulary mastery is recognition-centered.
- Principal parts may be attached to verbs when pedagogically useful.
- The learner should encounter vocabulary in phrases and verses, not only isolated cards.
- Gloss lists must remain short and context-sensitive for beginners.

---

# Lesson internal structure

Every normal unit should follow this architecture.

1. **Orientation** — what new reading problem this unit solves.
2. **Observe** — inspect a real or controlled Greek example before formal explanation.
3. **Explain** — concise grammar model.
4. **Recognize** — rapid identification tasks.
5. **Parse** — structured morphology retrieval.
6. **Contrast** — minimal pairs and confusable forms.
7. **Read** — authentic NT examples/passages.
8. **Translate / comprehend** — prioritize meaning over English mimicry.
9. **Explain your reasoning** — learner states the clue used.
10. **Checkpoint** — mastery measurement.
11. **Review injection** — weak forms enter spaced review.
12. **Return to Scripture** — re-read the initial passage with reduced assistance.

Not every screen must show all twelve steps, but every unit must cover their learning functions.

---

# Mastery model

A unit has four separate mastery dimensions:

- **Concept** — understands the rule or pattern.
- **Recognition** — identifies forms quickly.
- **Application** — parses/uses the rule in context.
- **Reading transfer** — succeeds in authentic text.

A single “lesson complete” boolean is insufficient for the final product.

## Provisional thresholds

### Unit completion

- concept checkpoint ≥80%
- recognition ≥85%
- application ≥80%
- at least one authentic-text transfer task completed

### Stage mastery

- composite ≥85%
- morphology/recognition ≥88% where morphology is a stage focus
- no required competency below 75%
- due review backlog below a configurable threshold
- stage reading assessment completed without unrestricted interlinear reveal

### Reading independence metric

Reading independence should rise when the learner:

- parses correctly without reveal;
- answers comprehension questions without translation;
- uses only light hints;
- reads longer spans before opening tools;
- succeeds on delayed re-reading.

It should fall or stagnate when the learner repeatedly jumps directly to full parse/translation.

---

# Error taxonomy

Every wrong answer should be classified when possible.

1. lemma confusion
2. case confusion
3. gender confusion
4. number confusion
5. person confusion
6. tense-form confusion
7. voice confusion
8. mood confusion
9. stem/principal-part failure
10. pronoun antecedent failure
11. syntax/function confusion
12. vocabulary retrieval failure
13. word-order overreliance
14. translation-overliteralism
15. lexical overreach
16. premature answer reveal

The review engine should target the error type, not simply repeat the same card indefinitely.

---

# Review and remediation rules

BG1 defines policy only; the scheduling algorithm belongs in a later review/SRS phase.

- A wrong morphology answer enters review immediately.
- Repeated errors trigger a minimal-pair drill.
- A failure after previous mastery lowers the relevant competency estimate.
- Difficult reader words can enter vocabulary review without forcing the learner to memorize every rare word.
- After multiple syntax failures, the learner should receive a simpler sentence using the same construction before returning to the original passage.
- Full-answer reveals count as assisted exposure, not mastery evidence.
- Correct answers after strong hints receive less mastery credit than unassisted answers.

---

# Reading progression

The reader has five assistance levels.

### R0 — Fully guided

Word selection, basic cues, morphology, and optional translation are readily available.

### R1 — Morphology guided

Vocabulary is supported, but learners attempt parsing first.

### R2 — Syntax guided

Common morphology is expected; hints focus on clause relationships.

### R3 — Tool-light reading

Only uncommon vocabulary and genuinely difficult forms receive proactive support.

### R4 — Independent practicum

No automatic glosses or parses. Tools are available only on deliberate request and usage is tracked.

Stages 0–1 primarily use R0; stages 2–3 move through R1; stages 4–5 emphasize R2; stage 6 uses R2–R3; stage 7 targets R3–R4.

---

# Assessment architecture

## Unit checks

Short, low-stakes, retrieval-heavy.

## Stage gates

Mixed forms plus unfamiliar authentic examples. Passing a stage gate unlocks the next stage but does not permanently remove older material from review.

## Cumulative checkpoints

After stages 2, 4, and 6:

- mixed morphology
- cumulative vocabulary
- short unseen reading
- error-profile review

## Final assessment

The final assessment should emphasize unfamiliar reading and tool judgment rather than paradigm recitation.

Suggested scoring dimensions:

- morphology 25%
- vocabulary/context 15%
- syntax 25%
- comprehension/translation 20%
- tool use and reasoning 15%

---

# Pronunciation policy

The app architecture must support a pronunciation profile ID on audio and pronunciation examples.

Initial planned profiles:

- `koine-reconstructed`
- `erasmian`

Pronunciation should be internally consistent within a learner profile. Accent-recitation expectations should not determine grammar mastery.

---

# Text and data policy

## Greek text

Initial preferred open edition: SBLGNT-compatible text under its applicable attribution requirements.

Every passage record should include:

- edition ID
- book/chapter/verse span
- token sequence
- punctuation
- variant-note flags where relevant

## Morphology

Morphology must be stored independently of the text layer so datasets can be upgraded or replaced without rewriting lesson content.

Each token should eventually support:

- surface form
- normalized form
- lemma
- part of speech
- morphology fields
- frequency metadata
- lesson competency links
- confidence/source metadata

## Grammar content

Human-reviewed lesson rules and examples are canonical. AI-generated prose must not overwrite canonical grammar content.

---

# AI tutor contract

The AI tutor may:

- ask Socratic questions;
- explain verified morphology and syntax;
- select or generate drills within a verified schema;
- diagnose learner error patterns;
- compare two learner translations;
- provide graded hints;
- suggest what to review next;
- explain why a tool result matters.

The AI tutor may not:

- invent a parse when canonical morphology is available;
- silently replace the configured Greek text;
- present disputed syntax as certain;
- derive theology from morphology alone;
- claim etymology determines contextual meaning;
- expose secret API credentials to the static client.

Where interpretation is disputed, responses should separate:

**grammatical constraints → plausible readings → interpretive arguments**.

---

# Dependency model

Units are sequential at the stage level but not all skills are strictly linear. The eventual engine should represent prerequisites as competency dependencies.

Examples:

- participles require noun/adjective agreement + verb tense recognition;
- genitive absolute requires participle recognition + genitive competence;
- conditional sentences require mood recognition + clause architecture;
- independent reading requires vocabulary, morphology, syntax, and tool-use competencies rather than completion of one final chapter.

A learner who places out of a competency should be able to skip redundant instruction while still completing transfer assessments.

---

# BG1 completion criteria

BG1 is complete when:

- the 8-stage / 50-unit canonical map is committed;
- every stage has an outcome, vocabulary target, reading focus, and gate;
- mastery dimensions and thresholds are defined;
- reader assistance levels are defined;
- error taxonomy is defined;
- text/morphology/content separation is defined;
- pronunciation policy is defined;
- AI tutor boundaries are defined;
- the application can read the machine-readable curriculum manifest without duplicating the curriculum structure in UI code.

This document is the canonical pedagogical contract for subsequent BG phases.