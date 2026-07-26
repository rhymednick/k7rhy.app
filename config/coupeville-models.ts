import type { CoupevilleModel } from '@/types/coupeville';

// Self-contained: voice copy is duplicated here on purpose. Do NOT import from
// config/relay-voicings.ts — the Coupeville and Relay lines share a voice lineage
// but are kept decoupled in code.
export const coupevilleModels: CoupevilleModel[] = [
	{
		slug: 'current',
		name: 'Coupeville Current',
		tagline: 'Fast attack · Upper-mid focus',
		genres: 'Funk · Pop · Rock',
		description: 'A rhythm-first voice built around fast attack, controlled low end, and a focused place in the mix.',
		href: '/coupeville/current',
	},
	{
		slug: 'lipstick',
		name: 'Coupeville Lipstick',
		tagline: 'Humbucker core · Chime and air',
		genres: 'Blues · Rock · Alternative · Indie',
		description: 'A familiar humbucker foundation opened up with chime, air, and a more dimensional, percussive character.',
		href: '/coupeville/lipstick',
	},
	{
		slug: 'reef',
		name: 'Coupeville Reef',
		tagline: 'High-contrast clean and driven',
		genres: 'Indie · Surf · Alt Country · Shoegaze · Studio',
		description: 'Two voice families in one instrument: a focused humbucker voice alongside a bright, glassy voice for high-contrast clean and driven sounds.',
		href: '/coupeville/reef',
	},
	{
		slug: 'velvet',
		name: 'Coupeville Velvet',
		tagline: 'Warm center · Controlled mids',
		genres: 'Jazz · Blues · Soul · R&B',
		description: 'A warm, rounded voice with controlled mids and enough presence to carry a small room clean.',
		href: '/coupeville/velvet',
	},
	{
		slug: 'arc',
		name: 'Coupeville Arc',
		tagline: 'Open · Spatial · Separated',
		genres: 'Clean pop · Indie · Ambient · Country',
		description: 'A clear, spatial voice built for separation: wide clean sounds that keep their detail under reverb and delay.',
		href: '/coupeville/arc',
	},
	{
		slug: 'torch',
		name: 'Coupeville Torch',
		tagline: 'Punch · Vocal mids · Presence',
		genres: 'Rock · Pop · Alternative · Modern country',
		description: 'A punchy, mid-forward voice with strong presence that sits confidently at the front of a mix.',
		href: '/coupeville/torch',
	},
];

/** Resolves a Coupeville model by slug. */
export function getCoupevilleModel(slug: string): CoupevilleModel | undefined {
	return coupevilleModels.find((model) => model.slug === slug);
}
