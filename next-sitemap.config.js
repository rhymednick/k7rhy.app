/* eslint-disable no-undef */
/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: 'https://k7rhy.app',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'Googlebot', disallow: '/contact' },
    ],
  }
};
