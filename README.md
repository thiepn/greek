# Koinē Path

Interactive Biblical Greek learning app focused on active recall, morphology, New Testament reading, adaptive review, and AI-ready tutoring.

**Live:** https://thiepn.github.io/greek/

## Current beta

The five currently interactive lessons are prototype foundation content used to validate the learning loop and interface. They are not the final canonical course sequence.

Current interactive systems include:

- foundation lessons
- parsing drills with persistent accuracy
- guided John 1:1 reader with progressive hints
- adaptive learner-state engine
- typed remediation and review scheduling
- competency-based progress tracking
- deterministic Socratic tutor designed for a later secure AI backend
- local-first browser persistence
- responsive desktop, tablet, and mobile UI

## BG1 curriculum architecture

The canonical course is defined as **50 units across 8 stages**, from script recognition through independent New Testament reading and introductory exegetical competence.

See [`CURRICULUM.md`](./CURRICULUM.md) for the pedagogical contract and [`curriculum.js`](./curriculum.js) for the machine-readable manifest consumed by the application.

The canonical learning loop is:

**Learn → Retrieve → Parse → Read → Explain → Review → Read again**

Major curriculum rules include attempt before reveal, recognition before production, real New Testament text from the beginning, frequency-first vocabulary, responsible tense/aspect teaching, and explicit separation of morphology, syntax, semantics, interpretation, and theology.

## BG2 Greek data foundation

BG2 establishes the source-of-truth layer consumed by future lessons, drills, readers, review, and AI tutoring.

See:

- [`DATA_ARCHITECTURE.md`](./DATA_ARCHITECTURE.md) — canonical data contract
- [`ATTRIBUTION.md`](./ATTRIBUTION.md) — source attribution and licensing
- [`data/greek-data.js`](./data/greek-data.js) — runtime source manifest and validated John 1:1 fixture
- [`scripts/validate-greek-data.cjs`](./scripts/validate-greek-data.cjs) — deterministic validation gates

The current runtime foundation uses:

- **SBLGNT** for canonical Greek text under CC BY 4.0;
- **MorphGNT: SBLGNT Edition 6.12** for normalization, lemmas, POS, and morphology under CC BY-SA 3.0;
- MorphGNT revision `aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d` as the pinned source revision;
- Koinē Path editorial annotations as a separate pedagogical layer.

The reader consumes the canonical John 1:1 token dataset rather than maintaining an independent hand-written parsing copy inside `app.js`.

BG2 deliberately leaves NT-wide frequency counts null until a complete pinned corpus is ingested. Partial samples are never labeled as global frequency data.

## BG3 learning engine

BG3 turns curriculum and Greek data into persistent learner state.

See:

- [`LEARNING_ENGINE.md`](./LEARNING_ENGINE.md) — mastery, decay, stage-gate, and recommendation contract
- [`learning-engine.js`](./learning-engine.js) — browser/CommonJS engine
- [`learning-engine-ui.js`](./learning-engine-ui.js) — live Progress-state rendering
- [`scripts/test-learning-engine.cjs`](./scripts/test-learning-engine.cjs) — deterministic engine tests

Every canonical unit now tracks four dimensions:

1. concept
2. recognition
3. application
4. reading transfer

A single correct response cannot grant mastery. The engine requires repeated evidence, penalizes assistance, creates typed remediation for diagnostic errors, schedules review, applies bounded evidence decay, enforces prerequisites and stage gates, and chooses the next task with this priority:

**remediation → due review → weakest in-progress unit → next available unit → general reading practice**

The previous `koine-path-v01` browser state is migrated into schema v3. Legacy lesson completion is preserved as low-confidence evidence and never grants canonical mastery automatically.

Reader hint use is recorded as assistance/exposure rather than as successful mastery evidence.

## Layer separation

Koinē Path keeps these layers separate:

1. Greek text / edition data
2. morphology and lemma data
3. deterministic derived data such as stable IDs and frequency counts
4. reviewed learning annotations
5. reviewed grammar curriculum
6. learner state and mastery evidence
7. generative AI explanation/coaching

The static client deliberately contains no AI API secret. A real model-backed tutor must connect through a secure serverless proxy.
