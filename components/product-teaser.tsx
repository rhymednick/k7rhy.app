// components/product-teaser.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShopifyProduct } from '@/types/shopify';

interface ProductTeaserProps {
    product: ShopifyProduct;
}

const ProductTeaser: React.FC<ProductTeaserProps> = ({ product }) => {
    return (
        <Link
            href={`/products/${product.handle}`}
            passHref
        >
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        {product.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Image
                        src={product.images[0]?.src}
                        alt={product.images[0]?.altText || 'Product image'}
                        width={300}
                        height={300}
                        className="rounded-md"
                    />
                </CardContent>
            </Card>
        </Link>
    );
};

export default ProductTeaser;
