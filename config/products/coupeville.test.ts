import { describe, expect, it } from 'vitest';
import { ProductCategory } from '@/types/product';
import { getProductsByCategory, productsByCategory } from '@/config/products';

describe('Coupeville product category', () => {
    it('is a registered product category', () => {
        expect(ProductCategory.COUPEVILLE).toBe('coupeville');
        expect(Object.values(ProductCategory)).toContain('coupeville');
    });

    it('is wired but currently empty', () => {
        expect(getProductsByCategory(ProductCategory.COUPEVILLE)).toEqual([]);
        expect(productsByCategory[ProductCategory.COUPEVILLE]).toEqual([]);
    });
});
