# BG14 — Mobile UX & Accessibility

BG14 treats accessibility and mobile behavior as application-wide infrastructure rather than per-screen decoration.

## Target

Koinē Path targets **WCAG 2.2 Level AA** for the web application shell and learning workspaces. Automated checks are necessary but not sufficient for conformance; real assistive-technology testing remains part of release certification.

Key implementation targets:

- reflow without page-level two-dimensional scrolling at **320 CSS px**;
- pointer targets at least **24×24 CSS px** under WCAG 2.2 AA, with Koinē Path using **44px** targets for normal coarse-pointer controls;
- visible keyboard focus that is not hidden by the sticky application header;
- no disabled browser zoom;
- semantic landmarks, labels, current-navigation state, language metadata, and live feedback;
- reduced-motion and increased-contrast support;
- safe-area support in installed PWA mode.

Inline Greek word controls in continuous reading remain inline because changing each word into a 44px block would destroy text flow. They fall under the inline target exception; all ordinary buttons and controls use the larger mobile target policy.

## Mobile navigation

The old <=900px horizontally scrolling navigation strip is removed by the final BG14 override.

Desktop retains the editorial left index. Mobile uses a native `<dialog>` opened from the sticky header:

- modal focus containment is provided by the platform dialog primitive;
- Escape closes the menu;
- focus returns to the Menu trigger;
- active view is exposed with `aria-current="page"`;
- arrow keys/Home/End provide supplemental list navigation;
- dynamically registered BG4–BG13 workspaces are mirrored automatically.

## Focus model

The active workspace heading becomes the focus destination after view changes. Headings and controls use scroll margins so the sticky header cannot fully obscure focused content. A visible **Skip to main content** link is the first keyboard stop.

No global `outline:none` or `outline:0` rules are permitted.

## Greek and screen readers

Ancient Greek reading surfaces are marked `lang="grc"` while surrounding UI remains English. This includes the full reader, fluency Greek, lesson Greek, morphology display forms, vocabulary fronts, and word inspectors. Verse numbers remain English-language metadata.

Dynamic answer feedback is promoted to polite live status output. Tables receive deterministic header scope/labels when content modules have not supplied them.

## Accessibility preferences

`koine-path-accessibility-v1` stores only display/access preferences:

- Motion: system / reduce / allow;
- Contrast: system / high / standard;
- Text size: standard / large.

This state is separate from BG3 mastery and all learner evidence. The accessibility runtime contains no mastery-write path.

System `prefers-reduced-motion` and `prefers-contrast` remain authoritative when the learner chooses System.

## Zoom and reflow

The viewport explicitly allows browser zoom and uses `viewport-fit=cover` for installed-PWA safe areas.

At 600px and below, multi-column controls, statistics, result rows, offline storage fields, review items, reader controls, and other composite layouts collapse progressively. At 320px, the app targets one-dimensional page scrolling; genuine data tables may retain internal two-dimensional scrolling because their tabular relationship requires it.

## Touch

For coarse pointers, normal controls target at least 44px height. Reader/fluency word tokens are intentionally exempted as inline text controls. Touch sizing is tested in Chromium mobile emulation in addition to CSS contract checks.

## Virtual keyboard and orientation

BG14 listens to `visualViewport` where supported and maintains a viewport-height CSS variable. Focused text inputs/selects are scrolled into a visible central position on small screens after virtual-keyboard changes. Orientation and viewport resize update the same state.

## PWA safe areas

Top, left, right, and bottom layout padding uses `env(safe-area-inset-*)`. Mobile dialogs, the sticky header, content padding, and the BG13 update banner account for display cutouts/home indicators.

## Automated validation

BG14 CI performs two layers.

### Deterministic contract

Checks include:

- zoom is not disabled;
- `viewport-fit=cover` is present;
- skip link/main target exists;
- mobile/accessibility files load last;
- no global focus-outline suppression;
- 44px coarse-pointer policy;
- 320px breakpoint;
- reduced motion / contrast support;
- no accessibility → mastery write path.

### Browser validation

Headless Chromium + axe-core checks:

- skip-link focus;
- view-change focus management;
- `lang="grc"` reader semantics;
- persisted accessibility preferences;
- native mobile navigation dialog and focus restoration;
- visible non-inline target minimums;
- page-level reflow across every registered workspace at 320 CSS px;
- representative WCAG 2.2 A/AA axe scans.

Axe's target-size rule is replaced by Koinē Path's own pointer-target check so inline Greek reading controls can be treated according to the WCAG inline exception rather than being reported as generic buttons.

## Manual certification still required

Automated browser testing cannot certify real screen-reader or platform behavior. Before v1 release, manually verify at minimum:

- VoiceOver + Safari on iPhone/iPad;
- TalkBack + Chrome on Android;
- NVDA + Firefox/Chrome on Windows;
- keyboard-only desktop navigation;
- installed PWA safe areas on iOS and Android;
- 200% and 400% zoom/reflow;
- portrait/landscape orientation;
- virtual keyboard with Tutor, search, translation, and notebook inputs;
- high-contrast/forced-colors environments where available.

BG14 establishes the architecture and automated regression gates; BG16 release certification should record the real-device/assistive-technology matrix.
