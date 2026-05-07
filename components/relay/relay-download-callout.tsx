import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DownloadGroup } from '@/components/doc/download-files';

interface RelayDownloadFile {
    href: string;
    label: string;
}

interface RepoSource {
    kind: 'repo';
    name: string;
    files: RelayDownloadFile[];
}

interface ExternalSource {
    kind: 'makerworld' | 'thingiverse' | 'printables' | 'other';
    label: string;
    href: string;
    description?: string;
}

type RelayDownloadSource = RepoSource | ExternalSource;

interface RelayDownloadCalloutProps {
    title: string;
    description: string;
    sources: RelayDownloadSource[];
}

export function RelayDownloadCallout({ title, description, sources }: RelayDownloadCalloutProps) {
    return (
        <div data-relay-download-callout className={cn('my-6 rounded-xl border-2 border-sky-500/40 bg-sky-500/5 p-5', 'shadow-[0_2px_10px_rgba(14,165,233,0.08)]')}>
            <div className="mb-3">
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="space-y-3">
                {sources.map((source, index) => (
                    <RelayDownloadSourceRender key={index} source={source} />
                ))}
            </div>
        </div>
    );
}

function RelayDownloadSourceRender({ source }: { source: RelayDownloadSource }) {
    if (source.kind === 'repo') {
        return <DownloadGroup title="Hosted in this repo" description="Direct download — no third-party account needed." name={source.name} files={source.files} />;
    }
    return (
        <Link href={source.href} target="_blank" rel="noopener noreferrer" className={cn('flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors', 'hover:border-sky-500 hover:bg-sky-500/5')}>
            <div className="min-w-0">
                <p className="text-sm font-semibold">{source.label}</p>
                {source.description && <p className="mt-0.5 text-xs text-muted-foreground">{source.description}</p>}
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
    );
}
