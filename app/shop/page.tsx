import React from 'react';
import Link from 'next/link';
import { ProductCategory } from '@/types/product';
import { getProductsByCategory } from '@/config/products';
import { ProductCategorySection } from '@/components/product/product-category-section';
import { PageHero } from '@/components/shared/page-hero';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export default function ShopPage() {
    const guitars = getProductsByCategory(ProductCategory.GUITARS);
    const hamRadioKits = getProductsByCategory(ProductCategory.HAM_RADIO_KITS);

    return (
        <main className="flex min-h-screen flex-col gap-10 px-4 pb-24 pt-8 md:px-12 lg:px-20">
            <PageHero badge="Shop" title="Kits and instruments ready for builders and players." description="Browse by subject. Checkout and inventory live on Shopify; this catalog presents what is available now." />

            <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2">
                <ProductCategorySection category={ProductCategory.HAM_RADIO_KITS} products={hamRadioKits} title="Ham Radio Kits" />

                <div className="space-y-10">
                    <ProductCategorySection category={ProductCategory.GUITARS} products={guitars} title="Guitars" />

                    <div className="group flex flex-col">
                        <div className="mb-3 flex items-baseline gap-3">
                            <Link href="/shop/coupeville" className="hover:opacity-80 transition-opacity">
                                <h2 className={cn('scroll-m-20 pb-2 text-xl font-bold tracking-tight transition-colors group-hover:text-primary')}>Coupeville</h2>
                            </Link>
                            <Link href="/shop/coupeville" className="flex items-center gap-1 whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground">
                                <span>View all</span>
                                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Instruments I build by hand.{' '}
                            <Link href="/guitars/coupeville" className="font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-300">
                                See the Coupeville line and how to order →
                            </Link>
                        </p>
                        <div className="mt-4">
                            <Button asChild variant="outline" size="sm">
                                <Link href="/shop/coupeville">Coupeville shop</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
