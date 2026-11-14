import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { CoupevilleSpecialOrderCta } from '@/components/coupeville/coupeville-special-order-cta';
import { ShopProductGrid } from '@/components/shop/shop-product-grid';
import { getAvailableProducts } from '@/lib/shop/catalog';
import { isShopCategorySlug, SHOP_CATEGORY_SLUGS, shopCategories, type ShopifyCategorySlug } from '@/lib/shop/categories';

export const revalidate = 300;
export const dynamicParams = false;

type CategoryPageProps = {
    params: Promise<{ category: string }>;
};

export function generateStaticParams() {
    return SHOP_CATEGORY_SLUGS.map((category) => ({ category }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { category } = await params;
    if (!isShopCategorySlug(category)) {
        return {};
    }
    const info = shopCategories[category];
    return { title: `${info.title} | Shop`, description: info.description };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { category } = await params;
    if (!isShopCategorySlug(category)) {
        notFound();
    }

    const info = shopCategories[category];

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 pb-24 pt-8 md:px-8">
            <Link href="/shop" className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Back to Shop
            </Link>

            <header className="relative isolate overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-sky-50 via-white to-emerald-50 px-6 py-8 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:ring-white/10">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{info.title}</h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">{info.description}</p>
            </header>

            {category === 'coupeville' ? <CoupevilleSpecialOrderCta /> : <CategoryProducts category={category} emptyMessage={info.emptyMessage} />}
        </main>
    );
}

async function CategoryProducts({ category, emptyMessage }: { category: ShopifyCategorySlug; emptyMessage: string }) {
    const { products, unavailable } = await getAvailableProducts(category);
    return <ShopProductGrid products={products} unavailable={unavailable} emptyMessage={emptyMessage} />;
}
