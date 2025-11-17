import { Guitar, ProductCategory, PickupType, PickupPosition, KnobType, SwitchType, Material, ProductImage } from '@/types/product';

/**
 * Example guitar configuration
 * This demonstrates the data structure for a guitar product
 */
export const exampleGuitar: Guitar = {
    slug: 'example-guitar',
    name: 'Example 3D-Printed Electric Guitar',
    category: ProductCategory.GUITARS,
    description: 'This is an example guitar showcasing the 3D-printed guitar product system. Built with engineering-grade composite materials for the core and beautiful PLA for the shell, this instrument demonstrates the possibilities of additive manufacturing in guitar construction.',
    images: [
        {
            src: '/images/products/guitars/example-guitar/front.jpg',
            description: 'Front view showing the body shape and finish',
            alt: 'Guitar front view',
        },
        {
            src: '/images/products/guitars/example-guitar/back.jpg',
            description: 'Back view highlighting the 3D-printed construction',
            alt: 'Guitar back view',
        },
        {
            src: '/images/products/guitars/example-guitar/detail.jpg',
            description: 'Close-up detail of the pickups and controls',
            alt: 'Guitar detail view',
        },
    ] as ProductImage[],
    bodyCore: Material.NYLON_CF_PA12,
    bodyShell: Material.PLA,
    pickups: [
        {
            type: PickupType.HUMBUCKER,
            position: PickupPosition.BRIDGE,
            resistance: 8.5,
            brand: 'Seymour Duncan',
        },
        {
            type: PickupType.HUMBUCKER,
            position: PickupPosition.NECK,
            resistance: 7.8,
            brand: 'Seymour Duncan',
        },
    ],
    controls: [
        {
            type: KnobType.VOLUME,
            usage: 'Master volume control',
        },
        {
            type: KnobType.TONE,
            usage: 'Tone control for treble roll-off',
        },
        {
            type: SwitchType.THREE_WAY_TOGGLE,
            usage: 'Pickup selector',
            switchPositions: [
                {
                    position: '1',
                    description: 'Bridge pickup only',
                },
                {
                    position: '2',
                    description: 'Both pickups',
                },
                {
                    position: '3',
                    description: 'Neck pickup only',
                },
            ],
        },
        {
            type: KnobType.PUSH_PULL_VOLUME,
            usage: 'Volume control with coil-split functionality',
            isPushPull: true,
        },
    ],
    price: 1299,
    purchaseLink: 'https://example.com/purchase',
    relatedBlogTag: 'guitar', // This tag will be used to filter related blog posts
};

