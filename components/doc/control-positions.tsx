import React from 'react';
import { cn } from '@/lib/utils';

interface ControlPositionsProps {
    switchLabel?: string;
    children: React.ReactNode;
}

interface ControlPositionProps {
    label: string;
    name: string;
    children?: React.ReactNode;
}

export function ControlPositions({ switchLabel, children }: ControlPositionsProps) {
    return (
        <div className="my-4">
            {switchLabel && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{switchLabel}</p>
            )}
            <div className="divide-y overflow-hidden rounded-lg border">{children}</div>
        </div>
    );
}

export function ControlPosition({ label, name, children }: ControlPositionProps) {
    return (
        <div className="flex gap-3 px-4 py-3">
            <div className="shrink-0 pt-0.5">
                <span
                    className={cn(
                        'inline-flex min-w-[26px] items-center justify-center rounded-full px-1.5 py-0.5',
                        'bg-indigo-100 text-xs font-semibold tabular-nums text-indigo-700',
                        'dark:bg-indigo-900/60 dark:text-indigo-300',
                    )}
                >
                    {label}
                </span>
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{name}</p>
                {children && <div className="mt-0.5 text-sm text-muted-foreground">{children}</div>}
            </div>
        </div>
    );
}
