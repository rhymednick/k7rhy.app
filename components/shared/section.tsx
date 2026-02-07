import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

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
        <section
            className={cn(
                'rounded-2xl px-6 py-10 md:px-10',
                background === 'muted' && 'bg-muted/50',
                background === 'gradient' && 'bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950',
                background === 'default' && '',
                className
            )}
        >
            {(title || description) && (
                <div className="mb-8 text-center">
                    {Icon && (
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-600 text-white shadow-md">
                            <Icon className="h-6 w-6" />
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
