# Koinē Path

Interactive Biblical Greek learning app focused on active recall, morphology, vocabulary acquisition, full New Testament reading, syntax/translation training, adaptive review, reading fluency, intermediate exegesis, audio/pronunciation, and grounded tutoring.

**Live:** https://thiepn.github.io/greek/

## Current beta

The five currently interactive foundation lessons are prototype content used to validate the learning loop and interface. They are not the final canonical course sequence.

Current interactive systems include:

- prototype foundation lessons;
- adaptive morphology laboratory;
- frequency-aware vocabulary workspace with spaced review;
- full 27-book Greek New Testament reader generated from the pinned SBLGNT/MorphGNT corpus;
- R0–R4 reader assistance, morphology self-checks, bookmarks, history, and chapter completion;
- reader-generated vocabulary cards and canonical NT-wide frequency synchronization;
- reviewed syntax and translation laboratory covering Units 38–44;
- secure-proxy-ready grounded AI tutor with deterministic fallback;
- unified BG9 adaptive review scheduler across remediation, vocabulary, morphology, syntax, unit decay, reading transfer, and advanced exegesis;
- BG10 continuous-reading fluency sessions with first-pass / analysis / reread separation;
- 1 John, Mark, and Philippians fluency programs plus whole-chapter practice;
- BG11 Exegesis workspace for Units 48–50;
- exact-corpus lexical study profiles for all 5,461 lemmas in the pinned 137,554-token corpus;
- 27 reviewed intermediate/exegetical cases, including five source-pinned edition-awareness cases;
- BG12 Audio workspace with reconstructed Koinē, Erasmian, and Modern Greek profiles;
- profile-specific pronunciation cues, Modern Greek browser speech, listening-only drills, reader/fluency audio hooks, and local microphone shadowing;
- adaptive learner-state engine;
- typed remediation and review scheduling;
- competency-based progress tracking;
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

The local BG2 John 1:1 fixture remains a small deterministic fallback and validation reference. BG6 supplies the complete generated runtime corpus.

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

BG5 adds lexical learning and spaced review. See [`VOCABULARY_SRS.md`](./VOCABULARY_SRS.md) and [`vocabulary-engine.js`](./vocabulary-engine.js).

It provides 1,000 core / 1,200 stretch vocabulary targets, curriculum-sensitive frequency ceilings, lemma/form/context cards, Again/Hard/Good/Easy scheduling, intervals/ease/lapses/leeches, and BG3 vocabulary-retrieval evidence/remediation.

BG5's version-pinned external frequency table is now a fallback. BG6 regenerates preferred ranks/counts from the exact reader corpus.

## BG6 full New Testament reader

BG6 replaces the John 1:1-only prototype with a complete 27-book reader. See [`FULL_READER.md`](./FULL_READER.md), [`canonical-reader.js`](./canonical-reader.js), and the corpus scripts in [`scripts/`](./scripts/).

At validation/deployment time the build fetches all 27 MorphGNT book files from revision `aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`, generates the manifest/frequency/book chunks, validates the corpus, and publishes the generated chunks with GitHub Pages.

The current exact corpus contains **27 books, 260 chapters, 7,927 token-bearing verses, 137,554 tokens, and 5,461 lemmas**. The browser lazy-loads books and renders only the current chapter.

BG6 does **not** bundle an unlicensed English translation. Grammatical and lexical assistance remains separate from translation/interpretation.

## BG7 syntax & translation laboratory

BG7 adds reviewed sentence-level training for canonical Units 38–44. See [`SYNTAX_LAB.md`](./SYNTAX_LAB.md), [`data/syntax-lab-data.js`](./data/syntax-lab-data.js), and [`syntax-lab.js`](./syntax-lab.js).

It covers case relationships, article syntax, participial/infinitival dependency, dependent clauses, discourse-sensitive analysis, explicit ambiguity, learner-authored structural translations, progressive assistance, and BG3 syntax/translation evidence.

BG7 does not derive syntax automatically from morphology, and translation drafts are not graded by naive string similarity.

## BG8 secure AI tutor

BG8 adds model-backed tutoring while keeping AI downstream from verified Greek data. See [`AI_TUTOR.md`](./AI_TUTOR.md), [`ai-tutor.js`](./ai-tutor.js), [`ai-tutor-ui.js`](./ai-tutor-ui.js), and [`worker/`](./worker/).

The Tutor supports Socratic, explanation, and translation-feedback modes with bounded reader/syntax context, strict structured output, explicit uncertainty, server-side origin/request/moderation/rate-limit controls, and deterministic fallback.

The static GitHub Pages client never contains an OpenAI API key. AI responses have no write path into BG3 mastery. Until the Worker is deployed and the endpoint meta value is configured, Tutor intentionally reports **Local fallback**.

## BG9 adaptive review engine

BG9 makes Review a cross-system scheduler rather than unrelated queues. See [`ADAPTIVE_REVIEW.md`](./ADAPTIVE_REVIEW.md), [`adaptive-review.js`](./adaptive-review.js), and [`adaptive-review-ui.js`](./adaptive-review-ui.js).

It combines BG3 remediation/review-due units, BG5 vocabulary state, BG4 morphology weakness, BG7 syntax weakness, reading-transfer weakness, and now BG11 exegesis review. It uses a transparent retrieval-risk heuristic rather than claiming FSRS.

The default mixed-review budget is 20 minutes, with 10/35/50-minute alternatives. Opening a task or finishing a review session never writes mastery evidence; source exercises remain authoritative.

## BG10 reading fluency mode

BG10 builds continuous-reading practice on the BG6 corpus. See [`READING_FLUENCY.md`](./READING_FLUENCY.md), [`data/fluency-programs.js`](./data/fluency-programs.js), [`reading-fluency.js`](./reading-fluency.js), and [`reading-fluency-ui.js`](./reading-fluency-ui.js).

Every scored session uses:

**First pass → Comprehension checkpoint → Assisted analysis → Reread → Comparison**

BG10 tracks first-pass/reread pace, approximate clauses/minute, unknown-word rate, tool-interruption rate, reviewed comprehension, passage length, reading days, and streaks. WPM is descriptive only and never creates mastery evidence.

Automatic passage length progresses **micro → short → medium → whole chapter**. Reviewed programs cover Units 45–47: 1 John, Mark, and Philippians.

With BG11, BG9 routing is now:

- **Units 45–47 → Fluency**
- **Units 48–50 → Exegesis**

## BG11 intermediate & exegetical Greek

BG11 adds a dedicated evidence-disciplined **Exegesis** workspace for the final three canonical units. See [`INTERMEDIATE_EXEGESIS.md`](./INTERMEDIATE_EXEGESIS.md), [`data/exegesis-lab-data.js`](./data/exegesis-lab-data.js), [`exegesis-lab.js`](./exegesis-lab.js), and [`exegesis-lab-ui.js`](./exegesis-lab-ui.js).

The central reasoning contract is:

**grammatical fact → contextual judgment → interpretive possibility → theological conclusion**

The system contains **27 reviewed cases**:

- **Unit 48:** responsible lexicon use, polysemy, root-fallacy safeguards, semantic restraint, corpus usage and lexical/syntactic interaction;
- **Unit 49:** edition awareness, textual variants, tool hierarchy, and explicit distinction between the SBLGNT edition-comparison apparatus and manuscript evidence;
- **Unit 50:** verbal aspect, advanced participial/infinitival syntax, discourse, argument tracing, ambiguity, and grammar/theology boundaries.

The full-corpus generator also creates `generated/corpus/lexical-index.json` for all **5,461 lemmas**, containing exact count/rank, per-book distribution, deterministic sample references, and raw ±3-token nearby-lemma counts. Co-occurrence counts are explicitly exploratory evidence, not definitions or semantic verdicts.

Five Unit 49 cases are pinned to Faithlife/SBLGNT apparatus data at revision `c4d241a9c1c479a55b989ba35a4976c1d0b8052c`: Mark 1:1, John 1:18, John 1:34, Romans 5:1, and Romans 8:1. BG11 treats that source as an **edition-comparison apparatus**, not a full manuscript apparatus.

Exegetical notebook entries, lexical searches, corpus statistics, apparatus inspection, and reviewed-analysis reveals never create mastery. Only scored reviewed cases may write BG3 evidence, and locked Units 48–50 remain exposure-only.

## BG12 audio & pronunciation

BG12 adds a dedicated **Audio** workspace. See [`AUDIO_PRONUNCIATION.md`](./AUDIO_PRONUNCIATION.md), [`data/pronunciation-profiles.js`](./data/pronunciation-profiles.js), [`pronunciation-engine.js`](./pronunciation-engine.js), and the pronunciation UI/bridge modules.

The selectable profiles are:

- **Reconstructed Koinē** — Roman-period teaching reconstruction and the default profile;
- **Academic Erasmian** — explicit classroom convention;
- **Modern Greek** — contemporary pronunciation with optional browser `el-GR` speech synthesis.

Historical profiles never substitute Modern Greek TTS. When no verified historical recording pack is installed, the app provides deterministic profile-specific pronunciation cues instead of falsely labeling Modern speech as Koinē/Erasmian audio.

BG12 includes alphabet/sound orientation, distinction drills, listening-only comprehension when an honest audio source exists, reader word-pronunciation integration, BG10 analysis/reread audio hooks with synchronized token highlighting, adjustable playback rate, and local microphone shadowing/replay.

Microphone audio remains a session-local Blob and is never uploaded or persisted. Pronunciation/listening activity has no `recordEvidence()` path and therefore remains separate from BG3 grammar mastery.

## Layer separation

Koinē Path keeps these layers distinct:

1. Greek text / active edition data;
2. morphology and lemma data;
3. deterministic corpus frequency/distribution/co-occurrence data;
4. lexical reference glosses;
5. reviewed morphology paradigms and learning annotations;
6. reviewed syntax/translation/fluency annotations;
7. edition-comparison apparatus data;
8. reviewed BG11 exegetical cases and reasoning ladders;
9. pronunciation profile rules and independently identified audio sources;
10. reviewed grammar curriculum;
11. learner state, SRS history, reading/fluency/pronunciation state, drafts/notebooks, mastery evidence, and deterministic review scheduling;
12. grounded generative explanation/coaching.

The static client contains no AI API secret. Model access must pass through the server-side BG8 proxy.