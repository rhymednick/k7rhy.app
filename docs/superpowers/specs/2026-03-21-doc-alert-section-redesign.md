# Doc Alert & Section Redesign — Design Spec

**Date:** 2026-03-21
**Status:** Approved

---

## Overview

Redesign `DocAlert` and `DocSection` heading styles to improve visual polish. These were shelved during the procedure components redesign sprint.

**Out of scope:** `DocProcedure`, `DocImage`, `MdxDocProcedure` family (already completed).

---

## Goals

1. **DocAlert** — give each alert level a distinct, professional visual identity using level-appropriate colors. Remove dependency on the Shadcn `Alert` wrapper which constrains the layout.
2. **DocSection** — clean typographic improvements to the heading hierarchy. Better size scale, spacing, and a bottom rule on h1 to provide natural section separation. No decorative elements.

---

## DocAlert Visual Design

Replace the Shadcn `<Alert>` outer wrapper with a plain `<div>`. The authoring API (`<DocAlert title="..." level={Level.Important}>content</DocAlert>`) is unchanged.

### Layout Structure

The component uses a two-column flex layout:

```
┌─────────────────────────────────────────┐
│ [icon]  [badge pill] [title text]        │
│         [body content]                   │
└─────────────────────────────────────────┘
```

- **Outer container:** `flex gap-3 items-start` with the card styles below
- **Left column:** icon only, `flex-shrink-0`, top-aligned
- **Right column:** `flex-1`, contains two rows:
  - Top row: `flex items-center gap-2 flex-wrap` — badge pill + title
  - Bottom row: body content div

The body content is indented naturally by being in the right column — no explicit padding needed.

### Card Styles

- Background: `bg-white dark:bg-slate-900`
- Border: `border border-gray-200 dark:border-slate-700` — 1px border on all four sides
- Left accent: `border-l-4` — overrides the left side to 4px in the level color. The result is intentional: 1px border on three sides, 4px accent on the left, with `rounded-lg` applied uniformly. This is the standard "left accent card" pattern.
- Corners: `rounded-lg`
- Shadow: `shadow-sm`
- Padding: `p-4`

### Icon

- Size: `w-[18px] h-[18px]`, `flex-shrink-0`
- Color: level-specific (see color map)
- If `title` is omitted, icon still renders

### Badge Pill

- Label: level-specific string (see color map)
- Classes: `rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide flex-shrink-0`
- Background and text color: level-specific (see color map)
- Badge always renders regardless of whether `title` is provided

### Title

- Element: `<span>` (changed from Shadcn `<AlertTitle>` which rendered as `<h5>`)
  - **Semantic note:** This is an intentional downgrade from heading to inline element. Alert titles are labels, not document headings — using `<h5>` was incorrect semantics. Section headings are provided by `DocSection`.
- Classes: `font-semibold text-sm text-gray-900 dark:text-slate-100`
- If `title` prop is `undefined`, the `<span>` is not rendered. **This is a behavior correction** — the current code renders `<AlertTitle>{undefined}</AlertTitle>` unconditionally, which produces an empty element. The new implementation conditionally renders the `<span>` only when `title` is provided.
- `overrideTitleClass` replaces the base title classes; `appendTitleClass` appends to them — both apply to this `<span>` element

### Body Content

- Wrapper: `<div>`
- Base classes: `prose space-y-2 text-gray-500 dark:text-slate-400` — retains the existing `prose space-y-2` classes unchanged so MDX body content renders correctly. `prose-sm` is intentionally not added to avoid changing body font sizing.
- `overrideDescriptionClass` replaces these base classes; `appendDescriptionClass` appends to them

### Level Color Map

The badge `className` is the light and dark classes composed together. Example for Important: `bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300`.

| Level    | Border / Icon  | Badge className (composed)                                                      | Badge label    |
|----------|----------------|---------------------------------------------------------------------------------|----------------|
| Default  | `gray-500`     | `bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400`                | "Note"         |
| Important| `blue-500`     | `bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300`             | "Important"    |
| Warning  | `amber-500`    | `bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300`         | "Caution"      |
| Critical | `red-500`      | `bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300`                 | "Critical"     |
| Question | `purple-500`   | `bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300`     | "FAQ"          |
| Choice   | `green-500`    | `bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300`         | "Your Choice"  |

Note: "Your Choice" is intentionally two words — it is the design choice for this label.

### Icons (unchanged from current)

| Level    | Lucide icon       |
|----------|-------------------|
| Default  | `Terminal`        |
| Important| `Info`            |
| Warning  | `AlertTriangle`   |
| Critical | `Ban`             |
| Question | `HelpCircle`      |
| Choice   | `ArrowLeftRight`  |

The `icon` prop override replaces the default icon for that level. It affects only the icon element — the badge label is always derived from the `level` prop and is unaffected by `icon`.

### API Changes

None. `Level` enum, all props (`title`, `level`, `icon`, `overrideTitleClass`, `appendTitleClass`, `overrideDescriptionClass`, `appendDescriptionClass`, `children`), and MDX aliases are unchanged.

---

## DocSection Visual Design

Changes are limited to `config/doc-section.config.ts`. The `DocSection` component itself is unchanged.

### Color Approach

The existing config uses `text-foreground/90` etc. (CSS variable opacity shorthand). The new styles use explicit Tailwind color classes with `dark:` variants. This is intentional: explicit colors provide more reliable control over the heading hierarchy in both light and dark mode, and the heading styles are not expected to vary with custom Shadcn theme tokens.

### Updated Heading Styles

| Level | New Tailwind classes |
|-------|---------------------|
| h1 | `text-2xl font-bold tracking-tight pb-3 mb-1 border-b border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100` |
| h2 | `text-lg font-semibold tracking-tight mt-6 mb-1 text-gray-700 dark:text-slate-200` |
| h3 | `text-base font-semibold tracking-tight mt-4 mb-1 text-gray-600 dark:text-slate-300` |
| h4 | `text-sm font-semibold tracking-tight mt-3 text-gray-500 dark:text-slate-400` |
| h5 | `text-sm font-medium tracking-tight mt-3 text-gray-500 dark:text-slate-400` |
| h6 | `text-sm font-medium italic tracking-tight mt-3 text-gray-400 dark:text-slate-500` |

**Note:** The existing config uses `text-l` for h4/h5/h6 which is not a valid Tailwind class (`text-lg` is correct). The new styles fix this.

### Spacing Changes (intentional)

- **h1:** The existing `md:pb-6` responsive padding is removed. It produced excessive whitespace at desktop widths. Replaced with a flat `pb-3` that works well at all sizes alongside the new bottom border.
- **h2/h3 `pt-*` → `mt-*`:** The existing styles used `pt-*` (padding-top, inside the element). The new styles use `mt-*` (margin-top, space between siblings). This is intentional — `mt-*` correctly controls the gap between a preceding element and the heading, rather than adding internal padding that can compound with surrounding margins. `pb-*` on h2/h3 is dropped in favor of the natural spacing between the heading and content below.

### Design Rationale

- h1 bottom border provides a clean visual separator between major sections without decoration
- Font weight steps down from `bold` → `semibold` → `medium` as levels deepen
- Foreground color ramps from `gray-900` → `gray-400` to reinforce hierarchy
- `mt-*` on h2+ provides breathing room between sections; h1 relies on page-level spacing

---

## Files to Change

| File | Change |
|------|--------|
| `components/doc/doc-alert.tsx` | Replace Shadcn `Alert` wrapper with `<div>`; apply new level-based color/badge/icon/layout system |
| `config/doc-section.config.ts` | Update all 6 heading style strings |

---

## Out of Scope

- `Level` enum values or names (unchanged)
- DocAlert prop API (unchanged)
- MDX component aliases (unchanged)
- `DocSection` component logic (unchanged)
- `DocPage`, `DocImage`, `MdxDocProcedure` family (already redesigned)
