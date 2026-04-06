import { relayModels } from '@/config/relay-models';

type Props = { modelKey: string };

export function RelayRecommendedPickups({ modelKey }: Props) {
	const model = relayModels.find((m) => m.modelKey === modelKey);
	if (!model) {
		return null;
	}
	const { neck, middle, bridge } = model.recommendedPickups;
	return (
		<>
			<h2 className="font-heading mt-12 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">Recommended pickups</h2>
			<p className="prose [&:not(:first-child)]:mt-2 text-muted-foreground">
				Default GFS choices from the platform proposal — swap anything that fits your ear or your bench.
			</p>
			<ul className="my-2 ml-6 list-disc">
				<li>
					<strong>Neck:</strong> {neck}
				</li>
				<li>
					<strong>Middle:</strong> {middle}
				</li>
				<li>
					<strong>Bridge:</strong> {bridge}
				</li>
			</ul>
		</>
	);
}
