# Koinē Path v1.1.0 — Production Certification

## Release state

Koinē Path **v1.1.0** has completed release-candidate certification and exact public GitHub Pages deployment verification. This production-promotion branch records that evidence without changing the learner-facing course runtime or scholarly content.

Frozen V1.1 certified-content fingerprint:

`800642ad7fdc25f2a1b576abe6e013940da7171c1857d1718cb0d84d2a2660c1`

Pinned MorphGNT/SBLGNT revision:

`aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`

## Release-candidate certification

The V1.1 release passed the complete Final Release Certification matrix before merge.

Final certified release head:

`edea302467608a152ba172465bb5c00e256b8c79`

Final-head certification evidence:

- workflow run: `32588725723`;
- release-certification artifact: `9479755584`;
- artifact SHA-256: `38c86dc4079a430da4914cbf0b84332540078613dc35a093a6ddb8dec03617a6`;
- final-head release envelope fingerprint: `fd11e3721181e6f83b9c67881325c69ecdcbee79fdd111597c912ba44e4bb3e8`;
- frozen application runtime fingerprint: `1c690bc15c47d3092fcc48f104302cf12d2c80d1a7ef82f3438df41d9e653887`;
- content fingerprint: `800642ad7fdc25f2a1b576abe6e013940da7171c1857d1718cb0d84d2a2660c1`.

The release matrix passed Chromium, Firefox, and WebKit; all 12 mandatory workspaces; all 50 course units in Chromium; representative early/middle/final course flows in Firefox/WebKit; learner-state migration and persistence; exact pinned-corpus rebuild; PWA validation; and isolated Chromium service-worker/offline reader recovery.

## Exact public deployment verification

PR #25 merged the certified release into `main` at:

`27eadce94b823c2be45ae6b03c8c9f6da101dce1`

The main-only Pages pipeline generated and deployed build:

`bg13-27eadce94b82`

A separate verification-only probe then tested the actual public `/greek/` deployment rather than inferring deployment from repository state.

Production Deployment Verification evidence:

- verification PR: `#26` — closed without merge;
- workflow run: `32589598659`;
- verification job: `97071184937`;
- completed at: `2026-08-22T18:03:36Z`;
- result: **`V1_1_RELEASE_DEPLOYMENT_VERIFIED`**.

The live probe verified HTTP 200 and exact identity for the application root, canonical course UI/data, V1.1 enrichment data/styling, PWA manager, manifest, service worker, generated PWA marker/shell, release metadata, full corpus manifest, and John corpus artifact.

## Live V1.1 course contract

The deployed application was evaluated directly from the public assets and verified to contain:

- exactly **50** canonical units in canonical ID/order;
- exactly **150** canonical mastery checkpoints;
- exactly **50** V1.1 enrichment records;
- exactly **100** supplementary retrieval items;
- two supplementary practice items per unit;
- `masteryEvidence: false` for the supplementary V1.1 rehearsal layer.

The learning sequence remains:

**Reading problem → Observe → Learn → Forms → Contrast → Unscored Practice → Safeguard → Explain reasoning → Scripture → Canonical Checkpoint → Read again**

Supplementary V1.1 practice remains outside canonical mastery evidence.

## Live corpus and PWA contract

The deployed corpus was verified as:

- 27 books;
- 260 chapters;
- 7,927 token-bearing verses;
- 137,554 tokens;
- 5,461 lemmas;
- `fullCorpusIngested: true`;
- source revision `aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`.

The live John artifact contained 21 chapters, non-empty token data, and the same pinned source revision.

The live PWA shell matched `bg13-27eadce94b82`, included the canonical course and V1.1 assets, and the service worker remained bound to the generated build identity with revision-aware `koine-corpus-*` caching.

## Production verdict

The deployment-verification prerequisite has passed. The production-promotion metadata records:

- technical: **`TECHNICAL_RC_CERTIFIED`**;
- product: **`V1_RELEASE_CERTIFIED`**;
- production: **`PRODUCTION_CERTIFIED`**;
- registered release blockers: **0**.

This production-promotion branch must still pass Final Release Certification before merge. After the metadata-only promotion is merged, one final public probe should confirm that the production-certified metadata itself is live at the new `main` SHA. That final probe is a deployment confirmation, not a reopening of the already verified V1.1 runtime/content certification.

## Learner-state safety

Koinē Path remains local-first. The historical migration remains:

`koine-path-v01` → `koine-path-learning-v3`

Legacy completion imports low-confidence evidence only and cannot grant full canonical mastery. Release certification prohibits `localStorage.clear()` and the V1.1 enrichment layer adds no alternate mastery store.

## Security and claim boundaries

The static GitHub Pages application contains no OpenAI API secret. Remote model tutoring remains optional behind the BG8 secure proxy; deterministic fallback remains available.

The deterministic content fingerprint, internal review, source provenance, and automated QA are **not** independent external scholarly peer review.

Automated reflow, keyboard, focus, touch-target, axe, browser, and PWA checks do **not** constitute complete manual VoiceOver, TalkBack, or NVDA certification. Those claims remain explicitly excluded unless separately tested and recorded.
