# V1.6 — Reading Goals, Passage Plans & Corpus-Based Learning Tracks

## Purpose

V1.6 connects learner planning to the actual pinned Greek New Testament corpus. It adds reading goals and corpus-linked tracks without creating a parallel Scripture dataset and without treating reading-plan coverage as canonical course mastery.

The canonical reader remains the owner of book/chapter navigation and chapter-completion state. V1.6 owns focused passage coverage, reading-goal structure, assistance targets, and corpus-based planning metadata.

## Persistent state

V1.6 stores learner planning state under:

`koine-path-reading-goals-v1`

Schema version: `1`.

Bounds:
- maximum 24 reading goals;
- maximum 500 focused-passage coverage records;
- maximum 300 items in any imported goal;
- all imported goal items require a string book id and a positive numeric chapter.

The store is included automatically in namespace-wide learner backups and is explicitly schema-validated before restore.

## Goal types

### Whole-book goal

A whole-book goal is generated from the canonical corpus manifest. Its milestones are exactly the canonical chapters reported for that book. Chapter completion is read from `koine-path-reader-v2` and is not duplicated into V1.6 passage coverage.

### Focused-passage goal

A learner may choose a book, chapter, start verse, and end verse. The UI materializes the requested range against the generated corpus before creating the goal. Passage completion records coverage in V1.6 only.

### Curated corpus track

V1.6 ships four selective learning tracks:

1. **First Epistle Track** — selected 1 John passages followed by sustained chapter reading.
2. **Mark Narrative Track** — narrative scenes followed by longer continuous Mark reading.
3. **Philippians Discourse Track** — longer clauses, participles, infinitives, and argumentative flow.
4. **John Gospel Sampler** — selected Johannine narrative/discourse passages with progressively reduced assistance.

The track definitions contain only canonical corpus references and short pedagogical labels. Greek text, morphology, and token data are loaded from the existing generated corpus at runtime.

## Assistance reduction

Each goal item receives a suggested reader-assistance target based on its position in the plan:

- first 25%: `R1`;
- >25% through 60%: `R2`;
- >60% through 85%: `R3`;
- final >85%: `R4`.

This is a planning suggestion, not a gate. It does not change the canonical learning engine and does not claim that a learner has achieved the suggested reading level.

## Intrinsic difficulty vs learner preparedness

V1.6 deliberately keeps two concepts separate.

### Intrinsic passage difficulty

Calculated from the actual loaded Greek tokens using a bounded heuristic combining:
- lexical diversity;
- proportion of tokens mapped to later canonical grammar units;
- verb density;
- token density per verse.

Bands:
- `<30`: accessible;
- `30–46`: moderate;
- `47–63`: demanding;
- `64+`: advanced.

This is a corpus-planning heuristic, not a psychometric difficulty scale.

### Learner preparedness

Calculated independently from:
- 55% vocabulary coverage, based on established vocabulary-card evidence;
- 45% grammar coverage, based on whether token-mapped canonical units are already mastered.

Bands:
- `82+`: ready;
- `65–81`: productive;
- `45–64`: stretch;
- `<45`: preparation-needed.

Preparedness estimates do not guarantee comprehension. They are a planning signal based on the learner state Koinē Path can currently observe.

## Best-fit track recommendation

When no reading goal is active, V1.6 materializes the opening milestone of each curated track and compares intrinsic difficulty with learner preparedness. The recommendation favors a productive opening fit rather than simply choosing the easiest or hardest text.

No recommendation changes mastery, unlocks units, or bypasses prerequisites.

## V1.4 daily-session integration

When a V1.4 session contains a `Read` task and an active V1.6 goal exists, the session UI decorates the task with:
- the actual next corpus passage/chapter;
- its reading-plan label;
- the suggested R1–R4 assistance target.

Opening that task routes to the planned reader location. Checking the V1.4 task remains session-workflow state only.

## V1.5 weekly-plan integration

V1.5 retains full ownership of weekly capacity and minute allocation. V1.6 changes only the visible label for reading capacity so a generic `Greek text transfer` slot can show the active reading goal’s next passage.

V1.6 does not modify V1.5 workload maths, backlog policy, milestones, or completion forecasts.

## Completion ownership and mastery firewall

V1.6 itself contains no calls to:
- `recordEvidence()`;
- `recordExposure()`;
- `recordHint()`.

Focused passage coverage therefore cannot create canonical mastery evidence.

Whole-chapter completion continues to use the pre-existing canonical reader action, **Mark chapter read**. That reader action may create low-confidence reading evidence under the existing reader/mastery contract when the relevant canonical unit is accessible. V1.6 does not alter or duplicate that behavior.

Simply creating a goal, selecting a track, opening a passage, navigating, scrolling, or marking a focused V1.6 passage as covered does not write canonical learning evidence.

## Progress interface

Progress shows:
- goals completed;
- chapters marked read by the canonical reader;
- focused V1.6 passages marked read;
- active/inactive goal progress;
- milestone coverage;
- recent reading coverage.

These figures are labeled as coverage, not mastery.

## Offline behavior

The V1.6 runtime files and curated track definitions are part of the PWA shell. The underlying Greek corpus continues to use the existing generated-corpus/offline system.

## Explicit non-claims and non-goals

V1.6 does **not** claim:
- exhaustive scholarly pericope segmentation of all 27 NT books;
- psychometrically validated passage difficulty;
- guaranteed comprehension from preparedness scores;
- automatic mastery from reading-plan completion;
- server telemetry or cloud synchronization;
- AI-generated canonical text or morphology;
- automatic workload escalation;
- that a suggested R-level has been achieved merely because it appears in a plan.

The curated tracks are selective pedagogical routes through the canonical corpus. Learners can still create whole-book or focused-passage goals outside those tracks.

## Acceptance gate

V1.6 is acceptable only if certification proves:
- deterministic goal and coverage semantics;
- actual-corpus passage materialization;
- whole-book chapter derivation from the canonical manifest;
- distinct difficulty and preparedness outputs;
- R1→R4 assistance reduction;
- daily and weekly planner integration without changing their mastery/capacity contracts;
- backup validation and restore safety;
- PWA inclusion;
- no V1.6 mastery-write path;
- no canonical learning-state mutation from goal creation, passage opening, or focused-passage coverage;
- no horizontal overflow in Read or Progress at a 320px viewport;
- no uncaught browser errors.
