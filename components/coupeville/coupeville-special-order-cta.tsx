import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';

export function CoupevilleSpecialOrderCta({ className }: { className?: string }) {
    return (
        <div className={cn('rounded-xl border border-border bg-card p-8 text-center', className)}>
            <p className="text-lg font-semibold text-foreground">Built to order</p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">There aren&apos;t any Coupeville instruments listed right now. Each one is built by hand — reach out and I&apos;ll build the voice you want to order.</p>
            <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/contact" className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700">
                    Reach out about a build
                </Link>
                <Link href={siteConfig.links.discord} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
                    Ask in Discord
                </Link>
            </div>
        </div>
    );
}
