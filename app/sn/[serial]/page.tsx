import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { InstrumentRecordPage } from '@/components/instrument/instrument-record-page';
import { instrumentMdxComponents } from '@/components/instrument/instrument-mdx-components';
import { getInstrument, getInstrumentStaticParams } from '@/lib/instruments/records';
import { instrumentUrl, normalizeInstrumentSerial } from '@/lib/instruments/serial';
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

    if (!record || !isInstrumentPublished(record)) return {};

    return {
        title: `${record.name} · ${serial} | K7RHY`,
        description: record.theme,
        alternates: { canonical: instrumentUrl(serial) },
    };
}

export default async function InstrumentPage({ params }: Props) {
    const { serial: input } = await params;
    const serial = normalizeInstrumentSerial(input);

    if (input !== serial) redirect(`/sn/${serial}`);

    const record = getInstrument(serial);
    if (!record || !isInstrumentPublished(record)) notFound();

    return (
        <InstrumentRecordPage record={record}>
            <MDXRemote source={record.content} components={instrumentMdxComponents} />
        </InstrumentRecordPage>
    );
}
