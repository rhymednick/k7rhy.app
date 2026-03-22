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

### Structure

```
[icon]  [badge pill] [title]
        [body text]
```

- White background (`bg-white dark:bg-slate-900`)
- Full border: `border border-gray-200 dark:border-slate-700`
- Left accent border: `border-l-4` in level color
- Rounded corners: `rounded-lg`
- Subtle shadow: `shadow-sm`
- Padding: `p-4`
- Icon: 18×18, level color, flex-shrink-0, aligned to top
- Badge pill: small uppercase label, level-colored background + text, `rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide`
- Title: `font-semibold text-sm text-gray-900 dark:text-slate-100`
- Body: `text-sm text-gray-500 dark:text-slate-400 leading-relaxed`

### Level Color Map

| Level    | Border / Icon   | Badge bg        | Badge text      | Badge label  |
|----------|----------------|-----------------|-----------------|--------------|
| Default  | `gray-500`     | `gray-100`      | `gray-500`      | "Note"       |
| Important| `blue-500`     | `blue-100`      | `blue-700`      | "Important"  |
| Warning  | `amber-500`    | `amber-100`     | `amber-700`     | "Caution"    |
| Critical | `red-500`      | `red-100`       | `red-700`       | "Critical"   |
| Question | `purple-500`   | `purple-100`    | `purple-700`    | "FAQ"        |
| Choice   | `green-500`    | `green-100`     | `green-700`     | "Your Choice"|

### Icons (unchanged from current)

| Level    | Lucide icon       |
|----------|-------------------|
| Default  | `Terminal`        |
| Important| `Info`            |
| Warning  | `AlertTriangle`   |
| Critical | `Ban`             |
| Question | `HelpCircle`      |
| Choice   | `ArrowLeftRight`  |

The `icon` override prop continues to work — if provided, it replaces the default icon for that level.

### API Changes

None. `Level` enum, all props, and MDX aliases are unchanged.

---

## DocSection Visual Design

Changes are limited to `config/doc-section.config.ts`. The `DocSection` component itself is unchanged.

### Updated Heading Styles

| Level | New Tailwind classes |
|-------|---------------------|
| h1 | `text-2xl font-bold tracking-tight pb-3 mb-1 border-b border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100` |
| h2 | `text-lg font-semibold tracking-tight mt-6 mb-1 text-gray-700 dark:text-slate-200` |
| h3 | `text-base font-semibold tracking-tight mt-4 mb-1 text-gray-600 dark:text-slate-300` |
| h4 | `text-sm font-semibold tracking-tight mt-3 text-gray-500 dark:text-slate-400` |
| h5 | `text-sm font-medium tracking-tight mt-3 text-gray-500 dark:text-slate-400` |
| h6 | `text-sm font-medium italic tracking-tight mt-3 text-gray-400 dark:text-slate-500` |

### Design Rationale

- h1 bottom border provides a clean visual separator between major sections without decoration
- Font weight steps down from `bold` → `semibold` → `medium` as levels deepen
- Foreground color ramps from `gray-900` → `gray-400` to reinforce hierarchy
- `mt-*` on h2+ gives breathing room between sections; h1 relies on page-level spacing

---

## Files to Change

| File | Change |
|------|--------|
| `components/doc/doc-alert.tsx` | Replace Shadcn `Alert` wrapper with `<div>`; apply new level-based color/badge/icon system |
| `config/doc-section.config.ts` | Update all 6 heading style strings |

---

## Out of Scope

- `Level` enum values or names (unchanged)
- DocAlert prop API (unchanged)
- MDX component aliases (unchanged)
- `DocSection` component logic (unchanged)
- `DocPage`, `DocImage`, `MdxDocProcedure` family (already redesigned)
