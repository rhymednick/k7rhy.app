import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { IconBadge } from '@/components/shared/icon-badge';

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
        <div className="group rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)]">
            <div className="mb-4">
                <IconBadge icon={Icon} variant="default" size="md" />
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
    return <div className={cn('grid gap-6', columns === 2 && 'grid-cols-1 md:grid-cols-2', columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', className)}>{children}</div>;
}
