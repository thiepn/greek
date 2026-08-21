# Data attribution and licensing

Koinē Path separates the Greek text, morphology/lemmatization, and Koinē Path learning annotations because they come from different sources and carry different licensing obligations.

## SBL Greek New Testament (SBLGNT)

**Role in Koinē Path:** canonical Greek surface text.

- Title: *SBL Greek New Testament (SBLGNT)*
- Copyright: Society of Biblical Literature and Logos Bible Software
- Official site: https://www.sblgnt.com/
- Official license: Creative Commons Attribution 4.0 International (CC BY 4.0)
- License: https://www.sblgnt.com/license/

Koinē Path reproduces and may technically normalize SBLGNT text under CC BY 4.0. Attribution is retained here and in the machine-readable source manifest. No endorsement by SBL, Logos, or Faithlife is implied.

## MorphGNT: SBLGNT Edition

**Role in Koinē Path:** token boundaries, normalized forms, lemmas, part-of-speech codes, and morphological parse codes.

- Repository: https://github.com/morphgnt/sblgnt
- Pinned revision: `aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`
- Data citation: Tauber, J. K., ed. (2017), *MorphGNT: SBLGNT Edition*, Version 6.12. DOI: 10.5281/zenodo.376200
- Morphological parsing and lemmatization license: CC BY-SA 3.0
- License: https://creativecommons.org/licenses/by-sa/3.0/

The MorphGNT repository's README still describes the SBLGNT text using the older wording “subject to the SBLGNT EULA.” Koinē Path follows the current official SBLGNT license page for the text itself and MorphGNT's stated CC BY-SA 3.0 terms for its morphology and lemmatization.

## Koinē Path learning annotations

**Role:** pedagogical hints, compact learning glosses, course mappings, difficulty metadata, and later reviewed instructional notes.

These are project-created editorial annotations. They are deliberately stored outside the canonical text/morphology fields so that a hint or gloss can never masquerade as source data.

A learning gloss is not a complete lexical definition and must not be used by the application as evidence for a contextual semantic claim.

## Current BG2 coverage

BG2 commits only a validated foundation sample, John 1:1, into the runtime dataset. It establishes the schema and import/validation contract for later full-corpus ingestion. NT-wide frequency values intentionally remain null until a complete pinned corpus has been imported and counted.