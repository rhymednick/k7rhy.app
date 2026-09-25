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
        <p className="mt-6 border-l-2 border-indigo-500/50 pl-3 text-sm text-foreground/80">
            {prompt}{' '}
            <Link
                href={channelHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-400 underline underline-offset-2 hover:text-indigo-300"
            >
                Chat in the Discord thread →
            </Link>
        </p>
    );
}
