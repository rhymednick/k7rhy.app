import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
        <div className="group rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-600 text-white shadow-sm">
                <Icon className="h-5 w-5" />
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
    return (
        <div
            className={cn(
                'grid gap-6',
                columns === 2 && 'grid-cols-1 md:grid-cols-2',
                columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
                columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
                className
            )}
        >
            {children}
        </div>
    );
}
