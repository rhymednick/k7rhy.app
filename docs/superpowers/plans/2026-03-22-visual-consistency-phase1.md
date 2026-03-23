# Visual Consistency Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the site's visual language by consolidating color palettes, replacing inline gradient circles with a shared `IconBadge` component, standardizing card hover behavior, and fixing dark mode gradient tails and the lime-green nav badge.

**Architecture:** All changes are visual-only (Tailwind class edits and one new shared component). `IconBadge` is created first since six other files depend on it. Remaining tasks are independent and can be done in any order after Task 1.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v3, Lucide React, Vitest + Testing Library

**Spec:** `docs/superpowers/specs/2026-03-22-visual-consistency-phase1.md`

---

## File Map

| File | Action |
|------|--------|
| `components/shared/icon-badge.tsx` | **Create** — new shared component |
| `components/shared/icon-badge.test.tsx` | **Create** — unit tests |
| `components/navigation/mobile-nav.tsx` | **Modify** — nav badge color |
| `components/navigation/sidebar-nav.tsx` | **Modify** — nav badge color |
| `components/shared/cta-banner.tsx` | **Modify** — dark gradient tail |
| `components/shared/page-hero.tsx` | **Modify** — dark gradient tail |
| `components/shared/section.tsx` | **Modify** — IconBadge + dark gradient tail |
| `components/navigation/site-footer.tsx` | **Modify** — use IconBadge |
| `components/blog/blog-card.tsx` | **Modify** — card hover behavior |
| `components/product/product-teaser-card.tsx` | **Modify** — card hover behavior |
| `components/shared/feature-grid.tsx` | **Modify** — card hover behavior + IconBadge |
| `components/doc/doc-index-card.tsx` | **Modify** — card hover behavior + IconBadge |
| `components/product/guitar-page.tsx` | **Modify** — IconBadge, borders, hover, color palette |
| `components/product/ham-radio-kit-page.tsx` | **Modify** — IconBadge, borders, hover, color palette |

---

## Task 1: Create `IconBadge` component

**Files:**
- Create: `components/shared/icon-badge.tsx`
- Create: `components/shared/icon-badge.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `components/shared/icon-badge.test.tsx`:

```tsx
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { IconBadge } from './icon-badge';
import { Radio } from 'lucide-react';

describe('IconBadge', () => {
    it('applies default sky→emerald gradient', () => {
        const { container } = render(<IconBadge icon={Radio} />);
        const div = container.firstChild as HTMLElement;
        expect(div.className).toContain('from-sky-500');
        expect(div.className).toContain('to-emerald-600');
    });

    it('applies guitar sky→indigo gradient', () => {
        const { container } = render(<IconBadge icon={Radio} variant="guitar" />);
        const div = container.firstChild as HTMLElement;
        expect(div.className).toContain('from-sky-500');
        expect(div.className).toContain('to-indigo-600');
    });

    it('applies sm size classes', () => {
        const { container } = render(<IconBadge icon={Radio} size="sm" />);
        const div = container.firstChild as HTMLElement;
        expect(div.className).toContain('h-9');
        expect(div.className).toContain('w-9');
        expect(div.className).toContain('rounded-lg');
    });

    it('applies md size classes by default', () => {
        const { container } = render(<IconBadge icon={Radio} />);
        const div = container.firstChild as HTMLElement;
        expect(div.className).toContain('h-10');
        expect(div.className).toContain('w-10');
        expect(div.className).toContain('rounded-lg');
    });

    it('applies lg size classes', () => {
        const { container } = render(<IconBadge icon={Radio} size="lg" />);
        const div = container.firstChild as HTMLElement;
        expect(div.className).toContain('h-12');
        expect(div.className).toContain('w-12');
        expect(div.className).toContain('rounded-xl');
    });

    it('renders the icon', () => {
        const { container } = render(<IconBadge icon={Radio} />);
        expect(container.querySelector('svg')).toBeInTheDocument();
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run components/shared/icon-badge.test.tsx
```

Expected: FAIL — `Cannot find module './icon-badge'`

- [ ] **Step 3: Create the component**

Create `components/shared/icon-badge.tsx`:

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface IconBadgeProps {
    icon: React.ElementType;
    variant?: 'default' | 'guitar';
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: { wrapper: 'h-9 w-9 rounded-lg', icon: 'h-4 w-4' },
    md: { wrapper: 'h-10 w-10 rounded-lg', icon: 'h-5 w-5' },
    lg: { wrapper: 'h-12 w-12 rounded-xl', icon: 'h-6 w-6' },
};

const variantClasses = {
    default: 'from-sky-500 to-emerald-600',
    guitar: 'from-sky-500 to-indigo-600',
};

export function IconBadge({ icon: Icon, variant = 'default', size = 'md' }: IconBadgeProps) {
    return (
        <div className={cn('flex items-center justify-center bg-gradient-to-br shadow-sm text-white', sizeClasses[size].wrapper, variantClasses[variant])}>
            <Icon className={sizeClasses[size].icon} />
        </div>
    );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run components/shared/icon-badge.test.tsx
```

Expected: 6/6 PASS

- [ ] **Step 5: Commit**

```bash
git add components/shared/icon-badge.tsx components/shared/icon-badge.test.tsx
git commit -m "feat: add IconBadge shared component with default and guitar variants"
```

---

## Task 2: Fix nav badges

Replace the lime-green `#adfa1d` badge with sky-blue in both nav files.

**Files:**
- Modify: `components/navigation/mobile-nav.tsx:56`
- Modify: `components/navigation/sidebar-nav.tsx:52`

- [ ] **Step 1: Update `mobile-nav.tsx`**

On line 56, replace:
```
bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000]
```
with:
```
bg-sky-500 px-1.5 py-0.5 text-xs leading-none text-white
```

- [ ] **Step 2: Update `sidebar-nav.tsx`**

On line 52, replace:
```
bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000]
```
with:
```
bg-sky-500 px-1.5 py-0.5 text-xs leading-none text-white
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run
```

Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add components/navigation/mobile-nav.tsx components/navigation/sidebar-nav.tsx
git commit -m "fix: replace lime-green nav badge with sky-500"
```

---

## Task 3: Fix dark gradient tails in `cta-banner.tsx` and `page-hero.tsx`

Remove the indigo tail from both shared layout gradient backgrounds.

**Files:**
- Modify: `components/shared/cta-banner.tsx:13`
- Modify: `components/shared/page-hero.tsx:17`

- [ ] **Step 1: Update `cta-banner.tsx`**

On the `bg-gradient-to-br` class string, replace:
```
dark:from-slate-900 dark:via-slate-950 dark:to-indigo-900
```
with:
```
dark:from-slate-950 dark:via-slate-950 dark:to-slate-900
```

- [ ] **Step 2: Update `page-hero.tsx`**

On the gradient div class string (line 17), replace:
```
dark:from-slate-900 dark:via-slate-950 dark:to-indigo-900
```
with:
```
dark:from-slate-950 dark:via-slate-950 dark:to-slate-900
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run
```

Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add components/shared/cta-banner.tsx components/shared/page-hero.tsx
git commit -m "fix: remove indigo dark gradient tail from cta-banner and page-hero"
```

---

## Task 4: Update `section.tsx` — IconBadge + dark gradient

**Files:**
- Modify: `components/shared/section.tsx`

The current file:
```tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
```

- [ ] **Step 1: Add IconBadge import and update the component**

Replace the entire file content:

```tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { IconBadge } from '@/components/shared/icon-badge';

interface SectionProps {
    background?: 'default' | 'gradient' | 'muted';
    title?: string;
    description?: string;
    icon?: LucideIcon;
    children: React.ReactNode;
    className?: string;
}

export function Section({ background = 'default', title, description, icon: Icon, children, className }: SectionProps) {
    return (
        <section className={cn('rounded-2xl px-6 py-10 md:px-10', background === 'muted' && 'bg-muted/50', background === 'gradient' && 'bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900', background === 'default' && '', className)}>
            {(title || description) && (
                <div className="mb-8 text-center">
                    {Icon && (
                        <div className="mx-auto mb-4 w-fit">
                            <IconBadge icon={Icon} variant="default" size="lg" />
                        </div>
                    )}
                    {title && <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>}
                    {description && <p className="mt-2 text-muted-foreground">{description}</p>}
                </div>
            )}
            {children}
        </section>
    );
}
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run
```

Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add components/shared/section.tsx
git commit -m "refactor: use IconBadge in Section and fix dark gradient tail"
```

---

## Task 5: Update `site-footer.tsx` — use IconBadge

**Files:**
- Modify: `components/navigation/site-footer.tsx:33-35`

- [ ] **Step 1: Add import**

Add to the existing imports at the top of `site-footer.tsx`:
```tsx
import { IconBadge } from '@/components/shared/icon-badge';
```

- [ ] **Step 2: Replace inline gradient div**

Find and replace this block (lines 33-35):
```tsx
<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-600 text-white shadow-sm">
    <Radio className="h-5 w-5" />
</div>
```

Replace with:
```tsx
<IconBadge icon={Radio} variant="default" size="sm" />
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run
```

Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add components/navigation/site-footer.tsx
git commit -m "refactor: use IconBadge in site footer"
```

---

## Task 6: Update `blog-card.tsx` — card hover behavior

**Files:**
- Modify: `components/blog/blog-card.tsx:19`

- [ ] **Step 1: Update the article element class**

On line 19, find:
```
transition-all group-hover:shadow-md group-hover:scale-[1.02]
```

Replace with:
```
transition-all group-hover:border-sky-500 group-hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]
```

The full resulting `<article>` opening tag should be:
```tsx
<article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all group-hover:border-sky-500 group-hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]">
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run
```

Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add components/blog/blog-card.tsx
git commit -m "refactor: replace scale hover with border accent on blog card"
```

---

## Task 7: Update `product-teaser-card.tsx` — card hover behavior

**Files:**
- Modify: `components/product/product-teaser-card.tsx:20`

- [ ] **Step 1: Update the Card className**

On line 20, find:
```tsx
<Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
```

Replace with:
```tsx
<Card className="cursor-pointer hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)] transition-all duration-150 h-full">
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run
```

Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add components/product/product-teaser-card.tsx
git commit -m "refactor: replace shadow-lg hover with border accent on product teaser card"
```

---

## Task 8: Update `feature-grid.tsx` — hover + IconBadge

**Files:**
- Modify: `components/shared/feature-grid.tsx`

- [ ] **Step 1: Replace the full file content**

```tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { IconBadge } from '@/components/shared/icon-badge';

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
        <div className="group rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]">
            <div className="mb-4">
                <IconBadge icon={Icon} variant="default" size="md" />
            </div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

interface FeatureGridProps {
    columns?: 2 | 3 | 4;
    children: React.ReactNode;
    className?: string;
}

export function FeatureGrid({ columns = 3, children, className }: FeatureGridProps) {
    return <div className={cn('grid gap-6', columns === 2 && 'grid-cols-1 md:grid-cols-2', columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', className)}>{children}</div>;
}
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run
```

Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add components/shared/feature-grid.tsx
git commit -m "refactor: use IconBadge and border accent hover in feature-grid"
```

---

## Task 9: Update `doc-index-card.tsx` — hover + IconBadge

**Files:**
- Modify: `components/doc/doc-index-card.tsx`

- [ ] **Step 1: Replace the full file content**

```tsx
import React from 'react';

import Link from 'next/link';
import { FileText, ExternalLink, LucideIcon } from 'lucide-react';
import { IconBadge } from '@/components/shared/icon-badge';

export enum DocIndexItemType {
    Internal, // Displays a doc page icon
    External, // Displays an external link icon
}

export interface DocIndexItem {
    title: string;
    href: string;
    description: string;
    type?: DocIndexItemType;
}

export interface DocIndexCardProps {
    title: string;
    description?: string;
    items?: DocIndexItem[];
    icon?: LucideIcon;
}

export function DocIndexCard(props: DocIndexCardProps) {
    const Icon = props.icon;

    return (
        <div className="mb-6 mt-4">
            <div className="mb-4 flex items-center gap-3">
                {Icon && <IconBadge icon={Icon} variant="default" size="md" />}
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">{props.title}</h2>
                    {props.description && <p className="text-sm text-muted-foreground">{props.description}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {props.items?.map((item, index) => {
                    const ItemIcon = item.type === DocIndexItemType.External ? ExternalLink : FileText;
                    const isExternal = item.type === DocIndexItemType.External;
                    return (
                        <Link key={index} href={item.href} target={isExternal ? '_blank' : undefined} className="group block">
                            <div className="flex h-full items-start gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all group-hover:border-sky-500 group-hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]">
                                <div className="mt-0.5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400">
                                    <ItemIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400">{item.title}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run
```

Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add components/doc/doc-index-card.tsx
git commit -m "refactor: use IconBadge and border accent hover in doc-index-card"
```

---

## Task 10: Update `guitar-page.tsx`

This is the most complex task. Read the full file before starting.

**Files:**
- Modify: `components/product/guitar-page.tsx`

**Changes summary (from spec):**
1. Add `IconBadge` import; replace inline icon div with `<IconBadge icon={...} variant="guitar" size="lg" />`
2. All 6 `<Card>` instances: `border-2` → `border border-border`
3. 4 interactive cards (lines 65, 75, 78, 81): `hover:shadow-lg transition-shadow` → `hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)] transition-all duration-150`
4. Decorative blobs: `bg-blue-400/20` → `bg-sky-400/20`, `bg-purple-400/20` → `bg-indigo-400/20`, `dark:bg-blue-500/10` → `dark:bg-sky-500/10`, `dark:bg-purple-500/10` → `dark:bg-indigo-500/10`
5. Header overlay gradient: `from-blue-100/50 to-purple-100/50` → `from-sky-100/50 to-indigo-100/50`; dark variant: `dark:from-blue-900/10 dark:to-purple-900/10` → `dark:from-sky-900/10 dark:to-indigo-900/10`
6. Related Content card (line 112) background gradient: `from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20` → `from-sky-50/50 to-indigo-50/50 dark:from-sky-950/20 dark:to-indigo-950/20`

- [ ] **Step 1: Add import**

Add to the imports at the top:
```tsx
import { IconBadge } from '@/components/shared/icon-badge';
```

- [ ] **Step 2: Replace the inline icon div**

Find (around line 45):
```tsx
<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
    <GuitarIcon className="h-6 w-6 text-white" />
</div>
```

Replace with:
```tsx
<IconBadge icon={GuitarIcon} variant="guitar" size="lg" />
```

(Note: the exact icon component name may differ — use whatever icon is currently in use there.)

- [ ] **Step 3: Fix decorative blob colors**

Make these replacements globally in the file:
- `bg-blue-400/20` → `bg-sky-400/20`
- `bg-purple-400/20` → `bg-indigo-400/20`
- `dark:bg-blue-500/10` → `dark:bg-sky-500/10`
- `dark:bg-purple-500/10` → `dark:bg-indigo-500/10`

- [ ] **Step 4: Fix overlay gradient**

Replace:
```
from-blue-100/50 to-purple-100/50 dark:from-blue-900/10 dark:to-purple-900/10
```
with:
```
from-sky-100/50 to-indigo-100/50 dark:from-sky-900/10 dark:to-indigo-900/10
```

- [ ] **Step 5: Fix all 6 `border-2` → `border border-border`**

Find all occurrences of `border-2 shadow-md` in this file and replace `border-2` with `border border-border`. There are 6 Card instances.

- [ ] **Step 6: Update hover classes on 4 interactive cards**

For lines 65, 75, 78, 81 (the cards with `hover:shadow-lg transition-shadow`), replace `hover:shadow-lg transition-shadow` with `hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)] transition-all duration-150`.

The Description card (line 88) and Related Content card (line 112) have no hover classes — do not add any.

- [ ] **Step 7: Fix Related Content card background gradient**

On line 112, replace:
```
from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20
```
with:
```
from-sky-50/50 to-indigo-50/50 dark:from-sky-950/20 dark:to-indigo-950/20
```

- [ ] **Step 8: Run tests**

```bash
npx vitest run
```

Expected: all tests pass

- [ ] **Step 9: Verify with grep (success criteria check)**

```bash
grep -n "from-blue\|from-purple\|to-purple\|border-2\|hover:scale" components/product/guitar-page.tsx
```

Expected: no output

- [ ] **Step 10: Commit**

```bash
git add components/product/guitar-page.tsx
git commit -m "refactor: unify guitar-page color palette and card hover behavior"
```

---

## Task 11: Update `ham-radio-kit-page.tsx`

Read the full file before starting.

**Files:**
- Modify: `components/product/ham-radio-kit-page.tsx`

**Changes summary (from spec):**
1. Add `IconBadge` import; replace inline icon div (line 46, `from-amber-500 to-orange-600`) with `<IconBadge icon={...} variant="default" size="lg" />`
2. All 5 `<Card>` instances at lines 62, 71, 107, 143, 167: `border-2` → `border border-border`
3. 3 interactive cards (lines 62, 71, 107): `hover:shadow-lg transition-shadow` → `hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)] transition-all duration-150`
   - Note: lines 71 and 107 are inside `{isDummyLoad && ...}` blocks — changes still apply
4. Decorative blobs: `bg-amber-400/20` → `bg-sky-400/20`, `bg-orange-400/20` → `bg-emerald-400/20`, `dark:bg-amber-500/10` → `dark:bg-sky-500/10`, `dark:bg-orange-500/10` → `dark:bg-emerald-500/10`
5. Overlay gradient: `from-amber-100/50 via-transparent to-orange-100/50` → `from-sky-100/50 via-transparent to-emerald-100/50`; dark variant: `dark:from-amber-900/10 dark:via-transparent dark:to-orange-900/10` → `dark:from-sky-900/10 dark:via-transparent dark:to-emerald-900/10`
6. Card background gradient on lines 71 and 167: `from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20` → `from-sky-50/50 to-emerald-50/50 dark:from-sky-950/20 dark:to-emerald-950/20`

- [ ] **Step 1: Add import**

Add to imports:
```tsx
import { IconBadge } from '@/components/shared/icon-badge';
```

- [ ] **Step 2: Replace the inline icon div**

Find (around line 46):
```tsx
<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
    <Radio className="h-6 w-6 text-white" />
</div>
```

Replace with:
```tsx
<IconBadge icon={Radio} variant="default" size="lg" />
```

(Use whatever icon is currently there — likely `Radio`.)

- [ ] **Step 3: Fix decorative blob colors**

Global replacements in file:
- `bg-amber-400/20` → `bg-sky-400/20`
- `bg-orange-400/20` → `bg-emerald-400/20`
- `dark:bg-amber-500/10` → `dark:bg-sky-500/10`
- `dark:bg-orange-500/10` → `dark:bg-emerald-500/10`

- [ ] **Step 4: Fix overlay gradient**

Replace:
```
from-amber-100/50 via-transparent to-orange-100/50 dark:from-amber-900/10 dark:via-transparent dark:to-orange-900/10
```
with:
```
from-sky-100/50 via-transparent to-emerald-100/50 dark:from-sky-900/10 dark:via-transparent dark:to-emerald-900/10
```

- [ ] **Step 5: Fix all 5 `border-2` → `border border-border`**

Find all occurrences of `border-2` in this file and replace with `border border-border`. There are 5.

- [ ] **Step 6: Update hover classes on 3 interactive cards**

For lines 62, 71, 107 (cards with `hover:shadow-lg transition-shadow`), replace `hover:shadow-lg transition-shadow` with `hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)] transition-all duration-150`.

The non-interactive cards at lines 143 and 167 have no hover classes — do not add any.

- [ ] **Step 7: Fix card background gradient on lines 71 and 167**

Both cards have `from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20`. Replace with:
```
from-sky-50/50 to-emerald-50/50 dark:from-sky-950/20 dark:to-emerald-950/20
```

- [ ] **Step 8: Run tests**

```bash
npx vitest run
```

Expected: all tests pass

- [ ] **Step 9: Verify with grep (success criteria check)**

```bash
grep -n "from-amber\|from-orange\|to-orange\|border-2\|hover:scale" components/product/ham-radio-kit-page.tsx
```

Expected: no output

- [ ] **Step 10: Commit**

```bash
git add components/product/ham-radio-kit-page.tsx
git commit -m "refactor: unify ham-radio-kit-page color palette and card hover behavior"
```

---

## Final Verification

After all tasks are complete, run these checks to verify success criteria:

- [ ] **No banned colors in component files**

```bash
grep -r "from-blue-\|from-amber-\|from-purple-\|to-orange-\|to-purple-" components/ --include="*.tsx"
```

Expected: no output (only intentional sky/indigo guitar variants should exist)

- [ ] **No scale hover on cards**

```bash
grep -r "hover:scale\|group-hover:scale" components/ --include="*.tsx"
```

Expected: no output

- [ ] **No border-2 on product page inner cards**

```bash
grep -n "border-2" components/product/guitar-page.tsx components/product/ham-radio-kit-page.tsx
```

Expected: no output

- [ ] **No lime-green badge**

```bash
grep -r "adfa1d" components/ --include="*.tsx"
```

Expected: no output

- [ ] **No indigo tail in shared layout gradients**

```bash
grep -n "to-indigo-" components/shared/section.tsx components/shared/cta-banner.tsx components/shared/page-hero.tsx
```

Expected: no output

- [ ] **All tests pass**

```bash
npx vitest run
```

Expected: all tests pass
