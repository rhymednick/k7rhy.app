import type { DiscordAnnouncementsResult } from '@/lib/discord';
import { splitDiscordMessageContent } from '@/lib/discord';

interface AnnouncementFeedProps {
    result: DiscordAnnouncementsResult;
}

function formatAnnouncementDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

export function AnnouncementFeed({ result }: AnnouncementFeedProps) {
    if (result.status === 'unavailable') {
        return <p className="rounded-xl border border-border/60 bg-muted/30 p-5 text-sm text-muted-foreground">Announcements are temporarily unavailable.</p>;
    }

    if (result.messages.length === 0) {
        return <p className="rounded-xl border border-border/60 bg-muted/30 p-5 text-sm text-muted-foreground">No announcements yet.</p>;
    }

    return (
        <div className="space-y-4">
            {result.messages.map((message) => (
                <article key={message.id} className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                    <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-semibold text-foreground">{message.author.global_name ?? message.author.username}</h3>
                        <time dateTime={message.timestamp} className="text-xs text-muted-foreground">
                            {formatAnnouncementDate(message.timestamp)}
                        </time>
                    </header>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {splitDiscordMessageContent(message.content).map((segment, index) =>
                            segment.kind === 'link' ? (
                                <a key={`${message.id}-${index}`} href={segment.value} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
                                    {segment.value}
                                </a>
                            ) : (
                                segment.value
                            )
                        )}
                    </p>
                </article>
            ))}
        </div>
    );
}
