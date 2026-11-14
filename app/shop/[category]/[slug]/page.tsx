import React from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { ShopProductPage } from '@/components/shop/shop-product-page';
import { fetchCatalog, getShopProduct, type ShopProduct } from '@/lib/shop/catalog';
import { isShopifyCategorySlug } from '@/lib/shop/categories';

export const revalidate = 300;

type ProductRouteProps = {
    params: Promise<{ category: string; slug: string }>;
};

export async function generateStaticParams() {
    try {
        const products = await fetchCatalog();
        return products.filter((product) => product.available).map((product) => ({ category: product.category, slug: product.handle }));
    } catch {
        // Shopify unreachable at build time: pages render on first request instead.
        return [];
    }
}

async function loadProduct(category: string, slug: string): Promise<ShopProduct | null> {
    if (!isShopifyCategorySlug(category)) {
        return null;
    }
    return getShopProduct(slug);
}

export async function generateMetadata({ params }: ProductRouteProps): Promise<Metadata> {
    const { category, slug } = await params;
    const product = await loadProduct(category, slug);
    if (!product) {
        return {};
    }
    return {
        title: `${product.title} | Shop`,
        openGraph: product.image ? { images: [{ url: product.image.url, alt: product.image.alt }] } : undefined,
        // Sold one-offs stay reachable for old links but drop out of search.
        robots: product.available ? undefined : { index: false, follow: true },
    };
}

export default async function ProductRoute({ params }: ProductRouteProps) {
    const { category, slug } = await params;
    const product = await loadProduct(category, slug);

    if (!product) {
        notFound();
    }
    if (product.category !== category) {
        permanentRedirect(`/shop/${product.category}/${product.handle}`);
    }

    return <ShopProductPage product={product} />;
}
