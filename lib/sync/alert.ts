/**
 * Sales alerts for the owner, posted to a private Discord channel by the
 * site's existing bot (DISCORD_BOT_TOKEN). Set DISCORD_SALES_CHANNEL_ID to the
 * channel's ID. Without it, alerts go to the server log only.
 */
export async function sendSalesAlert(message: string): Promise<void> {
    const token = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_SALES_CHANNEL_ID;
    console.log(`[sales-alert] ${message}`);
    if (!token || !channelId) {
        return;
    }
    try {
        const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: 'POST',
            headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message.slice(0, 1900), allowed_mentions: { parse: [] } }),
            cache: 'no-store',
        });
        if (!response.ok) {
            console.error(`[sales-alert] Discord returned ${response.status}`);
        }
    } catch (error) {
        console.error('[sales-alert] Could not reach Discord:', error instanceof Error ? error.message : error);
    }
}
