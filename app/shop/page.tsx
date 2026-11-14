import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PageHero } from '@/components/shared/page-hero';
import { Button } from '@/components/ui/button';
import { ShopProductGrid } from '@/components/shop/shop-product-grid';
import { getAvailableProducts, type ShopProduct } from '@/lib/shop/catalog';
import { shopCategories, type ShopifyCategorySlug } from '@/lib/shop/categories';

export const revalidate = 300;

export const metadata: Metadata = {
    title: 'Shop',
    description: 'Guitars, amplifiers, and ham radio kits from K7RHY Resonance Lab, with live prices and availability from my Shopify store.',
};

function CategoryHeading({ slug, count }: { slug: ShopifyCategorySlug; count: number }) {
    const info = shopCategories[slug];
    return (
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">{info.title}</h3>
                <p className="text-sm text-muted-foreground">{info.description}</p>
            </div>
            {count > 0 && (
                <Link href={`/shop/${slug}`} className="inline-flex items-center gap-1 whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground">
                    View all
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            )}
        </div>
    );
}

function inCategory(products: ShopProduct[], slug: ShopifyCategorySlug) {
    return products.filter((product) => product.category === slug);
}

export default async function ShopPage() {
    const { products, unavailable } = await getAvailableProducts();
    const guitars = inCategory(products, 'guitars');
    const amplifiers = inCategory(products, 'amplifiers');
    const kits = inCategory(products, 'ham-radio-kits');

    return (
        <main className="flex min-h-screen flex-col gap-12 px-4 pb-24 pt-8 md:px-12 lg:px-20">
            <PageHero badge="Shop" title="Kits and instruments ready for builders and players." description="Everything here comes straight from my Shopify store, so prices and availability are always current. Checkout happens at shop.k7rhy.app." />

            <section aria-labelledby="available-instruments" className="mx-auto w-full max-w-6xl space-y-8">
                <h2 id="available-instruments" className="text-2xl font-bold tracking-tight">
                    Guitars and amps available now
                </h2>
                <div>
                    <CategoryHeading slug="guitars" count={guitars.length} />
                    <ShopProductGrid products={guitars} unavailable={unavailable} emptyMessage={shopCategories.guitars.emptyMessage} />
                </div>
                {(amplifiers.length > 0 || unavailable) && (
                    <div>
                        <CategoryHeading slug="amplifiers" count={amplifiers.length} />
                        <ShopProductGrid products={amplifiers} unavailable={unavailable} emptyMessage={shopCategories.amplifiers.emptyMessage} />
                    </div>
                )}
            </section>

            <section aria-labelledby="ham-radio-kits" className="mx-auto w-full max-w-6xl space-y-4">
                <h2 id="ham-radio-kits" className="text-2xl font-bold tracking-tight">
                    Ham radio kits
                </h2>
                <ShopProductGrid products={kits} unavailable={unavailable} emptyMessage={shopCategories['ham-radio-kits'].emptyMessage} />
            </section>

            <section aria-labelledby="coupeville" className="mx-auto w-full max-w-6xl space-y-3">
                <h2 id="coupeville" className="text-2xl font-bold tracking-tight">
                    Coupeville
                </h2>
                <p className="text-muted-foreground">
                    Instruments I build by hand, to order.{' '}
                    <Link href="/guitars/coupeville" className="font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-300">
                        See the Coupeville line and how to order →
                    </Link>
                </p>
                <Button asChild variant="outline" size="sm">
                    <Link href="/shop/coupeville">Coupeville shop</Link>
                </Button>
            </section>
        </main>
    );
}
