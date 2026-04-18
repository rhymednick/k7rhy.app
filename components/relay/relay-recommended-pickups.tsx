import { DocTerm } from '@/components/doc/doc-term';

type Props = { neck: string; middle: string; bridge: string };

function PickupName({ name }: { name: string }) {
    if (name.startsWith('GFS ')) {
        return (
            <>
                <DocTerm id="gfs">GFS</DocTerm>
                {name.slice(3)}
            </>
        );
    }
    return <>{name}</>;
}

export function RelayRecommendedPickups({ neck, middle, bridge }: Props) {
    return (
        <>
            <h2 className="font-heading mt-12 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">Recommended pickups</h2>
            <div className="prose [&:not(:first-child)]:mt-2 text-muted-foreground">
                Default <DocTerm id="gfs">GFS</DocTerm> choices from the platform proposal — swap anything that fits your ear or your bench.
            </div>
            <ul className="my-2 ml-6 list-disc">
                <li>
                    <strong>Neck:</strong> <PickupName name={neck} />
                </li>
                <li>
                    <strong>Middle:</strong> <PickupName name={middle} />
                </li>
                <li>
                    <strong>Bridge:</strong> <PickupName name={bridge} />
                </li>
            </ul>
        </>
    );
}
