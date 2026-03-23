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

No other slate values should appear as backgrounds.

### Mobile Nav Badge

Replace `bg-[#adfa1d] text-[#000000]` with `bg-sky-500 text-white`.

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
| `components/product/guitar-page.tsx` | Use `IconBadge variant="guitar"`, fix inner card `border-2` → `border`, add hover accent |
| `components/product/ham-radio-kit-page.tsx` | Use `IconBadge variant="default"`, fix inner card `border-2` → `border`, add hover accent |
| `components/product/product-teaser-card.tsx` | Add hover accent, ensure `border border-border` |
| `components/blog/blog-card.tsx` | Replace `group-hover:scale-[1.02]` with border accent hover |
| `components/doc/doc-index-card.tsx` | Replace `group-hover:scale-[1.02]` with border accent hover, use `IconBadge` |
| `components/shared/feature-grid.tsx` | Replace `hover:scale-[1.02]` with border accent hover, use `IconBadge` |
| `components/shared/section.tsx` | Use `IconBadge`, fix dark gradient tail |
| `components/shared/cta-banner.tsx` | Fix dark gradient tail |
| `components/shared/page-hero.tsx` | Fix dark gradient tail |
| `components/navigation/mobile-nav.tsx` | Replace `bg-[#adfa1d] text-[#000000]` with `bg-sky-500 text-white` |
| `components/navigation/site-footer.tsx` | Use `IconBadge` |

---

## Out of Scope

- Phase 2 layout changes (TOC, home page restructure, prev/next nav, container widths)
- `DocAlert` colors (the per-level semantic colors are intentional and remain unchanged)
- Shopify product purchase button styling
- Any changes to page routing, content, or data

---

## Success Criteria

- No `from-blue-500`, `from-amber-500`, `from-purple-*`, `to-orange-*`, `to-purple-*` in component files
- No `hover:scale-*` or `group-hover:scale-*` on card components
- No `border-2` on product page inner cards
- No `#adfa1d` in codebase
- No `to-indigo-*` in shared layout gradient backgrounds
- `IconBadge` used in all 6 locations that previously had inline gradient circles
- All tests pass
