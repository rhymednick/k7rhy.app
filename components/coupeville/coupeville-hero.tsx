import React from 'react';

export function CoupevilleHero({ tagline }: { tagline: string }) {
    return (
        <div className="my-8">
            <p className="max-w-2xl text-lg text-muted-foreground">{tagline}</p>
        </div>
    );
}
