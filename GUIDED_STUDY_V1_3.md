# Koinē Path V1.3 — Onboarding, Placement & Guided Study Path

## Purpose

V1.3 answers three learner-facing questions that the existing mastery architecture did not answer clearly enough:

1. **Where should I begin?**
2. **How much should I do today?**
3. **How does prior Greek experience affect my route without corrupting mastery?**

The feature is deliberately a **routing layer above the canonical learning engine**, not a second mastery system.

## Study profile

Learners can configure:

- previous experience: new / alphabet basics / prior coursework / returning reader;
- primary goal: NT reading / full-course mastery / grammar refresh / exegesis;
- typical session budget: 10 / 25 / 45 minutes;
- study days per week: 3–7.

The state is stored under `koine-path-guidance-v1`, so it is automatically included in V1.2 export/import/recovery. V1.3 also adds explicit schema validation for that store during backup restore.

## Placement diagnostic

The optional diagnostic contains **16 deterministic questions: exactly two per canonical stage S0–S7**.

It samples:

- script and breathing recognition;
- article/case relationships;
- present-system verbs;
- indicative systems and aorist recognition;
- third-declension/pronoun morphology;
- participles and subjunctive recognition;
- clause/article syntax;
- responsible lexical and edition-awareness method.

The result is intentionally labeled **provisional**.

### Mastery firewall

Placement has no `recordEvidence()`, `recordExposure()`, `recordHint()`, stage-pass, or unlock path.

A placement result may recommend an **accelerated validation path**, but earlier canonical units remain governed by the existing prerequisite/mastery engine. An experienced learner moves faster by demonstrating competence through the canonical checks rather than by receiving synthetic credit from placement.

This protects the distinction between:

- routing evidence — “this learner probably knows material around S5”; and
- mastery evidence — “this learner has satisfied Koinē Path's reviewed canonical requirements.”

## Guided daily plan

The Today screen receives a goal-aware session plan derived from:

- the canonical mastery engine's current recommendation;
- remediation/review state;
- the learner's session budget;
- the learner's primary goal;
- the provisional placement result when present.

The primary task always follows the canonical learning engine. Secondary tasks use existing Morphology, Review, Read, or Tutor workspaces.

Session budgets are exact by construction:

- **10 min:** one primary task;
- **25 min:** 15 min primary + 5 min goal-aligned transfer/support + 5 min review/vocabulary;
- **45 min:** 25 min primary + 5 min goal-aligned transfer/support + 5 min review/vocabulary + 10 min sustained reading or exegesis-oriented explanation.

## UX behavior

Onboarding is **opt-in**, not a forced modal after an upgrade. New or existing learners see a visible setup card on Today and can configure or revise the path from Progress.

An interrupted placement diagnostic can be resumed later. Completing or skipping placement closes onboarding and leaves the study profile editable.

## Explicit non-claims

V1.3 does not claim that a 16-question diagnostic is a psychometrically validated proficiency exam. It is a compact routing instrument.

V1.3 does not:

- award mastery from placement;
- skip canonical stage gates;
- certify CEFR/ACTFL proficiency;
- replace instructor assessment;
- infer exegetical competence from morphology alone;
- create cloud accounts or sync.

## Acceptance criteria

V1.3 is acceptable only when automated validation proves:

- 16 unique diagnostic items, exactly two per stage;
- deterministic score-to-stage mapping;
- no mastery write path from onboarding/placement;
- exact 10/25/45-minute plan budgets;
- placement-ahead learners receive accelerated **validation**, not unlocking;
- guided-plan generation is side-effect free;
- guidance state is included in V1.2 backups and schema-validated on restore;
- app shell/PWA includes all V1.3 runtime assets;
- existing learning, accessibility, content, corpus, and offline gates remain green.
