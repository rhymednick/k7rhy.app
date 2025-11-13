// next.config.mjs

import { execSync } from 'node:child_process';
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { withContentCollections } from '@content-collections/next';

function resolveCommitHash() {
    if (process.env.NEXT_PUBLIC_GIT_COMMIT_SHA) {
        return process.env.NEXT_PUBLIC_GIT_COMMIT_SHA;
    }
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
        return process.env.VERCEL_GIT_COMMIT_SHA;
    }
    if (process.env.GIT_COMMIT_SHA) {
        return process.env.GIT_COMMIT_SHA;
    }
    try {
        return execSync('git rev-parse HEAD').toString().trim();
    } catch {
        return 'local-dev';
    }
}

function normalizeRepoUrl(url) {
    if (!url) {
        return undefined;
    }
    return url.replace(/\.git$/, '').replace(/\/+$/, '');
}

const repositoryUrl =
    process.env.NEXT_PUBLIC_GITHUB_REPO_URL ??
    process.env.VERCEL_GIT_REPO_URL ??
    'https://github.com/rhymednick/k7rhy.app';

const commitHash = resolveCommitHash();
const shortCommitHash =
    process.env.NEXT_PUBLIC_GIT_COMMIT_SHORT_SHA ??
    (/^[0-9a-f]{7,40}$/i.test(commitHash) ? commitHash.slice(0, 7) : commitHash);

const buildTimestamp = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP ?? new Date().toISOString();
const isPublicBuild =
    process.env.NEXT_PUBLIC_GIT_COMMIT_IS_PUBLIC ?? (process.env.VERCEL ? 'true' : 'false');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configure `pageExtensions` to include MDX files
    pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx', 'md'],

    // Configure the image remote patterns (Next.js 15+ requires remotePatterns instead of domains)
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.shopify.com',
            },
        ],
    },
    // Add the redirects function
    async redirects() {
        return [
            {
                source: '/DL20W',
                destination: '/docs/dl20w_bnc',
                permanent: true,
            },
        ];
    },

    // Optionally, add any other Next.js config below
    env: {
        NEXT_PUBLIC_GITHUB_REPO_URL: normalizeRepoUrl(repositoryUrl),
        NEXT_PUBLIC_GIT_COMMIT_SHA: commitHash,
        NEXT_PUBLIC_GIT_COMMIT_SHORT_SHA: shortCommitHash,
        NEXT_PUBLIC_BUILD_TIMESTAMP: buildTimestamp,
        NEXT_PUBLIC_GIT_COMMIT_IS_PUBLIC: isPublicBuild,
    },
};

const withMDX = createMDX({
    // Add markdown plugins here, as desired
    options: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight],
    },
});
export default withContentCollections(withMDX(nextConfig));
