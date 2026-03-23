# Visual Consistency Phase 1 — Design Spec

**Date:** 2026-03-22
**Status:** Approved

---

## Overview

Unify the visual language across the site: consolidate competing color palettes, create a shared icon badge component, standardize card borders and hover behavior, clean up dark mode depth inconsistency, and fix small legacy bugs. This is a visual-only refactor — no new features, no changes to page structure or routing.

---

## Goals

1. **Color unification** — one primary gradient (sky→emerald), with sky→indigo as the single guitar-category variant. Remove amber→orange and blue→purple entirely.
2. **IconBadge component** — replace all inline gradient-circle implementations with a single shared component.
3. **Card consistency** — thin 1px border everywhere; sky-blue border accent on hover (no scale animation).
4. **Dark mode depth** — standardize to two values site-wide: `slate-950` for page backgrounds, `slate-900` for card/panel surfaces.
5. **Small fixes** — mobile nav lime green badge, dark gradient `to-indigo-*` tail removed.

---

## Design Decisions

### Icon Badge Colors

| Context | Gradient | Tailwind |
|---------|----------|----------|
| Default (all icons, footer, docs, kits) | sky→emerald | `from-sky-500 to-emerald-600` |
| Guitar category only | sky→indigo | `from-sky-500 to-indigo-600` |

Both variants share `sky-500` as the starting point — visually unified at first glance, subtly distinct on close inspection.

### Card Hover Behavior

All cards (blog, product teaser, doc index, feature grid) use:
```
hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]
```
Transition: `transition-all duration-150`

Remove all `hover:scale-[1.02]` and `hover:scale-*` from cards. Remove `group-hover:scale-[1.02]`. The border accent is sufficient; scale feels decorative.

### Card Border

All cards standardize to `border border-border` (thin 1px, CSS variable). Remove `border-2` from `ham-radio-kit-page.tsx` and `guitar-page.tsx` inner cards.

### Dark Mode Gradient Backgrounds

Consolidate all section/hero/banner dark gradients to:
```
dark:from-slate-950 dark:via-slate-950 dark:to-slate-900
```
Replace all `dark:to-indigo-950` and `dark:to-indigo-900` occurrences in shared layout components. The indigo tail creates an unintended purple tint in dark mode.

### Dark Mode Surface Colors

- Page/section backgrounds: `dark:bg-slate-950`
- Card/panel surfaces: `dark:bg-slate-900`
- Elevated overlays (e.g., doc-image lightbox): `dark:bg-slate-800`

No other slate values should appear as backgrounds. This is a forward-looking standard; Phase 1 does not require auditing all existing files for compliance — only the files explicitly listed in the file table are in scope.

### Nav Badge (Mobile and Sidebar)

Both `mobile-nav.tsx` and `sidebar-nav.tsx` contain the same lime-green badge. Replace `bg-[#adfa1d] text-[#000000]` with `bg-sky-500 text-white` in both files.

---

## New Component: `components/shared/icon-badge.tsx`

```tsx
interface IconBadgeProps {
    icon: React.ElementType;
    variant?: 'default' | 'guitar';
    size?: 'sm' | 'md' | 'lg';
}
```

| Prop | Value | Tailwind |
|------|-------|----------|
| `variant="default"` | sky→emerald | `from-sky-500 to-emerald-600` |
| `variant="guitar"` | sky→indigo | `from-sky-500 to-indigo-600` |
| `size="sm"` | 36×36px | `h-9 w-9 rounded-lg` — icon `h-4 w-4` |
| `size="md"` | 40×40px | `h-10 w-10 rounded-lg` — icon `h-5 w-5` |
| `size="lg"` | 48×48px | `h-12 w-12 rounded-xl` — icon `h-6 w-6` |

Default: `variant="default"`, `size="md"`.

Full classes on the wrapper div:
```
flex items-center justify-center bg-gradient-to-br shadow-sm text-white
+ size classes + rounded classes + gradient classes
```

No tests needed — it's a pure presentational component with no logic beyond prop-driven class selection.

---

## Files to Create or Modify

| File | Change |
|------|--------|
| `components/shared/icon-badge.tsx` | Create — new shared component |
| `components/product/guitar-page.tsx` | Use `<IconBadge icon={...} variant="guitar" size="lg" />` for the inline gradient icon div (existing gradient is `from-blue-500 to-purple-600` with `shadow-lg` — this changes structure, color, and shadow; `shadow-lg` → `shadow-sm` via `IconBadge` is intentional). Replace all `border-2` on `<Card>` elements with `border border-border` (applies to all 6 card instances at lines 65, 75, 78, 81, 88, 112). For the 4 interactive cards (lines 65, 75, 78, 81 — those with `hover:shadow-lg`), replace `hover:shadow-lg transition-shadow` with `hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)] transition-all duration-150`. The 2 non-interactive cards get no hover classes: the Description card (line 88, `from-slate-50/50`) gets only `border-2` → `border border-border`; the Related Content card (line 112) gets `border-2` → `border border-border` AND the background gradient replacement `from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20` → `from-sky-50/50 to-indigo-50/50 dark:from-sky-950/20 dark:to-indigo-950/20`. Replace decorative blob colors: `bg-blue-400/20` → `bg-sky-400/20`, `bg-purple-400/20` → `bg-indigo-400/20`, `dark:bg-blue-500/10` → `dark:bg-sky-500/10`, `dark:bg-purple-500/10` → `dark:bg-indigo-500/10`. Replace header overlay gradient `from-blue-100/50 to-purple-100/50` with `from-sky-100/50 to-indigo-100/50` (dark variant: `dark:from-blue-900/10 dark:to-purple-900/10` → `dark:from-sky-900/10 dark:to-indigo-900/10`). |
| `components/product/ham-radio-kit-page.tsx` | Use `<IconBadge icon={...} variant="default" size="lg" />` for the inline gradient icon div (existing gradient is `from-amber-500 to-orange-600` with `shadow-lg` — this changes structure, color, and shadow; `shadow-lg` → `shadow-sm` via `IconBadge` is intentional). Replace all `border-2` on `<Card>` elements with `border border-border` (applies to all 5 card instances at lines 62, 71, 107, 143, 167). For the 3 interactive cards (lines 62, 107 — plain; line 71 — amber-gradient), replace `hover:shadow-lg transition-shadow` with `hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)] transition-all duration-150`. Note: lines 71 and 107 are inside `{isDummyLoad && ...}` conditional blocks — the hover changes still apply; they simply will not render for non-dummy-load products. The 2 non-interactive cards get no hover classes: the Specs card (line 143, `from-slate-50/50`) gets only `border-2` → `border border-border`; the card at line 167 gets `border-2` → `border border-border` AND the background gradient replacement `from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20` → `from-sky-50/50 to-emerald-50/50 dark:from-sky-950/20 dark:to-emerald-950/20`. Replace decorative blob colors: `bg-amber-400/20` → `bg-sky-400/20`, `bg-orange-400/20` → `bg-emerald-400/20`, `dark:bg-amber-500/10` → `dark:bg-sky-500/10`, `dark:bg-orange-500/10` → `dark:bg-emerald-500/10`. Replace overlay gradient `from-amber-100/50 via-transparent to-orange-100/50` → `from-sky-100/50 via-transparent to-emerald-100/50`, dark variant `dark:from-amber-900/10 dark:via-transparent dark:to-orange-900/10` → `dark:from-sky-900/10 dark:via-transparent dark:to-emerald-900/10`. |
| `components/product/product-teaser-card.tsx` | Uses Shadcn `<Card>` — add hover classes via `className` prop: replace `hover:shadow-lg transition-shadow` with `hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)] transition-all duration-150`. No restructuring needed. |
| `components/blog/blog-card.tsx` | On the `<article>` element: remove `group-hover:shadow-md group-hover:scale-[1.02]`, add `group-hover:border-sky-500 group-hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]`. Keep existing `transition-all`. The resting border is `border-border/60` (60% opacity); the hover border `group-hover:border-sky-500` is intentionally solid (no opacity modifier) — this is consistent with the card hover standard. |
| `components/doc/doc-index-card.tsx` | On the per-item row div: remove `group-hover:shadow-md group-hover:scale-[1.02]`, add `group-hover:border-sky-500 group-hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]`. Keep existing `transition-all`. Additionally, replace the section-level inline gradient div (`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-600 text-white shadow-sm` at the top of the card) with `<IconBadge icon={...} variant="default" size="md" />`. Per-item icons inside the card use plain `text-muted-foreground` and are not changed. |
| `components/shared/feature-grid.tsx` | On the `FeatureCard` wrapper div: remove `hover:shadow-md hover:scale-[1.02]`, add `hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]`. Keep existing `transition-all`. Replace the inline gradient div (`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-600 text-white shadow-sm`) with `<IconBadge icon={Icon} variant="default" size="md" />`. |
| `components/shared/section.tsx` | Replace the inline icon div (`h-12 w-12 rounded-xl from-sky-500 to-emerald-600`) with `<IconBadge icon={Icon} variant="default" size="lg" />`. Fix dark gradient: replace `dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950` with `dark:from-slate-950 dark:via-slate-950 dark:to-slate-900`. Note: `section.tsx` types its `icon` prop as `LucideIcon`; `IconBadge` accepts `React.ElementType`, which is compatible — no prop type change needed on callers. |
| `components/shared/cta-banner.tsx` | Fix dark gradient: replace `dark:from-slate-900 dark:via-slate-950 dark:to-indigo-900` with `dark:from-slate-950 dark:via-slate-950 dark:to-slate-900`. No other changes. |
| `components/shared/page-hero.tsx` | Fix dark gradient: replace `dark:from-slate-900 dark:via-slate-950 dark:to-indigo-900` with `dark:from-slate-950 dark:via-slate-950 dark:to-slate-900`. No other changes. |
| `components/navigation/mobile-nav.tsx` | Replace `bg-[#adfa1d] text-[#000000]` with `bg-sky-500 text-white` |
| `components/navigation/sidebar-nav.tsx` | Replace `bg-[#adfa1d] text-[#000000]` with `bg-sky-500 text-white` (same badge pattern as mobile-nav) |
| `components/navigation/site-footer.tsx` | Replace the 1 inline gradient div (`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-600 text-white shadow-sm`) with `<IconBadge icon={...} variant="default" size="sm" />`. The gradient colors are already sky→emerald — this is a structural consolidation, not a color change. No other changes needed in this file. |

---

## Out of Scope

- Phase 2 layout changes (TOC, home page restructure, prev/next nav, container widths)
- `DocAlert` colors (the per-level semantic colors are intentional and remain unchanged)
- Shopify product purchase button styling
- Any changes to page routing, content, or data

---

## Success Criteria

- No `from-blue-*`, `from-amber-*`, `from-purple-*`, `to-orange-*`, `to-purple-*` in component files
- No `hover:scale-*` or `group-hover:scale-*` on card components
- No `border-2` on product page inner cards
- No `#adfa1d` in codebase
- No `to-indigo-*` in shared layout gradient backgrounds (`section.tsx`, `cta-banner.tsx`, `page-hero.tsx`)
- `IconBadge` used in all 6 locations that previously had inline gradient circles: `guitar-page.tsx`, `ham-radio-kit-page.tsx`, `section.tsx`, `feature-grid.tsx`, `doc-index-card.tsx`, `site-footer.tsx`
- All tests pass
