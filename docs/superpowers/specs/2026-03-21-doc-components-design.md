# Doc Components Redesign — Design Spec

**Date:** 2026-03-21
**Status:** Approved

---

## Overview

Redesign the procedural documentation components (`DocProcedure` / `MdxDocProcedure` family and `DocImage`) to improve visual polish and authoring ergonomics. The redesign adopts a "Structured / Premium" aesthetic — gradient circle step numbers, fading connector lines, tinted alert callouts — and eliminates the redundant `<Desc>` wrapper requirement.

**Out of scope (shelved for follow-up):** `DocAlert`, `DocSection`.

---

## Goals

1. **Visual polish** — apply a cohesive, professional look consistent with the approved style direction (indigo/purple gradient palette, soft shadows, smooth connectors).
2. **Authoring DX** — remove the `<Desc>` wrapper so step text is written as direct children of `<ProcStep>`.
3. **Code consolidation** — eliminate the parallel `DocProcedure` (props-based) / `MdxDocProcedure` (JSX) duplication. `MdxDocProcedure` becomes the single implementation.

---

## Visual Design

### Procedure Steps

- **Step number badge:** 34×34px circle, `linear-gradient(135deg, #6366f1, #8b5cf6)`, white bold number, `box-shadow: 0 2px 8px rgba(99,102,241,0.35)`.
- **Connector line:** 2px wide, `linear-gradient(to bottom, #8b5cf6, rgba(139,92,246,0.08))` — fades out between steps, absent on the last step.
- **Step title:** `font-weight: 700`, `font-size: 16px`, `color: #1e1b4b` (dark indigo).
- **Step body text:** `font-size: 14px`, `color: #4b5563`, `line-height: 1.6`.
- **Image:** floated right of description on md+ screens. Thumbnail widths are intentionally reduced from current values (400px top-level → 120px, 200px substep → 80px) to better fit the two-column layout.

### Substeps

- **Letter badge:** 26×26px circle, `background: #ede9fe`, `color: #7c3aed`, `border: 1.5px solid #c4b5fd`. Lowercase letter (a, b, c…).
- **Rail:** left `border-left: 2px solid #e0e7ff` on the substep container, indented `padding-left: 16px`.
- **Connector:** 1.5px fading gradient matching main steps but lighter (`#c4b5fd → transparent`).
- **Substep title:** `font-weight: 600`, `font-size: 14px`, `color: #2e1065`.

### Alert Callouts (within steps)

Keep existing `DocAlert` component and level system unchanged. Visual improvement is out of scope for this sprint. Within the procedure mockup, alerts appear as tinted `#ede9fe` boxes with icon + bold title.

### Dark Mode

Maintain existing dark mode support using Tailwind `dark:` variants. Map new light-mode colors to appropriate dark equivalents:
- `#1e1b4b` → `dark:text-slate-100`
- `#4b5563` → `dark:text-slate-300`
- `#ede9fe` callout background → `dark:bg-violet-900/30`
- Gradient circles: unchanged (they read well on dark backgrounds).

---

## DocImage

- **Thumbnail:** rounded corners (`border-radius: 8px`), `border: 1px solid #c7d2fe`, `box-shadow: 0 2px 8px rgba(99,102,241,0.15)`.
- **Hover state:** semi-transparent indigo overlay (`rgba(99,102,241,0.12)`) with a white circular zoom icon (Lucide `ZoomIn`) centered on the image. `DocImage` is currently a React Server Component (`async function`). The hover overlay must be implemented with pure CSS using Tailwind `group`/`group-hover:` utilities — do **not** add `'use client'` or `useState`. This keeps it RSC-compatible.
- **Expand dialog:** unchanged (existing `AlertDialog`), but thumbnail styling signals clickability clearly.

---

## API Changes

### Remove `<Desc>` wrapper

**Before:**
```mdx
<ProcStep text="Prepare the resistors">
  <Desc>
    Bend the leads of the resistor...
  </Desc>
</ProcStep>
```

**After:**
```mdx
<ProcStep text="Prepare the resistors">
  Bend the leads of the resistor...
</ProcStep>
```

`MdxDocProcedureStep` will treat all non-`MdxDocProcedureSubstepGroup` children as description content, rendered together inside the `prose` wrapper div (replacing both the old `stepDescription` slot and the `nonSubStepChildren` slot — these are merged into one). The `substepGroup` is still rendered after the prose block. The `StepDescription` / `Desc` component is removed from `mdx-doc-procedure-step.tsx` and its `Desc` alias is removed from `components/mdx-components.tsx`.

**Risk:** Any `.mdx` file still containing `<Desc>` after migration will silently render nothing (the alias will be undefined). Run a project-wide search for `<Desc>` before shipping to confirm all instances are removed. Currently only `content/docs/dl20w_sma.mdx` uses `<Desc>`.

### Deprecate props-based `DocProcedure`

`DocProcedure` (`doc-procedure.tsx`) is used nowhere in the MDX content — all docs use the JSX component API. It will be removed. The props-based interface types (`DocProcedureStep`, `DocProcedureSubstep`, `DocProcedureProps`) are also removed.

### MDX component aliases unchanged

The MDX shorthand aliases (`Proc`, `ProcStep`, `ProcSubgroup`, `DocAlert`, etc.) remain the same. Authors see no breaking changes beyond removing `<Desc>` tags.

---

## Files to Change

| File | Change |
|------|--------|
| `components/doc/mdx-doc-procedure-step.tsx` | New visual style; remove `StepDescription`/`Desc` handling; treat non-subgroup children as description; remove leftover `console.log` debug statements |
| `components/doc/mdx-doc-procedure-substep-group.tsx` | New substep rail + letter badge style |
| `components/doc/mdx-doc-procedure.tsx` | New step list styles (spacing, counter reset) |
| `components/doc/doc-image.tsx` | Rounded corners, border, shadow, hover overlay with zoom icon |
| `components/doc/doc-procedure.tsx` | **Delete** (replaced by MDX component) |
| `components/mdx-components.tsx` | Remove `Desc`/`StepDescription` alias and import; remove `DocProcedure` import and alias |
| `content/docs/dl20w_sma.mdx` | Remove all `<Desc>` wrapper tags (only known file using them) |

---

## Out of Scope

- `DocAlert` redesign (shelved)
- `DocSection` heading redesign (shelved)
- `DocPage`, `DocIndexCard`, `PageNavigation` (untouched)
