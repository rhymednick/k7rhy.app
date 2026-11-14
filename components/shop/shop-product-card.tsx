import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPriceRange, type ShopProduct } from '@/lib/shop/catalog';

export function ShopProductCard({ product }: { product: ShopProduct }) {
    return (
        <Link href={`/shop/${product.category}/${product.handle}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-150 hover:border-sky-500 hover:shadow-[0_2px_10px_rgba(14,165,233,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
            <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-900">{product.image && <Image src={product.image.url} alt={product.image.alt} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />}</div>
            <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="line-clamp-3 text-base font-semibold leading-snug text-foreground">{product.title}</h3>
                <p className="mt-auto text-lg font-bold text-foreground">{formatPriceRange(product)}</p>
            </div>
        </Link>
    );
}
