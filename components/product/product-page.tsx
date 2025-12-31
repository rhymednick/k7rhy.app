import React from 'react';
import { Product, Guitar, ProductCategory } from '@/types/product';
import { GuitarPage } from './guitar-page';
import { HamRadioKitPage } from './ham-radio-kit-page';

interface ProductPageProps {
    product: Product;
    Description?: React.ComponentType;
}

export function ProductPage({ product, Description }: ProductPageProps) {
    // Route to specialized page components based on category
    if (product.category === ProductCategory.GUITARS) {
        return <GuitarPage guitar={product as Guitar} Description={Description} />;
    }

    if (product.category === ProductCategory.HAM_RADIO_KITS) {
        return <HamRadioKitPage product={product} Description={Description} />;
    }

    // Fallback generic page (shouldn't happen with current categories)
    return null;
}
