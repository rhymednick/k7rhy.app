import React from 'react';

export interface GlossaryEntry {
    label: string;
    content: React.ReactNode;
}

export const glossary: Record<string, GlossaryEntry> = {
    gfs: {
        label: 'GFS',
        content: <>I&apos;m recommending GFS pickups because of the quality for the price, but any pickups with matching specs could be used.</>,
    },
};
