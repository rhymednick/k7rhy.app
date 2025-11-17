import React from 'react';
import { Guitar, ProductCategory, PickupType, PickupPosition, KnobType, SwitchType, Material, ProductImage, ProductConfig } from '@/types/product';
import { Balancer } from 'react-wrap-balancer';

// Product metadata
const product: Guitar = {
    slug: 'rainbow-tele',
    name: 'Rainbow Telecaster-style Guitar',
    category: ProductCategory.GUITARS,
    description: "A Telecaster-style electric guitar built with 3D-printed construction methods, combining a carbon-fiber reinforced PETG core for structural stability with an ABS and PETG shell for durability and visual appeal.",
    images: [
        {
            src: '/images/products/guitars/rainbow-tele/front.jpeg',
            description: 'Full front view',
            alt: 'Telecaster-style guitar with rainbow strings, front view',
        },
        {
            src: '/images/products/guitars/rainbow-tele/glow-strings.jpeg',
            description: 'UV-reactive rainbow strings',
            alt: 'Telecaster-style guitar with UV-reactive rainbow strings',
        },
    ],
    bodyCore: [Material.PETG_CF],
    bodyShell: [Material.ABS, Material.PETG],
    pickups: [
        {
            type: PickupType.SINGLE_COIL,
            position: PickupPosition.NECK,
        },
        {
            type: PickupType.SINGLE_COIL,
            position: PickupPosition.BRIDGE,
        },
    ],
    controls: [
        {
            type: KnobType.VOLUME,
            usage: 'Main volume control for both pickups.',
        },
        {
            type: KnobType.TONE,
            usage: 'Master tone control for both pickups.',
        },
        {
            type: SwitchType.THREE_WAY_BLADE,
            usage: '3-position blade switch for selecting pickups.',
            switchPositions: [
                {
                    position: '1',
                    description: 'Bridge pickup only',
                },
                {
                    position: '2',
                    description: 'Bridge and neck pickups together',
                },
                {
                    position: '3',
                    description: 'Neck pickup only',
                },
            ],
        },
    ],
    price: 350,
    relatedBlogTag: 'rainbow-tele',
};

// Description component with full formatting flexibility
export function Description() {
    return (
        <div className="text-base text-muted-foreground space-y-4">
            <p>
                A Telecaster-style electric guitar built with 3D-printed construction methods, combining a carbon-fiber reinforced PETG core for structural stability with an ABS and PETG shell for durability and visual appeal.
            </p>
            
            <p>
                The classic Telecaster pickup configuration—two single-coil pickups at the neck and bridge positions—delivers the bright, twangy tones that define the Telecaster sound, while the straightforward three-way selector switch gives you quick access to bridge-only, both pickups, or neck-only settings.
            </p>
            
            <p>
                The UV-reactive rainbow strings add a distinctive visual element that responds to blacklight, making this guitar stand out on stage or in the studio. At $350, this instrument offers an entry point into 3D-printed guitar construction without compromising on playability or tone. Whether you're exploring alternative manufacturing methods, looking for a unique stage presence, or simply want a functional Tele-style guitar at an accessible price point, this guitar delivers solid performance in a distinctive package.
            </p>
            
            <p>
                Since this is a personal property sale and isn't a commercial product, contact me on Discord or email me at{' '}
                <a href="mailto:de.k7rhy@gmail.com" className="text-primary hover:underline">
                    de.k7rhy@gmail.com
                </a>
                {' '}to discuss availability and purchase details.
            </p>
        </div>
    );
}

// Export the config
export const rainbowTeleConfig: ProductConfig = {
    product,
    Description,
};
