# BG6 — Full New Testament Reader

BG6 replaces the John 1:1-only reading prototype with a complete, source-pinned Greek New Testament reading environment.

## Corpus generation

The repository does not commit a monolithic generated NT dataset. `scripts/build-full-corpus.mjs` downloads the 27 MorphGNT book files from the BG2-pinned revision:

`aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`

It generates at build/deploy time:

- `generated/corpus/manifest.json`
- `generated/corpus/frequency.json`
- `generated/corpus/books/<book>.json` for all 27 NT books

Each token preserves:

- stable token ID
- punctuated surface text
- punctuation-free word
- normalized form
- lemma
- MorphGNT POS code
- MorphGNT parse code
- verse-relative token position

Generated book chunks are lazy-loaded by the browser. Startup therefore does not require loading the entire token corpus.

## Validation contract

`validate-full-corpus.mjs` requires:

- 27 books
- 260 chapters
- token-bearing verse coverage in the expected critical-NT range, without assuming every traditional verse number is present in SBLGNT
- a plausible full-corpus token range
- stable unique book IDs
- contiguous token positions within each verse
- NFC-normalized Greek fields
- valid POS/parse-code shapes
- token and verse totals matching every per-book manifest
- John 1:1 reconstructing exactly from 17 canonical tokens
- John 1:1 morphology fixture consistency
- frequency ranks generated from the same corpus revision
- `ὁ` as the highest-frequency lemma with the expected MorphGNT count

GitHub Pages runs both generation and validation before deployment. A failed corpus build therefore blocks publication.

## Navigation

The reader supports:

- all 27 NT books
- chapter navigation
- previous/next chapter traversal across book boundaries
- persisted last location
- reading history
- chapter/verse bookmarks
- persisted chapter-completion records

## Assistance levels

BG1 defines five reader levels, now executable in BG6:

- **R0 — Fully guided:** visible word-class cues and full assistance controls.
- **R1 — Morphology guided:** morphology support remains easy to access, but no automatic lexical answer.
- **R2 — Syntax guided:** learner is expected to identify morphology before asking for help.
- **R3 — Tool-light:** metadata is visually de-emphasized; assistance is deliberately less prominent.
- **R4 — Independent practicum:** inline vocabulary highlighting and standard help controls are suppressed until the learner deliberately leaves independent reading.

All assistance is learner-state metadata. It never changes the canonical Greek token or source parse.

## Word inspection

Selecting a token may expose, progressively:

1. grammatical hint;
2. lemma;
3. full source parse.

The inspector also shows exact-corpus lemma frequency when available and whether the lemma is currently unknown, learning, or in review in BG5.

A reference gloss is explicitly a recall prompt. It is not presented as the contextual meaning of the word.

## Reader parsing checks

The reader can generate a morphology self-check from the selected token and nearby source parses. A response:

- contributes BG3 recognition evidence only if the mapped canonical unit is accessible;
- becomes exposure only when the relevant curriculum unit is locked;
- carries the reader's current assistance level into evidence strength;
- diagnoses person/number, tense, voice, mood, case, or agreement errors where the source codes permit that distinction.

Mere word selection never counts as mastery.

## Reading evidence

A chapter can be marked read. Completion is stored separately from competence.

Where the associated BG1 reading unit is accessible, chapter completion may contribute low-confidence reading-transfer evidence. Otherwise it remains exposure. This prevents free reader exploration from pre-mastering locked curriculum.

Dedicated S7 mappings currently include:

- 1 John → Unit 45
- Mark → Unit 46
- Philippians → Unit 47
- general independent reading → Unit 50

## Vocabulary integration

Reader tokens can create BG5 cards for:

- lemma recognition;
- surface form → lemma;
- reviewed passage-context glosses when such editorial data exists.

BG6 also regenerates lemma frequency from the exact canonical corpus. When the frequency index loads, BG5 replaces its version-pinned bootstrap ranks/counts with BG6 canonical ranks while preserving separately sourced reference gloss prompts and all learner SRS history.

## Frequency unification

BG5 needed a temporary NT-wide frequency bootstrap because BG2 had only a local John 1:1 fixture. BG6 removes that architectural mismatch:

`full pinned reader corpus → exact lemma counts → exact ranks → BG5 priority`

The BG5 bootstrap remains a network/failure fallback, not the preferred runtime authority once BG6 data is available.

## Translation policy

BG6 does not bundle a full English translation. The app therefore does not fabricate translations or silently redistribute an unlicensed translation.

Reader assistance consists of reviewed grammatical cues, lemmas, morphology, frequency information, vocabulary prompts, and later syntax-layer hooks. A future translation-comparison feature must name and license its translation source explicitly.

## Performance

The corpus is chunked per book rather than delivered as one large JSON object.

Runtime policy:

- load manifest + frequency index once;
- lazy-load the selected book;
- retain loaded books in an in-memory cache;
- render one chapter at a time;
- keep learner state in localStorage, not inside corpus chunks.

This keeps initial page load independent of the total NT token count.

## Boundaries

BG6 provides a complete morphology-aware Greek NT reader. It does not yet provide:

- sentence-level syntax trees;
- discourse annotations;
- textual apparatus/variant comparison;
- a licensed full English translation;
- automatic semantic or theological conclusions;
- offline PWA precaching of all 27 generated book chunks.

Those belong to later syntax, intermediate/exegetical, and PWA phases.
