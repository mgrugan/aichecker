---
version: alpha
name: AI Checker
description: >
  Design system for AI Checker — a tool that analyzes text and tells you,
  with evidence, how likely it is to be AI-generated. The visual language is
  editorial and forensic: warm paper surfaces, deep spruce ink, and a single
  emerald accent, with monospaced type reserved for scores and data.
colors:
  primary: "#173F35"
  secondary: "#5C6B66"
  accent: "#1E7A5F"
  neutral: "#F8F6F1"
  surface: "#FFFFFF"
  border: "#DDD8CC"
  success: "#1E7A5F"
  warning: "#7A5600"
  danger: "#B93815"
  danger-surface: "#FBEDE7"
  success-surface: "#E8F3EE"
  warning-surface: "#F9F1DF"
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
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-secondary-hover:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.primary}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
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

The personality is **editorial trust**. Warm paper backgrounds and a deep
spruce ink evoke print journalism; monospaced figures and quiet emerald
accents evoke instrumentation. The UI should feel spacious and unhurried,
with generous margins and a clear reading column. Nothing in the interface
should look machine-generated: no purple gradients, no glassmorphism, no
sparkle iconography, no robot mascots.

The emotional target: a user pastes in a suspect essay and feels they have
handed it to a meticulous, impartial examiner.

## Colors

The palette is rooted in warm paper neutrals and deep botanical inks, with
one emerald accent and a small set of verdict colors that carry semantic
meaning.

- **Primary — Spruce Ink (#173F35):** A near-black green used for headlines
  and core text. It reads as black at body sizes but reveals warmth in
  display sizes, giving the brand its signature tone.
- **Secondary — Sage Slate (#5C6B66):** A muted grey-green for captions,
  metadata, placeholder text, and secondary icons.
- **Accent — Verdigris (#1E7A5F):** The sole interactive color. Reserved for
  primary buttons, links, focus rings, and active states. If everything is
  emerald, nothing is — use it sparingly.
- **Neutral — Warm Paper (#F8F6F1):** The page background. Pure white
  (#FFFFFF) is reserved for cards and input surfaces so content sits on a
  subtly elevated layer.
- **Verdict colors:** Analysis results use a dedicated semantic trio —
  emerald (#1E7A5F) for "likely human," ochre (#7A5600) for "mixed signals,"
  and burnt sienna (#B93815) for "likely AI." Each pairs with a soft tinted
  surface for badges and highlighted passages. These colors are reserved for
  verdicts and system feedback; they never decorate marketing content.

All text/background pairings must meet WCAG AA (4.5:1 for body text, 3:1 for
large text). Spruce Ink on Warm Paper and on white both clear AAA.

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

The layout follows a **fixed-max-width grid** — content capped at 72rem,
with long-form reading columns capped at 42rem for comfortable line lengths
(65–75 characters).

Spacing follows an 8px scale with a 4px half-step. Sections breathe:
vertical rhythm between major page sections is 64px, between related blocks
24px, and within components 12–16px. The core screen is a two-pane analysis
view — pasted text on the left, findings on the right — that collapses to a
stacked layout below 900px, findings first.

## Elevation & Depth

Depth comes from **tonal layering, not shadows**. The Warm Paper background
sits lowest; white cards define the content layer, separated by 1px borders
in #DDD8CC. Shadows are used only for transient surfaces (menus, dialogs,
tooltips) and are soft and conservative: `0 4px 16px rgba(23, 63, 53, 0.08)`.
Nothing floats without a reason to float.

## Shapes

The shape language is **quietly rounded**: 6px on small elements (badges
excepted), 10px on buttons and inputs, 16px on cards and panels. Verdict
badges and chips are fully rounded (pill-shaped) to read as stamps of
classification. No sharp 0px corners, and no over-rounded 24px+ "bubble" UI.

## Components

- **Buttons:** Primary buttons are solid Verdigris with white text,
  darkening to Spruce Ink on hover. Secondary buttons are outlined on
  transparent, filling with the soft emerald surface on hover. One primary
  button per view. Button labels are sentence case, never all-caps.
- **Input fields:** The text-analysis textarea is the hero component — white
  surface, 1px border, generous 16px padding, and a 3px soft emerald focus
  ring. Helper text sits below in Sage Slate; error text in Burnt Sienna.
- **Cards:** White, bordered, 16px radius, 24px padding. Result cards lead
  with a mono data figure (the score) and a verdict badge, followed by prose
  explanation in Plex Sans.
- **Verdict badges:** Pill-shaped, tinted surface with matching deep text,
  uppercase mono labels ("LIKELY HUMAN", "MIXED SIGNALS", "LIKELY AI").
- **Evidence highlights:** Flagged passages within analyzed text use the
  tinted verdict surfaces as inline background with a 2px underline in the
  verdict color — readable, not neon.
- **Chips:** Filter and model-selection chips are pill-shaped, outlined by
  default, filling with soft emerald surface when selected.

## Do's and Don'ts

- **Do** reserve Verdigris for interaction and verdict-emerald for results;
  they may share a hex, but never use verdict colors decoratively.
- **Do** set every score, percentage, and count in IBM Plex Mono.
- **Do** keep one reading column for long-form text at ≤42rem.
- **Do** pair every verdict color with an icon or label — never communicate
  a verdict by color alone.
- **Don't** use purple, blue-violet gradients, glow effects, or any
  "AI aesthetic" clichés.
- **Don't** use Inter, Roboto, Arial, or generic system font stacks.
- **Don't** use heavy drop shadows or borderless floating cards.
- **Don't** animate verdicts with confetti, pulses, or sparkles; results
  appear with a single 150ms fade — this is a lab report, not a slot
  machine.
