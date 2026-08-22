# V1.7 — Passage Workbench, Notes & Exegetical Reading Projects

## Purpose

V1.7 adds a persistent project layer above the canonical Greek New Testament reader. It is designed for sustained passage study rather than a single scored exercise.

A project is anchored to an exact canonical corpus reference and can contain:

- observations;
- morphology notes;
- syntax notes;
- lexical study notes;
- discourse / argument-flow notes;
- cross-references;
- an exegetical synthesis;
- an explicit evidence / interpretation boundary;
- token-level lexical notes copied from the canonical token inspector;
- unresolved and resolved project questions;
- project workflow checkpoints;
- project status and history;
- Markdown export.

The project stores the reference and learner-authored state. It does **not** copy the Greek New Testament corpus into project storage.

## Canonical corpus boundary

Project references use the same canonical book/chapter/verse identifiers as the full reader and V1.6 reading goals. Before a project is created, the selected verse range is materialized against the generated pinned corpus.

The displayed Greek text, lemma, source morphology, and token identifiers come from the canonical corpus already used by the reader and fluency systems.

## Workflow is not mastery

The workbench contains no path to:

- `recordEvidence()`;
- `recordExposure()`;
- `recordHint()`.

The following actions are therefore workflow/project state only:

- creating a passage project;
- opening or navigating a project;
- writing or editing notes;
- marking a workbench step reviewed;
- adding/removing token notes;
- adding/resolving questions;
- completing, reopening, or archiving a project;
- exporting Markdown;
- opening the passage in the reader;
- handing the project to the grounded tutor.

A project marked **complete** means that the learner closed the seven-step workbench workflow and supplied an exegetical synthesis plus an evidence-boundary note. It does not mean that the interpretation is correct, that a canonical course unit is mastered, or that a stage gate is passed.

Reviewed BG11 exegesis cases remain separate. When a reviewed case overlaps the project passage, the workbench can deep-link to that case. Any scoring/evidence behavior belongs to the existing Exegesis Lab contract, not to V1.7.

## Seven workflow checkpoints

The completion checklist contains:

1. observations;
2. morphology;
3. syntax;
4. lexical study;
5. discourse / argument flow;
6. exegetical synthesis;
7. evidence & interpretation boundary.

Cross-references are supported as a structured notebook section but are not required for project completion because not every passage requires a useful cross-reference exercise.

## Grounded tutor handoff

The **Ask grounded tutor** action:

1. opens the exact project book/chapter in the canonical reader;
2. scrolls toward the project start verse;
3. opens the existing grounded tutor;
4. preloads a bounded prompt containing the project reference, current synthesis, evidence-boundary note, and up to five unresolved questions.

The tutor therefore works from the same canonical reader context and the learner's explicitly supplied analysis. AI output remains advisory and cannot award mastery.

## Reviewed exegesis handoff

If a reviewed BG11 case overlaps the project reference, V1.7 exposes it in the project sidebar. Opening it routes to the Exegesis Lab case laboratory and then opens the matching reviewed case.

This preserves a clear distinction:

- free-form project work = learner-authored workflow state;
- reviewed BG11 case answers = the pre-existing scored exegesis contract.

## Persistence and recovery

State key:

`koine-path-passage-workbench-v1`

Schema version: `1`.

Bounds:

- maximum 40 projects;
- maximum 12,000 characters per structured notebook section;
- maximum 80 token/lexical notes per project;
- maximum 80 questions per project.

V1.2 backup/recovery validates the V1.7 schema before restore. It rejects unsupported schemas, missing active projects, malformed status values, invalid corpus references, malformed structured notes/checkpoints, and records above the supported retention bounds.

Backups are local JSON files and are not encrypted.

## Markdown export

A project can be exported as Markdown containing:

- project title;
- canonical passage reference;
- status and workflow progress;
- all structured notebook sections;
- token/lexical notes;
- project questions and working answers;
- an explicit statement that project completion is workflow only.

The export intentionally does not reproduce the entire canonical Greek passage.

## Explicit non-claims

V1.7 does not provide:

- automatic exegesis;
- guaranteed theological correctness;
- a scholarly critical apparatus beyond the existing reviewed BG11 material;
- automatic cross-reference generation;
- psychometric scoring of notes;
- AI-generated mastery evidence;
- mastery from project completion;
- server-side project storage;
- cloud sync or collaboration;
- exhaustive pericope tagging for all 27 books.

## Acceptance criteria

V1.7 is acceptable only when all of the following pass on the same head:

- deterministic passage-workbench state tests;
- exact-corpus project materialization;
- structured notebook persistence;
- token-note persistence;
- question persistence;
- completion/reopen/archive lifecycle;
- Markdown export;
- grounded-tutor handoff;
- V1.6 active-reading-goal project creation;
- V1.2 backup/recovery validation;
- PWA/offline-shell inclusion;
- byte-for-byte canonical-learning-state firewall checks;
- 320px reflow without horizontal overflow;
- existing mobile/accessibility validation;
- existing reader, reading-goal, fluency, learning, content, corpus, and subsystem validation.
