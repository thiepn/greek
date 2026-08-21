# Koinē Path

Interactive Biblical Greek learning app focused on active recall, morphology, vocabulary acquisition, New Testament reading, adaptive review, and AI-ready tutoring.

**Live:** https://thiepn.github.io/greek/

## Current beta

The five currently interactive lessons are prototype foundation content used to validate the learning loop and interface. They are not the final canonical course sequence.

Current interactive systems include:

- prototype foundation lessons
- adaptive morphology laboratory
- frequency-aware vocabulary workspace with spaced review
- guided John 1:1 reader with progressive hints and reader-generated vocabulary cards
- adaptive learner-state engine
- typed remediation and review scheduling
- competency-based progress tracking
- deterministic Socratic tutor designed for a later secure AI backend
- local-first learner persistence
- responsive desktop, tablet, and mobile UI

## BG1 curriculum architecture

The canonical course is defined as **50 units across 8 stages**, from script recognition through independent New Testament reading and introductory exegetical competence.

See [`CURRICULUM.md`](./CURRICULUM.md) and [`curriculum.js`](./curriculum.js).

The canonical learning loop is:

**Learn → Retrieve → Parse → Read → Explain → Review → Read again**

Major rules include attempt before reveal, recognition before production, real New Testament text from the beginning, frequency-first vocabulary, responsible tense/aspect teaching, and explicit separation of morphology, syntax, semantics, interpretation, and theology.

## BG2 Greek data foundation

BG2 establishes the source-of-truth layer consumed by lessons, drills, readers, review, and later AI tutoring.

See [`DATA_ARCHITECTURE.md`](./DATA_ARCHITECTURE.md), [`ATTRIBUTION.md`](./ATTRIBUTION.md), [`data/greek-data.js`](./data/greek-data.js), and [`scripts/validate-greek-data.cjs`](./scripts/validate-greek-data.cjs).

The runtime uses SBLGNT for Greek text and MorphGNT for normalization, lemmas, POS, and morphology. The local token fixture currently covers John 1:1. BG5 adds a **separate** NT-wide frequency bootstrap; it does not pretend BG2 has already vendored the entire token corpus.

## BG3 learning engine

BG3 turns curriculum and Greek data into persistent learner state. See [`LEARNING_ENGINE.md`](./LEARNING_ENGINE.md) and [`learning-engine.js`](./learning-engine.js).

Every canonical unit tracks concept, recognition, application, and reading transfer. Repeated evidence is required; assistance lowers evidence value; typed errors create remediation; review can become due through scheduling or decay; prerequisites and stage gates control canonical progression.

Recommendation priority is:

**remediation → due review → weakest in-progress unit → next available unit → general reading practice**

## BG4 morphology laboratory

BG4 replaces the prototype random parsing drill with an adaptive morphology laboratory. See [`MORPHOLOGY_LAB.md`](./MORPHOLOGY_LAB.md), [`data/morphology-lab-data.js`](./data/morphology-lab-data.js), and [`morphology-lab.js`](./morphology-lab.js).

Modes:

1. **Parse** — form → morphology;
2. **Build** — morphology → form;
3. **Contrast** — identify one changing feature in a minimal pair;
4. **Principal parts** — recognize principal-part slots.

BG4 models syncretism explicitly and keeps reviewed paradigms separate from corpus-derived tokens.

## BG5 vocabulary & SRS

BG5 adds the dedicated lexical-learning system. See [`VOCABULARY_SRS.md`](./VOCABULARY_SRS.md), [`vocabulary-engine.js`](./vocabulary-engine.js), [`vocabulary-ui.js`](./vocabulary-ui.js), and [`data/vocabulary-seed.js`](./data/vocabulary-seed.js).

Key behavior:

- loads and caches ranks 1–1,200 from a version-pinned NT-wide lemma-frequency source derived from MorphGNT;
- follows BG1 vocabulary ceilings: 20 → 80 → 180 → 320 → 450 → 600 → 800 → 1,000 core / 1,200 stretch;
- introduces at most 12 frequency-ordered new cards per day by default;
- permits passage-sensitive manual additions from the reader;
- provides lemma-recognition and form→lemma cards;
- schedules **Again / Hard / Good / Easy** reviews using explicit new, learning, review, and relearning states;
- tracks intervals, ease, repetitions, lapses, due timestamps, and leeches;
- flags a card as a leech after six lapses;
- sends limited vocabulary-retrieval evidence/errors into BG3 only when the mapped curriculum unit is accessible;
- keeps frequency, reference gloss, contextual sense, and interpretation as separate claims.

BG5 deliberately does not call its scheduler FSRS. Its review-history schema is designed so a later FSRS implementation can replace the interval algorithm without losing learner history.

## Layer separation

Koinē Path keeps these layers separate:

1. Greek text / edition data
2. morphology and lemma data
3. corpus frequency data
4. lexical reference glosses
5. reviewed morphology paradigms and learning annotations
6. reviewed grammar curriculum
7. learner state, SRS history, and mastery evidence
8. generative AI explanation/coaching

The static client contains no AI API secret. A real model-backed tutor must connect through a secure serverless proxy.