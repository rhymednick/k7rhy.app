'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2 } from 'lucide-react';

type Status = 'checking' | 'available' | 'sold-elsewhere';

const CHECK_TIMEOUT_MS = 4000;

/**
 * Buy button that first asks the server whether the item already sold on
 * Reverb. If the check is slow or fails, the button turns on anyway.
 */
export function ShopBuyButton({ handle, url, categoryHref }: { handle: string; url: string; categoryHref: string }) {
    const [status, setStatus] = useState<Status>('checking');

    useEffect(() => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
        fetch(`/api/shop/availability?handle=${encodeURIComponent(handle)}`, { signal: controller.signal, cache: 'no-store' })
            .then((response) => (response.ok ? response.json() : { status: 'unknown' }))
            .then((body: { status?: string }) => setStatus(body.status === 'sold-elsewhere' ? 'sold-elsewhere' : 'available'))
            .catch(() => setStatus('available'))
            .finally(() => clearTimeout(timeout));
        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [handle]);

    if (status === 'sold-elsewhere') {
        return (
            <p className="text-muted-foreground">
                This one has sold.{' '}
                <Link href={categoryHref} className="font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-300">
                    See what&apos;s available now
                </Link>
                .
            </p>
        );
    }

    const buttonClass = 'inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 sm:w-auto';
    return (
        <div className="space-y-2">
            {status === 'checking' ? (
                <button type="button" disabled className={`${buttonClass} cursor-wait bg-sky-600/60`}>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Checking availability…
                </button>
            ) : (
                <a href={url} className={`${buttonClass} bg-sky-600 hover:bg-sky-700`}>
                    Buy on my Shopify store
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
            )}
            <p className="text-sm text-muted-foreground">Checkout, shipping, and payment are handled at shop.k7rhy.app.</p>
        </div>
    );
}
