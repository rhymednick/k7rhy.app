import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RelayDiscordCtaProps {
    channelHref?: string;
    message?: string;
    className?: string;
}

export function RelayDiscordCta({
    channelHref = 'https://discord.gg/BuUxCG4W6w',
    message = 'Ask questions, share your build, and follow development as the guides are written.',
    className,
}: RelayDiscordCtaProps) {
    return (
        <div
            className={cn(
                'my-6 flex flex-col gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5 sm:flex-row sm:items-center sm:justify-between',
                className,
            )}
        >
            <div>
                <p className="font-semibold text-foreground">Join the community</p>
                <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            </div>
            <Link
                href={channelHref}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
                Open Discord →
            </Link>
        </div>
    );
}
