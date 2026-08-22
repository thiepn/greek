# V1.2 — Learner Data Portability & Recovery

Status: feature implementation candidate.

## Implemented

- namespace-complete `koine-path-*` learner-state export;
- versioned JSON backup format;
- deterministic integrity validation;
- 5 MB / 200-record safety limits;
- known critical-store schema checks;
- rejection of foreign storage keys and imported recovery journals;
- replace-based transactional restore;
- automatic pre-restore recovery journal;
- immediate automatic rollback on failed restore;
- persistent one-level **Undo last restore** after a successful restore;
- unrelated browser storage remains untouched;
- Progress-screen export/import/restore/undo UX;
- explicit privacy warning and validation preview;
- PWA shell inclusion through normal index-driven asset generation;
- dedicated Node regression contract and GitHub Actions validation.

## Explicit non-goals

- accounts;
- cloud sync;
- automatic multi-device synchronization;
- encrypted backup files;
- service-worker/cache export;
- merging divergent learning histories.

## Acceptance gate

V1.2 is ready to merge only when the dedicated Learner Data Portability Validation workflow passes and existing affected validation remains green.
