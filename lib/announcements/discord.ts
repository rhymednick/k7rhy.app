import type { Action } from './model';

// Discord MessageFlags.SuppressEmbeds: keep links clickable without preview cards.
const SUPPRESS_EMBEDS = 1 << 2;

export class DiscordRejection extends Error {}
/** Failed edits are safely repeatable. Ambiguous creates require operator reconciliation. */
export async function deliver(channel: string, action: Action): Promise<string> {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) throw new DiscordRejection('DISCORD_BOT_TOKEN is missing');
    if (action.content.length > 2000) throw new DiscordRejection('Announcement exceeds Discord message limit');
    const response = await fetch(`https://discord.com/api/v10/channels/${channel}/messages${action.kind === 'edit' ? `/${action.target}` : ''}`, {
        method: action.kind === 'edit' ? 'PATCH' : 'POST',
        headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: action.content, flags: SUPPRESS_EMBEDS, allowed_mentions: { parse: [] }, ...(action.kind === 'create' ? { nonce: action.nonce, enforce_nonce: true } : {}) }),
        cache: 'no-store',
        signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) {
        if (response.status >= 400 && response.status < 500) throw new DiscordRejection(`Discord rejected announcement (${response.status})`);
        throw new Error(`Discord delivery uncertain (${response.status}); inspect channel before replay`);
    }
    const data = (await response.json()) as { id?: string };
    if (!data.id || !/^\d+$/.test(data.id)) throw new Error('Discord response missing message ID; inspect channel before replay');
    return data.id;
}
