# BG16 / BG16-B001 — Final Release Certification

Koinē Path v1.0.0 is the production promotion of the fully certified `1.0.0-rc.2` build. BG16 established the release-level verification contract; BG16-B001 resolved the only product blocker found by the original certification pass: incomplete structured course content.

## Frozen certified-content input

v1.0.0 preserves the BG16-B001 certified content snapshot:

- content source head: `701ae7f3e3eaafcb8b2e33590df26ba665c8bab8`
- certified content fingerprint: `e654a810fca0c9fbfa88c8808fa275204fba5a3806ac5ffd4f052a4ef0e9e445`
- certified RC2 source head: `ad88a25e5d59f4ab1a02f7bd84400607aa0697d5`
- RC2 fingerprint: `7deb0d2f913498fae9c90a95655e032b39753fb5302332185480738eb3398714`
- MorphGNT/SBLGNT snapshot: `aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`
- edition-comparison apparatus revision: `c4d241a9c1c479a55b989ba35a4976c1d0b8052c`
- canonical course: 50 units / 150 deterministic checkpoints

Changing certified course or reviewed scholarly content invalidates this content snapshot and requires a new content-QA fingerprint.

The content certification is an internal deterministic/editorial QA boundary. It is **not** represented as independent external scholarly peer review.

## Release levels

### 1. Technical RC certification

The accepted RC passed all inherited BG2–BG15/BG16-B001 workflows, complete course checks, the full pinned corpus rebuild, clean/legacy learner-state migrations, Chromium/Firefox/WebKit smoke tests, PWA/offline validation, security/secret boundaries, accessibility automation, and deterministic RC fingerprint generation.

Technical verdict:

**`TECHNICAL_RC_CERTIFIED`**

### 2. v1.0 product certification

v1.0.0 requires technical RC certification plus zero open release blockers. BG16-B001 supplies production content for all 50 canonical units and exactly 150 deterministic checkpoints, resolving the original course-completeness blocker.

Product verdict:

**`V1_RELEASE_CERTIFIED`**

Open v1 blockers: **0**.

### 3. Production certification

Production certification requires the accepted RC to be merged to `main` and the exact deployed GitHub Pages build to be verified publicly.

The complete certified stack was merged through PR #20 to:

`60b7028017dfb7cc1b3adab9b153f00ab6c72b6f`

After the repository Pages source was switched to GitHub Actions, Production Deployment Verification run `32540664820` / job `96951794130` verified the public deployment on 2026-08-22 at 00:45:12Z.

Verified live identity:

- root `/greek/` served successfully;
- PWA deployment marker: `bg13-60b7028017df`;
- release metadata matched the accepted RC2 content snapshot;
- generated corpus manifest was present;
- `John.json` was present and valid;
- corpus revision matched `aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`;
- corpus coverage matched 27 books / 260 chapters / 7,927 token-bearing verses / 137,554 tokens / 5,461 lemmas.

The verifier completed with:

**`PRODUCTION_DEPLOYMENT_VERIFIED`**

Production verdict:

**`PRODUCTION_CERTIFIED`**

## Automated release matrix

### Deterministic source/data gates

- complete course contract: 50 units / 150 checkpoints / Scripture transfer in every unit;
- certified content contract and frozen fingerprint;
- complete full-corpus rebuild;
- morphology, vocabulary, syntax, fluency, exegesis, and pronunciation regressions;
- learning-engine migration tests;
- PWA build validation;
- accessibility contract;
- secrets/API-key scan;
- no AI → mastery write path.

### Cross-browser smoke matrix

The accepted RC passed current Playwright Chromium, Firefox, and WebKit coverage. The release suite verifies workspace initialization, representative and complete course rendering, current-schema persistence, legacy migration safety, project-relative URLs, and service-worker-controlled online → offline reader recovery.

BG14's deeper Chromium/axe/320px accessibility suite also passed independently.

## Course-completion evidence

BG16-B001 verifies:

- exact canonical Unit 1–50 IDs and titles;
- at least three substantive teaching movements per unit;
- worked forms/patterns and explicit interpretive safeguards;
- at least one named Scripture-transfer task per unit;
- exactly three deterministic checkpoint items per unit;
- valid mastery dimensions and error/remediation codes;
- NFC normalization for Greek content;
- anti-slogan safeguards for tense/aspect, article syntax, case functions, discourse, lexical semantics, and textual criticism;
- locked-unit preview behavior cannot grant canonical mastery evidence.

Certified content fingerprint:

`e654a810fca0c9fbfa88c8808fa275204fba5a3806ac5ffd4f052a4ef0e9e445`

## Migration policy

Koinē Path is local-first. Stored learner state is treated as user data. The release must never solve schema incompatibility by calling `localStorage.clear()` or deleting unrelated keys.

The explicitly supported migration path is:

`koine-path-v01` → `koine-path-learning-v3`

Legacy completion markers import only low-confidence evidence and cannot grant canonical mastery or bypass stage gates.

## Performance boundary

The full NT is not loaded at startup. The browser lazy-loads the selected book, while offline downloads are optional and revision-aware. The release does not claim a universal millisecond SLA because hardware, browser, network, and device classes vary.

## Security boundary

The static application contains no OpenAI API secret. Remote tutoring requires the secure BG8 proxy and remains optional; deterministic/local fallback is available when no remote endpoint is configured. AI output has no canonical mastery write path.

## Manual matrix not claimed by automation

The following remain **not manually certified** unless separately tested on physical platforms:

- iOS Safari + installed PWA + VoiceOver;
- Android Chrome + installed PWA + TalkBack;
- Windows Firefox/Chromium + NVDA;
- physical-device virtual keyboard/orientation behavior;
- real OS-specific Modern Greek speech availability/quality.

This is a claim limitation, not an open v1 blocker under the release contract.

## Final verdict

For Koinē Path **v1.0.0**:

**`TECHNICAL_RC_CERTIFIED` + `V1_RELEASE_CERTIFIED` + `PRODUCTION_CERTIFIED`**
