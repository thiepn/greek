# Data attribution and licensing

Koinē Path separates Greek text, morphology/lemmatization, corpus frequency, lexical reference data, and Koinē Path learning annotations because they have different evidential roles and licensing histories.

## SBL Greek New Testament (SBLGNT)

**Role in Koinē Path:** canonical Greek surface text.

- Title: *SBL Greek New Testament (SBLGNT)*
- Copyright: Society of Biblical Literature and Logos Bible Software
- Official site: https://www.sblgnt.com/
- Official license: Creative Commons Attribution 4.0 International (CC BY 4.0)
- License: https://www.sblgnt.com/license/

Koinē Path reproduces and technically restructures SBLGNT text under CC BY 4.0. Attribution is retained here and in the generated machine-readable corpus manifest. No endorsement by SBL, Logos, or Faithlife is implied.

## MorphGNT: SBLGNT Edition

**Role in Koinē Path:** token boundaries, normalized forms, lemmas, part-of-speech codes, morphological parse codes, and the lemmatization used to regenerate canonical NT-wide frequency.

- Repository: https://github.com/morphgnt/sblgnt
- Pinned revision: `aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`
- Data citation: Tauber, J. K., ed. (2017), *MorphGNT: SBLGNT Edition*, Version 6.12. DOI: 10.5281/zenodo.376200
- Morphological parsing and lemmatization license: CC BY-SA 3.0
- License: https://creativecommons.org/licenses/by-sa/3.0/

The MorphGNT repository README uses older wording for SBLGNT text licensing. Koinē Path follows the current official SBLGNT license page for the Greek text itself and MorphGNT's stated CC BY-SA terms for morphology and lemmatization.

## BG6 generated full-corpus layer

BG6 builds the runtime reader corpus directly from all 27 MorphGNT book files at the pinned revision above.

The generation process creates:

- one manifest;
- one exact-corpus lemma frequency index;
- 27 lazy-loaded book chunks.

The generated corpus therefore uses the same pinned source revision for reader text, lemmas, morphology, and runtime frequency counts. The build is validated before GitHub Pages deployment.

Generated corpus files are derivative runtime artifacts. Source attribution and licensing remain attached through this document and the generated manifest.

## Core GNT Vocabulary frequency bootstrap

**Role in BG5/BG6:** fallback/bootstrap rank and count data while the BG6-generated canonical frequency index is unavailable.

- Repository: https://github.com/jtauber/core-gnt-vocab
- Pinned revision: `136cc6464f1d4dfca9dec63fbbe5fd013982459c`
- Runtime source file: `lemma_95.tsv`
- Upstream method: counts lemmas across all 27 books using MorphGNT lemmatization, then sorts by occurrence count.

BG5 introduced this source before Koinē Path had a full local reader corpus. BG6 now regenerates frequency directly from the exact pinned MorphGNT corpus used by the reader and treats that generated index as the preferred runtime authority. The `core-gnt-vocab` source remains a version-pinned fallback and a useful independent cross-check.

Frequency and rank are corpus statistics. They do **not** determine lexical meaning.

## Dodson Greek-English Lexicon

**Role in BG5/BG6:** compact reference-gloss prompts present in the upstream core-vocabulary table.

John Jeffrey Dodson released his Greek-English lexicon into the public domain. Koinē Path treats these strings only as **reference gloss prompts**. They are not complete lexical definitions and are never authoritative evidence for the contextual sense of a word in a particular verse.

Relevant machine-readable edition: https://github.com/biblicalhumanities/Dodson-Greek-Lexicon

BG6 exact-corpus frequency replaces ranks and counts, not these independently sourced lexical prompts. A lemma without a reviewed reference gloss may therefore have exact frequency while its English prompt remains unavailable.

## Koinē Path learning annotations

**Role:** pedagogical hints, selected contextual notes, course mappings, difficulty metadata, and reviewed instructional content.

These are project-created editorial annotations. They remain outside canonical text/morphology/frequency fields so that a hint, gloss, or pedagogical simplification can never masquerade as source data.

## English translation policy

BG6 does not bundle a complete English Bible translation. The full reader therefore does not silently redistribute an English translation or generate one as though it were a canonical source.

A future comparison translation must have an explicit source, edition, license, and attribution policy before inclusion.

## Semantic boundary

The application must keep these claims distinct:

1. `lemma X occurs N times` — corpus statistic;
2. `X may be glossed …` — lexical reference prompt;
3. `X means … here` — contextual interpretation requiring passage evidence;
4. `therefore this verse teaches …` — interpretive/theological reasoning beyond lexical lookup.

The reader and SRS may support steps 1–2 and reviewed passage-specific learning notes. They may not automatically infer steps 3–4 from a flashcard gloss or morphology tag.
