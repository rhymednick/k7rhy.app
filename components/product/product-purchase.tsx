import React from 'react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface ProductPurchaseProps {
    product: Product;
}

export function ProductPurchase({ product }: ProductPurchaseProps) {
    if (!product.price && !product.purchaseLink) {
        return null;
    }

    return (
        <div className="flex items-center gap-4">
            {product.price && (
                <span className="text-2xl font-bold">
                    ${product.price.toLocaleString()}
                </span>
            )}
            {product.purchaseLink && (
                <Button
                    asChild
                    variant="default"
                >
                    <Link
                        target="_blank"
                        href={product.purchaseLink}
                    >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Buy Now
                    </Link>
                </Button>
            )}
        </div>
    );
}

