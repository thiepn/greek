# Koinē Path — Known limitations and release status

This register is part of BG16 release certification. It distinguishes **release blockers** from **optional or claim-limiting constraints** so a green automated suite is reported precisely.

## Open v1 release blockers

**None.**

### Resolved — BG16-B001: canonical 50-unit course content

BG16 originally blocked v1 because the curriculum defined 50 units while Learn exposed only five prototype lessons. BG16-B001 has now replaced that prototype layer with production instructional content for **all Units 1–50**.

Resolution evidence:

- all 50 canonical unit IDs and titles are present in exact curriculum order;
- every unit has an objective, at least three substantive teaching movements, worked Greek forms/patterns, and an explicit interpretive safeguard;
- every unit returns to a named Scripture passage with an application/reading task;
- exactly **150 deterministic checkpoints** (three per unit) feed the existing mastery/remediation model when prerequisites are accessible;
- locked units remain readable as preview exposure without granting canonical mastery evidence;
- the retired five-prototype lesson bootstrap has been removed;
- the complete course is included in the deterministic content-QA fingerprint;
- the complete-course QA and inherited scholarly suites pass on the BG16-B001 content snapshot.

Certified BG16-B001 content fingerprint:

`e654a810fca0c9fbfa88c8808fa275204fba5a3806ac5ffd4f052a4ef0e9e445`

This closes `BG16-B001` as a **v1 release blocker**. It does not claim external scholarly peer review; the course remains internally authored/reviewed pedagogical content protected by deterministic QA and the existing source/provenance safeguards.

## Production verification pending

The BG1–BG16-B001 work remains in a stacked, unmerged PR chain. GitHub Pages deploys from `main`, so the public production URL does not yet represent this candidate.

**Required after merge:** verify the exact merged SHA at the public Pages URL, service-worker version, generated corpus manifest, offline behavior, PWA update flow, and absence of stale pre-release caches.

This is a deployment gate, not a code defect and not a v1 product blocker.

## Optional remote AI not deployed

BG8's remote AI path requires a separately deployed secure Worker and secret configuration. The static client intentionally contains no API key and the endpoint is blank until deployment.

The deterministic tutor fallback remains functional, so this is **not a release blocker** unless remote AI is advertised as a shipped v1 feature.

## Historical pronunciation audio packs not installed

Reconstructed Koinē and Academic Erasmian currently provide deterministic pronunciation guidance but do not masquerade Modern Greek browser TTS as historical audio. Modern Greek playback is available when an `el-GR` browser voice exists.

This is not a blocker for a reading-first Greek app, but marketing must not claim complete recorded historical-pronunciation coverage.

## Reviewed syntax/exegesis coverage is selective

The full NT has canonical morphology and lemma data, but reviewed higher-level syntax/exegesis annotations exist only for the declared BG7/BG10/BG11 teaching sets. The app must not imply that every NT verse has a reviewed dependency parse, interpretation, or textual-critical note.

## Accessibility certification boundary

Automated Chromium/axe/reflow checks are strong regression gates, but BG14 does not constitute complete manual certification with VoiceOver, TalkBack, NVDA, or every physical device/browser combination.

A release may state that the app has automated WCAG-oriented accessibility coverage. It must not state full assistive-technology certification unless the manual matrix has actually been executed and recorded.

## Browser speech variability

Modern Greek speech synthesis depends on the operating system/browser voice installed by the user. Voice quality, timing, and availability are therefore not identical across devices.

## Local-first storage

Learner progress is primarily browser-local. Clearing site data or using a different browser/device can remove local state unless a future account/sync layer is introduced. Offline cache deletion is deliberately separate from learner-state deletion.
