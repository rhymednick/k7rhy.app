import React from 'react';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ProductCategory } from '@/types/product';
import { getProductsByCategory } from '@/config/products';
import { ProductTeaserCard } from '@/components/product/product-teaser-card';
import { Badge } from '@/components/ui/badge';
import { Guitar, Radio } from 'lucide-react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

type CategoryPageProps = {
    params: Promise<{
        category: string;
    }>;
};

// Map category slugs to display info
const categoryInfo: Record<
    ProductCategory,
    {
        title: string;
        icon: React.ComponentType<{ className?: string }>;
        description?: string;
        gradientFrom: string;
        gradientTo: string;
        blurFrom: string;
        blurTo: string;
        iconGradientFrom: string;
        iconGradientTo: string;
        darkGradientFrom: string;
        darkGradientTo: string;
        darkBlurFrom: string;
        darkBlurTo: string;
    }
> = {
    [ProductCategory.GUITARS]: {
        title: 'Guitars',
        icon: Guitar,
        description: '3D-printed electric guitars built with engineering-grade materials',
        gradientFrom: 'from-blue-100/50',
        gradientTo: 'to-purple-100/50',
        blurFrom: 'bg-blue-400/20',
        blurTo: 'bg-purple-400/20',
        iconGradientFrom: 'from-blue-500',
        iconGradientTo: 'to-purple-600',
        darkGradientFrom: 'dark:from-blue-900/10',
        darkGradientTo: 'dark:to-purple-900/10',
        darkBlurFrom: 'dark:bg-blue-500/10',
        darkBlurTo: 'dark:bg-purple-500/10',
    },
    [ProductCategory.HAM_RADIO_KITS]: {
        title: 'Ham Radio Kits',
        icon: Radio,
        description: 'Electronics kits for amateur radio operators',
        gradientFrom: 'from-amber-100/50',
        gradientTo: 'to-orange-100/50',
        blurFrom: 'bg-amber-400/20',
        blurTo: 'bg-orange-400/20',
        iconGradientFrom: 'from-amber-500',
        iconGradientTo: 'to-orange-600',
        darkGradientFrom: 'dark:from-amber-900/10',
        darkGradientTo: 'dark:to-orange-900/10',
        darkBlurFrom: 'dark:bg-amber-500/10',
        darkBlurTo: 'dark:bg-orange-500/10',
    },
};

export async function generateStaticParams() {
    return Object.values(ProductCategory).map((category) => ({
        category,
    }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { category } = await params;

    // Validate category
    if (!Object.values(ProductCategory).includes(category as ProductCategory)) {
        notFound();
    }

    const categoryEnum = category as ProductCategory;
    const products = getProductsByCategory(categoryEnum);
    const info = categoryInfo[categoryEnum];
    const Icon = info.icon;

    return (
        <main className="flex min-h-screen flex-col justify-between pl-4 pr-4 pt-4 md:pl-24 md:pr-24 md:pt-12">
            <div className="space-y-6">
                {/* Back link */}
                <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                    Back to All Products
                </Link>

                {/* Category Header */}
                <div className="relative isolate overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-slate-50 via-white to-slate-50 px-6 py-8 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:from-slate-950/70 dark:via-slate-900/50 dark:to-slate-950/70 dark:ring-white/10">
                    <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${info.gradientFrom} via-transparent ${info.gradientTo} ${info.darkGradientFrom} ${info.darkGradientTo}`} />
                    <div className={`absolute -right-20 top-0 -z-10 h-64 w-64 rounded-full ${info.blurFrom} ${info.darkBlurFrom} blur-3xl`} />
                    <div className={`absolute -left-20 bottom-0 -z-10 h-64 w-64 rounded-full ${info.blurTo} ${info.darkBlurTo} blur-3xl`} />
                    <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${info.iconGradientFrom} ${info.iconGradientTo} shadow-lg`}>
                            <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className={cn('scroll-m-20 text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300')}>{info.title}</h1>
                            {info.description && <p className="mt-2 text-muted-foreground">{info.description}</p>}
                            <Badge variant="secondary" className="mt-2">
                                {products.length} Product
                                {products.length !== 1 ? 's' : ''}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map((product) => (
                            <ProductTeaserCard key={product.slug} product={product} category={categoryEnum} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-border bg-card p-8 text-center">
                        <p className="text-muted-foreground">No products available in this category yet.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
