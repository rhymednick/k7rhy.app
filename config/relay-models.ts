import type { RelayModel } from '@/types/relay-model';

export const relayModels: RelayModel[] = [
	{
		modelKey: 'lipstick',
		name: 'Relay Lipstick',
		tagline: 'Signature · Articulate · Lipstick layer',
		genres: 'Blues · Rock · Alternative · Indie',
		description:
			'The reference model and first release: expressive dual humbuckers with a middle lipstick as a curated alternate voice — familiar core behavior plus a second identity of the same instrument, not a novelty.',
		status: 'available',
		href: '/docs/relay/lipstick',
		recommendedPickups: {
			neck: 'GFS Professional Series Alnico II Humbucker',
			middle: 'GFS Pro-Tube Lipstick, middle / ~6K class',
			bridge: 'GFS VEH humbucker',
		},
	},
	{
		modelKey: 'velvet',
		name: 'Relay Velvet',
		tagline: 'Warm authority · Club presence',
		genres: 'Jazz · Blues · Soul · R&B',
		description:
			'The warm, fat, classy club model — a distinct center of gravity. The middle pickup is a true core voice (5-way family), poised and present so the band can orbit the guitar.',
		status: 'planned',
		href: '/docs/relay/velvet',
		recommendedPickups: {
			neck: 'GFS Professional Series Alnico II Humbucker',
			middle: 'GFS Retrotron Nashville',
			bridge: 'GFS Professional Series Alnico II Humbucker',
		},
	},
	{
		modelKey: 'arc',
		name: 'Relay Arc',
		tagline: 'Chime · Air · Spatial clarity',
		genres: 'Clean pop · Indie · Ambient · Country',
		description:
			'The airy, spatial, chime-forward model: width, shimmer, and clarity without thinning out — open, ringing, and alive rather than club-warm or mid-forward.',
		status: 'planned',
		href: '/docs/relay/arc',
		recommendedPickups: {
			neck: 'GFS Vintage 59 Humbucker',
			middle: 'GFS Dream 180',
			bridge: 'GFS Retrotron Liverpool',
		},
	},
	{
		modelKey: 'torch',
		name: 'Relay Torch',
		tagline: 'Vocal mids · Hooky · Contemporary',
		genres: 'Rock · Pop · Alternative · Modern country',
		description:
			'The rude, vocal-mid, modern-radio voice: attitude and edge with a P90-type middle as a core position (5-way family) — emotionally direct and hooky without becoming a metal guitar.',
		status: 'planned',
		href: '/docs/relay/torch',
		recommendedPickups: {
			neck: 'GFS Professional Series Alnico II Humbucker',
			middle: 'GFS Mean 90',
			bridge: 'GFS VEH humbucker',
		},
	},
	{
		modelKey: 'current',
		name: 'Relay Current',
		tagline: 'Punch · Cut · Fast attack',
		genres: 'Funk · Pop · Rock',
		description:
			'Punchy, cutting, and immediate: strong projection and edge definition (3-way family with the middle as a fast alternate layer). The line’s sharpest non-metal tool — less warm than Velvet, less spacious than Arc, less throaty than Torch.',
		status: 'planned',
		href: '/docs/relay/current',
		recommendedPickups: {
			neck: 'GFS Vintage 59 Humbucker',
			middle: 'GFS Retrotron Hot Nashville',
			bridge: 'GFS Professional Series Alnico V HOT Humbucker',
		},
	},
	{
		modelKey: 'hammer',
		name: 'Relay Hammer',
		tagline: 'High gain · Tight · Uncompromising',
		genres: 'Metal · Hard rock',
		description:
			'The dedicated heavy model: high-gain authority, tight aggressive attack, and rail-style passive pickups — the specialty brute of the line, direct and forceful rather than elegant.',
		status: 'planned',
		href: '/docs/relay/hammer',
		recommendedPickups: {
			neck: 'GFS Crunchy Rails',
			middle: 'GFS Power Rails',
			bridge: 'GFS Crunchy Rails',
		},
	},
];

export const plannedModelKeys = relayModels
	.filter((m) => m.status === 'planned')
	.map((m) => m.modelKey);
