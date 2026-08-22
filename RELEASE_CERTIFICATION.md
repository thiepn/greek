# Koinē Path v1.1.0 — Release Certification

## Current release state

Koinē Path **v1.1.0** is the release candidate for the V1.1 Full Learning-Experience Audit & Course Deepening work merged to `main` through PR #24.

Release source baseline:

`a48f7c781b3665fdd601abf5080282a1cc2ae29a`

Frozen V1.1 certified-content fingerprint:

`800642ad7fdc25f2a1b576abe6e013940da7171c1857d1718cb0d84d2a2660c1`

This candidate preserves the exact pinned Greek corpus and the complete canonical 50-unit course while adding the V1.1 learning-experience layer to every unit.

## Final release certification record

The v1.1.0 release candidate passed the complete `Final Release Certification` gate on **2026-08-22**.

Certified runtime head:

`d319d149e4daa35b96ec0b35ecac3aafea9a58e4`

Certification evidence:

- workflow run: `32588533293`;
- certification job: `97068507129`;
- generated release-candidate fingerprint: `f269ba35d5a73a26ab9eafa7624f4775d12c6c30d4ce9371d2221b37c15e55c8`;
- release-certification artifact ID: `9479708118`;
- artifact SHA-256: `9620e086998dc3d6233b28b5f14854b3a371326e6f2c1a72cfea2895c3fa5930`;
- frozen content fingerprint reverified: `800642ad7fdc25f2a1b576abe6e013940da7171c1857d1718cb0d84d2a2660c1`.

Generated verdicts:

- technical: **`TECHNICAL_RC_CERTIFIED`**;
- product: **`V1_RELEASE_CERTIFIED`**;
- production: **`PENDING_MAIN_DEPLOYMENT`**;
- registered release blockers: **0**.

The successful browser matrix certified all 12 mandatory workspaces in Chromium, Firefox, and WebKit. Chromium exercised all 50 course units; Firefox and WebKit exercised representative early, middle, and final course views. The matrix separately verified exactly three canonical mastery checkpoints and two unscored V1.1 practice items per tested unit, legacy learner-state migration, persistent local state, service-worker control, exact corpus fetches, and offline reader recovery.

This record is documentation evidence only. It is deliberately excluded from the application runtime fingerprint; `RELEASE_CANDIDATE.json` is not made self-referential by embedding the generated release fingerprint into the runtime snapshot.

## V1.1 learning contract

Every canonical unit must preserve the underlying production lesson and add the following learning functions:

**Reading problem → Observe → Learn → Forms → Contrast → Unscored Practice → Safeguard → Explain reasoning → Scripture → Canonical Checkpoint → Read again**

The frozen release contract requires:

- exactly **50** canonical units;
- exactly **150** canonical mastery checkpoints;
- exactly **50** V1.1 enriched unit records;
- exactly **100** supplementary retrieval items;
- exactly **50** observation tasks;
- exactly **50** contrast tasks;
- exactly **50** explain-your-reasoning prompts;
- at least one Scripture-transfer task in every unit;
- supplementary V1.1 practice remaining outside canonical mastery evidence.

The supplementary layer is intentionally a rehearsal space. It must not call `recordEvidence()` or `recordExposure()` and cannot increase canonical mastery merely because a learner completed practice.

## Content and scholarly QA boundary

The release reruns the complete internally reviewed content suite, including:

- canonical course integrity;
- V1.1 learning-experience integrity;
- morphology and explicit syncretism;
- vocabulary/SRS safeguards;
- reviewed syntax exercises;
- reading-fluency checkpoints;
- exegesis and edition-awareness cases;
- pronunciation profiles and drills;
- exact full-corpus rebuild and passage-reference validation;
- Unicode normalization and anti-slogan safeguards.

The frozen content snapshot contains the same pinned MorphGNT/SBLGNT source revision:

`aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`

Expected full-corpus coverage remains:

- 27 books;
- 260 chapters;
- 7,927 token-bearing verses;
- 137,554 tokens;
- 5,461 lemmas.

The internal content fingerprint is an editorial/deterministic QA boundary. It is **not** represented as independent external scholarly peer review.

## Technical release gate

`Final Release Certification` must run from a `release/*` pull request and pass before this candidate may be merged.

The gate includes:

1. release-contract validation;
2. clean/current and legacy learner-state migration validation;
3. complete course and V1.1 content QA;
4. exact pinned-corpus rebuild;
5. PWA shell rebuild and validation;
6. Playwright Chromium, Firefox, and WebKit installation;
7. cross-browser release smoke testing at the GitHub Pages project path;
8. deterministic release-candidate manifest/fingerprint generation;
9. release certification artifact upload.

The independent V1.1 learner simulation and BG14 mobile/axe accessibility suites remain separate required subsystem gates.

## Release verdict model

### Technical RC

The certified release artifact for the runtime snapshot records:

**`TECHNICAL_RC_CERTIFIED`**

### Product

The release blocker register is empty and the certified release artifact records:

**`V1_RELEASE_CERTIFIED`**

### Production

Production certification is deliberately unavailable on the release branch.

The candidate must first be merged to `main`, deployed by the main-only GitHub Pages workflow, and verified against the public `/greek/` deployment.

Until that occurs:

**`PENDING_MAIN_DEPLOYMENT`**

The existing v1.0.0 production certification remains the last verified production state and is preserved in `RELEASE_CANDIDATE.json` as release lineage.

## Learner-state migration policy

Koinē Path remains local-first. Release certification must not solve compatibility problems by wiping browser storage.

The supported historical migration remains:

`koine-path-v01` → `koine-path-learning-v3`

Legacy completion imports only low-confidence evidence and cannot grant full canonical mastery or bypass curriculum gates. The V1.1 supplementary layer introduces no new mastery storage schema.

## Security boundary

The static GitHub Pages application contains no OpenAI API secret. The remote tutor remains optional and requires the secure BG8 proxy. AI output has no canonical mastery write path.

## Accessibility claim boundary

Automated reflow, keyboard, focus, touch-target, and axe coverage remain release requirements. The release still does **not** claim complete manual VoiceOver, TalkBack, or NVDA certification unless those physical/manual matrices are separately executed and recorded.

## Release sequence

The v1.1.0 production sequence is:

1. create `release/v1.1.0` from merged `main`;
2. freeze V1.1 content fingerprint and release metadata;
3. open the release PR to `main`;
4. pass Final Release Certification and all inherited subsystem gates;
5. merge the certified release PR;
6. allow the main-only GitHub Pages deployment to complete;
7. verify the exact live main revision, PWA marker, release metadata, and corpus identity;
8. promote v1.1.0 production metadata only after successful public verification.

No release-branch certification alone may be described as `PRODUCTION_CERTIFIED`.
