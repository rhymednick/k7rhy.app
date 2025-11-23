import { siteConfig } from '@/config/site';
import { buildMetadata } from '@/lib/version';
import React from 'react';

export function SiteFooter() {
    const buildTimestampLabel = buildMetadata.buildTimeUTC ?? 'unknown time';
    const currentYear = new Date().getFullYear();
    const copyrightYear = currentYear > 2024 ? `2024–${currentYear}` : '2024';
    return (
        <footer className="py-6 md:px-8 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-2 md:h-24 md:flex-row md:gap-4">
                <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                    Built by{' '}
                    <a
                        href={siteConfig.links.discord || siteConfig.links.github}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium underline underline-offset-4"
                    >
                        K7RHY
                    </a>{' '}
                    using Next.js and shadcn. Copyright {copyrightYear}. All
                    rights reserved.
                </p>
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-right">
                    Version{' '}
                    {buildMetadata.commitUrl ? (
                        <a
                            href={buildMetadata.commitUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium underline underline-offset-4"
                        >
                            {buildMetadata.shortCommitHash}
                        </a>
                    ) : (
                        buildMetadata.shortCommitHash
                    )}{' '}
                    built {buildTimestampLabel} UTC
                    {!buildMetadata.isPublicBuild && ' (local build)'}
                </p>
            </div>
        </footer>
    );
}
