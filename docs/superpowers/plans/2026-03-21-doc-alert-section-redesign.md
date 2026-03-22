# DocAlert & DocSection Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `DocAlert` with level-appropriate colors and a badge pill, and update `DocSection` heading styles with cleaner typography and a bottom rule on h1.

**Architecture:** Two independent changes. Task 1 rewrites the `DocAlert` component body (same props/API, new visual implementation using a plain `<div>` instead of Shadcn `<Alert>`). Task 2 updates the heading style strings in `config/doc-section.config.ts` — the `DocSection` component itself is untouched.

**Tech Stack:** React 19, Tailwind CSS v3, Vitest, React Testing Library, `@testing-library/jest-dom/vitest`

---

## File Map

| File | Change |
|------|--------|
| `components/doc/doc-alert.tsx` | Rewrite component body — new layout, level config object, badge pill, remove Shadcn Alert dependency |
| `components/doc/doc-alert.test.tsx` | Create — tests for badge label, title rendering, missing title, children |
| `config/doc-section.config.ts` | Update all 6 heading style strings |
| `components/doc/doc-section.test.tsx` | Create — tests for h1 border-b class, h2 class on nested section |

---

## Task 1: Redesign DocAlert

**Files:**
- Modify: `components/doc/doc-alert.tsx`
- Create: `components/doc/doc-alert.test.tsx`

### Context

`doc-alert.tsx` currently wraps Shadcn's `<Alert>` component. We're replacing it with a plain `<div>` and adding a level-based config object that drives border color, icon color, badge color, and badge label. The `Level` enum and all props remain unchanged — this is a visual-only rewrite.

Key spec decisions:
- Two-column layout: icon column (left, fixed) + content column (right, flex-1)
- Badge pill always renders, title `<span>` renders only when `title` prop is provided
- `border border-gray-200 border-l-4 border-l-{color}` gives 1px on 3 sides + 4px accent left
- `selectIcon` function and `Placeholder` fallback are removed; icon lookup moves into the level config object
- Existing `overrideTitleClass`/`appendTitleClass` apply to the title `<span>`
- Existing `overrideDescriptionClass`/`appendDescriptionClass` apply to the body `<div>` (base: `prose space-y-2 text-gray-500 dark:text-slate-400`)

---

- [ ] **Step 1: Write the failing tests**

Create `components/doc/doc-alert.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import DocAlert, { Level } from './doc-alert';

describe('DocAlert', () => {
    it('renders "Note" badge for Default level', () => {
        render(<DocAlert title="Test">Content</DocAlert>);
        expect(screen.getByText('Note')).toBeDefined();
    });

    it('renders "Important" badge for Important level', () => {
        render(<DocAlert title="Test" level={Level.Important}>Content</DocAlert>);
        expect(screen.getByText('Important')).toBeDefined();
    });

    it('renders "Caution" badge for Warning level', () => {
        render(<DocAlert title="Test" level={Level.Warning}>Content</DocAlert>);
        expect(screen.getByText('Caution')).toBeDefined();
    });

    it('renders title text when provided', () => {
        render(<DocAlert title="My Alert Title" level={Level.Important}>Content</DocAlert>);
        expect(screen.getByText('My Alert Title')).toBeDefined();
    });

    it('does not render title element when title is undefined', () => {
        const { container } = render(<DocAlert level={Level.Important}>Content</DocAlert>);
        // Badge renders but no title span
        expect(screen.getByText('Important')).toBeDefined();
        expect(container.querySelectorAll('span').length).toBe(1); // only badge span
    });

    it('renders children content', () => {
        render(<DocAlert title="Test">Body text content</DocAlert>);
        expect(screen.getByText('Body text content')).toBeDefined();
    });

    it('applies border-l-4 accent class', () => {
        const { container } = render(<DocAlert title="Test" level={Level.Important}>Content</DocAlert>);
        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass('border-l-4');
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run components/doc/doc-alert.test.tsx
```

Expected: Several tests fail. The "Note" badge test will fail because the current implementation doesn't render a badge element.

- [ ] **Step 3: Rewrite `components/doc/doc-alert.tsx`**

Replace the entire file with:

```tsx
import React from 'react';
import * as lucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

export enum Level {
    Default = 'default',
    Important = 'important',
    Warning = 'warning',
    Critical = 'critical',
    Question = 'question',
    Choice = 'choice',
}

export interface DocAlertProps {
    title?: string;
    level?: Level;
    icon?: keyof typeof lucideIcons;
    overrideTitleClass?: string;
    overrideDescriptionClass?: string;
    appendTitleClass?: string;
    appendDescriptionClass?: string;
    children?: React.ReactNode | string;
}

const levelConfig: Record<Level, { borderColor: string; iconColor: string; badgeClass: string; badgeLabel: string; iconName: keyof typeof lucideIcons }> = {
    [Level.Default]: {
        borderColor: 'border-l-gray-500',
        iconColor: 'text-gray-500',
        badgeClass: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        badgeLabel: 'Note',
        iconName: 'Terminal',
    },
    [Level.Important]: {
        borderColor: 'border-l-blue-500',
        iconColor: 'text-blue-500',
        badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        badgeLabel: 'Important',
        iconName: 'Info',
    },
    [Level.Warning]: {
        borderColor: 'border-l-amber-500',
        iconColor: 'text-amber-500',
        badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        badgeLabel: 'Caution',
        iconName: 'AlertTriangle',
    },
    [Level.Critical]: {
        borderColor: 'border-l-red-500',
        iconColor: 'text-red-500',
        badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        badgeLabel: 'Critical',
        iconName: 'Ban',
    },
    [Level.Question]: {
        borderColor: 'border-l-purple-500',
        iconColor: 'text-purple-500',
        badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        badgeLabel: 'FAQ',
        iconName: 'HelpCircle',
    },
    [Level.Choice]: {
        borderColor: 'border-l-green-500',
        iconColor: 'text-green-500',
        badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
        badgeLabel: 'Your Choice',
        iconName: 'ArrowLeftRight',
    },
};

const DocAlert: React.FC<DocAlertProps> = ({ title, level = Level.Default, icon, overrideTitleClass, appendTitleClass, overrideDescriptionClass, appendDescriptionClass, children }) => {
    const config = levelConfig[level];
    const iconName = icon ?? config.iconName;
    const IconComponent = lucideIcons[iconName] as React.ElementType;

    const titleClass = overrideTitleClass ? overrideTitleClass : cn('font-semibold text-sm text-gray-900 dark:text-slate-100', appendTitleClass);
    const descriptionClass = overrideDescriptionClass ? overrideDescriptionClass : cn('prose space-y-2 text-gray-500 dark:text-slate-400', appendDescriptionClass);

    return (
        <div
            className={cn(
                'flex gap-3 items-start',
                'bg-white dark:bg-slate-900',
                'border border-gray-200 dark:border-slate-700',
                'border-l-4',
                config.borderColor,
                'rounded-lg shadow-sm p-4',
            )}
        >
            {IconComponent && <IconComponent className={cn('w-[18px] h-[18px] flex-shrink-0 mt-0.5', config.iconColor)} />}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide flex-shrink-0', config.badgeClass)}>
                        {config.badgeLabel}
                    </span>
                    {title && <span className={titleClass}>{title}</span>}
                </div>
                <div className={descriptionClass}>{children}</div>
            </div>
        </div>
    );
};

export default DocAlert;
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run components/doc/doc-alert.test.tsx
```

Expected: All 7 tests pass.

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run
```

Expected: All tests pass. (The existing tests in `doc-image.test.tsx`, `mdx-doc-procedure-step.test.tsx`, etc. should be unaffected.)

- [ ] **Step 6: Commit**

```bash
git add components/doc/doc-alert.tsx components/doc/doc-alert.test.tsx
git commit -m "feat: redesign DocAlert with level-appropriate colors and badge pill"
```

---

## Task 2: Update DocSection Heading Styles

**Files:**
- Modify: `config/doc-section.config.ts`
- Create: `components/doc/doc-section.test.tsx`

### Context

`config/doc-section.config.ts` exports an array of `{ level, style }` objects consumed by `DocSection` via `generateSectionHeading`. The component itself is unchanged.

Changes:
- h1 gets `border-b border-gray-200` bottom rule and `pb-3 mb-1`; the old responsive `md:pb-6` is removed
- h2–h6 switch from `pt-*`/`pb-*` padding to `mt-*` margin (spacing between siblings, not inside element)
- All levels get explicit dark mode classes replacing `text-foreground/{opacity}` shorthand
- `text-l` (invalid Tailwind) on h4–h6 is corrected to `text-sm`

---

- [ ] **Step 1: Write the failing tests**

Create `components/doc/doc-section.test.tsx`:

```tsx
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { DocSection } from './doc-section';

describe('DocSection', () => {
    it('renders h1 with border-b class for top-level section', () => {
        const { container } = render(<DocSection title="Operating Instructions" />);
        const heading = container.querySelector('h1');
        expect(heading).not.toBeNull();
        expect(heading).toHaveClass('border-b');
    });

    it('renders h2 for nested section', () => {
        const { container } = render(
            <DocSection title="Operating Instructions">
                <DocSection title="Precautions" />
            </DocSection>
        );
        const h2 = container.querySelector('h2');
        expect(h2).not.toBeNull();
        expect(h2?.textContent).toBe('Precautions');
    });

    it('renders h1 with text-2xl class', () => {
        const { container } = render(<DocSection title="Test" />);
        const heading = container.querySelector('h1');
        expect(heading).toHaveClass('text-2xl');
    });

    it('h2 does not have border-b class', () => {
        const { container } = render(
            <DocSection title="Parent">
                <DocSection title="Child" />
            </DocSection>
        );
        const h2 = container.querySelector('h2');
        expect(h2).not.toHaveClass('border-b');
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run components/doc/doc-section.test.tsx
```

Expected: `border-b` and `text-2xl` tests fail — the current h1 style is `text-3xl font-bold tracking-tight pb-2 md:pb-6` (no `border-b`, different size).

- [ ] **Step 3: Update `config/doc-section.config.ts`**

Replace the `docSectionFormats` array:

```ts
export default {
    docSectionFormats: [
        {
            level: 1,
            style: 'text-2xl font-bold tracking-tight pb-3 mb-1 border-b border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100',
        },
        {
            level: 2,
            style: 'text-lg font-semibold tracking-tight mt-6 mb-1 text-gray-700 dark:text-slate-200',
        },
        {
            level: 3,
            style: 'text-base font-semibold tracking-tight mt-4 mb-1 text-gray-600 dark:text-slate-300',
        },
        {
            level: 4,
            style: 'text-sm font-semibold tracking-tight mt-3 text-gray-500 dark:text-slate-400',
        },
        {
            level: 5,
            style: 'text-sm font-medium tracking-tight mt-3 text-gray-500 dark:text-slate-400',
        },
        {
            level: 6,
            style: 'text-sm font-medium italic tracking-tight mt-3 text-gray-400 dark:text-slate-500',
        },
    ],
} as DocSectionConfig;
```

Leave the interfaces (`DocSectionFormat`, `DocSectionConfig`) and all other file structure unchanged.

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run components/doc/doc-section.test.tsx
```

Expected: All 4 tests pass.

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add config/doc-section.config.ts components/doc/doc-section.test.tsx
git commit -m "feat: update DocSection heading styles with cleaner typography and h1 bottom rule"
```
