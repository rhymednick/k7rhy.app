const repositoryUrl = process.env.NEXT_PUBLIC_GITHUB_REPO_URL ?? 'https://github.com/rhymednick/k7rhy.app';

const commitHash = process.env.NEXT_PUBLIC_GIT_COMMIT_SHA ?? 'local-dev';

const shortCommitHash = process.env.NEXT_PUBLIC_GIT_COMMIT_SHORT_SHA ?? (/^[0-9a-f]{7,40}$/i.test(commitHash) ? commitHash.slice(0, 7) : commitHash);

const buildTimestamp = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP ?? '';

const normalizedRepoUrl = repositoryUrl.replace(/\.git$/, '').replace(/\/+$/, '');

const commitUrl = normalizedRepoUrl && process.env.NEXT_PUBLIC_GIT_COMMIT_IS_PUBLIC === 'true' && /^[0-9a-f]{7,40}$/i.test(commitHash) ? `${normalizedRepoUrl}/commit/${commitHash}` : undefined;

const commitLinkLabel = shortCommitHash;

const parsedBuildDate = buildTimestamp && !Number.isNaN(Date.parse(buildTimestamp)) ? new Date(buildTimestamp) : undefined;

const buildTimeUTC = parsedBuildDate ? parsedBuildDate.toUTCString() : undefined;

export const buildMetadata = {
    repositoryUrl: normalizedRepoUrl,
    commitHash,
    shortCommitHash: commitLinkLabel,
    buildTimestamp,
    commitUrl,
    buildTimeUTC,
    isPublicBuild: process.env.NEXT_PUBLIC_GIT_COMMIT_IS_PUBLIC === 'true',
};

export type BuildMetadata = typeof buildMetadata;
