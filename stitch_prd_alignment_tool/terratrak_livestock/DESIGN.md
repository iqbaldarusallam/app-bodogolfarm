---
name: TerraTrak Livestock
colors:
  surface: '#fcf8fb'
  surface-dim: '#dcd9dc'
  surface-bright: '#fcf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#404943'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#707973'
  outline-variant: '#bfc9c1'
  surface-tint: '#2c694e'
  primary: '#0f5238'
  on-primary: '#ffffff'
  primary-container: '#2d6a4f'
  on-primary-container: '#a8e7c5'
  inverse-primary: '#95d4b3'
  secondary: '#006c48'
  on-secondary: '#ffffff'
  secondary-container: '#92f7c3'
  on-secondary-container: '#00734d'
  tertiary: '#2e4e3d'
  on-tertiary: '#ffffff'
  tertiary-container: '#456654'
  on-tertiary-container: '#bee2cb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1f0ce'
  primary-fixed-dim: '#95d4b3'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#0e5138'
  secondary-fixed: '#92f7c3'
  secondary-fixed-dim: '#75daa8'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005235'
  tertiary-fixed: '#c7ebd4'
  tertiary-fixed-dim: '#abcfb8'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#2d4d3c'
  background: '#fcf8fb'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
  status-active: '#52B788'
  status-sick: '#F4A261'
  status-quarantine: '#E63946'
  status-sold: '#6D6875'
  status-dead: '#495057'
  surface-muted: '#F2F2F7'
  brand-light: '#D8F3DC'
  brand-surface: '#F0FAF2'
typography:
  display:
    fontFamily: DM Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: DM Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 26px
  headline-md:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 22px
  headline-sm:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 20px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 21px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  id-monospace:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  safe-bottom: 64px
  gutter: 16px
---

## Brand & Style

This design system is engineered for the high-stakes, high-utility environment of modern ranching and livestock management. It is designed to be **functional, glanceable, and error-tolerant**, specifically optimized for "dirty hands and bright sunlight." The aesthetic avoids decorative fluff in favor of a **Corporate / Modern** style mixed with **Tactile** elements that ensure high accessibility in the field.

The brand personality is **Earthy and Trustworthy**, reflecting a deep connection to the land while maintaining a professional, data-driven core. The UI prioritizes high contrast and clear hierarchy, ensuring that a user can understand the status of an animal within a 2-second glance. 

Key principles include:
- **High Utility:** Large tap targets (48dp minimum) and clear visual feedback for all actions.
- **Glanceable Information:** Use of semantic color-coding to communicate health and status instantly.
- **Environmental Adaptability:** High-contrast typography and earthy tones that remain legible under varying outdoor lighting conditions.

## Colors

The color palette is rooted in a range of **Brand Greens** that symbolize health, growth, and the agricultural environment. These are balanced by **Earthy Neutrals** that provide a stable, professional foundation for data-heavy screens.

**Semantic Status Colors** are the most critical part of the system's communication layer:
- **Active (Green):** Represents healthy animals and positive progress.
- **Sick (Orange):** Signals a need for attention or medical intervention.
- **Quarantine (Red):** Used for critical isolation; this color is also reserved for high-priority errors.
- **Sold/Dead (Grays):** Used for terminal statuses where the animal is no longer in the active production cycle.

The system defaults to a **Light Mode** optimized for outdoor visibility, utilizing off-whites and light grays to reduce glare while maintaining contrast.

## Typography

This design system employs a three-family typographic strategy to balance personality, readability, and technical precision.

- **DM Sans (Headings):** Used for the structural hierarchy of the app. It provides a modern, geometric look that remains legible in display sizes.
- **Inter (Body/UI):** The workhorse font. Chosen for its exceptional legibility at small sizes and high x-height, it handles the bulk of the data and interface labels.
- **JetBrains Mono (Technical IDs):** Specifically used for Ear Tags, Batch Codes, and Animal IDs. The monospaced nature ensures that characters like 'O' and '0' or 'I' and '1' are easily distinguishable, reducing data entry errors.

**Mobile Scaling:** Headings larger than 22px are strictly reserved for detail headers and hero stats. Body text never drops below 14px for primary content to ensure readability in field conditions.

## Layout & Spacing

The system is built on a **fixed 8dp grid** to ensure consistency and speed of development. 

### Layout Model
The app utilizes a **Fluid Grid** for content within a 16dp global margin. 
- **Margins:** 16dp standard horizontal margin for all screens.
- **Gutters:** 16dp between cards or major layout sections.
- **Tap Targets:** A strict **48dp minimum** height/width is enforced for all interactive elements (buttons, inputs, list items) to accommodate use with gloves or in motion.

### Breakpoints
- **Compact (Phone):** Full-width cards, single column layout.
- **Medium (Tablet):** Two-column grid for summary stats and list items; sidebar navigation where applicable.

## Elevation & Depth

This system uses **Ambient Shadows** inspired by Android's elevation model to communicate hierarchy and interactivity. Depth is used to separate active tasks from the background.

- **Surface Layer:** The base screen uses `Neutral-100` (#F2F2F7).
- **Elevation 1 (Standard Cards):** Low-opacity, diffused shadows that lift content slightly off the background. Used for Livestock cards and list items.
- **Elevation 2 (Interactive Elements):** Slightly deeper shadows used for input fields and pressed states.
- **Elevation 4 (Floating Action Buttons):** Distinct shadows to indicate high interactivity and the top-most layer of the UI.
- **Elevation 8 (Bottom Sheets):** Heavy, soft shadows with a `rgba(0,0,0,0.4)` backdrop overlay to focus the user on modal tasks.

For **Alert Cards**, depth is complemented by a 4dp solid left-border accent in the appropriate semantic color to ensure the priority is felt even if shadows are less visible in bright light.

## Shapes

The shape language is **Rounded**, striking a balance between a modern software feel and a soft, approachable brand identity. 

- **Standard (12dp):** Applied to the majority of containers, including Livestock Cards, Form Fields, and Primary Buttons.
- **Large (24dp):** Reserved for the Floating Action Button (FAB) and the top corners of Bottom Sheets to create a distinct visual "pull" and comfort for thumb interactions.
- **Full (Pill):** Used for Status Badges and Avatars to distinguish them as atomic elements rather than structural containers.

## Components

### StatusBadge
Small, pill-shaped chips using `named_colors` for backgrounds. Active status includes a pulse animation on the leading dot. Text is always uppercase `Label-md`.

### LivestockCard
The primary vessel for data. Includes a 12dp radius, Elevation 1, and a `Monospace` ID at the top right. Displays the primary animal name in `Headline-md`.

### AlertCard
Used for health warnings or quarantine. Feature a 4dp left-border in `status-quarantine` or `warning` colors. Backgrounds should be the 50-tint of the semantic color.

### FormField & VitalSignsInput
Input fields use a 12dp radius and a 1dp `neutral-300` border. On focus, the border thickens to 2dp in `primary-700`. Vital signs inputs should include clear unit labels (e.g., "kg", "°C") in `Caption` text.

### TimelineItem
Used for medical and weight history. Connected by a vertical 2dp line in `neutral-300`. Events are marked with 8dp dots colored by event type (Medication = Orange, Weight = Green).

### Primary Button & FAB
Buttons are 12dp rounded, `primary-700` background, and 48dp minimum height. The FAB is 24dp rounded (Elevation 4) and typically houses the "Add Record" or "Sync" action.

### BottomSheet
Used for all complex data entry. Surfaces are white with 24dp top-corner radii. Includes a handle bar at the top center for draggability.