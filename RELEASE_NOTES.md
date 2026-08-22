# Koinē Path — Release notes

## 1.0.0 — Production release

Koinē Path v1.0.0 promotes the fully certified `1.0.0-rc.2` build after exact GitHub Pages production verification.

### Production certification

The complete BG1–BG16 stack was merged to `main` at:

`60b7028017dfb7cc1b3adab9b153f00ab6c72b6f`

Production Deployment Verification subsequently confirmed that the public `/greek/` deployment serves:

- PWA build marker `bg13-60b7028017df`;
- the accepted release metadata;
- generated corpus artifacts;
- pinned corpus revision `aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`;
- exactly 27 books, 260 chapters, 7,927 token-bearing verses, 137,554 tokens, and 5,461 lemmas;
- a valid generated John corpus chunk.

The deployment check completed with `PRODUCTION_DEPLOYMENT_VERIFIED`.

Final verdicts:

- **`TECHNICAL_RC_CERTIFIED`**
- **`V1_RELEASE_CERTIFIED`**
- **`PRODUCTION_CERTIFIED`**
- open v1 blockers: **0**

Frozen certified-content fingerprint:

`e654a810fca0c9fbfa88c8808fa275204fba5a3806ac5ffd4f052a4ef0e9e445`

Accepted RC2 fingerprint:

`7deb0d2f913498fae9c90a95655e032b39753fb5302332185480738eb3398714`

### v1.0.0 product scope

- complete canonical 50-unit Biblical Greek course;
- exactly 150 deterministic course checkpoints with Scripture transfer;
- prerequisite-aware multidimensional mastery and remediation;
- adaptive morphology laboratory with explicit syncretism;
- frequency-aware vocabulary/SRS engine;
- full pinned 27-book Greek New Testament reader;
- reviewed syntax and translation laboratory;
- secure-proxy-ready grounded AI tutor with deterministic fallback;
- unified adaptive review;
- continuous reading-fluency mode;
- intermediate/exegetical Greek laboratory;
- corpus-based lexical analysis and edition-awareness safeguards;
- reconstructed Koinē, Erasmian, and Modern Greek pronunciation profiles;
- listening, playback, and local microphone shadowing tools;
- installable PWA with revision-aware offline corpus management;
- responsive mobile shell and automated accessibility/reflow validation;
- deterministic scholarly-content and release fingerprinting;
- clean-state, legacy-migration, cross-browser, offline, and production-deployment certification.

### Claim boundaries

v1.0.0 does not claim independent external scholarly peer review. Manual VoiceOver/TalkBack/NVDA testing on physical devices remains outside the automated certification claim. Remote AI remains optional and requires a separately deployed secure BG8 Worker; the static client contains no OpenAI API secret.

## 1.0.0-rc.2 — BG16-B001 course-complete candidate

RC2 resolved the only v1 product blocker found by the original BG16 certification pass. The structured Learn workspace implements the entire canonical **50-unit Biblical Greek course** rather than five prototype lessons.

### Course completion

- all Units 1–50 use the exact canonical curriculum order and titles;
- every unit has a learning objective and at least three substantive teaching movements;
- every unit includes worked Greek forms/patterns;
- every unit contains an explicit safeguard against common grammatical, lexical, discourse, or textual-critical overreading;
- every unit returns to a named Scripture passage with a reading/application task;
- exactly **150 deterministic checkpoints** (three per unit) integrate with the canonical mastery/remediation engine;
- inaccessible future units remain readable in preview mode but cannot generate canonical mastery evidence;
- the obsolete five-prototype lesson bootstrap was removed from `app.js`;
- the production Learn UI is responsive and preserves visible keyboard focus.

### Certified content snapshot

BG16-B001 certified-content fingerprint:

`e654a810fca0c9fbfa88c8808fa275204fba5a3806ac5ffd4f052a4ef0e9e445`

That snapshot passed the complete course contract, BG15 content safeguards, morphology/vocabulary/syntax/fluency/exegesis/pronunciation regressions, and the pinned 27-book / 7,927-verse / 137,554-token / 5,461-lemma GNT rebuild and validation.

RC2 finished with `TECHNICAL_RC_CERTIFIED`, `V1_RELEASE_CERTIFIED`, and zero v1 blockers before production deployment verification.

## 1.0.0-rc.1 — Historical platform candidate

RC1 certified the BG1–BG16 technical platform but correctly returned **`V1_RELEASE_BLOCKED`** because Learn contained only five interactive prototype lessons. That blocker was registered as `BG16-B001` and was resolved by RC2.

RC1 frozen content fingerprint:

`81f780289ed6d8719463092af9392fb5be85293aab20c50b26d0aa6758f130c5`

RC1 release-candidate fingerprint:

`6e70ef0d9cc5038e284da2ea6fb8ca830ef7a6fb03dc32aa96f82fdf432e0468`
