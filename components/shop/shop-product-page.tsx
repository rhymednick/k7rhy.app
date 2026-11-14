import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatPriceRange, type ShopProduct } from '@/lib/shop/catalog';
import { shopCategories } from '@/lib/shop/categories';
import { ShopGallery } from './shop-gallery';

export function ShopProductPage({ product }: { product: ShopProduct }) {
    const category = shopCategories[product.category];

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 pb-24 pt-8 md:px-8">
            <Link href={`/shop/${product.category}`} className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                {category.title}
            </Link>

            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                <ShopGallery images={product.images} />

                <section aria-labelledby="product-title" className="space-y-5 lg:sticky lg:top-24">
                    <div className="space-y-3">
                        <Badge variant="secondary">{category.title}</Badge>
                        <h1 id="product-title" className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                            {product.title}
                        </h1>
                        {product.available ? <p className="text-2xl font-bold text-foreground">{formatPriceRange(product)}</p> : <p className="text-lg font-semibold text-muted-foreground">Sold</p>}
                    </div>

                    {product.available && product.variants.length > 0 && (
                        <ul className="divide-y divide-border rounded-xl border border-border text-sm">
                            {product.variants.map((variant) => (
                                <li key={variant.title} className="flex items-center justify-between gap-4 px-4 py-3">
                                    <span className={variant.available ? 'text-foreground' : 'text-muted-foreground'}>{variant.title}</span>
                                    <span className={variant.available ? 'font-semibold text-foreground' : 'text-muted-foreground'}>{variant.available ? formatPrice(variant.price, product.currency) : 'Sold out'}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {product.available ? (
                        <div className="space-y-2">
                            <a href={product.url} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 sm:w-auto">
                                Buy on my Shopify store
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            </a>
                            <p className="text-sm text-muted-foreground">Checkout, shipping, and payment are handled at shop.k7rhy.app.</p>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">
                            This one has found a home.{' '}
                            <Link href={`/shop/${product.category}`} className="font-medium text-sky-700 underline-offset-4 hover:underline dark:text-sky-300">
                                See what&apos;s available now
                            </Link>
                            .
                        </p>
                    )}
                </section>
            </div>

            {product.descriptionHtml && (
                <section aria-label="Description" className="max-w-3xl">
                    <div className="shop-description" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
                </section>
            )}
        </main>
    );
}
