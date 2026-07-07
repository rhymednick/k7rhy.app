export const RELAY_DISCORD_SERVER_ID = '1432214244459417693';

export const relayDiscordVoicingChannelId = '1523931332428828723';

export const relayDiscordVoicingThreads = {
    lipstick: '1523931871531110440',
    arc: '1523931607126376570',
    torch: '1523931995607007273',
    velvet: '1523932118407843971',
} as const;

export type RelayDiscordVoicingThreadSlug = keyof typeof relayDiscordVoicingThreads;

export function relayDiscordChannelHref(channelOrThreadId: string): string {
    return `https://discord.com/channels/${RELAY_DISCORD_SERVER_ID}/${channelOrThreadId}`;
}

export const relayDiscordVoicingChannelHref = relayDiscordChannelHref(relayDiscordVoicingChannelId);

/** Resolves the voicing forum thread for a slug, or the parent channel when no thread exists yet. */
export function getRelayVoicingDiscordTarget(slug: string): { threadId: string; channelHref: string } {
    const threadId = slug in relayDiscordVoicingThreads ? relayDiscordVoicingThreads[slug as RelayDiscordVoicingThreadSlug] : relayDiscordVoicingChannelId;

    return {
        threadId,
        channelHref: relayDiscordChannelHref(threadId),
    };
}
