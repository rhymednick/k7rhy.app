// app/products/page.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { ProductCategory } from '@/types/product';
import { getProductsByCategory } from '@/config/products';
import { ProductCategorySection } from '@/components/product/product-category-section';
import Link from 'next/link';

export default function ProductsPage() {
    const guitars = getProductsByCategory(ProductCategory.GUITARS);
    const hamRadioKits = getProductsByCategory(ProductCategory.HAM_RADIO_KITS);

    return (
        <main className="flex min-h-screen flex-col justify-between pl-4 pr-4 pt-4 md:pl-24 md:pr-24 md:pt-12">
            <div className="space-y-4">
                <h1 className={cn('scroll-m-20 text-3xl pb-2 font-bold tracking-tight')}>Products</h1>

                {/* Categories side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Ham Radio Kits Section */}
                    <ProductCategorySection category={ProductCategory.HAM_RADIO_KITS} products={hamRadioKits} title="Ham Radio Kits" />

                    {/* Guitars Section */}
                    <ProductCategorySection category={ProductCategory.GUITARS} products={guitars} title="Guitars" />
                </div>

                <div className="pt-4">
                    <div className="flex items-baseline gap-3 mb-3">
                        <Link href="/products/coupeville" className="hover:opacity-80 transition-opacity">
                            <h2 className={cn('scroll-m-20 text-xl pb-2 font-bold tracking-tight')}>Coupeville</h2>
                        </Link>
                    </div>
                    <p className="text-sm text-muted-foreground">Instruments I build by hand. <Link href="/products/coupeville" className="font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-300">See the Coupeville line and how to order →</Link></p>
                </div>
            </div>
        </main>
    );
}
