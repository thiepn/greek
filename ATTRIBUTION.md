# Data attribution and licensing

Koinē Path separates Greek text, morphology/lemmatization, corpus frequency, lexical reference data, and Koinē Path learning annotations because they have different evidential roles and licensing histories.

## SBL Greek New Testament (SBLGNT)

**Role in Koinē Path:** canonical Greek surface text.

- Title: *SBL Greek New Testament (SBLGNT)*
- Copyright: Society of Biblical Literature and Logos Bible Software
- Official site: https://www.sblgnt.com/
- Official license: Creative Commons Attribution 4.0 International (CC BY 4.0)
- License: https://www.sblgnt.com/license/

Koinē Path reproduces and may technically normalize SBLGNT text under CC BY 4.0. Attribution is retained here and in the machine-readable source manifest. No endorsement by SBL, Logos, or Faithlife is implied.

## MorphGNT: SBLGNT Edition

**Role in Koinē Path:** token boundaries, normalized forms, lemmas, part-of-speech codes, morphological parse codes, and the underlying lemmatization used by the vocabulary-frequency source.

- Repository: https://github.com/morphgnt/sblgnt
- Pinned BG2 revision: `aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`
- Data citation: Tauber, J. K., ed. (2017), *MorphGNT: SBLGNT Edition*, Version 6.12. DOI: 10.5281/zenodo.376200
- Morphological parsing and lemmatization license: CC BY-SA 3.0
- License: https://creativecommons.org/licenses/by-sa/3.0/

The MorphGNT repository README uses older wording for SBLGNT text licensing. Koinē Path follows the current official SBLGNT license page for the text itself and MorphGNT's stated CC BY-SA terms for morphology and lemmatization.

## Core GNT Vocabulary frequency source

**Role in BG5:** NT-wide lemma occurrence counts and rank ordering used to bootstrap the 1,000-core / 1,200-stretch vocabulary system.

- Repository: https://github.com/jtauber/core-gnt-vocab
- Pinned revision: `136cc6464f1d4dfca9dec63fbbe5fd013982459c`
- Runtime file: `lemma_95.tsv`
- Upstream method: counts lemmas across all 27 books using MorphGNT lemmatization, then sorts by occurrence count.

Koinē Path loads at most the first 1,200 ranked rows and caches them locally. Frequency and rank are corpus statistics; they do **not** determine lexical meaning. The BG5 source is version-pinned so vocabulary ordering cannot silently change upstream.

This BG5 frequency layer is separate from the BG2 token corpus. BG2 still contains only a local John 1:1 token fixture; a later full-corpus ingest should regenerate the rank table directly from the same pinned corpus used by the reader and can replace the BG5 bootstrap without changing the SRS schema.

## Dodson Greek-English Lexicon

**Role in BG5:** compact reference gloss prompts present in the upstream core-vocabulary table.

John Jeffrey Dodson released his Greek-English lexicon into the public domain. Koinē Path treats these strings only as **reference gloss prompts**. They are not complete lexical definitions and are never authoritative evidence for the contextual sense of a word in a particular verse.

Relevant machine-readable edition: https://github.com/biblicalhumanities/Dodson-Greek-Lexicon

## Koinē Path learning annotations

**Role:** pedagogical hints, selected contextual notes, course mappings, difficulty metadata, and reviewed instructional content.

These are project-created editorial annotations. They remain outside canonical text/morphology/frequency fields so that a hint, gloss, or pedagogical simplification can never masquerade as source data.

## Semantic boundary

The application must keep these claims distinct:

1. `lemma X occurs N times` — corpus statistic;
2. `X may be glossed …` — lexical reference prompt;
3. `X means … here` — contextual interpretation requiring passage evidence;
4. `therefore this verse teaches …` — interpretive/theological reasoning beyond lexical lookup.

BG5 may support steps 1–2 and reviewed passage-specific learning notes. It may not automatically infer steps 3–4 from a flashcard gloss.