# Doc Components Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the `DocImage` and `MdxDocProcedure` component family with a premium indigo/violet aesthetic, remove the `<Desc>` wrapper requirement, and delete the legacy props-based `DocProcedure` component.

**Architecture:** Visual styles are applied via Tailwind utilities directly on the components — no new CSS files. The `MdxDocProcedureStep` child-dispatch logic is simplified: all non-substep-group children become description content. `DocImage` keeps its async RSC shape; hover overlay is pure CSS (`group`/`group-hover:`).

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS v3, Shadcn UI (Radix), Vitest + React Testing Library, Lucide React icons.

---

## File Map

| File                                                 | Action     | Responsibility                                                                                                                                      |
| ---------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/doc/doc-image.tsx`                       | Modify     | Thumbnail polish: rounded corners, indigo border/shadow, CSS hover zoom overlay                                                                     |
| `components/doc/mdx-doc-procedure-step.tsx`          | Modify     | New gradient circle badges, fading connectors, substep lettering; remove `StepDescription`/`Desc`; merge all non-subgroup children into prose block |
| `components/doc/mdx-doc-procedure-substep-group.tsx` | Modify     | New left-rail border, violet substep styles                                                                                                         |
| `components/doc/mdx-doc-procedure.tsx`               | Modify     | Updated `<ol>` container styles                                                                                                                     |
| `components/doc/doc-procedure.tsx`                   | **Delete** | Replaced by MDX component path                                                                                                                      |
| `components/mdx-components.tsx`                      | Modify     | Remove `DocProcedure` import/alias, remove `StepDescription`/`Desc` import/alias                                                                    |
| `content/docs/dl20w_sma.mdx`                         | Modify     | Remove all `<Desc>` wrapper tags                                                                                                                    |
| `components/doc/doc-image.test.tsx`                  | Create     | Tests for new thumbnail styles                                                                                                                      |
| `components/doc/mdx-doc-procedure-step.test.tsx`     | Create     | Tests for Desc-free rendering and new layout                                                                                                        |

---

## Task 1: DocImage — visual polish

**Files:**

- Modify: `components/doc/doc-image.tsx`
- Create: `components/doc/doc-image.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/doc/doc-image.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { DocImage } from './doc-image';

// DocImage is an async RSC — call it as a function and render the result
describe('DocImage', () => {
    it('renders thumbnail with rounded corners and indigo border', async () => {
        const jsx = await DocImage({ title: 'Test image', src: '/test.jpg', alt: 'Test', triggerImageSize: 120, popupImageSize: 1000 });
        const { container } = render(jsx);
        const triggerWrapper = container.querySelector('.rounded-lg');
        expect(triggerWrapper).not.toBeNull();
        expect(triggerWrapper).toHaveClass('border');
    });

    it('renders zoom icon overlay element', async () => {
        const jsx = await DocImage({ title: 'Test image', src: '/test.jpg', alt: 'Test', triggerImageSize: 120, popupImageSize: 1000 });
        const { container } = render(jsx);
        // The overlay div exists (hidden by default via opacity-0)
        const overlay = container.querySelector('.opacity-0');
        expect(overlay).not.toBeNull();
    });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run components/doc/doc-image.test.tsx
```

Expected: FAIL — `rounded-lg` not found on current component.

- [ ] **Step 3: Implement new DocImage**

Replace the full content of `components/doc/doc-image.tsx`:

```tsx
import React from 'react';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ZoomIn } from 'lucide-react';
import Image from 'next/image';

export interface DocImageProps {
    title: string;
    triggerImageSize: number;
    popupImageSize: number;
    src: string;
    alt?: string;
}

export async function DocImage(props: DocImageProps) {
    return (
        <div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <div className="group relative inline-block cursor-pointer rounded-lg overflow-hidden border border-indigo-200 shadow-[0_2px_8px_rgba(99,102,241,0.15)] dark:border-indigo-900">
                        <Image src={props.src} alt={props.alt || ''} width={props.triggerImageSize} height={props.triggerImageSize} className="block" />
                        <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 transition-colors duration-200 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-slate-800/90 rounded-full w-8 h-8 flex items-center justify-center shadow">
                                <ZoomIn className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                    </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{props.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            <Image src={props.src} alt={props.alt || ''} width={props.popupImageSize} height={props.popupImageSize} />
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Done</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
```

Key changes from current:

- `AlertDialogTrigger asChild` — delegates click to the inner `div`
- `group` on the wrapper div enables `group-hover:` on children
- Rounded corners, indigo border and shadow on trigger div
- Hover overlay: `bg-indigo-500/10` tint + `ZoomIn` icon (opacity-0 → opacity-100 on hover)
- Dark mode variants on border, overlay bg, and icon

- [ ] **Step 4: Run tests to confirm pass**

```bash
npx vitest run components/doc/doc-image.test.tsx
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/doc/doc-image.tsx components/doc/doc-image.test.tsx
git commit -m "feat: redesign DocImage thumbnail with indigo border, shadow, and hover zoom overlay"
```

---

## Task 2: MdxDocProcedureStep — new styles + remove Desc

**Files:**

- Modify: `components/doc/mdx-doc-procedure-step.tsx`
- Create: `components/doc/mdx-doc-procedure-step.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// components/doc/mdx-doc-procedure-step.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { MdxDocProcedureStep } from './mdx-doc-procedure-step';

// Wrap in <ol> with counter-reset so CSS counters work
const Wrapper = ({ children }: { children: React.ReactNode }) => <ol style={{ counterReset: 'step 0' }}>{children}</ol>;
const SubstepWrapper = ({ children }: { children: React.ReactNode }) => <ol style={{ counterReset: 'substep 0' }}>{children}</ol>;

describe('MdxDocProcedureStep', () => {
    it('renders step title', () => {
        render(<MdxDocProcedureStep text="Prepare the resistors">Direct text</MdxDocProcedureStep>, { wrapper: Wrapper });
        expect(screen.getByText('Prepare the resistors')).toBeDefined();
    });

    it('renders direct text children as description without Desc wrapper', () => {
        render(<MdxDocProcedureStep text="Step title">This is the description text written directly.</MdxDocProcedureStep>, { wrapper: Wrapper });
        expect(screen.getByText('This is the description text written directly.')).toBeDefined();
    });

    it('renders as substep with substep title style when isSubstep=true', () => {
        render(
            <MdxDocProcedureStep text="Substep title" isSubstep={true}>
                Substep description
            </MdxDocProcedureStep>,
            { wrapper: SubstepWrapper }
        );
        expect(screen.getByText('Substep title')).toBeDefined();
        expect(screen.getByText('Substep description')).toBeDefined();
    });

    it('does not render Desc wrapper content when given direct children', () => {
        // Regression: previously children had to be wrapped in <Desc>.
        // This confirms plain text renders directly without any wrapper.
        const { container } = render(<MdxDocProcedureStep text="Step">Plain child text</MdxDocProcedureStep>, { wrapper: Wrapper });
        expect(container.textContent).toContain('Plain child text');
    });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run components/doc/mdx-doc-procedure-step.test.tsx
```

Expected: FAIL — `StepDescription` test fails (it currently exists), and the direct-text test may fail depending on current render path.

- [ ] **Step 3: Implement new MdxDocProcedureStep**

Replace the full content of `components/doc/mdx-doc-procedure-step.tsx`:

```tsx
// components/doc/mdx-doc-procedure-step.tsx
import React from 'react';
import { DocImage } from '@/components/doc/doc-image';
import { MdxDocProcedureSubstepGroup } from '@/components/doc/mdx-doc-procedure-substep-group';

export interface MdxDocProcedureStepProps {
    text: string;
    image?: string;
    isSubstep?: boolean;
    children?: React.ReactNode;
}

export const MdxDocProcedureStep: React.FC<MdxDocProcedureStepProps> = ({ text, image, isSubstep = false, children }) => {
    const descriptionChildren: React.ReactNode[] = [];
    let substepGroup: React.ReactNode | null = null;

    React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === MdxDocProcedureSubstepGroup) {
            substepGroup = child;
        } else {
            descriptionChildren.push(child);
        }
    });

    if (isSubstep) {
        return (
            <li
                style={{ counterIncrement: 'substep 1' }}
                className="relative pl-10 pb-4 last:pb-0
                    before:content-[counter(substep,lower-alpha)] before:absolute before:left-0 before:top-0
                    before:w-[26px] before:h-[26px] before:rounded-full
                    before:bg-violet-100 before:text-violet-700 before:text-xs before:font-bold
                    before:border before:border-violet-300
                    before:flex before:items-center before:justify-center
                    dark:before:bg-violet-900/40 dark:before:text-violet-300 dark:before:border-violet-700
                    after:absolute after:top-[26px] after:bottom-0 after:left-[12px] after:w-[1.5px]
                    after:bg-gradient-to-b after:from-violet-300 after:to-violet-300/5
                    last:after:hidden"
            >
                <div>
                    <h4 className="text-sm font-semibold text-violet-900 mb-2 dark:text-violet-200">{text}</h4>
                    <div className="flex flex-col md:flex-row md:items-start gap-3">
                        <div className="prose prose-slate prose-sm dark:prose-invert flex-1">{descriptionChildren}</div>
                        {image && (
                            <div className="flex-shrink-0">
                                <DocImage title={text} src={image} alt={text} triggerImageSize={80} popupImageSize={1000} />
                            </div>
                        )}
                    </div>
                </div>
            </li>
        );
    }

    return (
        <li
            style={{ counterIncrement: 'step 1' }}
            className="relative pl-12 pb-8 last:pb-0
                before:content-[counter(step)] before:absolute before:left-0 before:top-0
                before:w-[34px] before:h-[34px] before:rounded-full
                before:bg-gradient-to-br before:from-indigo-500 before:to-violet-500
                before:text-white before:text-sm before:font-bold
                before:flex before:items-center before:justify-center
                before:shadow-[0_2px_8px_rgba(99,102,241,0.35)]
                after:absolute after:top-[34px] after:bottom-0 after:left-[16px] after:w-[2px]
                after:bg-gradient-to-b after:from-violet-500 after:to-violet-500/5
                last:after:hidden"
        >
            <div>
                <h3 className="text-base font-bold text-indigo-950 mb-2 mt-1 dark:text-slate-100">{text}</h3>
                <div className="flex flex-col md:flex-row md:items-start gap-3">
                    <div className="prose prose-slate prose-sm dark:prose-invert flex-1">{descriptionChildren}</div>
                    {image && (
                        <div className="flex-shrink-0">
                            <DocImage title={text} src={image} alt={text} triggerImageSize={120} popupImageSize={1000} />
                        </div>
                    )}
                </div>
                {substepGroup}
            </div>
        </li>
    );
};
```

Changes from current:

- `StepDescription` export **removed** — no more `Desc` wrapper
- Child dispatch simplified: everything that isn't `MdxDocProcedureSubstepGroup` goes into `descriptionChildren`
- All debug `console.log` statements removed
- New step badge: 34px gradient circle with shadow (main); 26px violet-outlined circle (substep)
- Connector line: `after:` gradient fading to transparent, hidden on last item
- Image sizes: 120px (main), 80px (substep) — intentional reduction from 400/200

- [ ] **Step 4: Run tests to confirm pass**

```bash
npx vitest run components/doc/mdx-doc-procedure-step.test.tsx
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add components/doc/mdx-doc-procedure-step.tsx components/doc/mdx-doc-procedure-step.test.tsx
git commit -m "feat: redesign MdxDocProcedureStep with gradient badges, fading connectors; remove Desc wrapper"
```

---

## Task 3: MdxDocProcedureSubstepGroup — new rail styles

**Files:**

- Modify: `components/doc/mdx-doc-procedure-substep-group.tsx`

- [ ] **Step 1: Implement**

Replace the full content of `components/doc/mdx-doc-procedure-substep-group.tsx`:

```tsx
import React from 'react';
import { MdxDocProcedureStep } from '@/components/doc/mdx-doc-procedure-step';

export interface MdxDocProcedureSubstepGroupProps {
    children: React.ReactNode;
}

export const MdxDocProcedureSubstepGroup: React.FC<MdxDocProcedureSubstepGroupProps> = ({ children }) => {
    return (
        <ol className="relative mt-4 border-l-2 border-violet-100 pl-4 dark:border-violet-900/40" style={{ counterReset: 'substep 0' }}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && child.type === MdxDocProcedureStep) {
                    return React.cloneElement(child, { isSubstep: true } as React.Attributes);
                }
            })}
        </ol>
    );
};

MdxDocProcedureSubstepGroup.displayName = 'MdxDocProcedureSubstepGroup';
```

Changes from current: `space-y-2 mt-4` replaced with `mt-4 border-l-2 border-violet-100 pl-4` — adds the left-rail visual that frames the substep group.

- [ ] **Step 2: Run existing tests to confirm nothing broken**

```bash
npx vitest run
```

Expected: All previous tests still PASS.

- [ ] **Step 3: Commit**

```bash
git add components/doc/mdx-doc-procedure-substep-group.tsx
git commit -m "feat: add violet left-rail border to substep group"
```

---

## Task 4: MdxDocProcedure — container styles

**Files:**

- Modify: `components/doc/mdx-doc-procedure.tsx`

- [ ] **Step 1: Implement**

Replace the full content of `components/doc/mdx-doc-procedure.tsx`:

```tsx
// components/doc/mdx-doc-procedure.tsx
import React from 'react';
import { DocSection } from '@/components/doc/doc-section';
import { MdxDocProcedureStep } from '@/components/doc/mdx-doc-procedure-step';

export interface MdxDocProcedureProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export const MdxDocProcedure: React.FC<MdxDocProcedureProps> = (props) => {
    return (
        <div>
            <DocSection title={props.title}>
                {props.description && <div className="mb-4 prose prose-slate prose-sm dark:prose-invert">{props.description}</div>}
                <ol className="relative mb-8" style={{ counterReset: 'step 0' }}>
                    {React.Children.map(props.children, (child) => {
                        if (React.isValidElement(child) && child.type === MdxDocProcedureStep) {
                            return React.cloneElement(child, { isSubstep: false } as React.Attributes);
                        }
                    })}
                </ol>
            </DocSection>
        </div>
    );
};
```

Changes from current: removes `space-y-2` (spacing is now managed by `pb-8` on each `<li>`); removes the stale `DocImage` import; description uses `prose` class consistent with steps.

- [ ] **Step 2: Run tests**

```bash
npx vitest run
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/doc/mdx-doc-procedure.tsx
git commit -m "refactor: update MdxDocProcedure container styles, remove stale imports"
```

---

## Task 5: Delete DocProcedure + clean up mdx-components.tsx

**Files:**

- Delete: `components/doc/doc-procedure.tsx`
- Modify: `components/mdx-components.tsx`

- [ ] **Step 1: Verify DocProcedure is unused in MDX content**

```bash
grep -r "DocProcedure" content/
```

Expected: no output (it's only registered in `mdx-components.tsx`, never used in `.mdx` files).

- [ ] **Step 2: Delete the file**

```bash
rm components/doc/doc-procedure.tsx
```

- [ ] **Step 3: Update mdx-components.tsx**

Make these three edits to `components/mdx-components.tsx`:

**Remove line 22** (DocProcedure import):

```diff
- import { DocProcedure } from '@/components/doc/doc-procedure';
```

**Remove StepDescription from line 31**:

```diff
- import { MdxDocProcedureStep, StepDescription } from '@/components/doc/mdx-doc-procedure-step';
+ import { MdxDocProcedureStep } from '@/components/doc/mdx-doc-procedure-step';
```

**Remove lines 138 and 150** from the `components` object:

```diff
- DocProcedure,
  ...
- Desc: StepDescription,
```

- [ ] **Step 4: Confirm TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Run tests**

```bash
npx vitest run
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/mdx-components.tsx
git rm components/doc/doc-procedure.tsx
git commit -m "refactor: delete legacy DocProcedure component and remove Desc/StepDescription MDX alias"
```

---

## Task 6: Update dl20w_sma.mdx — remove Desc tags

**Files:**

- Modify: `content/docs/dl20w_sma.mdx`

- [ ] **Step 1: Confirm Desc usage in the project**

```bash
grep -rn "<Desc>" content/
```

Expected: only `content/docs/dl20w_sma.mdx` appears.

- [ ] **Step 2: Remove all `<Desc>` and `</Desc>` tags**

Open `content/docs/dl20w_sma.mdx` and remove every `<Desc>` opening tag and `</Desc>` closing tag. The text content between them should remain. Example:

```diff
- <Desc>
  Bend the leads of the resistor...
- </Desc>
```

There are approximately 15 `<Desc>` blocks in this file. Remove all of them.

- [ ] **Step 3: Run a final grep to confirm no Desc tags remain**

```bash
grep -n "<Desc\|</Desc>" content/docs/dl20w_sma.mdx
```

Expected: no output.

- [ ] **Step 4: Build to verify**

```bash
npm run build
```

Expected: successful build with no MDX compilation errors.

- [ ] **Step 5: Commit**

```bash
git add content/docs/dl20w_sma.mdx
git commit -m "docs: remove Desc wrapper tags from dl20w_sma.mdx"
```

---

## Task 7: Final verification

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run
```

Expected: all tests PASS.

- [ ] **Step 2: Confirm no remaining Desc usage anywhere**

```bash
grep -rn "StepDescription\|<Desc" --include="*.tsx" --include="*.ts" --include="*.mdx" .
```

Expected: no output.

- [ ] **Step 3: Start dev server and visually verify the assembly guide**

```bash
npm run dev
```

Navigate to the assembly guide doc page (the `dl20w_sma` route). Verify:

- Step numbers show as indigo→violet gradient circles
- Connector lines fade gracefully between steps
- Substep badges show violet-outlined circles with letters a, b, c…
- DocImage thumbnails have rounded corners and show zoom icon on hover
- Dark mode toggle still renders correctly

- [ ] **Step 4: Final commit if any cleanup needed, then done**
