# BG8 — Secure AI Tutor

BG8 replaces the prototype deterministic chat surface with a grounded tutor architecture while preserving deterministic Greek data as the authority.

## Security boundary

The GitHub Pages client **never receives an OpenAI API key**. The browser calls a separate Cloudflare Worker at `/v1/tutor`; the Worker holds `OPENAI_API_KEY` as an encrypted Worker secret.

Current deployment contract:

1. deploy `worker/` as a Cloudflare Worker;
2. set `OPENAI_API_KEY` with `wrangler secret put OPENAI_API_KEY` or the Cloudflare dashboard;
3. configure the resulting `/v1/tutor` URL in `<meta name="koine-ai-endpoint">` in `index.html`;
4. keep `.dev.vars` / `.env` untracked.

Cloudflare's 2026 Workers documentation explicitly recommends secrets rather than `vars` for API keys. The Worker configuration declares the secret as required, so deployment fails clearly if it is missing.

## OpenAI API contract

BG8 uses the current OpenAI **Responses API** (`POST /v1/responses`) through the server-side Worker. The default deployable model is `gpt-5.6-terra`; it is an ordinary non-secret Worker variable and may be changed without changing client code.

The request uses:

- `store: false`;
- bounded input/context;
- bounded output tokens;
- Structured Outputs with a strict JSON Schema;
- no model web-search or arbitrary tools;
- `omni-moderation-latest` on the learner's current message before generation.

The structured response contains only:

- `answer`;
- `confidence`: `grounded | mixed | uncertain`;
- `evidence_ids` pointing to IDs supplied by the app;
- up to three follow-up questions;
- `boundary_note`;
- `disputed` boolean.

The Worker filters returned `evidence_ids` against the evidence packet so the model cannot fabricate app citations.

## Grounding hierarchy

AI is downstream from verified/reviewed app layers:

1. **SBLGNT text** — canonical surface text;
2. **MorphGNT** — canonical lemma/POS/morphology;
3. **BG1 curriculum** — reviewed pedagogical sequence;
4. **BG7 syntax annotations** — reviewed syntactic claims;
5. **learner draft / question** — user work;
6. **AI tutor** — explanation, questioning, feedback.

The tutor must not replace levels 1–4 with model inference.

### Evidence packet

The client may send a bounded evidence packet such as:

```text
morph:sblgnt.John.1.1.002
  MorphGNT parse of ἀρχῇ

text:John 1:1
  current canonical Greek verse

syntax:u41.john1.1.subject
  reviewed subject/predicate analysis

curriculum:u41
  canonical unit metadata
```

Passage-specific morphology or reviewed-syntax claims should cite these IDs. If the packet cannot support a requested claim, the tutor should say what is missing rather than invent it.

## Tutor modes

### Socratic

Default. Ask the learner to identify a concrete clue before supplying the conclusion.

Typical sequence:

**form → morphology → governing word / dependency → clause role → interpretation**

### Explain

Give a compact grounded explanation, still distinguishing certain data from interpretation.

### Translation feedback

Evaluate the learner's structural draft rather than matching it against a copyrighted English Bible translation. Check whether the draft preserves:

- finite predication;
- subject/complement relationships;
- prepositional attachment;
- subordinate clauses;
- participial/infinitival dependency;
- major discourse relationships when reviewed data exists.

The tutor should not rewrite the entire passage by default.

## Pedagogical safeguards

The server instruction contract explicitly prohibits:

- invented Greek parses or tokens;
- “aorist = once/simple past” shortcuts;
- treating a case ending as a built-in semantic label;
- treating a reference gloss as the contextual meaning;
- using etymology/root similarity as decisive lexical semantics;
- treating article presence/absence as a universal interpretive rule;
- deriving theology directly from morphology;
- presenting a reviewed ambiguity exercise as undisputed certainty;
- claiming AI feedback changed canonical mastery.

For disputed material the response order is:

**secure grammatical constraints → plausible analyses → interpretive arguments**.

## Mastery boundary

BG8 model output has **no write path into BG3 mastery**. AI can recommend an exercise or point out a likely misconception, but only deterministic/reviewed exercise interactions create canonical evidence or remediation.

This protects the course from model hallucinations becoming learner-state facts.

## Privacy

The client stores a small conversation history locally in the browser. Only the bounded conversation/context packet for the current request is sent to the Worker when context sharing is enabled.

The Worker:

- does not log prompt bodies in application code;
- sends `store: false` to the Responses API;
- returns `Cache-Control: no-store`;
- does not maintain a server-side conversation database;
- accepts requests only from configured origins.

The learner can clear local tutor history from the Tutor screen and can disable current reader/syntax context for an individual request.

## Abuse and cost controls

The Worker limits:

- request body size;
- learner-message length;
- history length;
- evidence count and evidence length;
- output token count;
- origin;
- request rate.

A Cloudflare Workers Rate Limiting binding currently allows 20 tutor requests per 60 seconds per browser client ID/origin pair. This is a best-effort public-site limit, not billing-grade accounting or authenticated quotas.

If stronger abuse control is needed later, add real user identity / Turnstile / durable quota storage rather than relying on IP addresses.

## Failure behavior

The app remains functional if the Worker, network, moderation endpoint, or model is unavailable.

The client falls back to a clearly labeled deterministic tutor. The fallback can guide morphology/syntax reasoning but does not impersonate a successful model response.

## Deployment state

BG8 commits the complete client and Worker implementation, but the repository cannot create a Cloudflare account, deploy a Worker, or manufacture an API key by itself. Until the Worker is deployed and `koine-ai-endpoint` is configured, the Tutor screen deliberately reports **Local fallback**.
