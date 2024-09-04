// next.config.mjs

import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { withContentCollections } from '@content-collections/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configure `pageExtensions` to include MDX files
    pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx', 'md'],

    // Configure the image domains
    images: {
        domains: ['cdn.shopify.com'],
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
};

const withMDX = createMDX({
    // Add markdown plugins here, as desired
    options: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight],
    },
});
export default withContentCollections(withMDX(nextConfig));
