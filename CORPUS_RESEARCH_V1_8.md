# V1.8 — Corpus Research, Cross-Passage Comparison & Source Notebook

## Purpose

V1.8 extends Koinē Path from single-passage exegetical projects into reproducible corpus research. It is a research-organizing layer, not a second mastery engine and not an automatic interpretation system.

## Evidence classes

Every persistent research-notebook entry has exactly one provenance class:

1. **Canonical corpus** — observations saved from the pinned SBLGNT/MorphGNT corpus or a canonical passage comparison.
2. **Reviewed Koinē Path** — reviewed internal material such as a BG11 exegesis case. Adding it to the notebook does not replay or score the case.
3. **Learner observation** — the learner's own inference, hypothesis, or synthesis.
4. **External source** — user-entered citation metadata and notes about a source outside Koinē Path.

These classes are intentionally not interchangeable. A learner observation does not become canonical because it is linked to a corpus reference. An external-source note is not endorsed merely because it is stored beside corpus evidence.

## Exact corpus search

Search supports exact NFC-normalized matching by:

- lemma; or
- surface form.

Lemma search and form search remain distinct operations. Search can cover the whole 27-book New Testament or one selected book.

The search scans the generated pinned book corpus at runtime. Search output is transient. A saved search stores:

- mode;
- exact query;
- scope;
- corpus revision;
- total hit count;
- per-book counts;
- up to 160 hit references/token identifiers.

Verse text/context is not copied into the persistent saved-search record.

## Cross-passage comparison

A comparison contains 2–6 unique canonical verse ranges. Runtime analysis reports:

- token count per passage;
- unique lemma count per passage;
- lemmas occurring in every selected passage.

Shared lemmas are descriptive corpus signals only. They do not establish identical contextual meaning, semantic equivalence, source dependence, discourse function, or theology.

Saved comparisons retain references, the corpus revision, an optional learner note, and optional V1.7 project linkage. Materialized passage text remains runtime data rather than persistent duplicate Scripture content.

## Source notebook

External-source records store:

- source/title;
- citation string;
- optional locator/page/section;
- optional HTTP(S) URL;
- learner-authored note;
- optional V1.7 project link.

Koinē Path does not automatically fetch, verify, summarize, rank, or endorse an external source in V1.8.

Reviewed BG11 material is added through an explicit reviewed-material path so its provenance cannot silently become learner-authored or canonical-corpus evidence.

## V1.7 project linkage

V1.8 entries may reference a V1.7 project ID. This creates a research association only.

The V1.7 project store is not rewritten when research is linked. A thin UI bridge displays linked research inside an open workbench project and routes back to the Research view.

Deleting V1.8 research does not invalidate the V1.7 project. Archiving or reopening a V1.7 project does not rewrite V1.8 evidence provenance.

## Export

Research Markdown export includes:

- saved-search metadata;
- saved-comparison references and notes;
- notebook entries grouped by provenance;
- external citations, locators, and URLs;
- linked project names when available.

The export deliberately does not reproduce full materialized Greek passages.

## Persistence bounds

Store: `koine-path-corpus-research-v1`

Schema: `1`

Bounds:

- 40 saved searches;
- 160 saved hit references per search;
- 24 saved comparisons;
- 6 passages per comparison;
- 180 notebook entries;
- 8,000 characters per notebook note.

The V1.8 portability guard rejects malformed schema, malformed references, unsupported provenance, invalid external URLs, and bound violations before import/restore. Backup metadata is advanced to `v1.8-feature` while the existing atomic recovery journal remains authoritative.

## Mastery firewall

`corpus-research-engine.js`, `corpus-research-ui.js`, and `corpus-research-workbench-bridge.js` contain no `recordEvidence`, `recordExposure`, or `recordHint` path.

The following actions cannot award canonical mastery:

- running a corpus search;
- saving a search;
- opening a result;
- adding a result to a comparison;
- saving a comparison;
- adding corpus evidence to the research notebook;
- adding reviewed material to the notebook;
- writing learner observations;
- recording external-source notes;
- linking research to a V1.7 project;
- editing/deleting notebook entries;
- exporting the research notebook.

Pre-existing scored tools retain their own evidence contracts.

## Explicit non-goals

V1.8 does not provide:

- fuzzy semantic search;
- automatic word-sense disambiguation;
- automatic theological conclusions;
- automatic cross-reference generation;
- semantic equivalence claims from shared lemmas;
- automatic external-source retrieval or verification;
- bibliographic database synchronization;
- cloud collaboration;
- server-side research storage;
- mastery credit for research quantity;
- psychometric research-quality scoring.

## Acceptance gate

The phase is acceptable only when the exact PR head passes:

- deterministic V1.8 contracts;
- V1.7 passage-workbench contract;
- V1.6 reading-goal contract;
- full pinned NT corpus build/validation;
- PWA shell inclusion;
- Chromium corpus-research workflow;
- 320px reflow;
- portability/recovery protection;
- mastery-state byte-for-byte isolation;
- the affected repository regression matrix.
