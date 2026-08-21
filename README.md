# Koinē Path

Interactive Biblical Greek learning app focused on active recall, morphology, vocabulary acquisition, full New Testament reading, syntax/translation training, adaptive review, and AI-ready tutoring.

**Live:** https://thiepn.github.io/greek/

## Current beta

The five currently interactive lessons are prototype foundation content used to validate the learning loop and interface. They are not the final canonical course sequence.

Current interactive systems include:

- prototype foundation lessons;
- adaptive morphology laboratory;
- frequency-aware vocabulary workspace with spaced review;
- full 27-book Greek New Testament reader generated from the pinned SBLGNT/MorphGNT corpus;
- R0–R4 reader assistance, morphology self-checks, bookmarks, history, and chapter completion;
- reader-generated vocabulary cards and canonical NT-wide frequency synchronization;
- reviewed syntax and translation laboratory covering Units 38–44;
- adaptive learner-state engine;
- typed remediation and review scheduling;
- competency-based progress tracking;
- deterministic Socratic tutor designed for a later secure AI backend;
- local-first learner persistence;
- responsive desktop, tablet, and mobile UI.

## BG1 curriculum architecture

The canonical course is **50 units across 8 stages**, from script recognition through independent New Testament reading and introductory exegetical competence.

See [`CURRICULUM.md`](./CURRICULUM.md) and [`curriculum.js`](./curriculum.js).

Canonical learning loop:

**Learn → Retrieve → Parse → Read → Explain → Review → Read again**

## BG2 Greek data foundation

BG2 establishes the source-of-truth contract for SBLGNT text, MorphGNT normalization/lemmas/morphology, stable token IDs, Unicode normalization, provenance, and validation.

See [`DATA_ARCHITECTURE.md`](./DATA_ARCHITECTURE.md), [`ATTRIBUTION.md`](./ATTRIBUTION.md), and [`data/greek-data.js`](./data/greek-data.js).

The local BG2 John 1:1 fixture remains a small deterministic fallback and validation reference. BG6 now supplies the complete generated runtime corpus.

## BG3 learning engine

BG3 turns curriculum and Greek data into persistent learner state. See [`LEARNING_ENGINE.md`](./LEARNING_ENGINE.md) and [`learning-engine.js`](./learning-engine.js).

Every unit tracks concept, recognition, application, and reading transfer. Repeated evidence is required; assistance lowers evidence value; typed errors create remediation; review can become due through scheduling or decay; prerequisites and stage gates control canonical progression.

## BG4 morphology laboratory

BG4 provides adaptive morphology practice. See [`MORPHOLOGY_LAB.md`](./MORPHOLOGY_LAB.md), [`data/morphology-lab-data.js`](./data/morphology-lab-data.js), and [`morphology-lab.js`](./morphology-lab.js).

Modes:

1. **Parse** — form → morphology;
2. **Build** — morphology → form;
3. **Contrast** — identify one changing feature in a minimal pair;
4. **Principal parts** — recognize principal-part slots.

BG4 explicitly models syncretism and separates reviewed paradigms from direct corpus occurrences.

## BG5 vocabulary & SRS

BG5 adds the lexical-learning and spaced-review system. See [`VOCABULARY_SRS.md`](./VOCABULARY_SRS.md) and [`vocabulary-engine.js`](./vocabulary-engine.js).

It provides:

- 1,000 core / 1,200 stretch vocabulary architecture;
- curriculum-sensitive frequency ceilings;
- up to 12 new frequency cards per day by default;
- lemma recognition, form→lemma, and passage-context cards;
- Again / Hard / Good / Easy scheduling;
- intervals, ease, repetitions, lapses, due timestamps, and leeches;
- BG3 vocabulary-retrieval evidence/remediation.

BG5's version-pinned external frequency table is now a fallback. BG6 regenerates preferred ranks/counts from the exact reader corpus.

## BG6 full New Testament reader

BG6 replaces the John 1:1-only prototype with a complete 27-book reader. See [`FULL_READER.md`](./FULL_READER.md), [`canonical-reader.js`](./canonical-reader.js), and the corpus scripts in [`scripts/`](./scripts/).

### Corpus pipeline

At validation/deployment time:

1. fetch all 27 MorphGNT book files from revision `aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`;
2. generate one manifest, one lemma-frequency index, and 27 book chunks;
3. validate complete NT coverage, stable IDs, Unicode, parse codes, John 1:1 reconstruction, and frequency invariants;
4. publish the generated chunks with GitHub Pages.

The browser lazy-loads books and renders only the current chapter, avoiding a monolithic full-NT startup payload.

### Reader capabilities

- 27 books / 260 chapters;
- previous/next chapter navigation across book boundaries;
- stable token-level morphology inspection;
- exact-corpus lemma frequency;
- vocabulary known/learning/unknown highlighting;
- R0–R4 assistance levels;
- reader morphology self-checks with BG3 evidence/error routing;
- reader → BG5 vocabulary card creation;
- persisted reading history and bookmarks;
- persisted chapter completion;
- S7 reading-evidence hooks for 1 John, Mark, Philippians, and independent reading.

BG6 does **not** bundle an unlicensed English translation. Grammatical and lexical assistance remains separate from translation/interpretation.

## BG7 syntax & translation laboratory

BG7 adds reviewed sentence-level training for canonical Units 38–44. See [`SYNTAX_LAB.md`](./SYNTAX_LAB.md), [`data/syntax-lab-data.js`](./data/syntax-lab-data.js), and [`syntax-lab.js`](./syntax-lab.js).

The laboratory covers:

- genitive, dative, and accusative relationships;
- article syntax and substantival constructions;
- participial and infinitival dependency;
- dependent clauses and clause boundaries;
- word order, information structure, and discourse-sensitive analysis;
- explicit ambiguity exercises that distinguish secure grammatical facts from disputed classifications;
- learner-authored structural translation drafts;
- progressive **Attempt → Hint → Structure → Explanation** assistance;
- BG3 recognition/application evidence and syntax/translation remediation;
- current-reader location matching for reviewed passages.

BG7 does not derive syntax automatically from morphology. MorphGNT provides deterministic forms; Koinē Path syntax claims live in a separate reviewed annotation layer. Translation drafts are not graded by naive string similarity and the app does not supply an unlicensed full English translation.

## Layer separation

Koinē Path keeps these layers distinct:

1. Greek text / edition data;
2. morphology and lemma data;
3. corpus frequency data;
4. lexical reference glosses;
5. reviewed morphology paradigms and learning annotations;
6. reviewed syntactic relationships and translation scaffolds;
7. reviewed grammar curriculum;
8. learner state, SRS history, reading state, drafts, and mastery evidence;
9. generative AI explanation/coaching.

The static client contains no AI API secret. A real model-backed tutor must connect through a secure serverless proxy.
