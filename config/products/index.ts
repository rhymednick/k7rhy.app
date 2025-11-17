/**
 * Product configuration loader
 * This file exports all product configurations organized by category
 * 
 * Product configs can be either:
 * - Old format: Just export a Product/Guitar object
 * - New format: Export both product metadata and optional Description component
 */

import { Guitar, Product, ProductCategory, ProductConfig } from '@/types/product';
import type React from 'react';
// import { exampleGuitar } from './guitars/example-guitar';
import { rainbowTeleConfig } from './guitars/rainbow-tele';
import { dummyLoad20wBncConfig } from './ham-radio-kits/dummy-load-20w-bnc';

// Helper to extract product from config (supports both old and new format)
function extractProduct(config: Product | Guitar | ProductConfig): Product | Guitar {
    if ('product' in config) {
        return config.product;
    }
    return config;
}

// Helper to extract Description component from config
function extractDescription(config: Product | Guitar | ProductConfig): React.ComponentType | undefined {
    if ('product' in config && 'Description' in config) {
        return config.Description;
    }
    return undefined;
}

// Store configs with their Description components
export const guitarConfigs: (Guitar | ProductConfig)[] = [rainbowTeleConfig];
export const hamRadioKitConfigs: (Product | ProductConfig)[] = [dummyLoad20wBncConfig];

// Export all products by category (for listing pages)
export const guitars: Guitar[] = guitarConfigs.map(extractProduct) as Guitar[];
export const hamRadioKits: Product[] = hamRadioKitConfigs.map(extractProduct);

// Organize products by category
export const productsByCategory: Record<ProductCategory, Product[]> = {
    [ProductCategory.GUITARS]: guitars,
    [ProductCategory.HAM_RADIO_KITS]: hamRadioKits,
};

// Store configs by category for Description component lookup
const configsByCategory: Record<ProductCategory, (Product | Guitar | ProductConfig)[]> = {
    [ProductCategory.GUITARS]: guitarConfigs,
    [ProductCategory.HAM_RADIO_KITS]: hamRadioKitConfigs,
};

// Get all products for a category
export function getProductsByCategory(category: ProductCategory): Product[] {
    return productsByCategory[category] || [];
}

// Get a product config (with Description component) by slug and category
export function getProductConfig(
    category: ProductCategory,
    slug: string
): (Product | Guitar | ProductConfig) | undefined {
    const configs = configsByCategory[category] || [];
    return configs.find((config) => {
        const product = extractProduct(config);
        return product.slug === slug;
    });
}

// Get a product by slug and category (backward compatibility)
export function getProduct(
    category: ProductCategory,
    slug: string
): Product | undefined {
    const config = getProductConfig(category, slug);
    if (!config) return undefined;
    return extractProduct(config) as Product;
}

// Get Description component for a product
export function getProductDescription(
    category: ProductCategory,
    slug: string
): React.ComponentType | undefined {
    const config = getProductConfig(category, slug);
    if (!config) return undefined;
    return extractDescription(config);
}

// Get all products (flattened)
export function getAllProducts(): Product[] {
    return Object.values(productsByCategory).flat();
}

