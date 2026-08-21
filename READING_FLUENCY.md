# BG10 — Reading Fluency Mode

BG10 measures whether the learner can read connected New Testament Greek with decreasing dependence on lexical and morphological tools. It does not equate speed with competence.

## Core loop

Every scored fluency session follows:

1. **First pass** — continuous Greek reading with no lemma/parse reveal;
2. **Comprehension checkpoint** — commit to the passage-level flow before analysis;
3. **Assisted analysis** — inspect difficult tokens with lemma/morphology help;
4. **Reread** — read the same passage continuously again without tools;
5. **Comparison** — inspect pace, interruption, unknown-word, help, and comprehension metrics.

The first pass and assisted pass are intentionally separate. Tool use after the first read cannot be retroactively presented as unaided reading.

## Metrics

BG10 records:

- first-pass words/tokens per minute;
- approximate clause-boundary rate per minute;
- first-pass unknown-word rate;
- interruption count;
- unique tokens requiring analysis assistance;
- analysis-assistance rate;
- reread pace;
- reread change relative to the first pass;
- reviewed comprehension-check result when available;
- completed passage days and consecutive reading-day streak;
- passage length and program.

WPM is descriptive. It is never a mastery threshold and never writes BG3 evidence.

## Mastery boundary

These actions do **not** create mastery:

- starting a timer;
- finishing a first pass;
- reading quickly;
- marking an unknown word;
- opening morphology help;
- completing an unscored whole-chapter session;
- improving reread WPM.

A reviewed comprehension checkpoint may contribute limited BG3 `reading` evidence when its mapped unit is accessible. A whole chapter without a reviewed checkpoint records exposure only.

## R3 → R4 readiness

The current transition criterion uses the latest five scored sessions:

- average comprehension ≥80%;
- average first-pass unknown-word rate ≤12%;
- average analysis-help rate ≤8%;
- at least 3 of 5 passages contain ≥100 tokens.

There is deliberately **no WPM gate**. A learner who reads slowly but accurately and independently should not be blocked from R4 merely for speed.

R4-style sessions can be explicitly started in **cold practicum** mode. Cold status is recorded, but the same mastery firewall applies.

## Passage-length progression

Automatic recommendations progress by completed sessions within a program:

- sessions 0–1: `micro`;
- sessions 2–4: `short`;
- sessions 5–7: `medium`;
- session 8+: `chapter`.

Within the desired level, the engine prefers unseen passages and then passages whose known-vocabulary / accessible-grammar coverage is reasonably close to the learner's current ability.

Whole chapters are generated directly from the BG6 corpus after the program reaches chapter mode. They remain unscored for comprehension until a reviewed checkpoint exists.

## Programs

### Unit 45 — 1 John Fluency Path

Short, repetitive epistolary Greek designed for the first move from guided reading to continuous reading. The program eventually expands to all five chapters.

### Unit 46 — Mark Narrative Fluency

Narrative clauses and frequent finite verbs. The program eventually expands through all sixteen chapters of Mark.

### Unit 47 — Philippians Epistolary Fluency

Longer clause structures, participles, infinitives and argumentative flow. The program eventually expands to all four chapters.

The current reviewed checkpoint inventory contains 15 passage segments across the three books.

## Coverage-aware recommendation

For each candidate the engine estimates:

### Vocabulary coverage

A lemma is treated as known for recommendation purposes only when its BG5 lemma-recognition card has at least two reviews, is not currently failed (`Again`), and is not a leech.

### Grammar-access coverage

Tokens are mapped through the existing reader unit mapping. A token contributes to grammar coverage when its mapped curriculum unit is currently accessible.

The recommendation score combines both values. These are selection heuristics, not claims that every word or construction is mastered.

## Whole-chapter mode

The learner can also start a fluency session from the chapter currently open in BG6 Read.

This supports:

- arbitrary NT whole-chapter practice;
- critical-text chapters whose first token-bearing verse is not verse 1;
- sustained reading beyond the reviewed 1 John / Mark / Philippians sequences.

When no reviewed comprehension checkpoint exists, the session is explicitly marked **unscored** for comprehension.

## Persistence

`koine-path-reading-fluency-v1` stores:

- settings;
- active pass and its phase timestamps;
- unique unknown/help token IDs;
- completed-session history;
- pass metrics;
- checkpoint results.

An active session can be restored after reload. Timers resume from the persisted phase start timestamp rather than resetting visually to zero.

## BG9 integration

BG9 reading-transfer tasks for advanced Units 45–50 now route to **Fluency**. Earlier reading work may still route to the general reader.

BG10 does not replace BG9 scheduling. BG9 decides when reading work is high priority; BG10 supplies the structured reading task.

## Corpus validation

CI rebuilds the complete pinned BG6 corpus and confirms:

- all reviewed passage books exist;
- all referenced chapters exist;
- every reviewed verse range contains canonical tokens;
- all program chapters exist in the generated corpus;
- comprehension options/answers are structurally valid.

This preserves the separation between reviewed reading pedagogy and canonical Greek corpus data.