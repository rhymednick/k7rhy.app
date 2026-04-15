import React from 'react';
import { cn } from '@/lib/utils';

interface IconBadgeProps {
    icon: React.ElementType;
    variant?: 'default' | 'guitar';
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: { wrapper: 'h-9 w-9 rounded-lg', icon: 'h-4 w-4' },
    md: { wrapper: 'h-10 w-10 rounded-lg', icon: 'h-5 w-5' },
    lg: { wrapper: 'h-12 w-12 rounded-xl', icon: 'h-6 w-6' },
};

const variantClasses = {
    default: 'from-sky-500 to-emerald-600',
    guitar: 'from-sky-500 to-indigo-600',
};

export function IconBadge({ icon: Icon, variant = 'default', size = 'md' }: IconBadgeProps) {
    return (
        <div className={cn('flex items-center justify-center bg-gradient-to-br shadow-sm text-white', sizeClasses[size].wrapper, variantClasses[variant])}>
            <Icon className={sizeClasses[size].icon} />
        </div>
    );
}
