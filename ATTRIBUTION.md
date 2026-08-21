# Data attribution and licensing

Koinē Path separates Greek text, morphology/lemmatization, corpus frequency, lexical reference data, edition-comparison apparatus data, and Koinē Path learning annotations because they have different evidential roles and licensing histories.

## SBL Greek New Testament (SBLGNT)

**Role in Koinē Path:** canonical Greek surface-text family; the exact runtime snapshot is fixed by the pinned MorphGNT revision documented below.

- Title: *SBL Greek New Testament (SBLGNT)*
- Copyright: Society of Biblical Literature and Logos Bible Software
- Official repository: https://github.com/LogosBible/SBLGNT
- Official license: Creative Commons Attribution 4.0 International (CC BY 4.0)
- License: https://www.sblgnt.com/license/

Koinē Path reproduces and technically restructures SBLGNT text under CC BY 4.0. Attribution is retained here and in the generated machine-readable corpus manifest. No endorsement by SBL, Logos, or Faithlife is implied.

### Exact text snapshot used by Koinē Path

The reader does **not** silently track the newest official SBLGNT release. Its exact surface text is the SBLGNT text embedded in MorphGNT revision `aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`.

This distinction matters because the official Faithlife/Logos SBLGNT repository records later release changes, including v1.2 (2023), which added John 7:53–8:11. The pinned MorphGNT snapshot used by Koinē Path does not contain token-bearing John 7:53–8:11 and begins John 8 at verse 12. Koinē Path therefore labels its corpus as a **pinned SBLGNT/MorphGNT snapshot**, not as “the latest SBLGNT.”

A future corpus update must be an explicit source-revision migration with regenerated counts, hashes, QA, and reader validation; it must never happen merely because an upstream repository changes.

## MorphGNT: SBLGNT Edition

**Role in Koinē Path:** exact text-snapshot anchor plus token boundaries, normalized forms, lemmas, part-of-speech codes, morphological parse codes, and the lemmatization used to regenerate canonical NT-wide frequency and BG11 lexical-distribution data.

- Repository: https://github.com/morphgnt/sblgnt
- Pinned revision: `aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`
- Data citation: Tauber, J. K., ed. (2017), *MorphGNT: SBLGNT Edition*, Version 6.12. DOI: 10.5281/zenodo.376200
- Morphological parsing and lemmatization license: CC BY-SA 3.0
- License: https://creativecommons.org/licenses/by-sa/3.0/

The MorphGNT repository README uses older wording for SBLGNT text licensing. Koinē Path follows the current official SBLGNT license/repository for the Greek text license itself and MorphGNT's stated CC BY-SA terms for morphology and lemmatization.

## BG6/BG11 generated full-corpus layer

BG6 builds the runtime reader corpus directly from all 27 MorphGNT book files at the pinned revision above.

The generation process creates:

- one manifest;
- one exact-corpus lemma frequency index;
- 27 lazy-loaded book chunks;
- from BG11, one exact-corpus lexical study index.

The BG11 lexical index derives only deterministic corpus statistics from the same pinned tokens:

- exact lemma count and rank;
- per-book distribution;
- deterministic sample verse references;
- raw ±3-token nearby-lemma counts.

Canonical frequency order is occurrence-count descending with an explicit normalized-lemma **Unicode code-point** tie-break. Locale collation is not used for canonical rank assignment.

These nearby-lemma counts are not semantic definitions, senses, syntactic dependencies, or normalized statistical association scores. They are exploratory corpus evidence that must be inspected in context.

The generated corpus therefore uses the same pinned source revision for reader text, lemmas, morphology, runtime frequency, and BG11 corpus word-study statistics. The build is validated before GitHub Pages deployment.

Generated corpus files are derivative runtime artifacts. Source attribution and licensing remain attached through this document and the generated manifest/index metadata.

## SBLGNT edition-comparison apparatus

**Role in BG11:** limited edition-awareness and textual-variant training.

BG11 uses five reviewed apparatus cases from the Faithlife/Logos SBLGNT repository pinned at:

`c4d241a9c1c479a55b989ba35a4976c1d0b8052c`

Source repository:

https://github.com/Faithlife/SBLGNT

The reviewed loci are Mark 1:1, John 1:18, John 1:34, Romans 5:1, and Romans 8:1.

The SBLGNT apparatus used here is an **edition-comparison apparatus**: it records textual decisions/readings in selected printed editions. It is not a full manuscript apparatus and Koinē Path does not represent its edition abbreviations as manuscript witnesses.

Its pedagogical role is therefore:

**flag a potentially significant textual question → identify the active reading → require a fuller apparatus for manuscript-level evaluation**.

BG11 CI fetches the pinned apparatus source and verifies the exact source strings used by these teaching cases.

## Core GNT Vocabulary frequency bootstrap

**Role in BG5/BG6:** fallback/bootstrap count data and verified ranks where present while the BG6-generated canonical frequency index is unavailable.

- Repository: https://github.com/jtauber/core-gnt-vocab
- Pinned revision: `136cc6464f1d4dfca9dec63fbbe5fd013982459c`
- Runtime source file: `lemma_95.tsv`
- Upstream method: counts lemmas across all 27 books using MorphGNT lemmatization, then sorts by occurrence count.

BG5 introduced this source before Koinē Path had a full local reader corpus. BG6 now regenerates frequency directly from the exact pinned MorphGNT corpus used by the reader and treats that generated index as the preferred runtime authority. The `core-gnt-vocab` source remains a version-pinned fallback and a useful independent cross-check.

The local fallback seed is intentionally sparse. BG15 forbids using a sparse-subset position as an NT-wide rank. Only ranks verified against the source are populated; supplemental fallback entries may carry `rank: null` until canonical BG6 frequency is available.

Frequency and rank are corpus statistics. They do **not** determine lexical meaning.

## Dodson Greek-English Lexicon

**Role in BG5/BG6/BG11:** compact reference-gloss prompts present in the upstream core-vocabulary table.

John Jeffrey Dodson released his Greek-English lexicon into the public domain. Koinē Path treats these strings only as **reference gloss prompts**. They are not complete lexical definitions and are never authoritative evidence for the contextual sense of a word in a particular verse.

Relevant machine-readable edition: https://github.com/biblicalhumanities/Dodson-Greek-Lexicon

BG6 exact-corpus frequency replaces ranks and counts, not these independently sourced lexical prompts. A lemma without a reviewed reference gloss may therefore have exact corpus statistics while its English prompt remains unavailable.

## Koinē Path learning annotations

**Role:** pedagogical hints, selected contextual notes, reviewed morphology/syntax/exegesis cases, course mappings, difficulty metadata, and instructional reasoning ladders.

These are project-created editorial annotations. They remain outside canonical text/morphology/frequency/apparatus fields so that a hint, gloss, argument, or pedagogical simplification can never masquerade as source data.

## English translation policy

BG6/BG11 do not bundle a complete English Bible translation. The reader and exegesis laboratory therefore do not silently redistribute an English translation or generate one as though it were a canonical source.

A future comparison translation must have an explicit source, edition, license, and attribution policy before inclusion.

## Semantic and interpretive boundary

The application must keep these claims distinct:

1. `lemma X occurs N times` — corpus statistic;
2. `X may be glossed …` — lexical reference prompt;
3. `X occurs near Y N times` — raw corpus co-occurrence evidence;
4. `X means … here` — contextual interpretation requiring passage evidence;
5. `edition A prints X while edition B prints Y` — edition-comparison apparatus fact;
6. `reading X is text-critically preferable` — judgment requiring fuller textual evidence;
7. `therefore this verse teaches …` — interpretive/theological reasoning beyond lexical, morphological, or apparatus lookup.

Koinē Path may support each layer with appropriate evidence. It may not silently infer a later layer from an earlier one.