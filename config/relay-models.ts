import type { RelayModel } from '@/types/relay-model';

export const relayModels: RelayModel[] = [
	{
		modelKey: 'lipstick',
		name: 'Relay Lipstick',
		tagline: 'Humbucker backbone · Lipstick color',
		genres: 'Blues · Rock · Alternative · Indie',
		description:
			'The reference model and first release. Neck and bridge humbuckers on a 3-way foundation, with a lipstick pickup for tonal shaping and detail — blended in, never a stand-alone voice.',
		status: 'available',
		href: '/docs/relay/lipstick',
	},
	{
		modelKey: 'velvet',
		name: 'Relay Velvet',
		tagline: 'Warm authority · Club presence',
		genres: 'Jazz · Blues · Soul · R&B',
		description:
			'The warm, full-bodied model. A neck humbucker, Retrotron Nashville middle, and bridge humbucker combination aimed at players who want presence without harshness — authoritative and elegant across all positions.',
		status: 'planned',
		href: '/docs/relay/velvet',
	},
	{
		modelKey: 'arc',
		name: 'Relay Arc',
		tagline: 'Chime · Air · Spatial clarity',
		genres: 'Clean pop · Indie · Ambient · Country',
		description:
			'The open, ringing model. Designed for shimmer, width, and dimensional clarity without thinning out. A humbucker neck, Dream 180 middle, and a clear-voiced bridge give it a wide, airy palette.',
		status: 'planned',
		href: '/docs/relay/arc',
	},
	{
		modelKey: 'torch',
		name: 'Relay Torch',
		tagline: 'Vocal mids · Contemporary energy',
		genres: 'Rock · Pop · Alternative · Modern country',
		description:
			'The most immediately compelling model for a broad audience. A P90-type middle pickup brings a rude, alive quality to the center voice. Strong tonal separation from Lipstick and Velvet makes it a natural second release candidate.',
		status: 'planned',
		href: '/docs/relay/torch',
	},
	{
		modelKey: 'current',
		name: 'Relay Current',
		tagline: 'Punch · Cut · Immediacy',
		genres: 'Funk · Pop · Rock',
		description:
			'Percussive, forward, and fast-responding. Designed to cut through a mix with strong upper-mid presence and a crisp attack — more aggressive than Velvet, less saturated than Torch. ',
		status: 'planned',
		href: '/docs/relay/current',
	},
	{
		modelKey: 'hammer',
		name: 'Relay Hammer',
		tagline: 'High gain · Uncompromising',
		genres: 'Metal · Hard rock',
		description:
			'Built specifically for high-gain players. Tight, saturated, and aggressive — the specialty model in the family, not the centerpiece. A deliberate outlier in the lineup, this is the only model designed with active pickups.',
		status: 'planned',
		href: '/docs/relay/hammer',
	},
];

export const plannedModelKeys = relayModels
	.filter((m) => m.status === 'planned')
	.map((m) => m.modelKey);
