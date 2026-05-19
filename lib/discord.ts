export interface DiscordPinnedMessage {
    id: string;
    content: string;
    author: {
        username: string;
        global_name: string | null;
    };
    timestamp: string;
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
