# Visual Consistency Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize doc/blog content column widths to a shared Tailwind token and add prev/next post navigation to the bottom of blog posts.

**Architecture:** Three independent tasks. Task 1 is a pure config/class rename (no logic). Task 2 creates the `BlogPostNav` presentational component in isolation. Task 3 wires Task 2 into `BlogPage` and the blog post page, adding the file-read logic to derive adjacent posts.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v3, Vitest + @testing-library/react, gray-matter (already a project dependency), `fs` (Node built-in)

**Spec:** `docs/superpowers/specs/2026-03-22-visual-consistency-phase2.md`

---

## File Map

| File                                     | Action                                                         |
| ---------------------------------------- | -------------------------------------------------------------- |
| `tailwind.config.ts`                     | **Modify** — add `article: '800px'` to `theme.extend.maxWidth` |
| `components/doc/doc-page.tsx`            | **Modify** — `max-w-[800px]` → `max-w-article`                 |
| `components/blog/blog-page.tsx`          | **Modify** — `max-w-3xl` → `max-w-article`; add `nav` prop     |
| `components/blog/blog-post-nav.tsx`      | **Create** — Server Component, prev/next nav                   |
| `components/blog/blog-post-nav.test.tsx` | **Create** — unit tests                                        |
| `app/blog/[slug]/page.tsx`               | **Modify** — compute prev/next, pass to `BlogPage`             |

---

## Task 1: Add `article` Tailwind token and update content columns

**Files:**

- Modify: `tailwind.config.ts:16-75`
- Modify: `components/doc/doc-page.tsx:67`
- Modify: `components/blog/blog-page.tsx:44`

No new tests needed — this is a pure CSS config change. Existing tests verify no regressions.

- [ ] **Step 1: Add `maxWidth` token to `tailwind.config.ts`**

Inside `theme.extend` (after the `animation` block, before the closing brace), add:

```ts
maxWidth: {
    article: '800px',
},
```

The full `theme.extend` block should now end with:

```ts
extend: {
    colors: { ... },
    borderRadius: { ... },
    keyframes: { ... },
    animation: { ... },
    fontFamily: { ... },
    maxWidth: {
        article: '800px',
    },
},
```

- [ ] **Step 2: Update `doc-page.tsx`**

In `components/doc/doc-page.tsx` line 67, replace:

```tsx
<div className="max-w-[800px] justify-between ">{props.children}</div>
```

with:

```tsx
<div className="max-w-article justify-between">{props.children}</div>
```

(Also removes the trailing space inside the className string.)

- [ ] **Step 3: Update `blog-page.tsx`**

In `components/blog/blog-page.tsx` line 44, replace:

```tsx
<div className="max-w-3xl mx-auto">
```

with:

```tsx
<div className="max-w-article mx-auto">
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run
```

Expected: all tests pass (no regressions from class renames).

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts components/doc/doc-page.tsx components/blog/blog-page.tsx
git commit -m "refactor: standardize content column width to max-w-article token"
```

---

## Task 2: Create `BlogPostNav` component

**Files:**

- Create: `components/blog/blog-post-nav.test.tsx`
- Create: `components/blog/blog-post-nav.tsx`

- [ ] **Step 1: Write the failing tests**

Create `components/blog/blog-post-nav.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { BlogPostNav } from './blog-post-nav';

vi.mock('next/link', () => ({
    default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
        <a href={href} className={className}>
            {children}
        </a>
    ),
}));

const prev = { slug: 'older-post', title: 'Older Post Title', date: '2026-03-01' };
const next = { slug: 'newer-post', title: 'Newer Post Title', date: '2026-03-15' };

describe('BlogPostNav', () => {
    it('renders nothing when both prev and next are null', () => {
        const { container } = render(<BlogPostNav prev={null} next={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders only the prev link when next is null', () => {
        render(<BlogPostNav prev={prev} next={null} />);
        expect(screen.getByText('← Previous')).toBeInTheDocument();
        expect(screen.getByText('Older Post Title')).toBeInTheDocument();
        expect(screen.queryByText('Next →')).not.toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/blog/older-post');
    });

    it('renders only the next link when prev is null', () => {
        render(<BlogPostNav prev={null} next={next} />);
        expect(screen.getByText('Next →')).toBeInTheDocument();
        expect(screen.getByText('Newer Post Title')).toBeInTheDocument();
        expect(screen.queryByText('← Previous')).not.toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/blog/newer-post');
    });

    it('renders both links when both are provided', () => {
        render(<BlogPostNav prev={prev} next={next} />);
        expect(screen.getByText('← Previous')).toBeInTheDocument();
        expect(screen.getByText('Next →')).toBeInTheDocument();
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveAttribute('href', '/blog/older-post');
        expect(links[1]).toHaveAttribute('href', '/blog/newer-post');
    });

    it('displays the post date in each cell', () => {
        render(<BlogPostNav prev={prev} next={next} />);
        // formatDate transforms the date — just verify the date strings are rendered somewhere
        expect(screen.getByText((_, el) => (el?.textContent?.includes('2026') && el?.closest('a')?.href?.includes('older-post') ? true : false))).toBeInTheDocument();
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run components/blog/blog-post-nav.test.tsx
```

Expected: FAIL — `BlogPostNav` not found.

- [ ] **Step 3: Implement `BlogPostNav`**

Create `components/blog/blog-post-nav.tsx`:

```tsx
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

interface BlogPostNavProps {
    prev: { slug: string; title: string; date: string } | null;
    next: { slug: string; title: string; date: string } | null;
}

export function BlogPostNav({ prev, next }: BlogPostNavProps) {
    if (!prev && !next) return null;

    return (
        <nav className={cn('mt-8 grid gap-4', prev && next ? 'grid-cols-2' : 'grid-cols-1')}>
            {prev && (
                <Link href={`/blog/${prev.slug}`} className="rounded-xl border border-transparent bg-muted/50 p-4 transition-all duration-150 hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">← Previous</div>
                    <div className="mt-1 font-semibold text-foreground">{prev.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{formatDate(prev.date)}</div>
                </Link>
            )}
            {next && (
                <Link href={`/blog/${next.slug}`} className="rounded-xl border border-transparent bg-muted/50 p-4 text-right transition-all duration-150 hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next →</div>
                    <div className="mt-1 font-semibold text-foreground">{next.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{formatDate(next.date)}</div>
                </Link>
            )}
        </nav>
    );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run components/blog/blog-post-nav.test.tsx
```

Expected: all 5 tests pass.

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add components/blog/blog-post-nav.tsx components/blog/blog-post-nav.test.tsx
git commit -m "feat: add BlogPostNav component for blog prev/next navigation"
```

---

## Task 3: Wire `BlogPostNav` into `BlogPage` and the blog post page

**Files:**

- Modify: `components/blog/blog-page.tsx`
- Modify: `app/blog/[slug]/page.tsx`

- [ ] **Step 1: Add `nav` prop to `BlogPage`**

In `components/blog/blog-page.tsx`, update the `BlogPageProps` interface and render the `nav` prop.

Current interface (lines 7–12):

```tsx
interface BlogPageProps {
    title: string;
    date: string;
    tags?: string[];
    children?: React.ReactNode;
}
```

Replace with:

```tsx
interface BlogPageProps {
    title: string;
    date: string;
    tags?: string[];
    children?: React.ReactNode;
    nav?: React.ReactNode;
}
```

Current function signature (line 14):

```tsx
export function BlogPage(props: BlogPageProps) {
```

No change needed to signature — props already destructured via `props.*`.

Inside the return, find the `max-w-article mx-auto` div (after Task 1 is applied — formerly `max-w-3xl`). The actual nesting is:

```tsx
<div className="px-4 sm:px-6 md:px-8">
    <div className="max-w-article mx-auto">
        <main className="lg:gap-10 pb-8">
            <article className="relative pt-10">...</article>
        </main>
    </div>
</div>
```

Add `{props.nav}` after `</main>`, inside the `max-w-article` div:

```tsx
<div className="px-4 sm:px-6 md:px-8">
    <div className="max-w-article mx-auto">
        <main className="lg:gap-10 pb-8">
            <article className="relative pt-10">...</article>
        </main>
        {props.nav}
    </div>
</div>
```

- [ ] **Step 2: Update `app/blog/[slug]/page.tsx`**

Add the `BlogPostNav` import at the top with the other component imports:

```tsx
import { BlogPostNav } from '@/components/blog/blog-post-nav';
```

After the existing single-file read (`const { content, data } = matter(source);`), add the prev/next derivation logic. Insert before the `return` statement:

```tsx
// Derive prev/next from all published posts sorted by date descending
const allFiles = fs.readdirSync(path.join(process.cwd(), 'content/blog')).filter((f) => f.endsWith('.mdx'));
const allPosts = allFiles
    .map((filename) => {
        const src = fs.readFileSync(path.join(process.cwd(), 'content/blog', filename), 'utf-8');
        const { data: meta } = matter(src);
        return {
            slug: filename.replace('.mdx', ''),
            title: meta.title as string,
            date: meta.date as string,
            publish: meta.publish as boolean,
        };
    })
    .filter((p) => p.publish)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const currentIndex = allPosts.findIndex((p) => p.slug === slug);
const prevPost = currentIndex !== -1 && currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
const nextPost = currentIndex !== -1 && currentIndex > 0 ? allPosts[currentIndex - 1] : null;
```

Update the `return` to pass the `nav` prop:

```tsx
return (
    <BlogPage title={data.title} date={data.date} nav={<BlogPostNav prev={prevPost} next={nextPost} />}>
        {!data.publish && unpublishedAlert()}
        <MDXRemote source={content} components={components} />
    </BlogPage>
);
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 4: Verify with grep — success criteria**

```bash
grep -n "max-w-3xl\|max-w-\[800px\]" components/doc/doc-page.tsx components/blog/blog-page.tsx
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add components/blog/blog-page.tsx app/blog/[slug]/page.tsx
git commit -m "feat: wire BlogPostNav into blog post pages"
```
