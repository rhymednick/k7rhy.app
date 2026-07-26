import { describe, expect, it } from 'vitest';
import { coupevilleModels, getCoupevilleModel } from './coupeville-models';

describe('coupevilleModels registry', () => {
	it('contains exactly the six models (all Relay voices except hammer)', () => {
		expect(coupevilleModels.map((m) => m.slug).sort()).toEqual(['arc', 'current', 'lipstick', 'reef', 'torch', 'velvet']);
	});

	it('excludes the hammer concept', () => {
		expect(coupevilleModels.find((m) => m.slug === 'hammer')).toBeUndefined();
	});

	it('gives every model non-empty copy and a self-consistent href', () => {
		for (const model of coupevilleModels) {
			expect(model.name).toMatch(/^Coupeville /);
			expect(model.tagline.length).toBeGreaterThan(0);
			expect(model.genres.length).toBeGreaterThan(0);
			expect(model.description.length).toBeGreaterThan(0);
			expect(model.href).toBe(`/coupeville/${model.slug}`);
		}
	});

	it('carries no status/state field (models are state-free)', () => {
		for (const model of coupevilleModels) {
			expect('status' in model).toBe(false);
		}
	});

	it('resolves a model by slug', () => {
		expect(getCoupevilleModel('current')?.name).toBe('Coupeville Current');
		expect(getCoupevilleModel('nope')).toBeUndefined();
	});
});
