# Koinē Path — Known limitations and release status

This register distinguishes **release blockers** from optional or claim-limiting constraints so release language remains precise.

## Open v1.1 release blockers

**None currently registered.**

## V1.1 production state

Koinē Path v1.1.0 passed Final Release Certification and its exact release-candidate deployment was verified on the public GitHub Pages site.

Verified deployed release commit:

`27eadce94b823c2be45ae6b03c8c9f6da101dce1`

Verified PWA build:

`bg13-27eadce94b82`

Frozen V1.1 certified-content fingerprint:

`800642ad7fdc25f2a1b576abe6e013940da7171c1857d1718cb0d84d2a2660c1`

Production Deployment Verification run `32589598659`, job `97071184937`, completed with `V1_1_RELEASE_DEPLOYMENT_VERIFIED`.

The production-promotion metadata records `PRODUCTION_CERTIFIED`. After that metadata-only promotion is merged, the resulting Pages deployment should receive one final identity probe so the production-certified metadata itself is confirmed live at the new `main` SHA.

## Historical resolved blocker — BG16-B001

The original v1 release audit found that the curriculum defined 50 units while Learn exposed only five prototype lessons. BG16-B001 replaced that prototype layer with production instructional content for all Units 1–50 and exactly 150 deterministic mastery checkpoints.

Its certified content fingerprint remains preserved for release lineage:

`e654a810fca0c9fbfa88c8808fa275204fba5a3806ac5ffd4f052a4ef0e9e445`

V1.1 does not reopen this blocker; it deepens the already complete course with observation, contrast, unscored retrieval, reasoning, and read-again transfer.

## Optional remote AI not deployed

BG8's remote AI path requires a separately deployed secure Worker and secret configuration. The static client intentionally contains no API key and the endpoint is blank until deployment.

The deterministic tutor fallback remains functional, so this is **not a release blocker** unless remote AI is advertised as a shipped hosted service.

## Historical pronunciation audio packs not installed

Reconstructed Koinē and Academic Erasmian provide deterministic pronunciation guidance but do not masquerade Modern Greek browser TTS as historical audio. Modern Greek playback is available when an `el-GR` browser voice exists.

This is not a blocker for a reading-first Greek app, but release language must not claim complete recorded historical-pronunciation coverage.

## Reviewed syntax/exegesis coverage is selective

The full NT has canonical morphology and lemma data, but reviewed higher-level syntax/exegesis annotations exist only for the declared BG7/BG10/BG11 teaching sets. The app must not imply that every NT verse has a reviewed dependency parse, interpretation, or textual-critical note.

## Accessibility certification boundary

Automated Chromium/axe/reflow checks are strong regression gates, but they do not constitute complete manual certification with VoiceOver, TalkBack, NVDA, or every physical device/browser combination.

A release may state that the app has automated WCAG-oriented accessibility coverage. It must not state full assistive-technology certification unless the manual matrix has actually been executed and recorded.

## Browser speech variability

Modern Greek speech synthesis depends on the operating system/browser voice installed by the user. Voice quality, timing, and availability are therefore not identical across devices.

## Local-first storage

Learner progress is primarily browser-local. Clearing site data or using a different browser/device can remove local state unless a future account/sync layer is introduced. Offline cache deletion is deliberately separate from learner-state deletion.

## External scholarly-review boundary

The deterministic content fingerprint, source provenance, internal review, and anti-overclaim safeguards are strong internal QA controls. They are not independent external scholarly peer review, and the product must not market them as such.
