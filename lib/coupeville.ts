import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface CoupevillePageFrontmatter {
	title: string;
	description: string;
}

function loadMdxFile(filePath: string): { content: string; frontmatter: CoupevillePageFrontmatter } {
	if (!fs.existsSync(filePath)) {
		throw new Error(`Coupeville page not found: ${filePath}`);
	}
	const source = fs.readFileSync(filePath, 'utf-8');
	const { content, data } = matter(source);
	if (!data.title || !data.description) {
		throw new Error(`Coupeville page at ${filePath} is missing required frontmatter fields (title, description)`);
	}
	return { content, frontmatter: data as CoupevillePageFrontmatter };
}

/** Loads the Coupeville landing page (content/coupeville/index.mdx). */
export function loadCoupevilleLandingPage(): { content: string; frontmatter: CoupevillePageFrontmatter } {
	return loadMdxFile(path.join(process.cwd(), 'content', 'coupeville', 'index.mdx'));
}

/** Loads a Coupeville model page (content/coupeville/models/<slug>.mdx). */
export function loadCoupevilleModelPage(slug: string): { content: string; frontmatter: CoupevillePageFrontmatter } {
	return loadMdxFile(path.join(process.cwd(), 'content', 'coupeville', 'models', `${slug}.mdx`));
}
