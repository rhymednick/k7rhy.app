import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { InstrumentCaseCard } from '@/components/instrument/instrument-case-card';
import { instrumentMdxComponents } from '@/components/instrument/instrument-mdx-components';
import { PrintCaseCardControls } from '@/components/instrument/print-case-card-controls';
import { getInstrument, getInstrumentStaticParams } from '@/lib/instruments/records';
import { normalizeInstrumentSerial } from '@/lib/instruments/serial';
import { isInstrumentPublished } from '@/lib/instruments/visibility';

interface Props {
    params: Promise<{ serial: string }>;
}

export function generateStaticParams() {
    return getInstrumentStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { serial: input } = await params;
    const serial = normalizeInstrumentSerial(input);
    const record = getInstrument(serial);

    if (!record || !isInstrumentPublished(record)) return { robots: { index: false, follow: false } };

    return {
        title: `Case card · ${record.name} · ${serial} | K7RHY`,
        robots: { index: false, follow: false },
    };
}

export default async function InstrumentPrintPage({ params }: Props) {
    const { serial: input } = await params;
    const serial = normalizeInstrumentSerial(input);

    if (input !== serial) redirect(`/sn/${serial}/print`);

    const record = getInstrument(serial);
    if (!record || !isInstrumentPublished(record)) notFound();

    return (
        <main>
            <PrintCaseCardControls />
            <InstrumentCaseCard record={record}>
                <div className="instrument-print-mdx">
                    <MDXRemote source={record.content} components={instrumentMdxComponents} />
                </div>
            </InstrumentCaseCard>
        </main>
    );
}
