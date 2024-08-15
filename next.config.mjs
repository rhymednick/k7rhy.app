import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx', 'md'],

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

const withMDX = createMDX()
export default withMDX(nextConfig)