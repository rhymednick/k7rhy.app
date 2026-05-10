import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CardGridProps {
    children: React.ReactNode;
    columns?: 2 | 3;
    className?: string;
}

interface CardGridItemProps {
    title: string;
    children: React.ReactNode;
    eyebrow?: string;
    href?: string;
    cta?: string;
    className?: string;
}

const columnClasses: Record<NonNullable<CardGridProps['columns']>, string> = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
};

export function CardGrid({ children, columns = 3, className }: CardGridProps) {
    return <div className={cn('my-6 grid grid-cols-1 gap-4', columnClasses[columns], className)}>{children}</div>;
}

export function CardGridItem({ title, children, eyebrow, href, cta, className }: CardGridItemProps) {
    const content = (
        <div className={cn('flex h-full flex-col rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all', href && 'group-hover:border-sky-500 group-hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]', className)}>
            {eyebrow && <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{eyebrow}</p>}
            <h3 className={cn('font-semibold text-foreground', eyebrow && 'mt-2', href && 'transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400')}>{title}</h3>
            <div className="mt-2 flex-1 text-sm text-muted-foreground">{children}</div>
            {cta && <p className="mt-3 text-xs font-medium text-sky-600 dark:text-sky-400">{cta}</p>}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="group block h-full">
                {content}
            </Link>
        );
    }

    return content;
}
