export interface DiscordPinnedMessage {
    id: string;
    content: string;
    author: {
        username: string;
        global_name: string | null;
    };
    timestamp: string;
}

export interface DiscordAnnouncement extends DiscordPinnedMessage {}

export type DiscordAnnouncementsResult = { status: 'available'; messages: DiscordAnnouncement[] } | { status: 'unavailable'; messages: [] };

export type DiscordMessageSegment = { kind: 'text' | 'link'; value: string };

export async function fetchRecentAnnouncements(channelId: string, limit = 10): Promise<DiscordAnnouncementsResult> {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) return { status: 'unavailable', messages: [] };

    const boundedLimit = Math.min(Math.max(limit, 1), 20);

    try {
        const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages?limit=${boundedLimit}`, {
            headers: {
                Authorization: `Bot ${token}`,
            },
            next: { revalidate: 300 },
        });

        if (!response.ok) return { status: 'unavailable', messages: [] };
        return { status: 'available', messages: await response.json() };
    } catch {
        return { status: 'unavailable', messages: [] };
    }
}

export function splitDiscordMessageContent(content: string): DiscordMessageSegment[] {
    const segments: DiscordMessageSegment[] = [];
    const linkPattern = /https?:\/\/[^\s]+/g;
    let cursor = 0;

    for (const match of content.matchAll(linkPattern)) {
        const index = match.index ?? 0;
        if (index > cursor) segments.push({ kind: 'text', value: content.slice(cursor, index) });
        segments.push({ kind: 'link', value: match[0] });
        cursor = index + match[0].length;
    }

    if (cursor < content.length) segments.push({ kind: 'text', value: content.slice(cursor) });
    return segments;
}

export async function fetchPinnedMessages(threadId: string): Promise<DiscordPinnedMessage[]> {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) return [];

    try {
        const res = await fetch(`https://discord.com/api/v10/channels/${threadId}/pins`, {
            headers: {
                Authorization: `Bot ${token}`,
            },
            next: { revalidate: 300 },
        });

        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}
