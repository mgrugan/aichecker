---
version: alpha
name: AI Checker
description: >
  Design system for AI Checker — a tool that analyzes text and tells you,
  with evidence, how likely it is to be AI-generated. The visual language is
  cold luxury built around the liquid-metal primary button: graphite-black
  surfaces, chrome-silver ink, smoke greys, and monospaced type reserved
  for scores and data. Dark theme only; every view fits one screen.
colors:
  primary: "#E9EAEC"
  secondary: "#9BA0A8"
  accent: "#D3D6DB"
  neutral: "#16181D"
  surface: "#1D1F24"
  border: "#33363C"
  success: "#34D399"
  warning: "#E2B93B"
  danger: "#F87171"
  danger-surface: "#321616"
  success-surface: "#0E2A1E"
  warning-surface: "#2C2410"
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 56px
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: -0.015em
  h1:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.01em
  h2:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: 500
    lineHeight: 1.2
  h3:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.65
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
  label-caps:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.08em
  data-lg:
    fontFamily: IBM Plex Mono
    fontSize: 32px
    fontWeight: 500
    lineHeight: 1.1
  data-md:
    fontFamily: IBM Plex Mono
    fontSize: 15px
    fontWeight: 450
    lineHeight: 1.5
  caption:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
spacing:
  base: 16px
  "2xs": 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 40px
  "2xl": 64px
  gutter: 24px
  margin: 32px
  content-max: 72rem
  reading-max: 42rem
rounded:
  sm: 6px
  md: 10px
  lg: 16px
  full: 9999px
components:
  page:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
  button-primary:
    backgroundColor: "#141517"
    textColor: "#B9BDC4"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "#1B1C1F"
    textColor: "{colors.primary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-secondary-hover:
    backgroundColor: "#1F2125"
    textColor: "{colors.primary}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  input-focus:
    textColor: "{colors.accent}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  verdict-badge-human:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.success}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  verdict-badge-mixed:
    backgroundColor: "{colors.warning-surface}"
    textColor: "{colors.warning}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  verdict-badge-ai:
    backgroundColor: "{colors.danger-surface}"
    textColor: "{colors.danger}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
---

# AI Checker Design System

## Overview

AI Checker helps writers, editors, and educators understand whether a piece of
text was written by a human or a machine. The product's credibility *is* the
product, so the interface must feel like a well-edited publication crossed
with a forensic lab: calm, literate, and precise — never gimmicky, never
"AI-themed."

The personality is **cold luxury**: the interface is built outward from
its primary button, a liquid-metal pill of black gradient and chrome
shader. Graphite-black surfaces, silver ink, and smoke greys read as
precision instrumentation; monospaced figures carry the machine's
measurements. The UI is compact and unhurried at once: every view fits a
single desktop screen with no page scrolling, and long content scrolls
inside its panel. Nothing in the interface should look machine-generated:
no purple gradients, no neon glows, no sparkle iconography.

The emotional target: a user pastes in a suspect essay and feels they have
handed it to a meticulous, impartial examiner working at a black-steel
bench.

## Colors

The palette is a monochrome metal scale matched to the liquid-metal
button, with a small set of verdict colors that carry semantic meaning.

- **Primary — Chrome Ink (#E9EAEC):** Silver-white used for headlines and
  core text, echoing the button's chrome shader.
- **Secondary — Smoke (#9BA0A8):** Muted grey for captions, metadata,
  placeholder text, and secondary icons.
- **Accent — Polished Chrome (#D3D6DB):** Reserved for focus rings, links,
  and active states. Interaction itself belongs to the liquid-metal
  button; the accent stays quiet.
- **Neutral — Graphite (#16181D):** The page background, a step lighter
  than the button's black gradient so the button and the wireframe motifs
  read against it. Elevated panels use Gunmetal (#1D1F24) with 1px
  #33363C borders; the input workbench is frosted glass over the drifting
  wireframe layer.
- **Verdict colors:** Analysis results use a dedicated semantic trio —
  emerald (#34D399) for "likely human," brass (#E2B93B) for "mixed
  signals," and signal red (#F87171) for "likely AI." Each pairs with a
  deep tinted surface for badges and highlighted passages. These colors
  are reserved for verdicts and system feedback; they never decorate
  anything else.

All text/background pairings must meet WCAG AA (4.5:1 for body text, 3:1
for large text). Chrome Ink on Graphite clears AAA; verdict text is
checked against its tinted surface.

## Typography

Two families split the work: **Newsreader**, a contemporary editorial serif,
carries the brand voice in display and headline sizes; **IBM Plex Sans**
handles UI and body copy; **IBM Plex Mono** is reserved for anything the
machine says — scores, percentages, token counts, and highlighted evidence.

- **Display & Headlines:** Newsreader Medium with tight leading and slight
  negative tracking. Its bookish texture signals human judgment and
  editorial care.
- **Body & UI:** IBM Plex Sans Regular at 16px for interface copy and
  long-form explanations. Never substitute Inter, Roboto, Arial, or system
  defaults.
- **Data & Labels:** IBM Plex Mono for detection scores, confidence
  intervals, section labels, and inline evidence highlights. Labels are
  uppercase with 0.08em tracking. The serif/mono contrast is the visual
  shorthand for "human prose vs. machine measurement."

## Layout

The layout follows a **single-screen shell**: header, content, and footer
fill exactly one viewport (100dvh) and the page itself never scrolls.
Content is capped at 72rem wide; long documents scroll inside their own
panel, never the page. Reading columns cap at 42rem for comfortable line
lengths.

Spacing follows an 8px scale with a 4px half-step, tuned compact:
16-24px between related blocks, 12-16px inside components. The results
screen is a two-pane view — the analyzed document on the left, findings
on the right — each pane scrolling internally.

## Elevation & Depth

Depth comes from **tonal layering, not shadows**. The Graphite background
sits lowest; Gunmetal panels define the content layer, separated by 1px
borders in #2A2D31. The liquid-metal button is the only element with real
shadow depth — that is what makes it the protagonist. Other shadows are
reserved for transient surfaces (menus, dialogs) and stay conservative:
`0 4px 16px rgba(0, 0, 0, 0.4)`.

## Shapes

The shape language follows the button: **pills for interactive elements**
(fully rounded buttons, badges, and chips, matching the liquid-metal
pill), 10px on inputs, 16px on cards and panels. No sharp 0px corners,
and no over-rounded "bubble" containers.

## Components

- **Buttons:** The primary action is always the liquid-metal pill (black
  gradient body, chrome shader rim, ripple feedback) — one per view.
  Secondary buttons are gunmetal pills with 1px borders, lightening a
  step on hover. Button labels are sentence case, never all-caps.
- **Input fields:** The text-analysis textarea is the workbench — gunmetal
  surface, 1px border, 16px padding, and a soft chrome focus ring. Helper
  text sits below in Smoke; error text in signal red.
- **Cards:** Gunmetal, bordered, 16px radius, 20-24px padding. Result
  cards lead with a mono data figure (the score) and a verdict badge,
  followed by prose explanation in Plex Sans.
- **Verdict badges:** Pill-shaped, tinted surface with matching deep text,
  uppercase mono labels ("LIKELY HUMAN", "MIXED SIGNALS", "LIKELY AI").
- **Evidence highlights:** Flagged passages within analyzed text use the
  tinted verdict surfaces as inline background with a 2px underline in the
  verdict color — readable, not neon.
- **Chips:** Filter and model-selection chips are pill-shaped, outlined by
  default, filling with soft emerald surface when selected.

## Do's and Don'ts

- **Do** keep every view inside one viewport; long content scrolls in its
  panel, never the page.
- **Do** set every score, percentage, and count in IBM Plex Mono.
- **Do** reserve verdict colors for verdicts; the rest of the interface
  stays monochrome metal.
- **Do** pair every verdict color with an icon or label — never communicate
  a verdict by color alone.
- **Don't** use purple, blue-violet gradients, neon glows, or any
  "AI aesthetic" clichés.
- **Don't** use Inter, Roboto, Arial, or generic system font stacks.
- **Don't** use pure #000000 backgrounds; graphite keeps depth.
- **Don't** animate verdicts with confetti, pulses, or sparkles; results
  appear with a single 150ms fade — this is a lab report, not a slot
  machine.
