import { describe, expect, it } from 'vitest';
import { loadCoupevilleLandingPage, loadCoupevilleModelPage } from './coupeville';

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
