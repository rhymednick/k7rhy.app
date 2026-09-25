import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { fetchPinnedMessages } from '@/lib/discord';

interface DiscordCommunityCalloutProps {
    threadId?: string;
    channelHref?: string;
    message?: string;
    className?: string;
}

export async function DiscordCommunityCallout({
    threadId,
    channelHref,
    message = 'Ask questions and share your build with other builders.',
    className,
}: DiscordCommunityCalloutProps) {
    const pins = threadId ? await fetchPinnedMessages(threadId) : [];
    const serverHref = siteConfig.links.discord;
    const discussHref = channelHref ?? serverHref;
    const hasPins = pins.length > 0;
    const showJoinLink = hasPins && discussHref !== serverHref;

    return (
        <div
            className={`my-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5 ${className ?? ''}`}
        >
            {hasPins ? (
                <>
                    <p className="font-semibold text-foreground">From the community</p>
                    <ul className="mt-3 space-y-4">
                        {pins.map((pin) => (
                            <li key={pin.id} className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground/80">
                                    {pin.author.global_name ?? pin.author.username}:{' '}
                                </span>
                                {pin.content}
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <>
                    <p className="font-semibold text-foreground">Join the community</p>
                    <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                </>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
                <Link
                    href={discussHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                >
                    {hasPins ? 'Ask a question →' : 'Open Discord →'}
                </Link>
                {showJoinLink && (
                    <Link
                        href={serverHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-lg border border-indigo-500/30 px-4 py-2 text-sm font-medium text-indigo-400 transition-colors hover:bg-indigo-500/10"
                    >
                        Join the server →
                    </Link>
                )}
            </div>
        </div>
    );
}
