import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { RelayModelStatusBadge, type RelayModelStatus } from '@/components/relay/relay-model-status-badge';

interface RelayModelCardProps {
    name: string;
    tagline: string;
    genres: string;
    description: string;
    status: RelayModelStatus;
    href?: string;
}

export function RelayModelCard({ name, tagline, genres, description, status, href }: RelayModelCardProps) {
    const inner = (
        <div className={cn('flex h-full flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all', href && 'group-hover:border-sky-500 group-hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]')}>
            <div className="flex items-start justify-between gap-2">
                <h3 className={cn('font-semibold text-foreground', href && 'transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400')}>{name}</h3>
                <RelayModelStatusBadge status={status} />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{tagline}</p>
            <p className="flex-1 text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground/70">{genres}</p>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="group block">
                {inner}
            </Link>
        );
    }

    return <div>{inner}</div>;
}

export function RelayModelGrid({ children }: { children: React.ReactNode }) {
    return <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}
