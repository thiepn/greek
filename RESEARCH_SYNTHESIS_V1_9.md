# V1.9 — Research Synthesis, Citation Graph & Exegetical Dossier

## Purpose
V1.9 turns V1.7 passage projects and V1.8 research notes into an explicit, auditable argument workspace. It does not turn citation volume into truth, scholarly consensus, or mastery.

## Persistent model
Store: `koine-path-research-synthesis-v1`, schema 1.

A dossier contains writing sections, claims, evidence nodes, citation-graph links, and alternative readings. Evidence imported from V1.8 is snapshotted with its provenance and source ID so later notebook edits cannot silently rewrite the dossier's evidence record.

Bounds per local profile:
- 24 dossiers;
- 120 claims per dossier;
- 240 evidence nodes per dossier;
- 480 citation links per dossier;
- 24 alternative readings per dossier;
- 12,000 characters per major writing section.

## Claim layers
Every claim is explicitly labeled as one of:
- observation;
- argument;
- inference;
- theological synthesis.

Confidence is learner-assigned: unspecified, low, medium, or high. Koinē Path does not derive confidence from citation counts.

Contestation is learner-assigned: uncontested, contested, or unresolved. These labels record the researcher's current framing; they are not claims of scholarly consensus.

## Evidence nodes
Evidence can be:
- a V1.8 research-entry snapshot, preserving corpus / reviewed / learner / external provenance; or
- a direct canonical passage anchor, always classified as canonical corpus evidence.

External evidence snapshots preserve citation, locator, and optional HTTP(S) URL metadata. V1.9 does not fetch, verify, rank, summarize, or endorse the external source.

## Citation graph
Claim-to-evidence edges must be added deliberately with one relation:
- support;
- counter;
- context;
- unresolved.

The app never infers an edge merely because a source is present in the dossier.

## Evidence-gap detection
The deterministic gap report surfaces:
- claims without a support edge;
- contested claims without a counter-evidence edge;
- unresolved claims without an unresolved edge;
- evidence nodes not linked to any claim.

These are missing-link checks, not truth scores, quality scores, or psychometric assessments.

## Alternative readings
Alternative readings group claims for comparison. The comparison displays only descriptive counts of claims and citation-edge relations. It never chooses a winner automatically.

## Dossier completion
Completion requires:
- a thesis;
- a conclusion;
- limitations / unresolved-questions text;
- at least one explicit claim;
- every non-unresolved claim to have at least one support edge.

A completed dossier may still contain contested or unresolved material. Completion marks a research-writing checkpoint only.

## Export
Markdown export includes:
- research question;
- context;
- thesis;
- layered claim graph;
- citation-edge labels;
- alternative readings;
- argument outline;
- conclusion;
- theological synthesis;
- limitations;
- evidence-gap report;
- evidence appendix;
- external-source bibliography.

## Mastery firewall
V1.9 exposes no `recordEvidence`, `recordExposure`, or `recordHint` path. Creating dossiers, writing claims, importing sources, linking citations, setting confidence, completing a dossier, or exporting Markdown cannot directly mutate canonical mastery.

## Explicit non-goals
- automatic theological conclusions;
- automatic claim generation;
- automatic winner selection among readings;
- scholarly-consensus inference;
- citation-count quality scoring;
- psychometric research-quality scoring;
- source verification or external retrieval;
- bibliographic database sync;
- collaborative cloud research;
- mastery credit for dossier completion.