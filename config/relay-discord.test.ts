import { describe, expect, it } from 'vitest';
import { getRelayVoicingDiscordTarget, relayDiscordChannelHref, relayDiscordVoicingChannelHref, relayDiscordVoicingChannelId } from '@/config/relay-discord';

describe('getRelayVoicingDiscordTarget', () => {
    it('maps ready voicings with threads to their forum thread', () => {
        expect(getRelayVoicingDiscordTarget('lipstick')).toEqual({
            threadId: '1523931871531110440',
            channelHref: 'https://discord.com/channels/1432214244459417693/1523931871531110440',
        });
        expect(getRelayVoicingDiscordTarget('velvet').threadId).toBe('1523932118407843971');
        expect(getRelayVoicingDiscordTarget('arc').threadId).toBe('1523931607126376570');
        expect(getRelayVoicingDiscordTarget('torch').threadId).toBe('1523931995607007273');
    });

    it('falls back to the voicing forum channel for voicings without a thread', () => {
        for (const slug of ['reef', 'current', 'hammer']) {
            expect(getRelayVoicingDiscordTarget(slug)).toEqual({
                threadId: relayDiscordVoicingChannelId,
                channelHref: relayDiscordVoicingChannelHref,
            });
        }
    });
});

describe('relayDiscordChannelHref', () => {
    it('builds a Discord channel URL from the Relay server id', () => {
        expect(relayDiscordChannelHref('123')).toBe('https://discord.com/channels/1432214244459417693/123');
    });
});
