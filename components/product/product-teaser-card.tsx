import React from 'react';
import { Product, ProductImage } from '@/types/product';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductTeaserCardProps {
    product: Product;
    category: string;
}

export function ProductTeaserCard({ product, category }: ProductTeaserCardProps) {
    // Handle both string array and ProductImage array formats
    const firstImage = product.images[0];
    const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.src || '/images/placeholder.jpg';
    const imageAlt = typeof firstImage === 'string' ? product.name : firstImage?.alt || product.name;

    return (
        <Link href={`/products/${category}/${product.slug}`}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-4">
                    <div className="flex gap-3">
                        <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-md">
                            <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold mb-1 line-clamp-2">{product.name}</CardTitle>
                            <CardDescription className="text-sm line-clamp-2 mb-2">{product.description}</CardDescription>
                            {product.price && <div className="text-base font-bold">${product.price.toLocaleString()}</div>}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
