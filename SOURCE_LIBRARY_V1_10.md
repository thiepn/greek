# Koinē Path V1.10 — Scholarly Source Library, Bibliography Management & Research Import

V1.10 adds a structured bibliographic layer beneath the existing V1.8 corpus/source notebook and V1.9 research-synthesis dossier.

## Purpose

A scholarly source is stored once as reusable bibliographic metadata. Research notes and dossier evidence refer to that source through explicit links rather than silently duplicating an editable master citation.

The source library is **metadata-first**. It does not fetch, scrape, store, summarize, rank, or endorse source full text.

## Persistent state

Store: `koine-path-source-library-v1`

Schema: `1`

Bounds:
- 500 sources;
- 40 collections;
- 24 tags per source;
- 12,000 characters of source notes;
- 80 locator annotations per source;
- 1,000 source-to-research links;
- 300 records per BibTeX/RIS import.

Persistent source records explicitly reject `fullText`, `pdf`, `content`, or `body` payload fields during validation.

## Supported source types

- book
- article
- chapter
- thesis
- dissertation
- website
- conference paper
- grammar
- lexicon
- commentary
- other

## Bibliographic metadata

Records support title/subtitle, authors, editors, year, publisher, place, container/journal title, volume, issue, pages, edition, DOI, ISBN, URL, access date, language, citation key, tags, notes, verification workflow metadata, and locator annotations.

## Duplicate detection

Duplicate detection is deterministic and intentionally conservative:

1. normalized DOI;
2. normalized ISBN;
3. normalized title + first contributor + year.

A detected duplicate is not automatically merged. Manual creation rejects it by default, and import skips it by default. This protects source identity without pretending the app can adjudicate editions, translations, revised titles, or bibliographic edge cases automatically.

## Citation keys

Citation keys are generated from first contributor + year + a significant title word. Collisions receive deterministic numeric suffixes within the local library. Imported BibTeX citation keys are preserved when valid and available.

## Research import

V1.10 accepts pasted BibTeX and RIS metadata. Import is capped at 300 records per operation.

Import does not retrieve or embed the underlying publication. DOI/URL fields remain location metadata only.

## Verification workflow labels

Source records can be marked:

- `unverified`
- `metadata-checked`
- `consulted`

These are user workflow labels only. They are not authority, quality, reliability, consensus, peer-review, or truth scores.

## Locator annotations

A source can contain bounded notes tied to a locator such as a page, section, lexicon headword, or other user-entered reference point. An annotation may optionally link to a V1.7 passage project.

## V1.8 Research integration

Sending a V1.10 source to Research:

1. creates or reuses a V1.8 `external` research entry;
2. snapshots the current formatted citation into that research entry;
3. stores an explicit V1.10 source → V1.8 research-entry link;
4. preserves the original source ID independently of the V1.8 notebook schema.

The source-library link also stores a citation snapshot. Later edits to library metadata therefore do not silently rewrite an already-used research citation.

## V1.9 dossier integration

Sending a V1.10 source to an active dossier first goes through V1.8 Research, then uses V1.9's existing `importResearchEntry` API.

This preserves the established evidence provenance contract rather than inventing a new parallel evidence class.

A dossier-side V1.10 bibliography panel resolves structured sources from V1.9 evidence → V1.8 research-entry IDs → V1.10 source links. The panel can export those resolved sources as BibTeX, RIS, or formatted bibliography text.

The V1.9 claim graph itself remains unchanged.

## Bibliography exports

V1.10 can export:

- BibTeX (`.bib`)
- RIS (`.ris`)
- formatted plain-text bibliography

Exports can represent the full library or a selected collection. The dossier bridge can export only structured sources actually connected to imported dossier evidence.

The built-in formatted citation is a deterministic neutral bibliographic rendering, not a claim of perfect compliance with every citation style. V1.10 does not implement CSL or style-specific publishing rules.

## Mastery firewall

V1.10 source creation, import, verification labels, collections, annotations, research linking, dossier linking, and bibliography export do not call canonical mastery-write APIs.

Source collection and citation activity are research workflow, not evidence that the learner has mastered Greek.

## Authority / quality boundary

V1.10 does **not**:

- calculate an authority score;
- calculate a source quality score;
- calculate a consensus score;
- infer peer-review status from metadata;
- rank sources automatically;
- decide which scholar or interpretation is correct;
- infer truth from citation count;
- automatically merge possible duplicate editions;
- retrieve copyrighted publication text;
- synchronize with Zotero, Crossref, WorldCat, library catalogs, or commercial bibliographic databases.

## Portability

The source-library store is guarded during backup parsing and restore. The final V1.10 runtime backup metadata is `v1.10-feature`.

The wrapper preserves the existing V1.2+ atomic restore, recovery journal, rollback, integrity, and all V1.8/V1.9 validation layers.

## Offline behavior

The source engine, UI, bibliography bridge, styles, and portability guard are part of the generated PWA application shell. Only locally entered/imported bibliographic metadata is available offline; V1.10 does not cache linked external publications.

## Acceptance gate

V1.10 is accepted only when the same exact PR head passes:

- deterministic source-library validation;
- Chromium source-library workflow;
- V1.9 synthesis regression;
- V1.8 corpus-research regression;
- V1.7 passage-workbench regression;
- learner-data portability;
- PWA/offline validation;
- mobile/accessibility validation;
- full NT corpus validation;
- all established learning subsystem workflows.
