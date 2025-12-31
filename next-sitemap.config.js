// next-sitemap.config.js

/** @type {import('next-sitemap').IConfig} */

import allBlogs from './.content-collections/generated/allBlogs.js'; // Ensure the correct relative path

const config = {
    siteUrl: 'https://k7rhy.app',
    generateRobotsTxt: true,
    robotsTxtOptions: {
        policies: [
            { userAgent: '*', allow: '/' },
            { userAgent: 'Googlebot', disallow: '/contact' },
        ],
    },
    transform: async (config, path) => {
        // Check if we're in production
        const isProduction = process.env.NODE_ENV === 'production';

        // If in production, filter out unpublished blogs
        if (isProduction) {
            const publishedSlugs = new Set(allBlogs.filter((blog) => blog.publish).map((blog) => `/blog/${blog._meta.path}`));

            // Check if the path belongs to an unpublished blog post
            if (path.startsWith('/blog/') && !publishedSlugs.has(path)) {
                return null; // Exclude unpublished blogs
            }
        }

        // Otherwise, or in non-production, return the default configuration
        return {
            loc: path,
            changefreq: 'weekly', // Customize as needed
            priority: 0.7, // Customize as needed
            lastmod: new Date().toISOString(),
        };
    },
};

export default config;
