# BG3 — Learning Engine

This document is the canonical behavior contract for learner state in Koinē Path.

## Purpose

BG1 defines *what* must be learned. BG2 defines *what Greek data is trusted*. BG3 defines *how learner evidence becomes mastery, review, remediation, and recommendations*.

The engine must never equate one correct answer with mastery.

## State schema

Current schema version: `3`

Persistent browser key: `koine-path-learning-v3`

The state contains:

- one record for every canonical curriculum unit;
- four mastery dimensions per unit;
- evidence counts and timestamps;
- mastery/review dates;
- typed error counts;
- remediation items;
- a bounded evidence event log;
- preserved prototype UI state;
- migration metadata.

The legacy `koine-path-v01` state is imported once. Legacy lesson completions seed low-confidence evidence but **do not grant canonical mastery**.

## Four mastery dimensions

Every unit is tracked across:

1. **Concept** — can the learner explain/identify the underlying rule or concept?
2. **Recognition** — can the learner rapidly recognize forms or structures?
3. **Application** — can the learner correctly use the concept in parsing/analysis tasks?
4. **Reading transfer** — can the learner carry the knowledge into real-text reading?

Default thresholds:

| Dimension | Score threshold | Minimum evidence | Weight |
|---|---:|---:|---:|
| Concept | 80 | 2 | 20% |
| Recognition | 85 | 4 | 30% |
| Application | 80 | 3 | 25% |
| Reading | 75 | 2 | 25% |

A unit also needs a composite of at least **82**.

## Evidence scoring

Correct answers begin with a quality value of 100, then receive an assistance multiplier:

| Assistance | Multiplier |
|---|---:|
| None | 1.00 |
| Grammatical hint | 0.82 |
| Lemma reveal | 0.55 |
| Full answer/parse | 0.25 |

Incorrect evidence has a low quality value and should normally create a typed remediation item.

A full-answer reveal followed by a correct response is not treated as independent success. It also records the `premature_reveal` error class so the engine can detect interlinear dependency.

Evidence updates scores gradually through a weighted moving update. Evidence count requirements prevent a single high score from satisfying mastery.

## Unit access

Unit access is deterministic.

- Unit 1 is available initially.
- Within a stage, each unit requires the preceding unit to be mastered.
- The first unit of a later stage requires the preceding **stage gate** to pass.

This means a learner can inspect later material in the product UI if we choose to allow previewing, but canonical progression does not mark it available until prerequisites are satisfied.

## Stage gates

A stage passes only when:

- every unit in the stage is currently mastered;
- average unit composite is at least **85**;
- average recognition is at least **88**;
- no mastery dimension anywhere in the stage is below **75**.

Stage gates therefore prevent compensation where excellent performance in one area hides a serious weakness in another.

## Decay and review

Stored mastery scores are raw evidence scores. The engine separately computes an **effective score** based on age.

Decay starts only after a dimension-specific grace period:

| Dimension | Grace period | Daily decay after grace |
|---|---:|---:|
| Concept | 21 days | 0.20 |
| Recognition | 10 days | 0.45 |
| Application | 14 days | 0.35 |
| Reading | 10 days | 0.50 |

Decay is capped so old knowledge becomes review-worthy rather than being treated as if the learner had never encountered it.

Newly mastered units receive a review checkpoint after 14 days. Successful later evidence expands the checkpoint interval up to 120 days. BG3 deliberately does **not** claim to implement a mature SRS algorithm; later SRS work may replace this scheduling policy without changing the mastery schema.

## Error taxonomy

BG3 implements the curriculum error taxonomy as deterministic codes:

- `case_confusion`
- `gender_number_agreement`
- `declension_pattern`
- `person_number`
- `tense_form`
- `voice`
- `mood`
- `principal_part`
- `pronoun_antecedent`
- `syntax_relation`
- `vocabulary_retrieval`
- `preposition_case`
- `word_order_overreliance`
- `translation_overliteral`
- `lexical_overreach`
- `premature_reveal`

Errors create or strengthen open remediation items. Repeated identical errors accumulate rather than generating unlimited duplicates.

## Recommendation priority

The daily recommendation engine uses this order:

1. unresolved remediation;
2. due/decayed review;
3. weakest accessible in-progress unit;
4. next newly available unit;
5. general independent reading practice.

This keeps the app from recommending novelty while known weaknesses remain unresolved.

## Prototype mapping

The original five beta lessons map to canonical units only for migration and early telemetry:

| Prototype lesson | Canonical unit |
|---|---:|
| Alphabet | 1 |
| Article | 5 |
| Second-declension nouns | 7 |
| Present verbs | 12 |
| John 1:1 application | 16 |

Completing those beta lessons supplies limited evidence. It does not bypass BG1 prerequisites or stage gates.

## Runtime contract

`learning-engine.js` exposes `window.KOINE_LEARNING_ENGINE` in the browser.

Important public methods:

- `getUnit(unitId)`
- `getStage(stageId)`
- `getDashboard()`
- `recordEvidence(...)`
- `recordError(...)`
- `recordHint(...)`
- `recordExposure(...)`
- `resolveRemediation(...)`
- `recommend()`
- `snapshot()`
- `getPrototypeState()` / `updatePrototypeState()`

The engine is also CommonJS-compatible so deterministic Node tests can run without a browser.

## Boundaries

The learning engine may decide:

- whether a unit is available;
- how strong current evidence is;
- when review is due;
- which weakness should be remediated;
- what the next task should be.

It may **not** decide:

- whether a Greek parse is correct independently of the canonical data layer;
- lexical meaning beyond reviewed lexical data;
- theological conclusions;
- disputed grammatical interpretation.

Those boundaries remain owned by BG2 data, reviewed curriculum content, and later grounded AI layers.
