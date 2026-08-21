# Koinē Path

Interactive Biblical Greek learning app focused on active recall, morphology, New Testament reading, adaptive review, and AI-ready tutoring.

**Live:** https://thiepn.github.io/greek/

## Current beta

The five currently interactive lessons are prototype foundation content used to validate the learning loop and interface. They are not the final canonical course sequence.

Current interactive systems include:

- foundation lessons
- parsing drills with persistent accuracy
- guided John 1:1 reader with progressive hints
- review queue generated from mistakes and difficult words
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

The reader now consumes the canonical John 1:1 token dataset rather than maintaining an independent hand-written parsing copy inside `app.js`.

BG2 deliberately leaves NT-wide frequency counts null until a complete pinned corpus is ingested. Partial samples are never labeled as global frequency data.

## Data-layer separation

Koinē Path keeps these layers separate:

1. Greek text / edition data
2. morphology and lemma data
3. deterministic derived data such as stable IDs and frequency counts
4. reviewed learning annotations
5. reviewed grammar curriculum
6. learner state and mastery evidence
7. generative AI explanation/coaching

The static client deliberately contains no AI API secret. A real model-backed tutor must connect through a secure serverless proxy.