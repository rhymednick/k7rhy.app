/** @type {import('next-sitemap').IConfig} */
const config = {
    siteUrl: 'https://k7rhy.app',
    exclude: ['/sn/*', '/guitars/pedals/*'],
    generateRobotsTxt: true,
    robotsTxtOptions: {
        policies: [
            { userAgent: '*', allow: '/' },
            { userAgent: 'Googlebot', disallow: '/contact' },
        ],
    },
    transform: async (config, path) => {
        if (path === '/sn' || path.startsWith('/sn/')) return null;
        // Unreleased pedal kit guides stay unlisted until launch.
        if (path.startsWith('/guitars/pedals/')) return null;

        return {
            loc: path,
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: new Date().toISOString(),
        };
    },
};

export default config;
