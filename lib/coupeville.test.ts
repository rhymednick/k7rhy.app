import { describe, expect, it } from 'vitest';
import { loadCoupevilleLandingPage, loadCoupevilleModelPage } from './coupeville';
import { coupevilleModels } from '@/config/coupeville-models';

describe('coupeville MDX loader', () => {
	it('loads the landing page frontmatter and content', () => {
		const { content, frontmatter } = loadCoupevilleLandingPage();
		expect(frontmatter.title).toBe('Coupeville');
		expect(frontmatter.description.length).toBeGreaterThan(0);
		expect(content).toContain('CoupevilleHero');
	});

	it('throws for a model page that does not exist', () => {
		expect(() => loadCoupevilleModelPage('does-not-exist')).toThrow();
	});
});

describe('coupeville model pages', () => {
	it('loads a page for every model in the registry', () => {
		for (const model of coupevilleModels) {
			const { frontmatter, content } = loadCoupevilleModelPage(model.slug);
			expect(frontmatter.title).toBe(model.name);
			expect(frontmatter.description.length).toBeGreaterThan(0);
			expect(content.trim().length).toBeGreaterThan(0);
		}
	});
});
