# Koinē Path — Release notes

## 1.1.0 — Production release

Koinē Path v1.1.0 deepens the complete v1 course into a more deliberate reading-learning experience across all 50 canonical units while preserving the existing mastery model and full Greek New Testament toolchain.

Frozen certified-content fingerprint:

`800642ad7fdc25f2a1b576abe6e013940da7171c1857d1718cb0d84d2a2660c1`

Accepted final release-head fingerprint:

`fd11e3721181e6f83b9c67881325c69ecdcbee79fdd111597c912ba44e4bb3e8`

Frozen application runtime fingerprint at release certification:

`1c690bc15c47d3092fcc48f104302cf12d2c80d1a7ef82f3438df41d9e653887`

### Learning-experience reconstruction

All 50 canonical units explicitly train:

**Reading problem → Observe → Learn → Forms → Contrast → Unscored Practice → Safeguard → Explain reasoning → Scripture → Canonical Checkpoint → Read again**

V1.1 adds:

- 50 unit-specific reading-problem orientations;
- 50 observation tasks;
- 50 contrast/minimal-pair tasks;
- exactly **100 supplementary retrieval questions**;
- 50 explain-your-reasoning prompts;
- reduced-assistance Scripture re-reading after the checkpoint;
- progressive explanation disclosure.

The existing **150 canonical mastery checkpoints remain intact**.

### Mastery firewall

The 100 V1.1 practice questions are deliberately unscored rehearsal. They do not call canonical evidence/exposure writers and cannot increase mastery merely by completion. Dedicated browser certification verifies that supplementary practice leaves canonical learner mastery unchanged while the reviewed checkpoints still write evidence as designed.

### Release certification

Final Release Certification passed on the release branch with:

- Chromium, Firefox, and WebKit;
- all 12 mandatory workspaces;
- all 50 units exercised in Chromium;
- representative course flows in Firefox and WebKit;
- learner-state migration and reload preservation;
- exact pinned 27-book corpus rebuild;
- complete V1.1/content QA suite;
- PWA shell validation;
- service-worker-controlled online → offline reader recovery.

Final-head release certification run: `32588725723`.

### Exact production deployment verification

The certified release was merged to `main` commit:

`27eadce94b823c2be45ae6b03c8c9f6da101dce1`

GitHub Pages deployed PWA build:

`bg13-27eadce94b82`

The actual public `/greek/` deployment was then verified by workflow run `32589598659`, job `97071184937`, which completed with:

**`V1_1_RELEASE_DEPLOYMENT_VERIFIED`**

The live probe verified the application root, V1.1 assets, 50 canonical units, 150 canonical checkpoints, 50 enrichment records, 100 unscored practice items, PWA shell/service-worker identity, exact corpus revision, full corpus coverage, and the live John artifact.

### Production verdict

- **`TECHNICAL_RC_CERTIFIED`**
- **`V1_RELEASE_CERTIFIED`**
- **`PRODUCTION_CERTIFIED`**
- registered release blockers: **0**

The production-promotion metadata is release-only; it does not alter the V1.1 learning runtime or scholarly content. After that metadata is merged, a final public probe should confirm the production-certified metadata at the resulting `main` SHA.

### Claim boundaries

V1.1 does not claim independent external scholarly peer review. Automated WCAG-oriented checks do not replace manual VoiceOver, TalkBack, or NVDA certification. Remote AI remains optional and requires the separately deployed secure BG8 Worker; deterministic fallback remains available.

---

## 1.0.0 — Previous production release

Koinē Path v1.0.0 established the complete 50-unit course, exactly 150 canonical mastery checkpoints, the full pinned Greek NT reader, morphology/vocabulary/syntax/fluency/exegesis/pronunciation systems, PWA/offline support, mobile/accessibility infrastructure, content fingerprinting, cross-browser release certification, and exact GitHub Pages production verification.

Verified v1.0 production main commit:

`60b7028017dfb7cc1b3adab9b153f00ab6c72b6f`

Frozen v1.0 content fingerprint:

`e654a810fca0c9fbfa88c8808fa275204fba5a3806ac5ffd4f052a4ef0e9e445`

Accepted v1.0 RC fingerprint:

`7deb0d2f913498fae9c90a95655e032b39753fb5302332185480738eb3398714`

## Historical 1.0 release candidates

`1.0.0-rc.2` resolved `BG16-B001` by replacing the five-lesson prototype with production instructional content for all 50 canonical units. `1.0.0-rc.1` had correctly blocked product certification while that course-completeness gap remained.
