# V1.11 — Citation Style Engine, Bibliography Templates & Publication Export

## Purpose
V1.11 formats existing V1.9 dossiers and V1.10 structured source records for publication. It does not create a parallel research graph and does not reinterpret evidence.

## Persistent state
Store: `koine-path-publication-profiles-v1`, schema 1.

A publication profile stores formatting preferences only:
- profile name;
- Koinē citation-style template;
- parenthetical, footnote, or endnote placement;
- bibliography template;
- bibliography and notes headings;
- document title/subtitle/author/date;
- section-inclusion flags.

Profiles do not store source full text, copied dossier content, claim truth scores, or mastery evidence.

Maximum profiles: 20.

## Citation styles
V1.11 ships three deterministic house templates:
1. **Koinē Author–Date**
2. **Koinē Notes–Bibliography**
3. **Koinē Biblical Studies Notes**

These are Koinē Path formatting templates. They are **not certified implementations of CSL, SBL Handbook of Style, Chicago Manual of Style, Turabian, APA, or another external standard**.

The engine supports:
- parenthetical citations;
- full first notes;
- short repeated notes;
- footnote markers;
- endnote numbering;
- deterministic alphabetical bibliography ordering.

## Bibliography templates
- `standard`: formatted alphabetical bibliography;
- `keyed`: formatted bibliography with V1.10 citation keys;
- `annotated`: formatted bibliography that may include user source notes only when `includeSourceNotes` is explicitly enabled.

Source notes are excluded by default.

## Provenance path
Publication citations resolve through the existing chain:

`V1.9 evidence node -> V1.8 research entry -> V1.10 source link -> V1.10 structured source`

V1.11 does not add a new evidence-node type. V1.8/V1.9 snapshots therefore remain the provenance record, while V1.11 formats the current reusable V1.10 bibliographic metadata.

## Publication exports
The Publication workspace can generate locally:
- Markdown (`.md`);
- standalone HTML (`.html`);
- plain text (`.txt`).

Exports can include:
- title metadata;
- research question/context/thesis;
- layered claims;
- citations in the selected placement;
- alternative readings;
- argument outline and conclusion;
- theological synthesis (optional);
- limitations/unresolved questions (optional);
- evidence appendix (optional);
- bibliography (optional).

Every formatted export identifies the active Koinē house style and states that it is not externally style-certified.

## Boundaries
V1.11 does not:
- change V1.10 source metadata while formatting;
- change V1.9 claims, evidence, graph edges, confidence, contestation, or dossier status;
- infer scholarly authority or consensus;
- convert citation count into truth or quality;
- verify publication acceptance requirements;
- provide CSL compatibility or claim style-guide-perfect output;
- retrieve external publications or copyrighted full text;
- create canonical Greek mastery evidence.

## Backup/recovery
`publication-portability.js` validates the publication-profile store before inspection or restore. Final application backup metadata is `v1.11-feature`. Existing atomic recovery/rollback behavior remains owned by V1.2 data portability.

## Acceptance gate
V1.11 is accepted only when:
- deterministic citation/profile/export tests pass;
- the real Chromium Publication workflow passes;
- profile backup validation rejects malformed state;
- publication assets are included in the generated offline shell;
- 320px Publication and Synthesis layouts do not overflow horizontally;
- the source/dossier/mastery firewalls remain unchanged;
- V1.10/V1.9/V1.8/V1.7 and all established regression workflows pass on the same exact head.
