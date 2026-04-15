import React from 'react';
import { cn } from '@/lib/utils';

export type RelayModelStatus = 'available' | 'planned';

export function RelayModelStatusBadge({ status, className }: { status: RelayModelStatus; className?: string }) {
    if (status === 'available') {
        return (
            <span
                className={cn(
                    'shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400',
                    className,
                )}
            >
                Available
            </span>
        );
    }
    return (
        <span
            className={cn(
                'shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground',
                className,
            )}
        >
            Planned
        </span>
    );
}
