# Koinē Path — Learner Data Portability & Recovery

V1.2 adds an explicit local-first backup and recovery contract for learner data.

## Scope

Koinē Path learner state is stored in browser local storage under the `koine-path-*` namespace. V1.2 exports the complete namespace rather than maintaining a brittle hand-written list of subsystems, so current and future learner stores are covered automatically.

The internal recovery journal `koine-path-recovery-journal-v1` is deliberately excluded from exported backups and cannot be imported from a file.

## Backup format

A backup is a UTF-8 JSON document containing:

- product identity: `Koinē Path`;
- backup schema version;
- app version label;
- export timestamp;
- all exportable `koine-path-*` local-storage records;
- deterministic FNV-1a integrity checksum over the schema and sorted storage payload.

Backups are capped at 5 MB and 200 records. Unknown keys outside the Koinē Path namespace are rejected during import.

The checksum detects accidental corruption or editing. It is **not** cryptographic authentication and backups are **not encrypted**.

## Restore transaction

Restore is intentionally replace-based rather than merge-based. Mixing independently evolved learning-engine/SRS histories can produce contradictory state, while replacing the complete learner namespace keeps subsystem relationships coherent.

Before any restore, V1.2:

1. validates product identity, backup schema, namespace safety, size, known critical state schemas, and integrity;
2. captures the complete current learner namespace;
3. writes that snapshot to the local recovery journal;
4. replaces only Koinē Path learner records;
5. reads the storage back and verifies byte-for-byte equality with the selected backup.

If any write or verification step fails, the previous learner namespace is restored automatically and the failed journal is removed.

## Undo after restore

A successful restore keeps the pre-restore recovery journal across reloads. The Progress screen exposes **Undo last restore**, which atomically restores that recovery point and then removes the journal.

This is one-level rollback, not version history or cloud synchronization.

## UI

**Progress → Backup & recovery** provides:

- Export backup;
- Choose backup;
- validation preview before mutation;
- explicit restore confirmation;
- reload after restore;
- Undo last restore when a recovery point exists;
- privacy warning that the JSON file can contain learner history, reading state, drafts, and other local data.

## Boundaries

V1.2 does not introduce accounts, cloud storage, cross-device synchronization, or encryption. Moving data between devices is manual: export the JSON file on one browser and restore it on another.

Service-worker caches and generated Greek corpus resources are not the authoritative learner state. They remain independently rebuildable/offline-managed and are not required for learner-data recovery.
