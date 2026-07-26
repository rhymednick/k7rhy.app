import { describe, expect, it } from 'vitest';
import { getAllProducts, getProductsByCategory } from './index';
import { ProductCategory } from '@/types/product';

describe('shop catalog', () => {
    it('does not list the sold Rainbow Telecaster', () => {
        expect(getAllProducts().map((product) => product.slug)).not.toContain('rainbow-tele');
        expect(getProductsByCategory(ProductCategory.GUITARS)).toEqual([]);
    });

    it('does not carry retired blog relationships', () => {
        for (const product of getAllProducts()) {
            expect(product).not.toHaveProperty('relatedBlogTag');
        }
    });
});
