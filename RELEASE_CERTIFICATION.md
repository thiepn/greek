# BG16 / BG16-B001 — Final Release Certification

BG16 is the release-level verification phase for Koinē Path. BG16-B001 resolves the only product blocker found by the original certification pass: incomplete structured course content. The release gate validates the complete application across course content, scholarly data, runtime, storage migration, browser, PWA/offline, security, accessibility, and deployment boundaries.

## Frozen certified-content input

RC2 accepts only the BG16-B001 certified content snapshot:

- content source head: `701ae7f3e3eaafcb8b2e33590df26ba665c8bab8`
- certified content fingerprint: `e654a810fca0c9fbfa88c8808fa275204fba5a3806ac5ffd4f052a4ef0e9e445`
- MorphGNT/SBLGNT snapshot: `aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d`
- edition-comparison apparatus revision: `c4d241a9c1c479a55b989ba35a4976c1d0b8052c`
- canonical course: 50 units / 150 deterministic checkpoints

Changing certified course or reviewed scholarly content invalidates this release input and requires a new content-QA fingerprint.

The content certification is an internal deterministic/editorial QA boundary. It is **not** represented as independent external scholarly peer review.

## Release levels

### 1. Technical RC certification

A technical RC may pass when:

- all inherited BG2–BG15/BG16-B001 workflows are green;
- the complete 50-unit course contract passes;
- the full pinned corpus rebuilds and validates;
- the certified content fingerprint is reproduced exactly;
- clean-state and legacy-state migration tests pass;
- Chromium, Firefox, and WebKit smoke tests pass;
- PWA installation prerequisites, service worker, offline shell, and corpus cache flows pass in CI;
- security/secret and AI-boundary checks pass;
- all registered workspaces initialize without uncaught browser errors;
- a deterministic RC manifest/fingerprint is generated.

### 2. v1.0 product certification

`v1.0.0` requires technical RC certification plus **zero open release blockers**.

BG16-B001 supplies production content for all 50 canonical units and exactly 150 deterministic checkpoints, so the original course-completeness blocker is resolved. If the final RC2 workflow is green and no new release blocker appears, the product verdict is:

**`V1_RELEASE_CERTIFIED`**

This verdict means the repository candidate satisfies the declared v1 product contract. It does not mean the candidate has been deployed to production.

### 3. Production certification

Production certification additionally requires the accepted RC to be merged to `main` and the exact merged build to be verified at the public GitHub Pages deployment.

Because Pages deploys only from `main`, an unmerged stacked PR cannot receive production certification. Until deployment verification, the production verdict remains:

**`PENDING_MAIN_DEPLOYMENT`**

## Automated release matrix

### Deterministic source/data gates

- BG16-B001 complete-course contract: 50 units / 150 checkpoints / Scripture transfer in every unit
- certified content contract and frozen fingerprint
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
3. visit every registered workspace, including the production Learn workspace, without uncaught page errors;
4. preserve current-schema learner state across reload;
5. import the legacy prototype learning state without granting false mastery;
6. register the service worker on localhost;
7. reload under offline mode after the shell/current reader data has been cached;
8. preserve learner state independently from CacheStorage;
9. retain project-relative URL behavior compatible with GitHub Pages.

BG14's deeper Chromium/axe/320px accessibility suite remains independently required.

## Course-completion evidence

BG16-B001 is not cleared by documentation alone. The course QA gate verifies:

- exact canonical Unit 1–50 IDs and titles;
- at least three substantive teaching movements per unit;
- worked forms/patterns and explicit interpretive safeguards;
- at least one named Scripture-transfer task per unit;
- exactly three deterministic checkpoint items per unit;
- valid mastery dimensions and error/remediation codes;
- NFC normalization for Greek content;
- anti-slogan safeguards for tense/aspect, article syntax, case functions, discourse, lexical semantics, and textual criticism;
- locked-unit preview behavior cannot grant canonical mastery evidence.

The resulting certified content fingerprint is:

`e654a810fca0c9fbfa88c8808fa275204fba5a3806ac5ffd4f052a4ef0e9e445`

## Migration policy

Koinē Path is local-first. Release certification therefore treats stored learner state as user data.

The RC must never solve schema incompatibility by calling `localStorage.clear()` or deleting unrelated keys.

The currently supported explicit migration path is:

`koine-path-v01` → `koine-path-learning-v3`

Legacy completion markers import only low-confidence evidence and must not grant canonical mastery or bypass stage gates.

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

BG16 records these as **not manually certified** until evidence exists. This is a claim limitation, not an open v1 blocker under the current release contract.

## Final verdict vocabulary

- `TECHNICAL_RC_CERTIFIED` — automated release candidate gates pass.
- `V1_RELEASE_BLOCKED` — one or more product release blockers remain.
- `V1_RELEASE_CERTIFIED` — technical RC passes and blocker count is zero.
- `PRODUCTION_CERTIFIED` — the exact accepted release is deployed and verified publicly.

For `1.0.0-rc.2`, the expected result after a clean final workflow is:

**`TECHNICAL_RC_CERTIFIED` + `V1_RELEASE_CERTIFIED` + `PENDING_MAIN_DEPLOYMENT`**
