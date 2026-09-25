import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { formatInstrumentDate } from '@/lib/instruments/date';
import { getInstrument } from '@/lib/instruments/records';
import { resolveInstrumentRequest } from '@/lib/instruments/route-resolution';
import { normalizeInstrumentSerial } from '@/lib/instruments/serial';
import { isInstrumentPublished } from '@/lib/instruments/visibility';
import { getInstrumentWiringReference } from '@/lib/instruments/wiring-reference';
import { privateInstrumentRobots } from '../../instrument-metadata';

interface Props {
    params: Promise<{ serial: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { serial: input } = await params;
    const serial = normalizeInstrumentSerial(input);
    const record = getInstrument(serial);
    const reference = getInstrumentWiringReference(serial);

    if (!record || !reference || !isInstrumentPublished(record)) return { robots: privateInstrumentRobots };

    return {
        title: `${record.name} wiring reference · ${serial} | K7RHY`,
        description: `${reference.title} and connection map for ${serial}.`,
        alternates: { canonical: `https://k7rhy.app/sn/${serial}/wiring` },
        robots: privateInstrumentRobots,
    };
}

export default async function InstrumentWiringPage({ params }: Props) {
    const { serial: input } = await params;
    const resolution = resolveInstrumentRequest(input, process.env.NODE_ENV, getInstrument);

    if (resolution.kind === 'redirect') redirect(`${resolution.location}/wiring`);
    if (resolution.kind === 'not-found') notFound();

    const reference = getInstrumentWiringReference(resolution.record.serial);
    if (!reference) notFound();

    return (
        <main className="container mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8 md:py-12">
            <header className="space-y-3">
                <Link href={`/sn/${reference.serial}`} className="text-sm font-semibold text-sky-700 underline-offset-4 hover:underline dark:text-sky-300">
                    ← Back to instrument record
                </Link>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {reference.serial} · Rev {reference.revision} · {formatInstrumentDate(reference.revised)}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{resolution.record.name} wiring reference</h1>
                <p className="max-w-3xl text-lg text-muted-foreground">{reference.summary}</p>
            </header>

            <figure className="overflow-hidden rounded-xl border bg-white shadow-sm dark:border-slate-700">
                <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-4 py-3 text-sm dark:bg-slate-900">
                    <span className="font-semibold">{reference.title} · full circuit and operating states</span>
                    <span className="flex gap-5">
                        <a href={reference.diagram} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 underline underline-offset-4 dark:text-sky-300">
                            Open full size
                        </a>
                        <a href={reference.diagram} download={reference.diagram.split('/').at(-1)} className="font-semibold text-sky-700 underline underline-offset-4 dark:text-sky-300">
                            Download PNG
                        </a>
                    </span>
                </figcaption>
                <a href={reference.diagram} target="_blank" rel="noopener noreferrer" aria-label={`Open the ${reference.serial} wiring diagram at full resolution`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-sky-500">
                    <Image src={reference.diagram} alt={reference.diagramAlt} width={reference.diagramWidth} height={reference.diagramHeight} unoptimized className="h-auto w-full" />
                </a>
            </figure>

            <section className="space-y-3" aria-labelledby="operating-states">
                <h2 id="operating-states" className="text-2xl font-semibold">
                    What each switch position does
                </h2>
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                            <tr>
                                <th scope="col" className="border-b px-4 py-3">
                                    Five-way position
                                </th>
                                <th scope="col" className="border-b px-4 py-3">
                                    {reference.modeLabels[0]}
                                </th>
                                <th scope="col" className="border-b px-4 py-3">
                                    {reference.modeLabels[1]}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {reference.positions.map(([position, normal, switched]) => (
                                <tr key={position} className="border-t">
                                    <th scope="row" className="px-4 py-3 font-semibold">
                                        {position}
                                    </th>
                                    <td className="px-4 py-3">{normal}</td>
                                    <td className="px-4 py-3">{switched}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="space-y-3" aria-labelledby="parts-and-leads">
                <h2 id="parts-and-leads" className="text-2xl font-semibold">
                    Parts
                </h2>
                <p className="text-slate-700 dark:text-slate-300">
                    Pickup leads follow the{' '}
                    <a href="https://www.fmicassets.com/Damroot/Original/10008/Diagram_0992367000_CuNiFe-Stratocaster-Pickup-Set.pdf" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 underline underline-offset-4 dark:text-sky-300">
                        Fender CuNiFe pickup-set diagram
                    </a>
                    .
                </p>
                <ul className="list-disc space-y-2 pl-6 text-slate-700 dark:text-slate-300">
                    {reference.parts.map((part) => (
                        <li key={part}>{part}</li>
                    ))}
                </ul>
            </section>

            <section className="space-y-3" aria-labelledby="switch-contacts">
                <h2 id="switch-contacts" className="text-2xl font-semibold">
                    Functional switch contacts
                </h2>
                <p className="text-slate-700 dark:text-slate-300">{reference.switchIntro}</p>
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                            <tr>
                                {['Pole and common', '1', '2', '3', '4', '5'].map((heading) => (
                                    <th scope="col" key={heading} className="border-b px-3 py-3">
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {reference.contacts.map(([pole, one, two, three, four, five]) => (
                                <tr key={pole} className="border-t">
                                    {[pole, one, two, three, four, five].map((value, index) =>
                                        index === 0 ? (
                                            <th scope="row" key={index} className="whitespace-nowrap px-3 py-3 font-semibold">
                                                {value}
                                            </th>
                                        ) : (
                                            <td key={index} className="whitespace-nowrap px-3 py-3 font-mono text-xs">
                                                {value}
                                            </td>
                                        )
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-slate-700 dark:text-slate-300">{reference.modeSwitch}</p>
            </section>

            <section className="space-y-3" aria-labelledby="connection-map">
                <h2 id="connection-map" className="text-2xl font-semibold">
                    Connection map
                </h2>
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                            <tr>
                                <th scope="col" className="border-b px-4 py-3">
                                    Net
                                </th>
                                <th scope="col" className="border-b px-4 py-3">
                                    Connect these points
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {reference.nets.map(([net, description]) => (
                                <tr key={net} className="border-t">
                                    <th scope="row" className="whitespace-nowrap px-4 py-3 font-mono font-semibold">
                                        {net}
                                    </th>
                                    <td className="px-4 py-3">{description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-sm text-muted-foreground">In the diagram’s rear pot view, the shaft points away and the lugs point down. Left, center, and right are clockwise end, wiper, and counterclockwise end.</p>
            </section>
        </main>
    );
}
