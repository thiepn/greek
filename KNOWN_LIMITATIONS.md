# Koinē Path — Known limitations and release blockers

This register is part of BG16 release certification. It distinguishes **v1 blockers** from **optional or claim-limiting constraints** so that a green technical CI run cannot be misreported as a complete product release.

## Release blocker

### BG16-B001 — Canonical 50-unit course content is incomplete

**Severity:** v1 release blocker

The curriculum architecture defines 50 units, but the Learn workspace still contains only five interactive foundation prototype lessons. The reader, morphology, vocabulary, syntax, fluency, exegesis, audio, review, PWA, accessibility, and data systems are substantial, but they do not substitute for the missing structured teaching content across the canonical course.

**Exit criteria:**

- every Unit 1–50 has reviewed lesson content appropriate to its curriculum role;
- every unit has deterministic/reviewed checkpoints that can feed the existing mastery model;
- prerequisite progression can be completed without depending on placeholder/prototype lessons;
- content is included in the BG15-style scholarly QA manifest and receives a new certified fingerprint;
- the complete course is exercised in clean-state and migration browser tests.

Until those criteria are met, BG16 may certify a **technical platform release candidate**, but the product verdict for `v1.0.0` remains **NO-GO**.

## Production verification pending

The BG1–BG16 work remains in a stacked, unmerged PR chain. GitHub Pages deploys from `main`, so the public production URL does not yet represent this candidate.

**Required after merge:** verify the exact merged SHA at the public Pages URL, service-worker version, generated corpus manifest, offline behavior, PWA update flow, and absence of stale pre-release caches.

This is a deployment gate, not a code defect.

## Optional remote AI not deployed

BG8's remote AI path requires a separately deployed secure Worker and secret configuration. The static client intentionally contains no API key and the endpoint is blank until deployment.

The deterministic tutor fallback remains functional, so this is **not a release blocker** unless remote AI is advertised as a shipped v1 feature.

## Historical pronunciation audio packs not installed

Reconstructed Koinē and Academic Erasmian currently provide deterministic pronunciation guidance but do not masquerade Modern Greek browser TTS as historical audio. Modern Greek playback is available when an `el-GR` browser voice exists.

This is not a blocker for a reading-first Greek app, but marketing must not claim complete recorded historical-pronunciation coverage.

## Reviewed syntax/exegesis coverage is selective

The full NT has canonical morphology and lemma data, but reviewed higher-level syntax/exegesis annotations exist only for the declared BG7/BG10/BG11 teaching sets. The app must not imply that every NT verse has a reviewed dependency parse, interpretation, or textual-critical note.

## Accessibility certification boundary

Automated Chromium/axe/reflow checks are strong regression gates, but BG14 did not constitute a complete manual certification with VoiceOver, TalkBack, NVDA, or every physical device/browser combination.

A release may state that the app has automated WCAG-oriented accessibility coverage. It must not state full assistive-technology certification unless the manual matrix has actually been executed and recorded.

## Browser speech variability

Modern Greek speech synthesis depends on the operating system/browser voice installed by the user. Voice quality, timing, and availability are therefore not identical across devices.

## Local-first storage

Learner progress is primarily browser-local. Clearing site data or using a different browser/device can remove local state unless a future account/sync layer is introduced. Offline cache deletion is deliberately separate from learner-state deletion.
