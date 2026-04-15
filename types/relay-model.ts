export interface RelayModel {
	modelKey: string;
	name: string;
	tagline: string;
	genres: string;
	description: string;
	status: 'available' | 'planned';
	href?: string;
}
