import React from 'react';
import * as lucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

export enum Level {
    Default = 'default',
    Important = 'important',
    Warning = 'warning',
    Critical = 'critical',
    Question = 'question',
    Choice = 'choice',
}

export interface DocAlertProps {
    title?: string;
    level?: Level;
    icon?: keyof typeof lucideIcons;
    overrideTitleClass?: string;
    overrideDescriptionClass?: string;
    appendTitleClass?: string;
    appendDescriptionClass?: string;
    children?: React.ReactNode | string;
}

const levelConfig: Record<Level, { borderColor: string; iconColor: string; badgeClass: string; badgeLabel: string; iconName: keyof typeof lucideIcons }> = {
    [Level.Default]: {
        borderColor: 'border-l-gray-500',
        iconColor: 'text-gray-500',
        badgeClass: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        badgeLabel: 'Note',
        iconName: 'Terminal',
    },
    [Level.Important]: {
        borderColor: 'border-l-blue-500',
        iconColor: 'text-blue-500',
        badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        badgeLabel: 'Important',
        iconName: 'Info',
    },
    [Level.Warning]: {
        borderColor: 'border-l-amber-500',
        iconColor: 'text-amber-500',
        badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        badgeLabel: 'Caution',
        iconName: 'AlertTriangle',
    },
    [Level.Critical]: {
        borderColor: 'border-l-red-500',
        iconColor: 'text-red-500',
        badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        badgeLabel: 'Critical',
        iconName: 'Ban',
    },
    [Level.Question]: {
        borderColor: 'border-l-purple-500',
        iconColor: 'text-purple-500',
        badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        badgeLabel: 'FAQ',
        iconName: 'HelpCircle',
    },
    [Level.Choice]: {
        borderColor: 'border-l-green-500',
        iconColor: 'text-green-500',
        badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
        badgeLabel: 'Your Choice',
        iconName: 'ArrowLeftRight',
    },
};

const DocAlert: React.FC<DocAlertProps> = ({ title, level = Level.Default, icon, overrideTitleClass, appendTitleClass, overrideDescriptionClass, appendDescriptionClass, children }) => {
    const config = levelConfig[level];
    const iconName = icon ?? config.iconName;
    const rawIcon = lucideIcons[iconName];
    const IconComponent = typeof rawIcon === 'function' ? (rawIcon as React.ElementType) : null;

    const titleClass = overrideTitleClass ? overrideTitleClass : cn('font-semibold text-sm text-gray-900 dark:text-slate-100', appendTitleClass);
    const descriptionClass = overrideDescriptionClass ? overrideDescriptionClass : cn('prose space-y-2 text-gray-500 dark:text-slate-400', appendDescriptionClass);

    return (
        <div
            className={cn(
                'flex gap-3 items-start',
                'bg-white dark:bg-slate-900',
                'border border-gray-200 dark:border-slate-700',
                'border-l-4',
                config.borderColor,
                'rounded-lg shadow-sm p-4',
            )}
        >
            {IconComponent && <IconComponent className={cn('w-[18px] h-[18px] flex-shrink-0 mt-0.5', config.iconColor)} />}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide flex-shrink-0', config.badgeClass)}>
                        {config.badgeLabel}
                    </span>
                    {title && <span className={titleClass}>{title}</span>}
                </div>
                <div className={descriptionClass}>{children}</div>
            </div>
        </div>
    );
};

export default DocAlert;
