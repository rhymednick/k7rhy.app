import { buildMetadata } from '@/lib/version';
import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export function GET() {
    return NextResponse.json({
        repositoryUrl: buildMetadata.repositoryUrl,
        commitHash: buildMetadata.commitHash,
        shortCommitHash: buildMetadata.shortCommitHash,
        commitUrl: buildMetadata.commitUrl,
        buildTimestamp: buildMetadata.buildTimestamp,
        buildTimeUTC: buildMetadata.buildTimeUTC,
        isPublicBuild: buildMetadata.isPublicBuild,
    });
}
