# Koinē Path — Release notes

## 1.1.0-rc.1 — Learning-experience deepening candidate

Koinē Path v1.1.0-rc.1 promotes the V1.1 Full Learning-Experience Audit & Course Deepening work merged through PR #24 into the formal release-certification pipeline.

Release source baseline:

`a48f7c781b3665fdd601abf5080282a1cc2ae29a`

Frozen certified-content fingerprint:

`800642ad7fdc25f2a1b576abe6e013940da7171c1857d1718cb0d84d2a2660c1`

### Learning-experience reconstruction

All 50 canonical units now explicitly train a fuller reading-learning loop:

**Reading problem → Observe → Learn → Forms → Contrast → Unscored Practice → Safeguard → Explain reasoning → Scripture → Canonical Checkpoint → Read again**

V1.1 adds:

- 50 unit-specific reading-problem orientations;
- 50 observation tasks;
- 50 contrast/minimal-pair tasks;
- exactly **100 supplementary retrieval questions**;
- 50 explain-your-reasoning prompts;
- reduced-assistance Scripture re-reading after the checkpoint;
- progressive disclosure for explanations.

The existing **150 canonical mastery checkpoints are preserved**.

### Mastery firewall

The 100 V1.1 practice questions are deliberately unscored rehearsal. They do not call the canonical evidence/exposure writers and cannot increase mastery merely by completion.

The dedicated Chromium learner simulation verifies that supplementary practice leaves `koine-path-learning-v3` unchanged while canonical checkpoints still write learner evidence.

### V1.1 content QA

The deterministic content manifest now includes the learning-experience layer itself. The certified snapshot requires exact 50-unit enrichment coverage, exact 100-practice-item coverage, unique IDs, NFC-normalized Greek, valid observation/contrast/reasoning structures, preservation of the 150 canonical checkpoints, and anti-slogan safeguards for tense/aspect, article syntax, case functions, discourse, lexical semantics, and textual criticism.

### Release certification boundary

This RC must pass:

- Final Release Certification;
- Chromium / Firefox / WebKit release smoke;
- full pinned-corpus rebuild;
- learner-state migration tests;
- Content QA Validation;
- Learning Experience Validation;
- Mobile Accessibility Validation;
- PWA Offline Validation;
- all inherited Greek-data, morphology, vocabulary, syntax, fluency, exegesis, pronunciation, adaptive-review, and secure-tutor regressions.

Production remains **`PENDING_MAIN_DEPLOYMENT`** until the certified release is merged to `main`, deployed, and the exact public GitHub Pages revision is verified.

### Claim boundaries

V1.1 does not claim independent external scholarly peer review. Automated WCAG-oriented checks do not replace manual VoiceOver, TalkBack, or NVDA certification. Remote AI remains optional and requires the separately deployed secure BG8 Worker.

---

## 1.0.0 — Production release

Koinē Path v1.0.0 is the previously production-certified baseline. It established the complete 50-unit course, exactly 150 canonical mastery checkpoints, the full pinned Greek NT reader, morphology/vocabulary/syntax/fluency/exegesis/pronunciation systems, PWA/offline support, mobile/accessibility infrastructure, content fingerprinting, cross-browser release certification, and exact GitHub Pages production verification.

Production main commit:

`60b7028017dfb7cc1b3adab9b153f00ab6c72b6f`

Frozen v1.0.0 content fingerprint:

`e654a810fca0c9fbfa88c8808fa275204fba5a3806ac5ffd4f052a4ef0e9e445`

Accepted v1.0.0 RC fingerprint:

`7deb0d2f913498fae9c90a95655e032b39753fb5302332185480738eb3398714`

The v1.0.0 deployment was verified by workflow run `32540664820` / job `96951794130` with `PRODUCTION_DEPLOYMENT_VERIFIED`.

## Historical 1.0 release candidates

`1.0.0-rc.2` resolved `BG16-B001` by replacing the five-lesson prototype with production instructional content for all 50 canonical units. `1.0.0-rc.1` had correctly blocked product certification while that course-completeness gap remained.
