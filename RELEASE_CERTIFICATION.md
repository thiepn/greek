# BG16 — Final Release Certification

BG16 is the release-level verification phase for Koinē Path. It consumes the BG15 scholarly-content fingerprint and validates the complete application as a release candidate across runtime, storage migration, browser, PWA/offline, security, data, accessibility, and deployment boundaries.

## Frozen scholarly-content input

BG16 accepts only the BG15-certified content snapshot:

- BG15 source head: `ac1cc912abb58b03ca7606eb39095cf54fa486f3`
- certified content fingerprint: `81f780289ed6d8719463092af9392fb5be85293aab20c50b26d0aa6758f130c5`
- MorphGNT/SBLGNT snapshot: `aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`
- edition-comparison apparatus revision: `c4d241a9c1c479a55b989ba35a4976c1d0b8052c`

Changing reviewed content after BG15 invalidates this release input and requires a new content-QA fingerprint.

## Release levels

### 1. Technical RC certification

A technical RC may pass when:

- all inherited BG2–BG15 workflows are green;
- the full pinned corpus rebuilds and validates;
- the BG15 fingerprint is reproduced exactly;
- clean-state and legacy-state migration tests pass;
- Chromium, Firefox, and WebKit smoke tests pass;
- PWA installation prerequisites, service worker, offline shell, and corpus cache flows pass in CI;
- security/secret and AI-boundary checks pass;
- all registered workspaces initialize without uncaught browser errors;
- a deterministic RC manifest/fingerprint is generated.

### 2. v1.0 product certification

`v1.0.0` additionally requires **zero open release blockers**.

BG16 currently records one blocker: the canonical 50-unit Learn course is incomplete and still contains only five interactive prototype foundation lessons. Therefore technical RC success does **not** imply v1 product completion.

### 3. Production certification

Production certification additionally requires the accepted RC to be merged to `main` and the exact merged build to be verified at the public GitHub Pages deployment.

Because Pages deploys only from `main`, an unmerged stacked PR cannot receive production certification.

## Automated release matrix

### Deterministic source/data gates

- BG16 release contract
- BG15 content contract and frozen fingerprint
- complete full-corpus rebuild
- morphology, vocabulary, syntax, fluency, exegesis, pronunciation regressions
- learning-engine migration tests
- PWA build validation
- accessibility contract
- secrets/API-key scan
- no AI → mastery write path

### Cross-browser smoke matrix

CI runs the generated application in current Playwright:

- Chromium
- Firefox
- WebKit

Each browser must:

1. load a clean application state;
2. initialize the generated reader corpus;
3. visit every registered workspace without uncaught page errors;
4. preserve current-schema learner state across reload;
5. import the legacy prototype learning state without granting false mastery;
6. register the service worker on localhost;
7. reload under offline mode after the shell/current reader data has been cached;
8. preserve learner state independently from CacheStorage;
9. retain project-relative URL behavior compatible with GitHub Pages.

BG14's deeper Chromium/axe/320px accessibility suite remains independently required.

## Migration policy

Koinē Path is local-first. Release certification therefore treats stored learner state as user data.

The RC must never solve schema incompatibility by calling `localStorage.clear()` or deleting unrelated keys.

The currently supported explicit migration path is:

`koine-path-v01` → `koine-path-learning-v3`

Legacy completion markers import only low-confidence evidence and must not grant canonical mastery or bypass stage gates.

Current-schema state must preserve unknown future-safe fields where the owning engine supports them and must not reset progress merely because curriculum wording/version metadata changes.

## Performance boundary

The full NT is not loaded at startup. Release smoke tests require the shell to initialize without fetching all 27 book chunks and require reader navigation to lazy-load the selected book.

BG16 does not claim a universal millisecond performance SLA because CI hardware, browser, network, and device classes vary. The architectural release requirement is bounded startup work and absence of a mandatory full-corpus first-load download.

## Security boundary

A release candidate must contain no OpenAI API secret. The browser's AI endpoint remains an optional server-proxy URL. Remote tutor output has no canonical mastery write path.

## Manual matrix that cannot be fabricated by CI

The following can only be recorded as passed after actual execution on those platforms:

- iOS Safari + installed PWA + VoiceOver
- Android Chrome + installed PWA + TalkBack
- Windows Firefox/Chromium + NVDA
- physical-device virtual keyboard/orientation behavior
- real OS-specific Modern Greek speech availability/quality

BG16 records these as **not manually certified** until evidence exists.

## Final verdict vocabulary

- `TECHNICAL_RC_CERTIFIED` — automated release candidate gates pass.
- `V1_RELEASE_BLOCKED` — one or more product release blockers remain.
- `V1_RELEASE_CERTIFIED` — technical RC passes and blocker count is zero.
- `PRODUCTION_CERTIFIED` — the exact accepted release is deployed and verified publicly.

For the current repository state, the expected honest result is:

**`TECHNICAL_RC_CERTIFIED` + `V1_RELEASE_BLOCKED`**

unless validation exposes additional defects.
