# V1.4 — Daily Session Orchestration & Learning Analytics

## Purpose

V1.4 turns the V1.3 guided study recommendation into a resumable study session and adds local analytics that describe actual Koinē Path use without introducing XP, streak pressure, or a second mastery system.

## Session lifecycle

A session starts only from a ready V1.3 guided plan. The plan is snapshotted at start so a session remains stable even if the learning engine changes its recommendation while the learner is working.

A session can be:

- active;
- paused;
- resumed after reload;
- finished with all tasks complete; or
- finished manually with incomplete tasks retained in history.

Task completion is workflow metadata. It is not canonical learning evidence.

## Foreground-time definition

`engagedSeconds` is not wall-clock duration between start and finish.

The browser contributes short bounded pulses only when:

1. a session exists;
2. the session is active; and
3. the document is visible.

Closing the tab, backgrounding the app, pausing the session, sleeping the device, or leaving the app closed does not add study time. Each write is bounded to a maximum 30-second contribution so throttling or wake-from-sleep cannot create a large false interval.

Session time is attributed to the current top-level workspace (`Today`, `Learn`, `Morphology`, `Read`, `Tutor`, `Review`, or `Progress`).

## Daily orchestration

The V1.4 session UI shows:

- planned session minutes;
- plan mode;
- task count;
- current session status;
- foreground active time;
- task completion;
- direct task routing;
- pause/resume; and
- finish-session control.

An unfinished session is restored after reload rather than silently replaced by a newly generated plan.

## Analytics

The Progress screen derives analytics entirely from local session records plus the current V1.3 workload profile.

### This week

- foreground active minutes;
- configured weekly minute target (`sessionMinutes × daysPerWeek`);
- study days;
- configured study-day target;
- completed/total session tasks.

A day counts as a study day when a session records at least 60 seconds of foreground engagement or at least one completed session task.

### Recent 28-day view

- foreground minutes;
- study days;
- task completion rate;
- average completed-session active minutes;
- study-day coverage relative to the configured target during the observed window.

The denominator is bounded to the weeks actually observed, up to four weeks, so a new learner is not treated as if they had already missed four historical weeks before using the feature.

### Activity mix

Foreground seconds are aggregated by top-level workspace and displayed as a distribution. This is descriptive only and does not affect mastery.

### Seven-day trend

The seven-day chart shows foreground active minutes by session start date. It is not a streak score.

## Workload-fit adaptation

V1.4 may suggest a shorter default session when at least three of the most recent four completed sessions substantially under-fill their planned workload.

The fit measure uses the larger of:

- task-completion ratio; and
- foreground-time / planned-time ratio.

This avoids penalizing a learner merely for completing planned tasks efficiently.

If average fit is below 60%:

- a 45-minute profile may suggest 25 minutes;
- a 25-minute profile may suggest 10 minutes;
- a 10-minute profile is never shortened automatically.

The app never changes the profile silently. Applying the suggestion requires an explicit user action.

## Mastery firewall

`session-engine.js` and `session-ui.js` have no pathway to canonical mastery-writing methods.

Session state cannot:

- mark units mastered;
- pass stage gates;
- unlock units;
- create recognition/application/reading evidence;
- clear remediation; or
- change canonical checkpoint outcomes.

The V1.3 learning engine remains authoritative.

## Persistence and recovery

Session state is stored at:

`koine-path-sessions-v1`

It is included automatically in the V1.2 `koine-path-*` backup namespace. V1.4 adds explicit restore validation for session schema and the 400-session retention bound.

## Retention

The local session history retains at most 400 completed sessions. Oldest records are discarded first after that bound.

## Explicit non-goals

V1.4 does not add:

- XP;
- achievement badges;
- streak punishment;
- competitive leaderboards;
- cloud analytics;
- telemetry sent to a server;
- background activity tracking;
- automatic changes to canonical mastery;
- psychometric claims about time-on-task; or
- automatic changes to the learner's configured workload.

## Validation gate

The dedicated workflow must prove:

- deterministic session lifecycle;
- pause/resume behavior;
- reload persistence;
- foreground-time accounting;
- exact weekly-target calculation;
- workload-fit suggestion behavior;
- session backup inclusion and schema rejection;
- no canonical mastery-writing APIs in the session runtime;
- offline-shell inclusion;
- browser lifecycle operation;
- byte-for-byte canonical learning-state preservation during session-only actions; and
- 390px mobile reflow without horizontal overflow.
