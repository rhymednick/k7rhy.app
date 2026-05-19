import React from 'react';
import Link from 'next/link';

interface DiscordThreadNudgeProps {
    channelHref: string;
    prompt?: string;
}

export function DiscordThreadNudge({
    channelHref,
    prompt = 'Questions while you work?',
}: DiscordThreadNudgeProps) {
    return (
        <p className="text-sm text-muted-foreground">
            {prompt}{' '}
            <Link
                href={channelHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300"
            >
                Chat in the Discord thread →
            </Link>
        </p>
    );
}
