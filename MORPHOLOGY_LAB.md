# BG4 — Morphology Laboratory

BG4 is the canonical interactive morphology-training subsystem for Koinē Path.

## Purpose

The laboratory exists to make morphology recognition fast, accurate, contextual, and transferable to reading. It is not a paradigm slideshow and it does not reward answer revealing.

BG4 builds on:

- **BG1** — curriculum ownership and unit sequence;
- **BG2** — canonical Greek data/provenance rules;
- **BG3** — learner evidence, mastery, decay, remediation, and recommendations.

## Data boundary

`data/morphology-lab-data.js` contains reviewed pedagogical paradigm forms.

These forms are legitimate Greek training forms, but they are **not automatically labeled as corpus occurrences**. A future item may carry a canonical BG2 `corpusTokenId`; without one, its provenance remains `reviewed-pedagogical-paradigms`.

This prevents the app from implying that every generated paradigm form was directly ingested from the SBLGNT corpus.

## Current inventory

BG4 covers more than 100 reviewed forms across:

- the article;
- second-declension masculine nouns;
- second-declension neuter nouns;
- first-declension feminine nouns;
- adjective agreement;
- present active indicative;
- present middle/passive indicative;
- imperfect, future, aorist, passive aorist, and perfect recognition;
- pronouns;
- representative third-declension patterns;
- participles;
- infinitives;
- subjunctives;
- imperatives;
- common μι-verb recognition;
- six-slot principal-part systems.

The inventory is deliberately a reviewed foundation, not an exhaustive morphology database. Later content phases may add families while preserving the same item schema.

## Exercise modes

### Parse

Given a Greek form, identify the morphology.

Primary BG3 dimension: **recognition**.

### Build

Given a target morphology and lemma, choose the matching Greek form.

Primary BG3 dimension: **application**.

### Minimal contrast

Compare two forms of the same lemma that differ in one modeled feature and identify what changed.

Examples:

- case;
- number;
- gender;
- tense;
- voice;
- mood;
- person.

Primary BG3 dimension: **recognition**.

### Principal parts

Identify which of the six conventional principal-part slots a form represents.

Primary BG3 dimension: **recognition**, owned by Unit 22.

## Syncretism and ambiguity

BG4 must never force a false one-form/one-parse model.

If a contextless surface form has several legitimate parses in the modeled inventory, `combinedParse()` returns all modeled possibilities.

Examples include article forms such as `τῶν`, where gender is not recoverable from the form alone, and verbal forms such as `λύω`, where present active indicative 1sg and present active subjunctive 1sg are formally identical.

Context-sensitive disambiguation belongs to the reader/syntax layer, not to a contextless morphology quiz.

## Assistance

The laboratory supports:

1. hint;
2. lemma;
3. full answer reveal.

Assistance is sent to BG3. A later correct response therefore receives the same evidence penalty defined by the learning engine.

Full reveal is not independent recall.

## Error diagnosis

Wrong answers are mapped to BG3 error categories where the difference is diagnosable:

| Feature missed | Error type |
|---|---|
| case | `case_confusion` |
| number / gender | `gender_number_agreement` |
| person | `person_number` |
| tense | `tense_form` |
| voice | `voice` |
| mood | `mood` |
| principal-part slot | `principal_part` |
| other nominal pattern issue | `declension_pattern` |

The diagnostic code is stored through BG3 remediation rather than as a purely visual red/green result.

## Adaptation

Question selection is weighted rather than uniformly random.

Higher weight is given to:

- morphology families with lower session/history accuracy;
- BG3 units currently accessible;
- BG3 review-due units;
- units with recurring typed errors.

Recently shown forms are temporarily down-weighted to reduce repetition loops.

This is adaptive practice, not a full SRS implementation.

## Focus filters

The learner can choose:

- Foundation;
- Nominals;
- Verbs;
- Advanced;
- All reviewed forms.

Focus filters change the exercise pool but do not bypass BG3 curriculum prerequisites or mark locked units complete.

## Persistence

Laboratory session statistics use:

`koine-path-morphology-lab-v1`

Stored data includes:

- attempts;
- correct answers;
- current/best streak;
- selected mode;
- selected focus;
- family-level accuracy;
- recent-item suppression state.

Canonical mastery remains owned by BG3, not this local laboratory state.

## Validation

`scripts/test-morphology-lab.cjs` verifies:

- substantial inventory size;
- provenance on every item;
- explicit syncretism;
- valid correct-option generation;
- minimal-pair contrast logic;
- six-slot principal parts;
- assistance propagation into BG3;
- diagnostic error propagation;
- adaptive family weighting;
- recent-item down-weighting;
- persistence;
- focus inventory availability;
- required morphology-family breadth.

## Boundaries

BG4 does not yet provide:

- exhaustive NT corpus morphology;
- free typed Greek production with accent-sensitive grading;
- sentence-level syntactic disambiguation;
- mature spaced repetition;
- phonological/audio production;
- every irregular verb and every third-declension subtype.

Those are later layers. BG4's job is to establish a trustworthy, adaptive morphology-training engine that can be expanded without changing its learning-state contract.