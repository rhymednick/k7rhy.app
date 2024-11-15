import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { MDXComponents } from 'mdx/types';
// import { useMDXComponent } from "next-contentlayer/hooks"
//import { NpmCommands } from "types/unist"

//import { Event } from "@/lib/events"
import { cn } from '@/lib/utils';
//import { useConfig } from "@/hooks/use-config"
import { Callout } from '@/components/callout';
// import { ComponentExample } from "@/components/component-example"
// import { ComponentPreview } from "@/components/component-preview"
// import { ComponentSource } from "@/components/component-source"
// import { CopyButton, CopyNpmCommandButton } from "@/components/copy-button"
// import { FrameworkDocs } from "@/components/framework-docs"
// import { StyleWrapper } from "@/components/style-wrapper"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocProcedure } from '@/components/doc/doc-procedure';
import { DocSection } from '@/components/doc/doc-section';
import { DocImage } from '@/components/doc/doc-image';
import { DocIndexCard } from '@/components/doc/doc-index-card';
import { Icons } from '@/components/icons';
import PowerCalculator from '@/components/power-calculator';
import CodeBlock from '@/components/code-block';
import DocAlert from './doc/doc-alert';
import { MdxDocProcedure } from '@/components/doc/mdx-doc-procedure';
import {
    MdxDocProcedureStep,
    StepDescription,
} from '@/components/doc/mdx-doc-procedure-step';
import { MdxDocProcedureSubstepGroup } from '@/components/doc/mdx-doc-procedure-substep-group';
import { ArrowUpDown, CircleHelp } from 'lucide-react';

//import { Style } from "@/registry/styles"

const components: MDXComponents = {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Alert,
    AlertTitle,
    AlertDescription,
    h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h1
            className={cn(
                'font-heading mt-2 scroll-m-20 text-4xl font-bold',
                className
            )}
            {...props}
        />
    ),
    h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2
            className={cn(
                'font-heading mt-12 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0',
                className
            )}
            {...props}
        />
    ),
    h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3
            className={cn(
                'font-heading mt-8 scroll-m-20 text-xl font-semibold tracking-tight',
                className
            )}
            {...props}
        />
    ),
    h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h4
            className={cn(
                'font-heading mt-8 scroll-m-20 text-lg font-semibold tracking-tight',
                className
            )}
            {...props}
        />
    ),
    h5: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h5
            className={cn(
                'mt-8 scroll-m-20 text-lg font-semibold tracking-tight',
                className
            )}
            {...props}
        />
    ),
    h6: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h6
            className={cn(
                'mt-8 scroll-m-20 text-base font-semibold tracking-tight',
                className
            )}
            {...props}
        />
    ),
    a: ({ className, ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
        <a
            className={cn(
                'font-medium no-underline hover:underline underline-offset-2',
                className
            )}
            {...props}
        />
    ),
    p: ({
        className,
        ...props
    }: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p
            className={cn('prose [&:not(:first-child)]:mt-2', className)}
            {...props}
        />
    ),
    ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
        <ul
            className={cn('my-2 ml-6 list-disc', className)}
            {...props}
        />
    ),
    ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
        <ol
            className={cn('my-2 ml-6 list-decimal', className)}
            {...props}
        />
    ),
    li: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
        <li
            className={cn('', className)}
            {...props}
        />
    ),
    blockquote: ({
        className,
        ...props
    }: React.HTMLAttributes<HTMLElement>) => (
        <blockquote
            className={cn('mt-6 border-l-2 pl-6 italic', className)}
            {...props}
        />
    ),
    img: ({
        className,
        alt,
        ...props
    }: React.ImgHTMLAttributes<HTMLImageElement>) => (
        <img
            className={cn('rounded-md mt-2 mb-2', className)}
            alt={alt}
            {...props}
        />
    ),
    hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
        <hr
            className="my-4 md:my-8"
            {...props}
        />
    ),
    table: ({
        className,
        ...props
    }: React.HTMLAttributes<HTMLTableElement>) => (
        <div className="my-6 w-full overflow-y-auto rounded-lg">
            <table
                className={cn('w-full overflow-hidden rounded-lg', className)}
                {...props}
            />
        </div>
    ),
    tr: ({
        className,
        ...props
    }: React.HTMLAttributes<HTMLTableRowElement>) => (
        <tr
            className={cn('m-0 border-t p-0', className)}
            {...props}
        />
    ),
    th: ({
        className,
        ...props
    }: React.HTMLAttributes<HTMLTableCellElement>) => (
        <th
            className={cn(
                'border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right',
                className
            )}
            {...props}
        />
    ),
    td: ({
        className,
        ...props
    }: React.HTMLAttributes<HTMLTableCellElement>) => (
        <td
            className={cn(
                'border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right',
                className
            )}
            {...props}
        />
    ),
    code: ({ className, children }) => {
        const showLineNumbers =
            className?.includes('(show-line-numbers)') || false;
        const languageClassName = className
            ?.replace('(show-line-numbers)', '')
            .trim();
        // console.log('showLineNumbers', showLineNumbers);
        // console.log('languageClassName', languageClassName);
        // console.log('className', className);
        if (typeof children === 'string') {
            return (
                <CodeBlock
                    className={languageClassName}
                    showLineNumbers={showLineNumbers}
                >
                    {children.trim()}
                </CodeBlock>
            );
        }
        return <code className={languageClassName}>{children}</code>;
    },
    Image,
    Callout,
    AspectRatio,
    Step: ({ className, ...props }: React.ComponentProps<'h3'>) => (
        <h3
            className={cn(
                'font-heading mt-8 scroll-m-20 text-xl font-semibold tracking-tight',
                className
            )}
            {...props}
        />
    ),
    Steps: ({ ...props }) => (
        <div
            className="[&>h3]:step steps mb-12 ml-4 border-l pl-8 [counter-reset:step]"
            {...props}
        />
    ),
    Tabs: ({ className, ...props }: React.ComponentProps<typeof Tabs>) => (
        <Tabs
            className={cn('relative mt-6 w-full', className)}
            {...props}
        />
    ),
    TabsList: ({
        className,
        ...props
    }: React.ComponentProps<typeof TabsList>) => (
        <TabsList
            className={cn(
                'w-full justify-start rounded-none border-b bg-transparent p-0',
                className
            )}
            {...props}
        />
    ),
    TabsTrigger: ({
        className,
        ...props
    }: React.ComponentProps<typeof TabsTrigger>) => (
        <TabsTrigger
            className={cn(
                'relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none',
                className
            )}
            {...props}
        />
    ),
    TabsContent: ({
        className,
        ...props
    }: React.ComponentProps<typeof TabsContent>) => (
        <TabsContent
            className={cn(
                'relative [&_h3.font-heading]:text-base [&_h3.font-heading]:font-semibold',
                className
            )}
            {...props}
        />
    ),
    Link: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
        <Link
            className={cn(
                'font-medium underline underline-offset-4',
                className
            )}
            {...props}
        />
    ),
    LinkedCard: ({
        className,
        ...props
    }: React.ComponentProps<typeof Link>) => (
        <Link
            className={cn(
                'flex w-full flex-col items-center rounded-xl border bg-card p-6 text-card-foreground shadow transition-colors hover:bg-muted/50 sm:p-10',
                className
            )}
            {...props}
        />
    ),
    DocImage,
    DocIndexCard,
    DocProcedure,
    DocSection,
    Icons,
    PowerCalculator,
    DocAlert,
    Proc: MdxDocProcedure,
    ProcStep: MdxDocProcedureStep,
    Desc: StepDescription,
    ProcSubgroup: MdxDocProcedureSubstepGroup,
    ArrowUpDown,
    CircleHelp,
};

// interface MdxProps {
//     code: string
// }

// export function Mdx({ code }: MdxProps) {
//     const [config] = useConfig()
//     const Component = useMDXComponent(code, {
//         style: config.style,
//     })

//     return (
//         <div className="mdx">
//             <Component components={components} />
//         </div>
//     )
// }
declare global {
    type MDXProvidedComponents = typeof components;
}
export default components;
