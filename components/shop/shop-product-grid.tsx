import React from 'react';
import Link from 'next/link';
import type { ShopProduct } from '@/lib/shop/catalog';
import { ShopProductCard } from './shop-product-card';

export const SHOPIFY_STOREFRONT_URL = 'https://shop.k7rhy.app';

interface ShopProductGridProps {
    products: ShopProduct[];
    unavailable: boolean;
    emptyMessage: string;
}

export function ShopProductGrid({ products, unavailable, emptyMessage }: ShopProductGridProps) {
    if (unavailable) {
        return (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">
                    I couldn&apos;t load the listings just now. You can browse everything on{' '}
                    <Link href={SHOPIFY_STOREFRONT_URL} className="font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-300">
                        shop.k7rhy.app
                    </Link>
                    .
                </p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
                <ShopProductCard key={product.handle} product={product} />
            ))}
        </div>
    );
}
