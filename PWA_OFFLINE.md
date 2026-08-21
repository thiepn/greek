# BG13 — PWA & Offline

BG13 makes Koinē Path installable and resilient offline while keeping corpus storage explicit, revision-aware, and separate from learner state.

## Installability

The application ships `manifest.webmanifest` with:

- relative `id`, `start_url`, and `scope` so the GitHub Pages project path `/greek/` remains valid;
- standalone display mode;
- 192×192 and 512×512 icons plus a maskable 512×512 icon;
- theme/background colors matching the editorial paper design;
- shortcuts into Read, Review, and Fluency.

`pwa-manager.js` registers `./sw.js` at `./` scope. The app never requests domain-root service-worker ownership.

## Application shell

`build-pwa-shell.mjs` parses the deployed `index.html` and builds `generated/pwa-shell.json` from the local scripts/styles actually referenced by the document. This avoids a manually maintained list drifting away from the runtime shell.

The shell includes the small corpus manifest and lemma-frequency table so the reader can initialize offline. It deliberately excludes all 27 book chunks and the large BG11 lexical index from mandatory first-install caching.

## Service-worker lifecycle

The service worker uses a versioned shell/runtime cache. A new worker precaches the new shell but does not immediately call `skipWaiting()` when an older worker controls the app.

Instead the client shows **New version ready → Update now**. Choosing that action sends `SKIP_WAITING`, and `controllerchange` reloads into the accepted version.

Old shell/runtime caches are removed at activation. Corpus caches are not automatically destroyed during an app update.

## Corpus revision boundary

Offline Greek data is stored under:

`koine-corpus-<MorphGNT revision>`

The current canonical corpus revision comes from `generated/corpus/manifest.json`.

The service worker only serves a corpus book from the cache matching the active manifest revision. This prevents a newer manifest/frequency layer from silently being paired with an older downloaded book.

Old corpus revisions are reported as **stale**. The learner may explicitly remove them from Offline settings.

## Offline packs

The Offline workspace supports:

- any individual NT book;
- 1 John fluency pack;
- Mark fluency pack;
- Philippians fluency pack;
- all three fluency books;
- the BG11 exact-corpus lexical index;
- the complete 27-book Greek NT + frequency + lexical index.

Every book/program download also stores the corpus manifest and exact lemma-frequency table.

The full NT is never required before the first app launch.

## Storage manager

The workspace uses `navigator.storage.estimate()` when available and presents usage/quota as browser estimates rather than exact disk accounting.

It also exposes `navigator.storage.persist()` when supported. Persistent storage is a browser decision; a request may be declined.

Cache writes catch quota failure and instruct the learner to remove an offline pack or request persistence.

## Learner-state firewall

Corpus/app caches and learner state are separate systems.

Removing offline data must never delete:

- BG3 mastery/evidence;
- BG5 SRS cards/history;
- reader bookmarks/history/completion;
- BG7 translation drafts;
- BG10 fluency history;
- BG11 exegesis notebooks;
- BG12 pronunciation settings/history;
- other localStorage learner preferences.

`offline-engine.js` contains no localStorage mutation path.

## Offline Tutor behavior

BG8 model requests remain network-only POST requests and are not cached by the service worker. When offline, the secure model endpoint fails normally and the existing deterministic tutor fallback remains available.

No model output is stored as an offline substitute for canonical Greek facts.

## Update/offline status

The UI shows current connectivity and exposes a manual service-worker update check. Browser `online` / `offline` events update the status immediately.

## Validation

BG13 CI validates:

- offline-engine pack/revision behavior;
- service-worker and browser runtime syntax;
- relative GitHub Pages-safe scope/assets;
- install manifest fields and required icon sizes;
- exact app-shell asset generation;
- full pinned corpus generation before PWA validation;
- corpus-cache revision prefix;
- explicit update lifecycle;
- absence of learner-state deletion from offline code.

## Scope boundary

BG13 provides offline application/corpus behavior. It does not yet attempt cross-device synchronization, background sync of learner state, or server backup. Those would require a separate account/sync architecture and privacy policy.
