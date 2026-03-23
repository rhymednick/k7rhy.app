# Visual Consistency Phase 2 — Design Spec

**Date:** 2026-03-22
**Status:** Approved

---

## Overview

Two focused improvements: standardize content column widths across docs and blog using a shared Tailwind token, and add prev/next post navigation to the bottom of blog posts.

---

## Goals

1. **Content width consistency** — docs and blog content columns share a single named max-width token (`max-w-prose`). No other pages are in scope for this phase.
2. **Blog prev/next navigation** — readers can move between adjacent posts (sorted by date) from the bottom of any blog post. Docs pages are explicitly out of scope.

---

## Design Decisions

### Content Width Token

Add `prose: '800px'` to `theme.extend.maxWidth` in `tailwind.config.ts`. This aligns `components/doc/doc-page.tsx` (currently `max-w-[800px]`) and `components/blog/blog-page.tsx` (currently `max-w-3xl` = 768px) to the same value. The 32px increase in blog content width is intentional and acceptable.

### Blog Prev/Next Navigation

**Component:** `components/blog/blog-post-nav.tsx`

```tsx
interface BlogPostNavProps {
    prev: { slug: string; title: string; date: string } | null;
    next: { slug: string; title: string; date: string } | null;
}
```

**Layout:** Two-column grid. Prev on the left, next on the right. When only one neighbor exists (first or last post), the opposing cell is absent — no empty placeholder box.

**Per-cell content:**
- Direction label: `← Previous` or `Next →` (small uppercase, muted)
- Post title (semibold)
- Formatted date (small, muted)

**Styling:**
- Resting state: `rounded-xl border border-transparent bg-muted/50 p-4`
- Hover: `hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)] transition-all duration-150`
- Each cell is a Next.js `<Link>` wrapping the content
- Right-aligned for the "Next →" cell

**Integration:** `BlogPage` (`components/blog/blog-page.tsx`) receives an optional `nav?: React.ReactNode` prop, rendered below the article content inside the same `max-w-prose` container. The page component (`app/blog/[slug]/page.tsx`) computes prev/next and passes `<BlogPostNav ... />` as the `nav` prop.

**Data:** `app/blog/[slug]/page.tsx` already reads files with `fs`. Extend it to read all `.mdx` files from `content/blog`, parse frontmatter with `gray-matter` to extract `title`, `date`, and `publish`, filter to published-only posts, sort by `date` descending, find the current slug's index, and derive neighbors.

---

## Files to Create or Modify

| File | Change |
|------|--------|
| `tailwind.config.ts` | Add `prose: '800px'` to `theme.extend.maxWidth` |
| `components/doc/doc-page.tsx` | Replace `max-w-[800px]` with `max-w-prose` on line 67 |
| `components/blog/blog-page.tsx` | Replace `max-w-3xl` with `max-w-prose` on line 44; add optional `nav?: React.ReactNode` prop rendered below `<main>` inside the same container |
| `components/blog/blog-post-nav.tsx` | Create — new component (see spec above) |
| `app/blog/[slug]/page.tsx` | Read all blog files, sort by date, derive prev/next, pass `<BlogPostNav>` as `nav` prop to `BlogPage` |

---

## Out of Scope

- Products page container widths
- Home page padding/layout
- Docs prev/next navigation
- Any changes to blog post content, frontmatter, or routing

---

## Success Criteria

- `max-w-3xl` and `max-w-[800px]` do not appear in `doc-page.tsx` or `blog-page.tsx`
- `max-w-prose` resolves to `800px` in the Tailwind config
- Prev/next nav appears at the bottom of every published blog post
- On the first post (oldest by date), only "Next →" is shown; on the last post (newest), only "← Previous" is shown
- Clicking prev/next navigates to the correct adjacent post
- All existing tests pass
