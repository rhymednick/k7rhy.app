import React from 'react';
import { getCachedPrice } from '@/lib/amazon-prices';
import { cn } from '@/lib/utils';

interface BomItemProps {
    title: string;
    href: string;
    source: string;
    itemKey: string;
    fallback: string;
    /** Mark this item as a specific required choice — no substitution */
    specific?: boolean;
    /** Describe a valid substitution and how to decide */
    substitution?: string;
    children?: React.ReactNode;
}

export function BomItem({ title, href, source, itemKey, fallback, specific, substitution, children }: BomItemProps) {
    const price = getCachedPrice(itemKey, fallback);

    return (
        <div className="border-b py-3 last:border-b-0">
            <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-2">
                    <span className="font-medium">{title}</span>
                    {specific && <span className={cn('rounded border px-1.5 py-0.5 text-xs font-medium', 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400')}>Specific</span>}
                    {substitution && <span className={cn('rounded border px-1.5 py-0.5 text-xs font-medium', 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400')}>Flexible</span>}
                </div>
                <span className="shrink-0 text-sm text-muted-foreground">
                    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {source}
                    </a>
                    <span className="mx-2 text-border">·</span>
                    {price}
                </span>
            </div>
            {children && <div className="mt-1 text-sm text-muted-foreground">{children}</div>}
            {substitution && (
                <div className={cn('mt-2 rounded-md border-l-2 border-emerald-500/40 pl-3 text-sm text-muted-foreground')}>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">Alternative: </span>
                    {substitution}
                </div>
            )}
        </div>
    );
}

export function BomSection({ children }: { children: React.ReactNode }) {
    return <div className="mb-6 rounded-lg border px-4">{children}</div>;
}
