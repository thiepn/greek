# Koinē Path — Release candidate notes

## 1.0.0-rc.1

This candidate represents the complete **BG1–BG16 platform stack** through final automated release certification. It is a release candidate for the application platform, not yet a certified `v1.0.0` product release.

### Major systems present

- canonical 50-unit curriculum architecture and mastery/prerequisite model;
- pinned full 27-book Greek New Testament reader with morphology, lemmas, frequency and lexical-distribution data;
- adaptive morphology laboratory with explicit contextless syncretism;
- vocabulary/SRS engine with reader-generated cards;
- reviewed syntax and translation laboratory;
- secure-proxy-ready grounded AI tutor with deterministic offline/local fallback;
- unified adaptive review planner;
- continuous reading-fluency mode and 1 John / Mark / Philippians programs;
- intermediate/exegetical Greek laboratory with lexical, discourse, aspect and edition-awareness safeguards;
- pronunciation/audio workspace with explicitly separated historical profiles and Modern Greek TTS;
- installable PWA, per-book/full-corpus offline downloads and revision-aware cache management;
- responsive mobile shell and automated accessibility/reflow regression gates;
- BG15 deterministic scholarly-content fingerprinting;
- BG16 clean-state, migration, cross-browser and offline release-candidate certification.

### Frozen scholarly-content input

BG15 certified-content fingerprint:

`81f780289ed6d8719463092af9392fb5be85293aab20c50b26d0aa6758f130c5`

Reader corpus revision:

`aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`

### Current product verdict

**Technical release candidate:** eligible for certification after the BG16 workflow passes.

**v1.0.0 product release:** **BLOCKED**.

The canonical course has 50 planned units, but the structured Learn workspace still contains only five interactive prototype foundation lessons. The substantial morphology, vocabulary, reader, syntax, fluency, exegesis, audio and review systems do not replace the missing unit-by-unit teaching content.

The required completion work is defined in `KNOWN_LIMITATIONS.md` as `BG16-B001`.

### Deployment status

The BG1–BG16 stack remains unmerged while these notes are written. GitHub Pages deploys from `main`, so production certification is pending until an accepted release candidate is merged and the exact deployed SHA is verified publicly.

### Claims intentionally not made

This candidate does not claim:

- that remote OpenAI-backed tutoring is deployed;
- that reconstructed historical pronunciation has a complete recorded audio pack;
- that every NT verse has reviewed syntax/exegesis annotations;
- that VoiceOver, TalkBack and NVDA have been manually certified on physical target devices;
- that a green automated suite constitutes independent scholarly peer review.
