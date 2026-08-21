# BG15 — Content QA & Greek Accuracy Audit

BG15 is the scholarly-content hardening pass for Koinē Path. It audits the reviewed Greek-learning content, source/provenance boundaries, deterministic corpus contracts, and pedagogical claims that will be handed to BG16 release certification.

## Certification boundary

A BG15 pass means the repository satisfies the **declared deterministic content-QA contract** and that the reviewed editorial content listed below has been checked for the documented structural, provenance, Unicode, ambiguity, and pedagogical safeguards.

It does **not** mean:

- the project has received independent external scholarly peer review;
- every possible linguistic analysis is undisputed;
- the selected pronunciation reconstruction is the only historically possible pronunciation;
- the compact SBLGNT edition-comparison apparatus substitutes for manuscript evidence;
- an AI answer can become canonical Greek data.

Those boundaries are intentionally visible rather than hidden behind a generic “scholarly” label.

## Audited content surface

BG15 covers:

- all **50 curriculum units** across Stages 0–7;
- **130 modeled morphology parses** after BG15 syncretism corrections;
- three six-slot principal-part recognition sets;
- the BG5 fallback vocabulary seed plus exact-corpus BG6 frequency contract;
- **34 reviewed syntax exercises** across Units 38–44;
- **15 reviewed fluency checkpoints** across Units 45–47;
- **27 reviewed intermediate/exegesis cases** across Units 48–50;
- **5 pinned SBLGNT edition-comparison cases**;
- three pronunciation profiles, six pronunciation drills, and three listening checkpoints;
- the complete pinned BG6 corpus contract: 27 books, 260 chapters, 7,927 token-bearing verses, 137,554 tokens, 5,461 lemmas;
- Unicode NFC, stable IDs, source revisions, licensing/attribution, and generated content fingerprints.

## Source truth

### Greek reader snapshot

The full reader uses the SBLGNT surface text embedded in MorphGNT revision:

`aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`

This is deliberately described as a **pinned SBLGNT/MorphGNT snapshot**. It is not described as the newest official SBLGNT release. The current official Faithlife SBLGNT repository records v1.2 (2023-07-10) as adding John 7:53–8:11, while the pinned MorphGNT snapshot used by Koinē Path has no token-bearing John 7:53–8:11 and begins John 8 at verse 12.

The reader snapshot is therefore stable until an explicit corpus migration is performed.

### Text and morphology licensing

- SBLGNT Greek text: **CC BY 4.0** under the current official SBLGNT license.
- MorphGNT morphology/lemmatization: **CC BY-SA 3.0**, pinned to the revision above.
- Compact vocabulary reference gloss prompts: Dodson-derived/public-domain source as documented in `ATTRIBUTION.md`.
- Koinē Path reviewed teaching annotations: project-created editorial content, kept separate from canonical text/morphology fields.

### Edition-comparison apparatus

BG11's five textual-variant cases are pinned to Faithlife/SBLGNT revision:

`c4d241a9c1c479a55b989ba35a4976c1d0b8052c`

This is an **edition-comparison apparatus**, not a manuscript apparatus. The learning flow is:

**notice edition variation → identify active reading → consult fuller manuscript evidence when required → establish working text → exegete**.

## Corrections made during BG15

### BG15-001 — Sparse fallback vocabulary ranks

**Problem:** the local BG5 fallback is a sparse subset, but subset position could be treated as though it were exact NT-wide rank. That could mislabel supplemental entries and allow fabricated metadata to affect curriculum ownership.

**Correction:**

- exact ranks remain populated only where source order is actually continuous/known;
- `λόγος` keeps its verified source rank 55;
- supplemental `ἀρχή` keeps exact count 55 but `rank: null` until canonical BG6 frequency is available;
- unknown ranks do not enter the automatic frequency queue;
- unknown-rank cards conservatively map to advanced exposure rather than receiving invented early-stage ownership;
- UI displays rank as unavailable instead of inventing `#N`.

### BG15-002 — Canonical frequency tie-break

**Problem:** equal-frequency lemmas were sorted with locale collation. Locale/ICU collation is suitable for display but is not a stable cross-runtime canonical ordering contract.

**Correction:** canonical frequency now uses:

1. occurrence count descending;
2. normalized lemma Unicode code-point order for ties.

The generator and validator both enforce this rule, and generated frequency/lexical metadata records it explicitly.

### BG15-003 — SBLGNT version ambiguity

**Problem:** a generic `SBLGNT` label could be read as “latest SBLGNT,” even though the pinned MorphGNT snapshot predates later official release changes.

**Correction:** canonical data, generated manifests, reader documentation, and attribution now call this an exact **pinned SBLGNT/MorphGNT snapshot** and state that it does not silently track later official releases.

### BG15-004 — Contextless morphology syncretism

**Problem:** several correct individual paradigm records could still give false one-form/one-parse certainty when presented without sentence context.

**Correction:** modeled alternatives now explicitly include, among others:

- `τῶν` — article gender ambiguity;
- `λύω` — present active indicative 1sg / present active subjunctive 1sg;
- `λύῃ` — present middle/passive indicative 2sg / present active subjunctive 3sg;
- `λύετε` — present active indicative 2pl / present active imperative 2pl;
- `ἔλυον` — imperfect active indicative 1sg / 3pl;
- `καλόν` — masculine accusative singular plus neuter nominative/accusative singular;
- `καλά` — neuter nominative/accusative plural;
- `αὐτό`, `αὐτά` — neuter nominative/accusative identities;
- `λῦον` — present active participle neuter nominative/accusative singular;
- `λύσω` — future active indicative 1sg / aorist active subjunctive 1sg;
- `λῦσαι` — aorist active infinitive / aorist middle imperative 2sg.

BG4's parser continues to combine all modeled same-surface/same-lemma alternatives instead of choosing a contextless answer silently.

### BG15-005 — Beginner tense/aspect wording

**Problem:** the former Stage 3 title “Indicative Timeframes & Principal Parts” could suggest that Greek tense-forms mechanically encode English-style time categories, conflicting with the later aspect safeguards.

**Correction:** Stage 3 is now **Indicative Systems, Aspect & Principal Parts**, with the explicit outcome that morphological form must remain distinct from contextual temporal/aspectual interpretation.

The project continues to reject slogans such as:

- `aorist = once-for-all`;
- `aorist = simple past` as a universal semantic rule;
- `present = continuous` as an automatic interpretation.

### BG15-006 — No reproducible content snapshot

**Problem:** earlier phase tests validated subsystems, but BG16 had no single machine-readable fingerprint identifying the exact reviewed content set that passed QA.

**Correction:** `scripts/generate-content-qa-manifest.cjs` now generates `generated/content-qa-manifest.json` containing:

- SHA-256 hashes of reviewed source files;
- source revisions;
- reviewed-content counts;
- exact corpus coverage;
- semantic corpus-manifest hash;
- frequency and lexical-index hashes;
- all 27 book hashes and an aggregate book-set hash;
- one final certified-content fingerprint.

The file is generated in CI and retained as an artifact for release certification.

## Pedagogical accuracy rules enforced

### Morphology is not semantics

Case, tense-form, article presence, voice, or mood can constrain interpretation. They do not by themselves encode a complete contextual meaning.

### Lexicon is not context

Reference glosses are recall prompts. Root history, first-listed gloss, frequency, and raw co-occurrence never determine contextual meaning automatically.

### Syntax is not theology

Reviewed material follows:

**grammatical fact → contextual judgment → interpretive possibility → theological conclusion**.

A later layer may depend on an earlier one, but the application may not silently collapse them.

### Textual variation precedes detailed exegesis

When wording is materially disputed, the app identifies the reading being analyzed before claiming grammatical or lexical implications.

### Pronunciation profiles are labeled conventions/reconstructions

Reconstructed Koinē is a Roman-period teaching approximation, Academic Erasmian is a classroom convention, and Modern Greek TTS is labeled Modern Greek. Modern browser TTS may not masquerade as historical Koinē audio.

## Deterministic QA gates

`Content QA Validation` must pass:

1. BG15 content contract;
2. BG4/BG15 morphology regression suite;
3. vocabulary/SRS regression suite;
4. syntax lab tests and full-corpus reference validation;
5. reading-fluency tests and corpus validation;
6. intermediate/exegesis tests and pinned apparatus validation;
7. pronunciation tests;
8. full 27-book corpus rebuild and validation;
9. content-manifest generation;
10. artifact upload of the exact QA manifest.

The inherited workflows remain independently required as regression guards.

## BG16 handoff

BG16 should consume the final green BG15 head and its generated QA manifest. BG16 still must perform release-level checks that BG15 cannot certify on its own, especially real-device accessibility/assistive-technology checks, browser/PWA certification, production deployment behavior, and final release-candidate freeze.