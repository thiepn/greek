# BG11 — Intermediate & Exegetical Greek

BG11 moves Koinē Path beyond first-year parsing and fluency into disciplined intermediate exegesis. Its goal is not to make the app produce authoritative interpretations. Its goal is to train the learner to distinguish direct grammatical evidence from increasingly inferential judgments.

## Reasoning ladder

Every BG11 case is organized around four layers:

1. **Grammatical fact** — what can be established directly from the configured Greek text, morphology, or a reviewed syntactic relationship;
2. **Contextual judgment** — what the local clause, discourse, lexical distribution, or argument makes more or less plausible;
3. **Interpretive possibility** — readings that remain defensible after the grammatical and contextual constraints are applied;
4. **Theological conclusion** — broader synthesis that must be argued rather than presented as though it were contained in a morphology tag.

The application must never silently collapse these layers.

## Canonical units

BG11 is attached to the final three BG1 units.

### Unit 48 — Lexicon method & responsible word study

Training includes:

- polysemy and contextual sense;
- the difference between reference glosses and definitions;
- root-fallacy / etymology safeguards;
- exact-corpus frequency and rank;
- per-book lemma distribution;
- sample canonical verse contexts;
- raw nearby-lemma co-occurrence;
- lexical + syntactic interaction;
- disputed genitives and semantic restraint.

### Unit 49 — Textual variants, edition awareness & tool-assisted exegesis

Training includes:

- naming the active Greek edition;
- recognizing that textual establishment precedes detailed exegesis;
- using the SBLGNT comparison apparatus as an alert to variation;
- distinguishing an edition-comparison apparatus from a manuscript apparatus;
- understanding that a textual variant can change the grammatical object being analyzed;
- assigning morphology, lexicon, concordance, syntax, apparatus, and AI to different evidential roles.

### Unit 50 — Independent exegetical practicum

Training includes:

- advanced participial and infinitival dependency;
- verbal aspect without simplistic tense slogans;
- discourse and argument tracing;
- long-period clause structure;
- lexical + syntax integration;
- explicit ambiguity;
- grammar/theology boundary cases;
- responsible synthesis from multiple evidence layers.

## Reviewed case inventory

BG11 currently contains **27 reviewed cases**:

- 8 Unit 48 lexical-method cases;
- 8 Unit 49 edition/tool cases;
- 11 Unit 50 integrated exegetical cases.

The cases use real BG6 corpus passages. They do not contain a second hand-maintained copy of the Greek text.

## Corpus word-study index

The existing full-corpus build now also generates:

`generated/corpus/lexical-index.json`

For every lemma in the exact pinned MorphGNT corpus it stores:

- exact occurrence count;
- exact frequency rank and band;
- per-book distribution;
- up to 40 deterministic sample verse references;
- the twelve most frequent lemmas occurring within a raw ±3-token window.

The index therefore covers the same **5,461 lemmas / 137,554 tokens** used by BG6 rather than a separate word-study corpus.

### Important semantic limitation

`nearbyLemmas` are raw co-occurrence counts. They are **not** semantic definitions, senses, syntactic dependencies, or statistically normalized collocation scores.

The UI deliberately describes them as evidence worth inspecting rather than a meaning generator.

A BG5 reference gloss may be displayed alongside the exact corpus data, but it remains a reference/retrieval gloss rather than a definition.

## Textual-variant source

BG11 adds five reviewed edition-awareness cases from the Faithlife/SBLGNT comparison apparatus pinned at:

`c4d241a9c1c479a55b989ba35a4976c1d0b8052c`

Current reviewed loci:

- Mark 1:1;
- John 1:18;
- John 1:34;
- Romans 5:1;
- Romans 8:1.

The SBLGNT apparatus used here compares readings printed by selected editions. It is **not manuscript evidence** and is not a substitute for a full manuscript-based critical apparatus.

BG11 therefore teaches the following workflow:

**identify edition/reading → note significant variant → consult fuller apparatus when needed → establish working text → analyze morphology/syntax/lexicon → interpret**

The limited SBLGNT apparatus is an edition-awareness tool, not the final text-critical authority.

## Verbal aspect policy

BG11 explicitly rejects shortcuts such as:

- `present = continuous action`;
- `aorist = once-for-all action`;
- `aorist = simple past in every mood`.

Tense-form, aspect/viewpoint, temporal reference, Aktionsart, discourse function, and translation realization are kept conceptually separate.

A case may teach a secure morphological form and a reasonable aspectual contribution while still marking finer pragmatic conclusions as judgments rather than facts.

## Ambiguity policy

Cases such as disputed genitives or participial relations must be presented in the format:

**secure grammatical constraints → plausible analyses → arguments for/against → interpretive implications**

A contested construction may not be encoded as a single unquestionable theological answer merely to make the exercise easier to grade.

The graded question instead tests whether the learner understands the methodological boundary.

## Exegetical notebook

Each reviewed case has a local notebook.

The learner can write:

- observations;
- lexical findings;
- syntactic arguments;
- alternative readings;
- translation decisions;
- theological reflection.

**notes never create mastery**. They are learner-owned work, not automatically graded evidence.

## Assistance and mastery

The BG11 assistance sequence is:

**Attempt → Observation hint → Constraint → Reviewed analysis**

Assistance maps into the existing BG3 hint-penalty system.

- unassisted answer: strongest evidence;
- observation hint: reduced evidence;
- constraint reveal: stronger reduction;
- reviewed analysis reveal: full-help evidence only.

A correct reviewed case can contribute BG3 evidence only when its Unit 48–50 prerequisite is accessible.

Locked cases remain available for exploration, but they write exposure only.

## Mastery firewall

These actions do not create BG3 mastery:

- opening Exegesis;
- opening a case;
- reading a reasoning ladder;
- opening the reviewed analysis;
- searching a lemma;
- viewing frequency or nearby-lemma counts;
- inspecting the SBLGNT comparison apparatus;
- saving a notebook entry;
- receiving an AI explanation.

Only a scored reviewed interaction writes canonical BG3 evidence, and the BG8 AI tutor still has no mastery-write path.

## Adaptive-review integration

BG9 routes:

- Units 45–47 → Fluency;
- Units 48–50 → Exegesis.

Repeated BG11 errors such as `lexical_overreach`, `syntax_relation`, `tense_form`, or `mood` can therefore return through the normal deterministic remediation system.

## Data separation

BG11 preserves these distinctions:

1. BG6 canonical SBLGNT/MorphGNT token data;
2. BG11 deterministic corpus statistics derived from those tokens;
3. BG5 reference gloss prompts;
4. reviewed BG11 pedagogical cases and reasoning ladders;
5. SBLGNT edition-comparison apparatus data;
6. learner notes/state;
7. BG8 generative explanation.

None of these layers silently becomes another.

## Validation

BG11 CI:

1. tests the deterministic Exegesis engine;
2. checks browser/runtime syntax;
3. rebuilds all 27 books from the pinned BG6 source;
4. regenerates the lexical index;
5. validates all 27 reviewed passage ranges against the generated corpus;
6. verifies 5,461 lexical profiles sum to the exact 137,554 corpus tokens;
7. checks sample references and nearby-lemma integrity;
8. fetches the five pinned Faithlife/SBLGNT apparatus entries and verifies the declared source strings;
9. checks the notebook/mastery firewall.

## Scope boundaries

BG11 does not include:

- a full NA28/UBS manuscript apparatus;
- an automatically generated semantic lexicon;
- automatic theological conclusions;
- AI-written canonical exegesis;
- manuscript dating/weighting algorithms;
- claims that corpus frequency equals importance;
- claims that co-occurrence equals lexical meaning.

Those boundaries are intentional. The learner is being trained to reason from evidence rather than merely operate a larger collection of tools.