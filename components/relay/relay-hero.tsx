import React from 'react';

interface RelayHeroProps {
    tagline: string;
}

export function RelayHero({ tagline }: RelayHeroProps) {
    return (
        <div className="my-8">
            <p className="max-w-2xl text-lg text-muted-foreground">{tagline}</p>
        </div>
    );
}
