/**
 * Product configuration loader
 * This file exports all product configurations organized by category
 */

import { Guitar, Product, ProductCategory } from '@/types/product';
// import { exampleGuitar } from './guitars/example-guitar';
import { rainbowTele } from './guitars/rainbow-tele';
import { dummyLoad20wBnc } from './ham-radio-kits/dummy-load-20w-bnc';

// Export all products by category
export const guitars: Guitar[] = [rainbowTele];
export const hamRadioKits: Product[] = [dummyLoad20wBnc];

// Organize products by category
export const productsByCategory: Record<ProductCategory, Product[]> = {
    [ProductCategory.GUITARS]: guitars,
    [ProductCategory.HAM_RADIO_KITS]: hamRadioKits,
};

// Get all products for a category
export function getProductsByCategory(category: ProductCategory): Product[] {
    return productsByCategory[category] || [];
}

// Get a product by slug and category
export function getProduct(
    category: ProductCategory,
    slug: string
): Product | undefined {
    const products = getProductsByCategory(category);
    return products.find((product) => product.slug === slug);
}

// Get all products (flattened)
export function getAllProducts(): Product[] {
    return Object.values(productsByCategory).flat();
}

