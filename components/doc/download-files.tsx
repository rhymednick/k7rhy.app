import React from 'react';
import fs from 'fs';
import path from 'path';
import { Download, FileBox } from 'lucide-react';
import { cn } from '@/lib/utils';

function getFileSize(href: string): string {
    try {
        const abs = path.join(process.cwd(), 'public', href);
        const { size } = fs.statSync(abs);
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    } catch {
        return '';
    }
}

interface DownloadFileEntry {
    href: string;
    label: string;
}

// ─── Option A: Compact list ──────────────────────────────────────────────────

export function DownloadList({ children }: { children: React.ReactNode }) {
    return <div className="my-4 overflow-hidden rounded-lg border">{children}</div>;
}

export function DownloadFile({ href, label }: DownloadFileEntry) {
    const size = getFileSize(href);
    return (
        <div className={cn('flex items-center gap-3 border-b px-4 py-3 last:border-b-0', 'transition-colors hover:bg-muted/40')}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <FileBox className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{label}</p>
                {size && <p className="text-xs text-muted-foreground">{size}</p>}
            </div>
            <a href={href} download className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80">
                <Download className="h-3 w-3" />
                Download
            </a>
        </div>
    );
}

// ─── Option C: Group card ────────────────────────────────────────────────────

interface DownloadGroupProps {
    title: string;
    description?: string;
    name?: string;
    files: DownloadFileEntry[];
}

export function DownloadGroup({ title, description, name, files }: DownloadGroupProps) {
    const zipParams = new URLSearchParams();
    files.forEach((f) => zipParams.append('files', f.href));
    if (name) zipParams.set('name', name);
    const downloadAllHref = `/api/download-zip?${zipParams.toString()}`;

    return (
        <div className="my-6 overflow-hidden rounded-lg border">
            <div className="flex items-center gap-2.5 border-b bg-muted/30 px-4 py-3">
                <FileBox className="h-4 w-4 shrink-0 text-primary" />
                <p className="flex-1 font-semibold">{title}</p>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {files.length} {files.length === 1 ? 'file' : 'files'}
                </span>
            </div>
            {description && (
                <div className="border-b px-4 py-2">
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            )}
            <div>
                {files.map((f) => (
                    <DownloadGroupFile key={f.href} href={f.href} label={f.label} />
                ))}
            </div>
            <div className="flex justify-end border-t px-4 py-3">
                <a href={downloadAllHref} className="flex items-center gap-1.5 rounded-md border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10">
                    <Download className="h-3 w-3" />
                    Download all
                </a>
            </div>
        </div>
    );
}

export function DownloadGroupFile({ href, label }: DownloadFileEntry) {
    const size = getFileSize(href);
    return (
        <div className={cn('flex items-center gap-3 border-b px-4 py-3 last:border-b-0', 'transition-colors hover:bg-muted/40')}>
            <FileBox className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">{label}</span>
            {size && <span className="text-xs text-muted-foreground">{size}</span>}
            <a href={href} download className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/80" title={`Download ${label}`}>
                <Download className="h-3.5 w-3.5" />
                <span className="sr-only">Download {label}</span>
            </a>
        </div>
    );
}
