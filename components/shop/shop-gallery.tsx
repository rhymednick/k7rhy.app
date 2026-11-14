'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ShopImage } from '@/lib/shop/catalog';

export function ShopGallery({ images }: { images: ShopImage[] }) {
    const [selected, setSelected] = useState(0);

    if (images.length === 0) {
        return null;
    }

    const current = images[Math.min(selected, images.length - 1)];

    return (
        <div className="space-y-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border/60 bg-slate-100 dark:bg-slate-900">
                <Image src={current.url} alt={current.alt} fill priority className="object-contain" sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
            {images.length > 1 && (
                <ul className="grid grid-cols-5 gap-2 sm:grid-cols-6" aria-label="Photos">
                    {images.map((image, index) => (
                        <li key={image.url}>
                            <button type="button" onClick={() => setSelected(index)} aria-label={`Show photo ${index + 1}: ${image.alt}`} aria-current={index === selected} className={cn('relative block aspect-square w-full overflow-hidden rounded-lg border bg-slate-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:bg-slate-900', index === selected ? 'border-sky-500 ring-1 ring-sky-500' : 'border-border/60 hover:border-sky-400')}>
                                <Image src={image.url} alt="" fill className="object-cover" sizes="96px" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
