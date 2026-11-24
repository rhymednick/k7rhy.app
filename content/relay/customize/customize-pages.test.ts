import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { loadRelayPlatformSectionPage } from '@/lib/relay';

const customizeDir = path.join(process.cwd(), 'content', 'relay', 'customize');
const publicDir = path.join(process.cwd(), 'public');
const pageSlugs = fs
    .readdirSync(customizeDir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''))
    .sort();
const requiredSlugs = ['index', 'how-treble-bleeds-work', 'direct-off-reactive-switch'];
const hedgingPattern = /unvalidated|\bpending\b|experimental|not yet tested|to be determined|\bTBD\b/i;
const pluralFirstPersonPattern = /\bwe\b|\bour\b|\bus\b/i;

function readPage(slug: string): string {
    return fs.readFileSync(path.join(customizeDir, `${slug}.mdx`), 'utf-8');
}

/** Removes fenced code blocks and inline code so prose checks ignore code. */
function stripCode(source: string): string {
    return source.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

describe('Relay Customize content pages', () => {
    it.each(requiredSlugs)('has a page for %s', (slug) => {
        expect(pageSlugs).toContain(slug);
    });

    describe.each(pageSlugs)('%s.mdx', (slug) => {
        const source = readPage(slug);

        it('loads through loadRelayPlatformSectionPage with a title and description', () => {
            const { frontmatter, content } = loadRelayPlatformSectionPage(['customize', slug]);
            expect(frontmatter.title.length).toBeGreaterThan(0);
            expect(frontmatter.description.length).toBeGreaterThan(0);
            expect(content.trim().length).toBeGreaterThan(0);
        });

        it('contains no hedging language', () => {
            expect(source).not.toMatch(hedgingPattern);
        });

        it('never uses "we", "our" or "us" outside code', () => {
            expect(stripCode(source)).not.toMatch(pluralFirstPersonPattern);
        });

        it('references only diagram files that exist under public/', () => {
            const htmlRefs = [...source.matchAll(/(?:src|href)="(\/(?:circuits|wiring-diagrams)\/[^"]+)"/g)].map((match) => match[1]);
            const markdownRefs = [...source.matchAll(/\]\((\/(?:circuits|wiring-diagrams)\/[^)\s]+)/g)].map((match) => match[1]);
            const refs = [...htmlRefs, ...markdownRefs];
            for (const ref of refs) {
                expect(fs.existsSync(path.join(publicDir, ref)), `${ref} should exist under public/`).toBe(true);
            }
        });

        it('gives every <img a descriptive alt of at least 20 characters', () => {
            const imgs = [...source.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
            for (const img of imgs) {
                const alt = img.match(/\balt="([^"]*)"/);
                expect(alt, `${img} should have an alt`).not.toBeNull();
                expect(alt![1].trim().length, `${img} alt is too short`).toBeGreaterThanOrEqual(20);
            }
        });

        it('gives every Markdown image a descriptive alt of at least 20 characters', () => {
            for (const match of source.matchAll(/!\[([^\]]*)\]\(([^)]*)\)/g)) {
                expect(match[1].trim().length, `![${match[1]}](${match[2]}) alt is too short`).toBeGreaterThanOrEqual(20);
            }
        });
    });

    it('the explainer shows diagrams 01 through 10 in order', () => {
        const source = readPage('how-treble-bleeds-work');
        const numbers = [...source.matchAll(/<img\b[^>]*src="\/circuits\/treble-bleed\/(\d{2})-[^"]+\.png"/g)].map((match) => Number(match[1]));
        expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('the explainer links to the switch retrofit guide', () => {
        expect(readPage('how-treble-bleeds-work')).toContain('](/guitars/relay/customize/direct-off-reactive-switch)');
    });

    describe('the switch retrofit guide', () => {
        const slug = 'direct-off-reactive-switch';
        const source = fs.existsSync(path.join(customizeDir, `${slug}.mdx`)) ? readPage(slug) : '';

        it('loads with a title and description', () => {
            const { frontmatter } = loadRelayPlatformSectionPage(['customize', slug]);
            expect(frontmatter.title).toBe('Direct / Off / Reactive switch');
            expect(frontmatter.description.length).toBeGreaterThan(0);
        });

        it.each(['Direct', 'Off', 'Reactive'])('names the %s mode', (mode) => {
            expect(source).toMatch(new RegExp(`\\b${mode}\\b`));
        });

        it('links the suggested switch and gives the 6 mm hole size', () => {
            expect(source).toContain('https://www.amazon.com/dp/B0799JK458');
            expect(source).toContain('6 mm');
            expect(source).toContain('measure yours and drill to match');
            expect(source).not.toContain('just over that measurement');
        });

        it('defines TB-SW by the bleed, not the capacitor, and notes a swapped reused bleed', () => {
            expect(source).toContain("`TB-SW`: the bleed's free end (the capacitor's, on Lipstick or a new bleed) to the switch's common lug.");
            expect(source).toContain('If your reused bleed has the capacitor on the wiper, the two parts swap places; the nets are the same.');
        });

        it('gives mark 4 to one step only', () => {
            expect(source.split('(mark 4)').length - 1).toBe(1);
        });

        it.each([
            ['500k', '150 kΩ'],
            ['250k', '68 kΩ'],
            ['1M', '330 kΩ'],
        ])('pairs a %s volume pot with %s, 1 nF and the 22 nF tone capacitor in the value table', (pot, resistor) => {
            const row = source.split('\n').find((line) => line.trim().startsWith('|') && line.includes(` ${pot} `) && line.includes(resistor));
            expect(row, `a table row with ${pot} and ${resistor}`).toBeDefined();
            expect(row).toMatch(/(?<![\d.])1 nF/);
            expect(row).toMatch(/(?<![\d.])22 nF/);
        });

        it.each(['11-before', '12-after', '13-pot-lugs', '14-switch-contacts'])('shows diagram %s', (name) => {
            expect(source).toContain(`src="/circuits/treble-bleed/${name}.png"`);
            expect(fs.existsSync(path.join(publicDir, 'circuits', 'treble-bleed', `${name}.png`)), `${name}.png should exist under public/`).toBe(true);
        });

        it('shows the builder sheet and links both print pages', () => {
            expect(source).toContain('src="/wiring-diagrams/relay-treble-bleed-switch-rev-1.0.png"');
            expect(source).toContain('/wiring-diagrams/relay-treble-bleed-switch-rev-1.0-page-a.png');
            expect(source).toContain('/wiring-diagrams/relay-treble-bleed-switch-rev-1.0-page-b.png');
            for (const file of ['relay-treble-bleed-switch-rev-1.0.png', 'relay-treble-bleed-switch-rev-1.0-page-a.png', 'relay-treble-bleed-switch-rev-1.0-page-b.png']) {
                expect(fs.existsSync(path.join(publicDir, 'wiring-diagrams', file)), `${file} should exist under public/`).toBe(true);
            }
        });

        it('never uses "we", "our" or "us" outside code', () => {
            expect(stripCode(source)).not.toMatch(pluralFirstPersonPattern);
        });
    });
});
