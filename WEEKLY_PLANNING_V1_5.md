# V1.5 — Adaptive Weekly Planning, Milestones & Goal Forecasting

## Purpose

V1.5 turns the V1.3 guided path and V1.4 session history into a bounded weekly planning layer. It answers four questions without creating a second mastery system:

1. How much study capacity is available this week?
2. Which kinds of work should receive that capacity?
3. What is the next canonical milestone?
4. What completion range is plausible for a selected canonical target?

## Weekly capacity

Weekly capacity is always:

`sessionMinutes × daysPerWeek`

The planner never increases that capacity because work was missed. A 25-minute / 5-day profile remains a 125-minute week even after an under-filled previous week.

If completed-session evidence exists for the prior week, unused minutes are reported as unused capacity. They are not added as debt. Unfinished canonical prerequisites and remediation remain ahead of novelty because the learning engine is still authoritative.

If no completed-session evidence exists for the prior week, V1.5 records the week as unobserved and infers no missed-work debt.

## Weekly priority mix

The target mix is goal-aware:

- Read NT: 50% canonical course, 25% Greek-text transfer, 15% review/remediation, 10% vocabulary retrieval.
- Course mastery: 65% canonical course, 20% review/remediation, 10% Greek-text transfer, 5% vocabulary retrieval.
- Grammar refresh: 40% canonical course, 30% morphology retrieval, 20% review/remediation, 10% Greek-text transfer.
- Exegesis: 40% canonical course, 25% Greek-text transfer, 15% review/remediation, 15% exegetical reasoning, 5% vocabulary retrieval.

These percentages allocate planning capacity. They do not award evidence or override the daily learning-engine recommendation.

## Milestones

Canonical stage milestones are complete only when the existing learning engine reports the stage as passed. The planner may show unit-level progress toward the stage, but it may not infer a stage pass from its own calculations.

The full-course milestone requires all 50 canonical units mastered and all canonical stage gates passed.

The immediate objective is always the first incomplete canonical stage. Separately, the learner may choose any canonical stage or the full course as a forecast target. Changing the forecast target changes only the planning lens.

## Automatic recalibration

The current week is regenerated when any of these change:

- calendar week;
- configured session length;
- configured study days;
- primary study goal;
- canonical mastered-unit count;
- current stage;
- due-review/remediation state;
- canonical recommendation kind/unit;
- selected forecast target.

Manual recalibration is also available.

## Forecasting

Forecasts are ranges, never promised completion dates.

### Low confidence

Until enough aligned evidence exists, V1.5 uses a planning heuristic of **45–90 foreground active minutes per canonical unit**. This is a workload model, not an empirical claim about every learner or unit.

The weekly capacity comes from the configured workload until at least two completed prior weeks exist.

### Medium / high confidence

Empirical calibration is enabled only when:

- at least two completed prior weeks exist;
- at least two canonical unit masteries occurred inside the same completed-week evidence window; and
- at least 60 foreground active minutes exist in that window.

Observed active minutes per mastery are widened to a range (75%–135% of the observed ratio, with conservative floors) before converting remaining units into a week range.

Confidence is:

- **medium** with at least 2 aligned masteries across at least 2 completed weeks;
- **high** with at least 4 aligned masteries across at least 3 completed weeks;
- **low** otherwise.

Current-week masteries are excluded from empirical calibration until the week is complete, preventing a partially observed week from producing an artificially optimistic minutes-per-unit estimate.

## Foreground-time dependency

Forecast behavior uses V1.4 foreground active time. Background time, closed-tab time, device sleep, and paused-session time are not counted.

## Mastery firewall

`weekly-planning-engine.js` and `weekly-planning-ui.js` have no path to:

- `recordEvidence()`;
- `recordExposure()`;
- `recordHint()`;
- mark units mastered;
- pass stages;
- unlock content;
- resolve remediation.

Planning state lives in `koine-path-weekly-plan-v1` and is workflow metadata only.

## Portability

`koine-path-weekly-plan-v1` is covered by V1.2 namespace backups and has explicit restore validation:

- schema version 1;
- preferences object with a string `targetId`;
- `current` is null or an object;
- archive is an array;
- archive maximum is 20 weekly snapshots.

## Explicit non-goals

V1.5 does not provide psychometric proficiency prediction, guaranteed completion dates, server telemetry, cloud planning, XP, streak punishment, automatic workload increases, or planner-generated mastery.
