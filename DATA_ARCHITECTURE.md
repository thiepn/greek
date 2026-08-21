# BG2 — Greek Data Foundation

This document is the canonical data contract for Koinē Path. BG1 defines what must be learned; BG2 defines what Greek data the product may trust and how that data moves from source material into lessons, drills, readers, review, and later AI tutoring.

## 1. Goals

BG2 establishes a Greek layer that is:

- source-pinned;
- license-aware;
- Unicode-stable;
- token-addressable;
- morphology-aware;
- passage-addressable;
- vocabulary-ready;
- deterministic where facts are deterministic;
- separable from editorial pedagogy;
- testable before deployment;
- extensible to the complete New Testament without changing identifiers.

The core rule is:

> Source data, derived deterministic data, reviewed editorial data, and generative AI output are different layers and must never be silently merged.

## 2. Data layers

### Layer A — Canonical text

The canonical runtime text is SBLGNT unless a future release explicitly changes the edition.

Stored facts include:

- passage reference;
- token position;
- surface token including punctuation;
- punctuation-stripped word form.

Text provenance is always attached at passage/dataset level.

### Layer B — Morphology and lemmatization

MorphGNT supplies:

- normalized form;
- lemma;
- POS code;
- compact parse code.

Koinē Path also stores a decoded morphology object for app use. The original MorphGNT codes remain preserved so decoded data can always be checked against the source representation.

### Layer C — Deterministic derived data

Examples:

- stable token IDs;
- normalized Unicode strings;
- lemma occurrence counts;
- frequency rank;
- frequency band;
- passage token counts;
- morphology display labels generated from structured morphology.

These values may be regenerated from pinned source data and therefore do not require AI.

### Layer D — Reviewed learning annotations

Examples:

- hints;
- short learning glosses;
- unit associations;
- prerequisite labels;
- pedagogical difficulty;
- misconception notes;
- reviewed syntax notes.

These are clearly marked as Koinē Path editorial content. A learning gloss is not a lexicon entry and must not be presented as the meaning of a lemma in every context.

### Layer E — Generative tutoring

AI output is never stored in the canonical Greek dataset. AI may consume Layers A–D and learner-state data, but its explanation remains an ephemeral or separately logged tutoring artifact.

## 3. Stable identifiers

### Passage IDs

Use OSIS-like IDs:

`Book.Chapter.Verse`

Example:

`John.1.1`

### Token IDs

Format:

`sblgnt.<Book>.<Chapter>.<Verse>.<three-digit-position>`

Example:

`sblgnt.John.1.1.005`

Properties:

- unique across the corpus;
- edition-specific;
- deterministic;
- unaffected by UI ordering;
- safe for review queues, annotations, analytics, and AI citations.

If a future canonical text edition is introduced, it receives a different edition prefix rather than reusing SBLGNT token IDs.

### Lexeme IDs

Initial format:

`lex.<lemma>`

The canonical key is the NFC-normalized lemma. If future data reveals homograph collisions that require separate lexemes, BG2 permits migration to `lex.<lemma>.<sense-or-source-key>` while preserving aliases.

## 4. Unicode policy

All canonical Greek strings must be valid Unicode and normalized to NFC at build time.

The source surface form is preserved semantically, including accents, breathing marks, iota subscripts, capitalization, and punctuation.

Do not:

- strip accents from canonical display text;
- silently convert final sigma;
- normalize away breathing marks;
- treat visually similar but codepoint-distinct forms as automatically identical without an explicit normalization rule.

Search/index layers may later create accent-insensitive helper keys, but those are derived fields and never replace canonical text.

## 5. Token schema

Required token fields:

- `id`
- `position`
- `text`
- `word`
- `normalized`
- `lemma`
- `posCode`
- `parseCode`
- `morph`

### `text`

Exact source token including attached punctuation.

### `word`

Source word with punctuation stripped.

### `normalized`

MorphGNT normalized word form.

### `lemma`

MorphGNT lemma.

### `posCode`

Original MorphGNT/CCAT POS code retained for provenance.

### `parseCode`

Original compact morphology code retained for provenance.

### `morph`

Decoded deterministic object. Possible fields include:

- person;
- tense;
- voice;
- mood;
- case;
- number;
- gender;
- degree.

Unused categories are omitted rather than populated with invented values.

## 6. Passage schema

Required passage fields:

- `id`
- `osis`
- `book`
- `chapter`
- `verse`
- `textSource`
- `morphologySource`
- `sourceRevision`
- `unicodeNormalization`
- `surface`
- `tokens`

The passage `surface` must be reconstructable from token `text` values separated by spaces for ordinary MorphGNT rows. If later punctuation/tokenization cases require special spacing metadata, the token schema may add an explicit spacing field; consumers must not guess.

## 7. Source registry

Every data-generating source must have:

- stable internal source ID;
- title;
- role;
- source URL;
- license name;
- license URL;
- attribution/citation when required;
- pinned revision when the source is version-controlled.

BG2 sources:

1. SBLGNT — canonical Greek text — CC BY 4.0.
2. MorphGNT SBLGNT Edition 6.12 — morphology/lemmatization — CC BY-SA 3.0.
3. Koinē Path editorial annotations — pedagogical content.

Licensing details are also recorded in `ATTRIBUTION.md`.

## 8. Source pinning

MorphGNT is pinned to:

`aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`

A future import must never silently pull the latest `master` and overwrite production data. Updating a source revision is an explicit data migration requiring:

1. source revision change;
2. rebuild;
3. validation;
4. corpus diff;
5. review of changed tokens/parses;
6. dataset version increment.

## 9. Vocabulary frequency model

Frequency is computed from the complete pinned canonical corpus by **normalized lemma**, not by English gloss and not by surface form.

Required future fields:

- corpus count;
- rank;
- frequency band;
- corpus ID/revision used for counting.

Frequency bands:

- F1 — ranks 1–100
- F2 — 101–300
- F3 — 301–600
- F4 — 601–1000
- F5 — 1001+

Rules:

- partial passage samples must not be presented as NT-wide frequency;
- ties use deterministic lemma-codepoint ordering;
- proper names are counted but may later be separately filterable in pedagogy;
- course vocabulary priority may combine frequency with passage relevance, but the raw frequency value remains independent.

BG2 intentionally leaves global count/rank values `null` until full-corpus ingestion is implemented.

## 10. Learning annotations

Learning annotations are keyed by stable token ID.

Current allowed fields:

- `hint`
- `glosses`

Future fields may include:

- `unitIds`
- `difficulty`
- `syntaxNoteId`
- `commonErrors`
- `pronunciationOverride`
- `reviewPriority`

Pedagogical rules:

- glosses should be short possibilities, not exhaustive definitions;
- hints should direct attention to evidence before revealing answers;
- no annotation may overwrite the source lemma or morphology;
- theological interpretation does not belong in token morphology records.

## 11. Parse display

Human-readable parse labels are generated from structured morphology and POS labels.

Examples:

`N- + {case:dative, number:singular, gender:feminine}`
→ `noun · dative · singular · feminine`

`V- + {person:3, tense:imperfect, voice:active, mood:indicative, number:singular}`
→ `verb · imperfect · active · indicative · 3rd person · singular`

The UI may reorder display components for readability, but it must not change the underlying values.

## 12. Textual variants and edition policy

BG2 is edition-transparent but does not yet implement a textual apparatus.

Rules for future variant support:

- the reader always identifies the active base edition;
- variant records are separate from canonical token records;
- an AI tutor may explain a reviewed variant record but may not invent one;
- the application must distinguish a textual variant from a translation or interpretation difference;
- token IDs remain edition-specific.

## 13. Translation policy

English translations are not part of the canonical Greek layer.

A future translation registry must separately record:

- translation name;
- copyright/license;
- passage reference;
- text;
- source URL/revision if applicable.

The current prototype English line is a learning aid and should later migrate into this translation registry.

## 14. Pronunciation policy

Pronunciation metadata is not encoded into the text tokens unless a genuine lexical/form-specific exception is needed.

A later pronunciation engine should consume Greek orthography and a user-selected pronunciation profile such as:

- Erasmian;
- reconstructed Koine;
- Modern Greek.

This prevents the data layer from falsely presenting one pronunciation convention as part of the Greek text itself.

## 15. Import pipeline contract

The full-corpus pipeline will follow:

`pinned source → row parser → Unicode normalization → morphology decoder → stable ID generator → passage assembler → lemma counter → validator → runtime bundle`

The importer must fail rather than silently repair a malformed source row.

Corrections belong in an explicit patch layer containing:

- affected token ID;
- old value;
- new value;
- reason;
- evidence/source;
- reviewer;
- date/version.

## 16. Validation gates

Deployment data validation checks at minimum:

1. schema version exists;
2. source IDs resolve;
3. source revision is pinned;
4. passage IDs are unique;
5. token IDs are unique;
6. token positions are contiguous within a passage;
7. Greek strings are NFC;
8. every POS code is recognized;
9. parse objects contain only allowed morphology keys;
10. `surface` reconstructs from token text;
11. every token lemma has a lexeme record;
12. every learning annotation points to an existing token;
13. no NT-wide frequency rank/count exists while full-corpus coverage is false;
14. token IDs agree with passage and position;
15. no canonical token stores an English translation or AI-generated explanation.

CI must stop the merge if these checks fail.

## 17. Runtime behavior

The reader should consume canonical token data by stable token ID rather than maintaining independent hand-written arrays of forms and parses.

The UI may combine:

- token data;
- learning annotation;
- learner state.

It must keep those origins conceptually separate.

For example:

- form: canonical source data;
- lemma: morphology source data;
- parse: deterministic decoded source data;
- hint: Koinē Path editorial data;
- “you missed this twice”: learner-state data;
- AI explanation: generated tutoring layer.

## 18. Current BG2 dataset

BG2 includes John 1:1 as a 17-token reference fixture.

It is intentionally small because the purpose of BG2 is to lock the schema, provenance, licensing, and validation system before importing roughly the entire NT corpus.

This sample is sufficient to exercise:

- punctuation-preserving surface text;
- nouns;
- article;
- prepositions;
- conjunctions;
- imperfect indicative verbs;
- repeated lemmas;
- case/number/gender;
- stable IDs;
- editorial hints;
- lexeme derivation.

## 19. BG2 completion criteria

BG2 is complete when:

- source registry exists;
- licenses/attribution are documented;
- a pinned MorphGNT revision is recorded;
- stable passage/token/lexeme IDs are defined;
- Unicode policy is defined;
- morphology schema is defined;
- vocabulary frequency methodology is defined;
- a validated runtime fixture exists;
- CI validation exists;
- the reader can consume the canonical fixture rather than inventing its own parse records;
- later phases can ingest the full corpus without redesigning the schema.

## 20. Deferred work

BG2 does **not** attempt to finish:

- complete NT ingestion;
- a full lexicon;
- full frequency counts;
- syntax trees;
- textual apparatus;
- pronunciation audio;
- English translation licensing;
- SRS scheduling;
- AI tutoring.

Those systems build on this foundation in later phases.