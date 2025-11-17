import React from 'react';
import { Product, ProductCategory, ProductImage, ProductConfig } from '@/types/product';
import { Balancer } from 'react-wrap-balancer';

// Product metadata
const product: Product = {
    slug: 'dummy-load-20w-bnc',
    name: '20W Dummy Load Kit (BNC)',
    category: ProductCategory.HAM_RADIO_KITS,
    description: "Unleash the full potential of your ham radio setup with our 20W Dummy Load Kit, designed for both novice and experienced operators. Whether you're testing, adjusting, or simply experimenting with your equipment, this kit provides the perfect solution for ensuring your transmitter is optimally configured without transmitting signals on the air. The kit is shipped unassembled and without an enclosure.",
    images: [
        {
            src: '/images/dl20w_bnc/FinishedBoard.png',
            description: 'Finished assembled board',
            alt: '20W Dummy Load finished board',
        },
        {
            src: '/images/dl20w_bnc/KitComponents.jpg',
            description: 'Kit components included',
            alt: '20W Dummy Load kit components',
        },
        {
            src: '/images/dl20w_bnc/PowerProbe.jpg',
            description: 'Power measurement probe',
            alt: '20W Dummy Load power probe',
        },
    ] as ProductImage[],
    price: 12.95,
    purchaseLink: 'https://ca0f39-2e.myshopify.com/products/20w-dummy-load-kit?utm_source=copyToPasteBoard&utm_medium=product-links&utm_content=web',
    relatedBlogTag: 'product',
};

// Description component with full formatting flexibility
export function Description() {
    return (
        <div className="text-base text-muted-foreground space-y-4">
            <Balancer>
                <p>
                    Unleash the full potential of your ham radio setup with our 20W Dummy Load Kit, designed for both novice and experienced operators. Whether you're testing, adjusting, or simply experimenting with your equipment, this kit provides the perfect solution for ensuring your transmitter is optimally configured without transmitting signals on the air.
                </p>
            </Balancer>
            
            <Balancer>
                <p>
                    The kit is shipped unassembled and without an enclosure.
                </p>
            </Balancer>
        </div>
    );
}

// Export the config
export const dummyLoad20wBncConfig: ProductConfig = {
    product,
    Description,
};

