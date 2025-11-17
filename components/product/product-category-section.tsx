import React from 'react';
import { Product, ProductCategory } from '@/types/product';
import { ProductTeaserCard } from './product-teaser-card';
import { cn } from '@/lib/utils';

interface ProductCategorySectionProps {
    category: ProductCategory;
    products: Product[];
    title: string;
}

export function ProductCategorySection({
    category,
    products,
    title,
}: ProductCategorySectionProps) {
    if (products.length === 0) {
        return null;
    }

    return (
        <div>
            <h2
                className={cn(
                    'scroll-m-20 text-xl pb-2 font-bold tracking-tight mb-3'
                )}
            >
                {title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((product) => (
                    <ProductTeaserCard
                        key={product.slug}
                        product={product}
                        category={category}
                    />
                ))}
            </div>
        </div>
    );
}

