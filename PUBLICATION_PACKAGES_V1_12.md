# V1.12 — Publication Packages, DOCX/PDF Generation & Submission Profiles

V1.12 adds a derived-artifact layer above V1.11 Publication. It does not introduce a new research evidence type and does not persist generated DOCX/PDF/ZIP files in learner state.

## Data model

Persistent store: `koine-path-submission-profiles-v1`, schema version 1.

A submission profile stores layout and deliverable preferences only:

- page size: A4 or US Letter;
- 10–50 mm margins;
- academic serif, book serif, or clean sans font preset;
- 9–16 pt body size;
- 1, 1.15, 1.5, or 2 line spacing;
- paragraph spacing;
- page numbering and page-number start;
- title-page preference;
- header/footer text;
- institution, course/program, journal/venue, manuscript type, and optional word limit;
- selected package outputs.

At most 20 submission profiles are retained.

## Built-in submission presets

- Academic paper · A4
- Double-spaced paper · Letter
- Journal manuscript

Presets are Koinē Path convenience templates. They do not certify compliance with any institution, journal, publisher, style guide, or submission portal.

## Preflight

Preflight returns three explicit classes instead of a readiness score:

1. blocking errors;
2. warnings;
3. informational notices.

Blocking errors include the absence of an active dossier, missing publication title, malformed submission geometry, or no selected primary document output.

Warnings can include an incomplete dossier, configured word-limit overrun, V1.9 evidence gaps, missing author/year source metadata, and other conditions that may need human review.

Informational notices include unverified V1.10 source workflow state and the PDF text-model limitation.

Preflight counts are descriptive. They are not a scholarly quality score, correctness score, publication probability, or submission-readiness score.

## DOCX generation

DOCX is produced locally as a real OOXML ZIP package. The package contains Word document XML, styles, relationships, core properties, page geometry, and page-number/footer support.

When the active V1.11 publication profile uses footnotes or endnotes, V1.12 emits Word footnote/endnote parts and semantic note references rather than flattening those citations into source metadata.

The DOCX generator preserves Unicode source text in XML and therefore does not require bundling a font file.

## PDF generation

PDF is generated locally in the browser. V1.12 lays the V1.11 Markdown document into paginated browser canvases using the selected submission profile, converts each page to a JPEG image, and wraps those pages in a valid multipage PDF container.

This design preserves Greek/Unicode rendering without shipping a proprietary font file. The tradeoff is explicit: V1.12 PDF text is visual/raster text, not tagged or reliably selectable/searchable PDF text. This limitation is surfaced in preflight and the package manifest.

## Package ZIP

A submission package can contain:

- `.docx`;
- `.pdf`;
- `.md`;
- `.bib`;
- `.ris`;
- `preflight.json`;
- `manifest.json`.

`manifest.json` records dossier/profile identifiers, generation timestamp, page/typography settings, preflight counts, and every package file's media type, byte size, and FNV-1a32 checksum.

The generated ZIP is a derived download. It is not written into Koinē Path local storage.

## Provenance and mutation boundary

The generation chain is:

`V1.7 project → V1.8 research → V1.9 dossier/evidence → V1.10 structured sources → V1.11 publication rendering → V1.12 submission package`.

V1.12 consumes those layers but does not rewrite them. Changing submission profiles, running preflight, generating DOCX/PDF, or creating ZIP packages does not update canonical mastery, source verification, dossier status, evidence links, or research notes.

## Backup and recovery

Submission profiles participate in the existing atomic backup/recovery chain. V1.12 validates `koine-path-submission-profiles-v1` before restore and advances final application backup metadata to `v1.12-feature`.

Generated binary artifacts are not stored in backups because they are reproducible derived files.

## Explicit non-goals

V1.12 does not claim:

- Microsoft Word rendering parity across every Word/LibreOffice version;
- PDF/A, PDF/UA, tagged-PDF, selectable-text PDF, or archival compliance;
- certified SBL/Chicago/Turabian/APA/CSL formatting;
- journal- or university-specific submission compliance;
- automated peer-review, source-authority ranking, scholarly consensus, or acceptance prediction;
- cloud storage of generated packages;
- external full-text retrieval or copyrighted publication caching;
- mastery credit for publication work.

## Acceptance criteria

V1.12 is accepted only when the dedicated deterministic and Chromium workflow verifies:

- submission profile normalization, persistence, bounds, and presets;
- preflight severity separation without scoring;
- DOCX ZIP signatures and required OOXML parts;
- semantic DOCX footnote/endnote parts when selected;
- PDF `%PDF-` signature and multipage page tree;
- package ZIP manifest/checksums and selected deliverables;
- malformed backup rejection and `v1.12-feature` backup metadata;
- no writes to `koine-path-learning-v3` from package operations;
- no mutation of the active V1.9 dossier or V1.10 source library;
- PWA inclusion of V1.12 runtime assets;
- no horizontal overflow at 320 px;
- the full established regression matrix remains green on one exact head.
