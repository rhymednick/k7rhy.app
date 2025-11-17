import React from 'react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink, ShoppingCart } from 'lucide-react';

interface ProductPurchaseProps {
    product: Product;
}

export function ProductPurchase({ product }: ProductPurchaseProps) {
    if (!product.price && !product.purchaseLink) {
        return null;
    }

    return (
        <div className="flex flex-col items-end gap-2 md:flex-row md:items-center md:gap-4">
            {product.price && (
                <div className="text-right">
                    <div className="text-sm text-muted-foreground">Price</div>
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        ${product.price.toLocaleString()}
                    </span>
                </div>
            )}
            {product.purchaseLink && (
                <Button
                    asChild
                    variant="default"
                    size="lg"
                    className="shadow-lg hover:shadow-xl transition-shadow"
                >
                    <Link
                        target="_blank"
                        href={product.purchaseLink}
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Buy Now
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            )}
        </div>
    );
}

