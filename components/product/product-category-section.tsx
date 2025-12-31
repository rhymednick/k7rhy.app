import React from 'react';
import { Product, ProductCategory } from '@/types/product';
import { ProductTeaserCard } from './product-teaser-card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface ProductCategorySectionProps {
    category: ProductCategory;
    products: Product[];
    title: string;
    showViewAll?: boolean;
}

export function ProductCategorySection({ category, products, title, showViewAll = true }: ProductCategorySectionProps) {
    if (products.length === 0) {
        return null;
    }

    const categoryUrl = `/products/${category}`;

    return (
        <div className="group flex flex-col">
            <div className="flex items-baseline gap-3 mb-3">
                <Link href={categoryUrl} className="hover:opacity-80 transition-opacity">
                    <h2 className={cn('scroll-m-20 text-xl pb-2 font-bold tracking-tight group-hover:text-primary transition-colors')}>{title}</h2>
                </Link>
                {showViewAll && (
                    <Link href={categoryUrl} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                        <span>View all</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((product) => (
                    <ProductTeaserCard key={product.slug} product={product} category={category} />
                ))}
            </div>
        </div>
    );
}
