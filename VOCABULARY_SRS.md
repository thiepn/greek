# BG5 — Vocabulary & SRS Engine

BG5 establishes Koinē Path's lexical-learning system.

## Goals

The learner should acquire enough high-frequency vocabulary to read rather than constantly decode through English, while avoiding the false idea that a Greek lemma equals one English word.

Canonical curriculum targets remain:

- Stage 0: 20 lemmas
- Stage 1: 80
- Stage 2: 180
- Stage 3: 320
- Stage 4: 450
- Stage 5: 600
- Stage 6: 800
- Stage 7: 1,000 core / 1,200 stretch

The vocabulary engine introduces frequency-ordered new cards only up to the learner's current stage target. Passage words may be added manually at any time.

## Corpus frequency

BG5 uses the pinned `lemma_95.tsv` output from `jtauber/core-gnt-vocab` at commit `136cc6464f1d4dfca9dec63fbbe5fd013982459c`.

That project computes lemma counts from MorphGNT across all 27 New Testament books. BG5 loads the first 1,200 ranked lemmas and caches the parsed result in browser storage.

Frequency bands:

- F1: ranks 1–100
- F2: 101–300
- F3: 301–600
- F4: 601–1000
- F5: 1001–1200 stretch

If the remote pinned source cannot be loaded, the app remains functional with a small reviewed fallback seed. The UI explicitly says when fallback data is active.

## Lexical semantics

Three layers must never be collapsed:

1. **Frequency** — how often a lemma occurs.
2. **Reference gloss** — a compact English retrieval prompt.
3. **Contextual sense** — how the word functions in a specific clause/passage.

Reference glosses are not definitions. Cards may contain multiple gloss prompts. Reader-linked cards preserve passage references separately.

## Card types

### Lemma recognition

Front: Greek lemma.

Back: compact reference gloss prompt plus frequency metadata.

This is the default card because the primary goal is Greek → reading comprehension.

### Form → lemma

Created from reader tokens.

Front: inflected surface form.

Back: canonical lemma.

This bridges BG4 morphology and BG5 vocabulary without requiring the learner to treat every inflected form as a separate lexical item.

Future phases may add contextual-sense cards when enough reviewed passage annotations exist.

## New-card policy

Default new-card limit: **12/day**.

The engine does not dump all 1,000 words into the deck. It introduces the next unlearned frequency-ranked lemma only if its rank falls inside the learner's current curriculum vocabulary target.

Reader-selected words and manually searched words can be added outside that order because immediate passage relevance is a legitimate priority.

## SRS state model

BG5 does not claim to implement FSRS.

Each card has:

- state: new / learning / review / relearning;
- due timestamp;
- interval in days;
- ease factor;
- repetitions;
- lapses;
- last rating;
- last review timestamp;
- leech flag;
- source and passage references.

Ratings:

- **Again** — recall failed;
- **Hard** — barely recalled;
- **Good** — correctly recalled;
- **Easy** — immediate, confident recall.

### Initial behavior

A new card rated:

- Again → learning, due in 10 minutes;
- Hard → short learning interval;
- Good → review in 1 day;
- Easy → review in 4 days.

### Review behavior

- Again creates a lapse and moves the card to relearning.
- Hard expands slowly and slightly lowers ease.
- Good expands by the card's ease factor.
- Easy increases ease and expands more aggressively.

Intervals are transparent and stored per card so the algorithm can later be migrated to FSRS without losing review history.

## Lapses and leeches

After **6 lapses**, a card is flagged as a leech.

BG5 does not automatically suspend leeches. The flag is surfaced so later UI/remediation systems can suggest changing the prompt, adding context, or reviewing morphology rather than endlessly repeating a failing card.

## BG3 integration

Vocabulary SRS has its own scheduling state. It feeds BG3 only as limited recognition evidence.

Rank ranges map to the curriculum stage whose vocabulary target contains that word. Evidence is written only if the mapped unit is accessible. Otherwise the encounter is recorded as exposure.

This prevents free vocabulary exploration from pre-mastering locked curriculum.

An `Again` rating can create the BG3 `vocabulary_retrieval` error type.

## Reader integration

The John 1:1 word inspector gains **Learn vocabulary**.

Adding a reader token creates:

1. a lemma-recognition card;
2. a form→lemma card for that exact token form;
3. a passage reference to `John.1.1`.

Repeated additions merge into existing cards instead of duplicating them.

## Persistence

Vocabulary SRS state:

`koine-path-vocab-srs-v1`

Cached 1,200-row corpus:

`koine-path-vocab-corpus-v1`

The corpus cache is tied to the pinned source commit. A source revision change invalidates the old cache automatically.

## Boundaries

BG5 does not yet provide:

- a full locally vendored NT frequency corpus;
- sentence-level semantic disambiguation for all lemmas;
- typed Greek production;
- audio vocabulary cards;
- cloud sync;
- a formally tuned FSRS model.

Those can be added without replacing the BG5 card-history schema.