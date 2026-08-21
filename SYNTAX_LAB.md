# BG7 — Syntax & Translation Laboratory

BG7 moves Koinē Path from word-level parsing toward clause- and sentence-level reading.

## Core boundary

BG6 morphology is deterministic source data. BG7 syntax is a **separate reviewed annotation layer**.

A MorphGNT token can establish that a form is, for example, an aorist participle. That does not by itself establish whether the participle is temporal, causal, concessive, attendant circumstance, or something else in discourse. BG7 therefore stores syntactic relationships separately and treats disputed classifications explicitly.

The application must preserve this order:

1. morphology;
2. attachment / dependency;
3. syntactic relationship;
4. contextual interpretation;
5. translation choice;
6. theological inference.

No later layer may be smuggled into an earlier one.

## Curriculum coverage

The reviewed exercise inventory covers canonical Units 38–44:

- **38** — genitive relationships;
- **39** — dative relationships;
- **40** — accusative relationships;
- **41** — article syntax, substantives, attributive/predicative patterns;
- **42** — participial and infinitival syntax;
- **43** — conditional, purpose, result, content, and other dependent clauses;
- **44** — word order, information structure, discourse flow, and sentence analysis.

Exercises are linked to real BG6 corpus references. The validation workflow builds the complete pinned corpus and rejects any BG7 exercise whose book/chapter/verse reference does not exist in that source.

## Exercise modes

BG7 includes:

- **relation** — identify dependency between constituents;
- **article** — determine how the article structures a noun/adjective/infinitive phrase;
- **participle** — locate a participial unit relative to the finite predication;
- **infinitive** — identify infinitival clause function;
- **clause** — identify subordination and clause boundaries;
- **discourse** — distinguish information structure from morphology;
- **ambiguity** — identify what grammar constrains without pretending it settles a disputed reading;
- **translation** — preserve Greek relationships while drafting natural English.

## Assistance model

The sequence is:

**Attempt → Hint → Structure → Explanation**

Assistance is passed to BG3:

- no help → full evidence value;
- hint → reduced evidence;
- structure diagram → stronger assistance penalty;
- full explanation → strongest assistance penalty.

A saved translation draft is learner work, not evidence of correctness. Drafting alone never grants mastery.

## Translation bench

BG7 deliberately does not compare a learner draft against one copyrighted English Bible wording or perform naive word-by-word string matching.

The translation workflow is:

1. identify the main finite predication;
2. identify subordinate, participial, infinitival, nominal, and prepositional relationships;
3. make a structural English draft;
4. revise into idiomatic English;
5. check the revision against the Greek again.

The reviewed exercise checks whether the learner understands the structural relationship. A later AI tutor may give prose feedback, but only through the secure and grounded architecture planned for BG8.

## Ambiguity contract

An ambiguity exercise must not reward false certainty.

Examples currently include:

- **Matthew 28:19** — morphology establishes that πορευθέντες is a participle related to μαθητεύσατε; the exact discourse label requires additional argument.
- **Philippians 1:9** — the ἵνα clause is clearly subordinate to προσεύχομαι, while narrow labels such as content/purpose require finer analysis.
- **2 Timothy 3:16** — article absence does not function as a magic rule that independently settles every translation or theological question.
- **Romans 1:1** — a genitive attachment can be secure even when semantic subtype labels remain debatable.

## BG3 integration

For an accessible unit, a syntax response contributes to recognition or application mastery according to the exercise type. Incorrect answers generate typed remediation such as:

- `syntax_relation`;
- `translation_overliteral`;
- `word_order_overreliance` where appropriate in later expansions.

For a locked unit, the same activity is recorded as exposure only.

## Adaptive selection

The engine increases weight for:

- unseen exercises;
- low-accuracy exercises;
- BG3 review-due units.

It down-weights recently shown exercises and locked future units.

## Reader integration

The laboratory can inspect the current BG6 reader book/chapter/selected verse and open a registered reviewed syntax exercise when one exists for that location.

BG7 does not pretend that every one of the 7,927 token-bearing verses already has reviewed syntax annotation. The full Greek text is available everywhere; high-confidence syntax exercises expand as reviewed content is added.

## Persistence

Local state is stored under:

`koine-path-syntax-lab-v1`

It records:

- attempts and accuracy;
- per-exercise performance;
- per-unit performance;
- translation drafts;
- recent exercise IDs.

Canonical BG3 mastery remains stored in the learning-engine state rather than duplicated here.

## Validation

CI validates:

- substantial exercise inventory;
- at least four reviewed exercises for each Unit 38–44;
- unique exercise IDs;
- valid answer indices and four-option structure;
- required hints, explanations, and structure diagrams;
- explicit reviewed annotation provenance;
- presence of ambiguity training;
- presence of translation scaffolds;
- every passage reference against the generated pinned BG6 corpus;
- syntax-engine evidence, locked-unit exposure, assistance, draft persistence, and location matching.

## Scope boundary

BG7 does not yet provide a machine-generated syntax tree for the whole New Testament, a full discourse database, textual-variant analysis, or generative translation grading. Those require reviewed external data or the secure grounded AI layer planned for later phases.