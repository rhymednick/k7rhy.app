export interface RelayRecommendedPickups {
	neck: string;
	middle: string;
	bridge: string;
}

export interface RelayModel {
	modelKey: string;
	name: string;
	tagline: string;
	genres: string;
	description: string;
	status: 'available' | 'planned';
	href?: string;
	recommendedPickups: RelayRecommendedPickups;
}
