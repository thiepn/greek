# Koinē Path — Release candidate notes

## 1.0.0-rc.2 — BG16-B001 course-complete candidate

RC2 resolves the only v1 product blocker found by the original BG16 certification pass. The structured Learn workspace now implements the entire canonical **50-unit Biblical Greek course** rather than five prototype lessons.

### Course completion

- all Units 1–50 use the exact canonical curriculum order and titles;
- every unit has a learning objective and at least three substantive teaching movements;
- every unit includes worked Greek forms/patterns;
- every unit contains an explicit safeguard against common grammatical, lexical, discourse, or textual-critical overreading;
- every unit returns to a named Scripture passage with a reading/application task;
- exactly **150 deterministic checkpoints** (three per unit) integrate with the canonical mastery/remediation engine;
- inaccessible future units remain readable in preview mode but cannot generate canonical mastery evidence;
- the obsolete five-prototype lesson bootstrap has been removed from `app.js`;
- the production Learn UI is responsive and preserves visible keyboard focus.

### Certified content snapshot

BG16-B001 certified-content fingerprint:

`e654a810fca0c9fbfa88c8808fa275204fba5a3806ac5ffd4f052a4ef0e9e445`

That snapshot passed:

- the complete 50-unit / 150-checkpoint course contract;
- BG15 content safeguards;
- 130 modeled morphology parses;
- vocabulary/SRS regressions;
- 34 reviewed syntax exercises and passage references;
- 15 reading-fluency checkpoints;
- 27 exegesis cases and 5 pinned edition-comparison cases;
- pronunciation/listening regressions;
- the pinned 27-book / 7,927-verse / 137,554-token / 5,461-lemma GNT rebuild and validation.

### RC2 release verdict policy

After the final cross-browser BG16 workflow passes:

- technical verdict: **`TECHNICAL_RC_CERTIFIED`**;
- product verdict: **`V1_RELEASE_CERTIFIED`**;
- open v1 blockers: **0**;
- production verdict: **`PENDING_MAIN_DEPLOYMENT`** until the accepted stack is merged to `main` and verified publicly.

The candidate remains explicit about its claim boundaries: internal deterministic/editorial QA is not independent external scholarly peer review; remote AI requires a separately deployed secure Worker; historical pronunciation packs are not falsely represented as recorded audio; and manual VoiceOver/TalkBack/NVDA certification has not been claimed.

### Major systems present

- complete canonical 50-unit course plus mastery/prerequisite model;
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
- deterministic certified-content and release-candidate fingerprinting;
- clean-state, migration, cross-browser and offline release certification.

## 1.0.0-rc.1 — Historical platform candidate

RC1 certified the BG1–BG16 technical platform but correctly returned **`V1_RELEASE_BLOCKED`** because Learn contained only five interactive prototype lessons. That blocker was registered as `BG16-B001` and is resolved by RC2.

RC1 frozen content fingerprint:

`81f780289ed6d8719463092af9392fb5be85293aab20c50b26d0aa6758f130c5`

RC1 release-candidate fingerprint:

`6e70ef0d9cc5038e284da2ea6fb8ca830ef7a6fb03dc32aa96f82fdf432e0468`
