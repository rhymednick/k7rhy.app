import React from 'react';

const DISCORD_URL = 'https://discord.com/invite/BuUxCG4W6w';

interface DiscordLinkProps {
    children?: React.ReactNode;
}

export function DiscordLink({ children }: DiscordLinkProps) {
    return (
        <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
            {children ?? 'K7RHY Resonance Lab Discord community'}
        </a>
    );
}
