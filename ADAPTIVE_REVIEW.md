# BG9 — Adaptive Review Engine

BG9 unifies review signals from the deterministic learning systems into one daily scheduler. It does **not** create a second mastery model.

## Core boundary

The scheduler may decide **what to practice next**. It may not decide that the learner has mastered something.

- opening a scheduled task writes no BG3 evidence;
- marking a session visited writes no BG3 evidence;
- finishing a review session writes no BG3 evidence;
- only the source interaction (morphology answer, SRS rating, syntax answer, reader parse, explicit remediation success) can update canonical learner evidence.
- BG8 AI output remains advisory and is never accepted as a review fact automatically.

## Inputs

BG9 reads deterministic state from:

1. **BG3 Learning Engine** — unit mastery, dimension scores, review-due state, typed remediation, error history, prerequisite accessibility;
2. **BG5 Vocabulary/SRS** — due cards, intervals, lapses, relearning state, leech flags;
3. **BG4 Morphology Laboratory** — family-level attempts/accuracy;
4. **BG7 Syntax Laboratory** — Unit 38–44 attempts/accuracy;
5. **BG6 Reader/BG3** — reading-transfer evidence already recorded through the canonical learning engine.

BG8 tutor conversation text is deliberately excluded from canonical scheduling input.

## Review task types

- `remediation` — repeated typed errors grouped by unit + error class;
- `vocabulary` — currently due BG5 SRS cards;
- `unit-review` — accessible units that are due or materially weak;
- `morphology` — repeatedly weak reviewed morphology families;
- `syntax` — weak reviewed syntax units;
- `reading` — weak reading-transfer dimensions.

## Error clustering and escalation

Open BG3 remediation items are grouped by `(unitId, errorType)`.

Escalation labels:

- 1–2 occurrences: `new`;
- 3–5 occurrences: `repeated`;
- 6+ occurrences: `persistent`.

Persistent clusters receive higher scheduling priority but are not automatically suspended or marked mastered.

## Retrieval-risk heuristic

BG9 exposes a transparent heuristic rather than claiming a calibrated memory model or FSRS implementation.

For a BG3 unit it uses:

- elapsed time since latest evidence/activity;
- the unit's current BG3 review interval;
- current composite mastery;
- whether BG3 already considers review due.

A simple exponential decay estimate produces `retrievability` and `risk`. This value is used only for task ranking.

It is **not** a scientifically calibrated probability that the learner will remember an item.

Vocabulary urgency continues to use BG5's real card state: due date, lapses, relearning status and leech flag.

## Priority order

Typical ordering is:

1. repeated/persistent remediation;
2. overdue/leech vocabulary;
3. due BG3 unit review;
4. weak syntax/morphology;
5. reading-transfer review;
6. if the review queue is clear, the normal BG3 curriculum recommendation.

The exact score is intentionally deterministic and inspectable.

## Mixed-session planning

The default review budget is **20 minutes**. The UI also offers 10, 35 and 50 minute presets.

Approximate task costs:

| Task | Cost |
| --- | ---: |
| Vocabulary card | 0.6 min |
| Morphology weakness block | 2.5 min |
| Remediation cluster | 3 min |
| Syntax weakness block | 3.5 min |
| BG3 unit review | 4 min |
| Reading transfer | 5 min |

The planner penalizes repeatedly choosing the same domain and the same domain twice in succession. This produces interleaving without forcing artificial diversity when only one kind of review is actually due.

A large vocabulary backlog therefore cannot automatically consume the entire available study block.

## Session state

`koine-path-adaptive-review-v1` stores only scheduler/session metadata:

- daily review-minute preference;
- active session ID;
- planned task IDs;
- task IDs opened during the session;
- recent session history.

No Greek answer, mastery score or canonical SRS state is duplicated there.

## Today integration

BG9 becomes the owner of the cross-system **Recommended next** decision.

When deterministic review is due, Today routes to the highest-value review task. When the review backlog is clear, it falls back to BG3's prerequisite-aware curriculum recommendation.

## Future replacement points

BG9 is designed so a future calibrated memory scheduler can replace `memoryEstimate()` without changing:

- BG3 learner-state schema;
- BG5 card history;
- remediation history;
- task routing;
- review-session UI.

If a future FSRS implementation is adopted, it should be named FSRS only when the actual algorithm and state model are implemented and validated.