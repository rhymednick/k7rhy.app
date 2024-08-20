import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import * as lucideIcons from "lucide-react"
import { cn } from '@/lib/utils';

export enum Level {
    Default = "default",
    Important = "important",
    Warning = "warning",
    Critical = "critical",
    Question = "question",
    Choice = "choice",
}


export interface DocAlertProps {
    title?: string
    level?: Level
    icon?: keyof typeof lucideIcons
    overrideTitleClass?: string
    overrideDescriptionClass?: string
    appendTitleClass?: string
    appendDescriptionClass?: string
    children?: React.ReactNode | string
}

const DocAlert: React.FC<DocAlertProps> = ({ ...props }) => {

    // Pick the correct icon
    if (!props.icon) {
        switch (props.level) {
            case Level.Important:
                props.icon = "Info"
                break
            case Level.Warning:
                props.icon = "AlertTriangle"
                break
            case Level.Critical:
                props.icon = "Ban"
                break
            case Level.Question:
                props.icon = "CircleHelp"
                break
            case Level.Choice:
                props.icon = "ArrowLeftRight"
                break
            case Level.Default:
                props.icon = "Terminal"
                break;
            default:
            //don't set a new value - keep it empty - no icon
        }

    }

    const titleColor = {
        [Level.Important]: "text-blue-500",
        [Level.Warning]: "text-yellow-500",
        [Level.Critical]: "text-red-500",
        [Level.Question]: "text-purple-500",
        [Level.Choice]: "text-green-500",
        [Level.Default]: "text-gray-900 dark:text-slate-200",
    }


    const titleClass = (props.overrideTitleClass) ?
        props.overrideTitleClass :
        `${titleColor[props.level || Level.Default]} ${props.appendTitleClass}`

    const descriptionClass = (props.overrideDescriptionClass) ?
        props.overrideDescriptionClass :
        `prose ${props.appendDescriptionClass}`

    const IconComponent = props.icon ? lucideIcons[props.icon] : null;

    const Placeholder = lucideIcons["Terminal"]

    return (
        <Alert>
            {IconComponent ? (
                <IconComponent className="mr-2 h-4 w-4" />
            ) : (
                // Placeholder to maintain formatting
                <Placeholder className="mr-2 h-4 w-4 invisible" />
            )}
            <AlertTitle className={titleClass}>
                {props.title}
            </AlertTitle>
            <AlertDescription className={descriptionClass}>
                {props.children}
            </AlertDescription>
        </Alert>
    )
}
export default DocAlert