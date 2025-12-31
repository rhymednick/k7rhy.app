import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

const selectIcon = (level?: Level): keyof typeof lucideIcons => {
    switch (level) {
        case Level.Important:
            return 'Info';
        case Level.Warning:
            return 'AlertTriangle';
        case Level.Critical:
            return 'Ban';
        case Level.Question:
            return 'HelpCircle'; // Updated to a correct icon name
        case Level.Choice:
            return 'ArrowLeftRight';
        case Level.Default:
        default:
            return 'Terminal';
    }
};

const DocAlert: React.FC<DocAlertProps> = ({ title, level = Level.Default, icon, overrideTitleClass, appendTitleClass, overrideDescriptionClass, appendDescriptionClass, children }) => {
    const iconName = icon || selectIcon(level);
    const IconComponent = lucideIcons[iconName] as React.ElementType; // Ensure the component is treated as a valid React component
    const Placeholder = lucideIcons['Terminal'] as React.ElementType; // Ensure the placeholder is treated as a valid React component

    const titleColor = {
        [Level.Important]: 'text-blue-500',
        [Level.Warning]: 'text-yellow-500',
        [Level.Critical]: 'text-red-500',
        [Level.Question]: 'text-purple-500',
        [Level.Choice]: 'text-green-500',
        [Level.Default]: 'text-gray-900 dark:text-slate-200',
    };

    const titleClass = overrideTitleClass ? overrideTitleClass : `mb-2 ${titleColor[level]} ${appendTitleClass || ''}`;

    const descriptionClass = overrideDescriptionClass ? overrideDescriptionClass : `prose space-y-2 ${appendDescriptionClass || ''}`;

    return (
        <Alert>
            {IconComponent ? <IconComponent className="mr-2 h-4 w-4" /> : <Placeholder className="mr-2 h-4 w-4 invisible" />}
            <div>
                <AlertTitle className={titleClass}>{title}</AlertTitle>
                <AlertDescription>
                    <div className={descriptionClass}>{children}</div>
                </AlertDescription>
            </div>
        </Alert>
    );
};

export default DocAlert;
