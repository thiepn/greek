# BG12 — Audio & Pronunciation

BG12 adds pronunciation, listening, playback, and shadowing without making pronunciation a proxy for grammatical competence.

## Profiles

### Reconstructed Koinē

The default profile is a Roman-period **teaching reconstruction**. Its seven-vowel system follows the broad phonemic model described by Biblical Language Center: `ι/ει`, `ε/αι`, `ο/ω`, and `υ/οι` are paired while `η`, `ου`, and `α` remain distinct. The app labels this as an approximation because Koinē covered centuries, regions, and changing sound systems.

Reference: https://www.biblicallanguagecenter.com/koine-greek-pronunciation/

### Academic Erasmian

The Erasmian profile is an explicit classroom convention. “Erasmian” is not one universally identical accent, so Koinē Path does not call this profile a historical reconstruction.

### Modern Greek

The Modern profile represents contemporary Greek pronunciation. Only this profile may use the browser `SpeechSynthesis` API. It requests an `el-GR` voice and reports failure when no Greek voice exists.

## Historical-audio boundary

Koinē Path must never do this:

`Reconstructed Koinē selected → play Modern Greek TTS → label it Koinē`

Historical profiles therefore refuse browser TTS. Their deterministic phoneme cue remains available, and the runtime is designed so a future reviewed/licensed recording pack can supply reference audio without changing learner state.

BG12 intentionally ships **no third-party historical recording corpus**. Free-to-listen material is not automatically redistributable, and pronunciation/text editions may differ from the pinned SBLGNT/MorphGNT corpus.

## Pronunciation cues

`pronunciation-engine.js` converts polytonic Greek into a profile-specific phonemic teaching cue. It:

- normalizes Greek through NFD for breathing/accent inspection;
- detects rough breathing for non-Modern profiles;
- preserves lexical stress/accent as a cue marker;
- applies longest-match digraph rules;
- distinguishes the selected profile's vowel/consonant system.

The cue is instructional notation, not a claim of narrow phonetic transcription for every speaker or period.

## Audio workspace

The Audio view provides:

- persistent pronunciation-profile selection;
- persistent playback rate;
- free-text Greek pronunciation workbench;
- alphabet/sound-system orientation;
- profile distinction drills;
- listening-only comprehension items when an honest audio source exists;
- Modern Greek browser speech when available;
- local microphone shadowing and replay;
- listening/playback statistics separate from BG3 mastery.

## Listening-only comprehension

BG12 includes short reviewed listening items whose Greek text remains hidden until the learner answers.

At present these can play only under the **Modern Greek** profile with an installed `el-GR` browser voice. Under Reconstructed Koinē or Erasmian, the app explicitly withholds playback rather than recycling a Modern voice and pretending it belongs to the selected historical/classroom profile.

Listening answers are stored only in the pronunciation subsystem and never become BG3 grammar mastery evidence.

## Microphone privacy

Shadowing uses `navigator.mediaDevices.getUserMedia` + `MediaRecorder`.

The recording:

- remains in the current browser session as a local Blob URL;
- is not uploaded;
- is not persisted to localStorage;
- is not sent to the AI tutor;
- receives no automatic pronunciation grade.

Only the count of completed recording sessions is persisted.

## Reader integration

The BG6 word inspector receives a **Pronounce selected word** action.

- Modern profile + installed `el-GR` voice: plays the word.
- Reconstructed Koinē / Erasmian: routes to Audio and shows the selected profile's deterministic cue rather than substituting Modern speech.

## Fluency integration

BG10 keeps the first pass audio-free so listening cannot contaminate its unaided reading metric.

During **analysis** and **reread**, BG12 may expose **Listen / shadow**. Modern speech is token-queued so the current token can be highlighted during playback. Historical profiles route to the Audio workbench unless a verified historical pack is installed in a later phase.

## Listening drills

BG12 tracks discrimination drills in a separate pronunciation state. These drills can test profile-specific sound distinctions, but they do not call `learningEngine.recordEvidence()`.

BG3 currently models concept, recognition, application, and reading-transfer competence, not a separate listening/pronunciation dimension. BG12 therefore refuses to smuggle accent or listening performance into grammar mastery.

## Persistence

`koine-path-pronunciation-v1` stores:

- profile;
- playback rate;
- pronunciation-drill attempts/correct;
- listening-comprehension attempts/correct;
- playback counts;
- recording-session count;
- bounded drill/listening history.

It does not store microphone audio.

## Scope boundary

BG12 establishes a trustworthy pronunciation/audio system, not a complete studio-recorded Greek NT. A future recording pack can add historically reviewed word/passage audio plus timing metadata. That pack must state pronunciation profile, reader, text edition, license, attribution, and token/passage alignment before Koinē Path treats it as reference audio.