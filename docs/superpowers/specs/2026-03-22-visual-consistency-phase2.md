# Visual Consistency Phase 2 — Design Spec

**Date:** 2026-03-22
**Status:** Approved

---

## Overview

Two focused improvements: standardize content column widths across docs and blog using a shared Tailwind token, and add prev/next post navigation to the bottom of blog posts.

---

## Goals

1. **Content width consistency** — docs and blog content columns share a single named max-width token (`max-w-article`). No other pages are in scope for this phase.
2. **Blog prev/next navigation** — readers can move between adjacent posts (sorted by date) from the bottom of any blog post. Docs pages are explicitly out of scope.

---

## Design Decisions

### Content Width Token

Add `article: '800px'` to `theme.extend.maxWidth` in `tailwind.config.ts`. The token is named `article` (not `prose`) to avoid silently overriding Tailwind's built-in `max-w-prose` utility, which resolves to `65ch`. This aligns `components/doc/doc-page.tsx` (currently `max-w-[800px]`) and `components/blog/blog-page.tsx` (currently `max-w-3xl` = 768px) to the same value. The 32px increase in blog content width is intentional and acceptable.

### Blog Prev/Next Navigation

**Component:** `components/blog/blog-post-nav.tsx`

Server Component (no `'use client'` directive needed — no state or effects).

```tsx
interface BlogPostNavProps {
    prev: { slug: string; title: string; date: string } | null;
    next: { slug: string; title: string; date: string } | null;
}
```

**Layout:** Two-column grid. Prev on the left, next on the right. When only one neighbor exists (first or last post), the opposing cell is absent — no empty placeholder box. Use `grid-cols-2` when both are present; render only the single cell (full-width or right-aligned as appropriate) when one is null.

**Per-cell content:**
- Direction label: `← Previous` or `Next →` (small uppercase, muted)
- Post title (semibold)
- Formatted date (small, muted) — use `formatDate` from `@/lib/utils`

**Styling:**
- Resting state: `rounded-xl border border-transparent bg-muted/50 p-4`
- Hover: `hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)] transition-all duration-150`
- Each cell is a Next.js `<Link>` wrapping the content
- "Next →" cell: right-aligned text

**Integration:** `BlogPage` (`components/blog/blog-page.tsx`) receives an optional `nav?: React.ReactNode` prop. It is rendered as a sibling of `<main>` — after the closing `</main>` tag — inside the same `max-w-article` container div. The page component (`app/blog/[slug]/page.tsx`) computes prev/next and passes `<BlogPostNav ... />` as the `nav` prop.

**Data:** `app/blog/[slug]/page.tsx` already reads the current post file with `fs` and `gray-matter`. Extend it to also read all `.mdx` files from `content/blog`, parse each file's frontmatter with `gray-matter` to extract `title`, `date`, `publish`, and filename (as slug), filter to `publish === true` posts only, sort by `date` descending, find the current slug's index, and derive neighbors. If the current slug is not found in the published list (i.e., the post is unpublished), both `prev` and `next` will be `null` — no nav is shown. This is the correct behavior since unpublished posts return 404 in production.

---

## Files to Create or Modify

| File | Change |
|------|--------|
| `tailwind.config.ts` | Add `article: '800px'` to `theme.extend.maxWidth` |
| `components/doc/doc-page.tsx` | Replace `max-w-[800px]` with `max-w-article` on line 67 |
| `components/blog/blog-page.tsx` | Replace `max-w-3xl` with `max-w-article` on line 44; add optional `nav?: React.ReactNode` prop rendered as a sibling of `<main>` (after `</main>`) inside the same container |
| `components/blog/blog-post-nav.tsx` | Create — Server Component, see spec above |
| `app/blog/[slug]/page.tsx` | Read all blog files, filter to published, sort by date, derive prev/next, pass `<BlogPostNav>` as `nav` prop to `BlogPage` |

---

## Out of Scope

- Products page container widths
- Home page padding/layout
- Docs prev/next navigation
- Any changes to blog post content, frontmatter, or routing

---

## Success Criteria

- `max-w-3xl` and `max-w-[800px]` do not appear in `doc-page.tsx` or `blog-page.tsx`
- `max-w-article` resolves to `800px` in the Tailwind config
- Tailwind's built-in `max-w-prose` (65ch) is unaffected
- Prev/next nav appears at the bottom of every published blog post
- On the oldest post (by date), only "Next →" is shown; on the newest post, only "← Previous" is shown
- On an unpublished post (dev only), no prev/next nav is shown
- Clicking prev/next navigates to the correct adjacent post
- All existing tests pass
