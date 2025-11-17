import React from 'react';
import { notFound } from 'next/navigation';
import { ProductPage } from '@/components/product/product-page';
import { ProductCategory } from '@/types/product';
import { getProduct, getAllProducts } from '@/config/products';

type ProductPageRouteProps = {
    params: Promise<{
        category: string;
        slug: string;
    }>;
};

export async function generateStaticParams() {
    // Generate static params for all products
    const allProducts = getAllProducts();
    return allProducts.map((product) => ({
        category: product.category,
        slug: product.slug,
    }));
}

export default async function Page({ params }: ProductPageRouteProps) {
    const { category, slug } = await params;

    // Validate category
    if (!Object.values(ProductCategory).includes(category as ProductCategory)) {
        notFound();
    }

    // Load product config
    const product = getProduct(category as ProductCategory, slug);

    if (!product) {
        notFound();
    }

    // Ensure the product matches the category
    if (product.category !== category) {
        notFound();
    }

    return <ProductPage product={product} />;
}

