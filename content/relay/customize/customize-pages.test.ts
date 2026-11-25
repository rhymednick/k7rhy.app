import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { loadRelayPlatformSectionPage } from '@/lib/relay';

const customizeDir = path.join(process.cwd(), 'content', 'relay', 'customize');
const publicDir = path.join(process.cwd(), 'public');

/** Every .mdx under content/relay/customize, as slugs relative to it without the extension (for example `treble-bleed/build/is-it-a-fit`). */
function listPageSlugs(dir: string, prefix = ''): string[] {
    return fs
        .readdirSync(dir, { withFileTypes: true })
        .flatMap((entry) => {
            if (entry.isDirectory()) return listPageSlugs(path.join(dir, entry.name), `${prefix}${entry.name}/`);
            return entry.name.endsWith('.mdx') ? [`${prefix}${entry.name.replace(/\.mdx$/, '')}`] : [];
        })
        .sort();
}

const understandSlugs = ['why-turning-down-dulls', 'what-a-bleed-does', 'the-reactive-bleed'].map((part) => `treble-bleed/understand/${part}`);
const buildSlugs = ['is-it-a-fit', 'parts-and-hole', 'what-changes-and-lugs', 'wire-it-and-check', 'reference-and-troubleshooting'].map((part) => `treble-bleed/build/${part}`);
const pageSlugs = listPageSlugs(customizeDir);
const requiredSlugs = ['index', ...understandSlugs, ...buildSlugs];
const hedgingPattern = /unvalidated|\bpending\b|experimental|not yet tested|to be determined|\bTBD\b/i;
const pluralFirstPersonPattern = /\bwe\b|\bour\b|\bus\b/i;
const retiredUrls = [['/guitars/relay/customize/', 'how-treble-bleeds-work'].join(''), ['/guitars/relay/customize/', 'direct-off-reactive-switch'].join('')];

function readPage(slug: string): string {
    return fs.readFileSync(path.join(customizeDir, ...slug.split('/')) + '.mdx', 'utf-8');
}

function readSeries(slugs: string[]): string {
    return slugs.map(readPage).join('\n');
}

/** Removes fenced code blocks and inline code so prose checks ignore code. */
function stripCode(source: string): string {
    return source.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

function h2Titles(source: string): string[] {
    return [...source.matchAll(/^## (.+)$/gm)].map((match) => match[1].trim());
}

describe('Relay Customize content pages', () => {
    it.each(requiredSlugs)('has a page for %s', (slug) => {
        expect(pageSlugs).toContain(slug);
    });

    it('has no page beyond the landing page and the eight series parts', () => {
        expect(pageSlugs).toEqual([...requiredSlugs].sort());
    });

    describe.each(pageSlugs)('%s.mdx', (slug) => {
        const source = readPage(slug);

        it('loads through loadRelayPlatformSectionPage with a title and description', () => {
            const { frontmatter, content } = loadRelayPlatformSectionPage(['customize', ...slug.split('/')]);
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

        it('links to none of the retired two-page URLs', () => {
            for (const url of retiredUrls) {
                expect(source, `${url} is retired`).not.toContain(url);
            }
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

    describe('the Understand series', () => {
        const source = readSeries(understandSlugs);

        it('keeps every heading of the original explainer exactly once, in order', () => {
            expect(h2Titles(source)).toEqual(['A few words first', 'What the volume knob really does', 'Why turning down makes it dull', 'What a bleed does', 'The usual variants', 'Where fixed bleeds disappoint', 'The reactive bleed', 'The three modes together', 'Where to go next']);
        });

        it('shows diagrams 01 through 10 in order across its parts', () => {
            const numbers = [...source.matchAll(/<img\b[^>]*src="\/circuits\/treble-bleed\/(\d{2})-[^"]+\.png"/g)].map((match) => Number(match[1]));
            expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });

        it('ends by linking the first part of the Build series', () => {
            expect(readPage(understandSlugs[2])).toContain('](/guitars/relay/customize/treble-bleed/build/is-it-a-fit)');
        });
    });

    describe('the Build series', () => {
        const source = readSeries(buildSlugs);

        it('keeps every heading of the original retrofit guide exactly once, in order', () => {
            expect(h2Titles(source)).toEqual(['What you get', 'Is your guitar a fit?', 'Parts and tools', 'Make room for the switch', 'Understand what changes', 'Identify your lugs', 'Step-by-step wiring', 'Bench checks', 'The reference sheet', 'Worked example: Relay Lipstick', 'Tuning by ear', 'Troubleshooting']);
        });

        it('opens by pointing at the first part of the Understand series', () => {
            expect(readPage(buildSlugs[0])).toContain('](/guitars/relay/customize/treble-bleed/understand/why-turning-down-dulls)');
        });

        it.each(['Direct', 'Off', 'Reactive'])('names the %s mode', (mode) => {
            expect(source).toMatch(new RegExp(`\\b${mode}\\b`));
        });

        it('links the suggested switch and gives the 6 mm hole size', () => {
            expect(readPage(buildSlugs[1])).toContain('https://www.amazon.com/dp/B0799JK458');
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
            const row = readPage(buildSlugs[1])
                .split('\n')
                .find((line) => line.trim().startsWith('|') && line.includes(` ${pot} `) && line.includes(resistor));
            expect(row, `a table row with ${pot} and ${resistor}`).toBeDefined();
            expect(row).toMatch(/(?<![\d.])1 nF/);
            expect(row).toMatch(/(?<![\d.])22 nF/);
        });

        it.each(['11-before', '12-after', '13-pot-lugs', '14-switch-contacts'])('shows diagram %s', (name) => {
            expect(source).toContain(`src="/circuits/treble-bleed/${name}.png"`);
            expect(fs.existsSync(path.join(publicDir, 'circuits', 'treble-bleed', `${name}.png`)), `${name}.png should exist under public/`).toBe(true);
        });

        it('shows the builder sheet and links both print pages on the reference part', () => {
            const reference = readPage(buildSlugs[4]);
            expect(reference).toContain('src="/wiring-diagrams/relay-treble-bleed-switch-rev-1.0.png"');
            expect(reference).toContain('/wiring-diagrams/relay-treble-bleed-switch-rev-1.0-page-a.png');
            expect(reference).toContain('/wiring-diagrams/relay-treble-bleed-switch-rev-1.0-page-b.png');
            for (const file of ['relay-treble-bleed-switch-rev-1.0.png', 'relay-treble-bleed-switch-rev-1.0-page-a.png', 'relay-treble-bleed-switch-rev-1.0-page-b.png']) {
                expect(fs.existsSync(path.join(publicDir, 'wiring-diagrams', file)), `${file} should exist under public/`).toBe(true);
            }
        });

        it('keeps the in-series links pointing at the part that now holds each section', () => {
            expect(readPage(buildSlugs[0])).toContain('/guitars/relay/customize/treble-bleed/build/what-changes-and-lugs#identify-your-lugs');
            expect(readPage(buildSlugs[1])).toContain('/guitars/relay/customize/treble-bleed/build/reference-and-troubleshooting#tuning-by-ear');
            expect(readPage(buildSlugs[4])).toContain('/guitars/relay/customize/treble-bleed/build/parts-and-hole#make-room-for-the-switch');
            for (const slug of buildSlugs) {
                expect(readPage(slug), `${slug} has a stale in-page anchor to another part's section`).not.toMatch(/\]\(#(?:identify-your-lugs|tuning-by-ear|make-room-for-the-switch|the-reference-sheet)\)/);
            }
        });
    });
});
