import { generateSitemap } from 'next-sitemap';
import config from './next-sitemap.config.mjs';
import process from 'process';

async function generate() {
  try {
    await generateSitemap(config);
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    process.exit(1);
  }
}

generate();