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

The canonical course is now defined as **50 units across 8 stages**, from script recognition through independent New Testament reading and introductory exegetical competence.

See [`CURRICULUM.md`](./CURRICULUM.md) for the pedagogical contract and [`curriculum.js`](./curriculum.js) for the machine-readable manifest consumed by the application.

The canonical learning loop is:

**Learn → Retrieve → Parse → Read → Explain → Review → Read again**

Major curriculum rules include:

- attempt before reveal;
- recognition before production;
- real New Testament text from the beginning;
- deterministic grammar and morphology facts;
- frequency-first, passage-sensitive vocabulary;
- explicit separation of morphology, syntax, semantics, interpretation, and theology;
- no simplistic tense/aspect slogans;
- responsible lexical semantics;
- configurable pronunciation profiles;
- mastery that can decay and trigger remediation.

## Data architecture direction

Koinē Path will keep these layers separate:

1. Greek text / edition data
2. morphology and lemma data
3. vocabulary and frequency data
4. reviewed grammar curriculum
5. learner state and mastery evidence
6. generative AI explanation/coaching

The static client deliberately contains no AI API secret. A real model-backed tutor must connect through a secure serverless proxy.
