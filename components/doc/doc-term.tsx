'use client';

import React from 'react';
import { glossary } from '@/config/glossary';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';

export interface DocTermProps {
    id: string;
    children?: React.ReactNode;
}

export function DocTerm({ id, children }: DocTermProps) {
    const entry = glossary[id];

    // Unknown id: render as plain text — no crash, no hover UI
    if (!entry) {
        return <>{children ?? id}</>;
    }

    const displayText = children ?? entry.label;

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <span className="cursor-help border-b border-dotted border-current">{displayText}</span>
            </HoverCardTrigger>
            <HoverCardContent className="w-72 text-sm leading-relaxed">{entry.content}</HoverCardContent>
        </HoverCard>
    );
}
