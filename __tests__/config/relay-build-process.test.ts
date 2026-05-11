import { describe, it, expect } from 'vitest';
import { relayBuildProcess } from '@/config/relay-build-process';

describe('relayBuildProcess config', () => {
    it('contains exactly three stages: body, voicings, assembly', () => {
        expect(relayBuildProcess.stages).toHaveLength(3);
        const slugs = relayBuildProcess.stages.map((s) => s.slug);
        expect(slugs).toEqual(['body', 'voicings', 'assembly']);
    });

    it('numbers stages 1, 2, 3 in order', () => {
        const numbers = relayBuildProcess.stages.map((s) => s.number);
        expect(numbers).toEqual([1, 2, 3]);
    });

    it('marks Body and Voicings as live, Assembly as planned at PR #3 ship time', () => {
        const byslug = Object.fromEntries(relayBuildProcess.stages.map((s) => [s.slug, s.status]));
        expect(byslug).toEqual({
            body: 'live',
            voicings: 'live',
            assembly: 'planned',
        });
    });

    it('routes every stage to an in-site /relay/ page (non-Live stages link to placeholder pages)', () => {
        for (const stage of relayBuildProcess.stages) {
            expect(stage.isDiscord ?? false).toBe(false);
            expect(stage.href).toMatch(/^\/relay\//);
        }
    });

    it('points each stage to the expected in-site route', () => {
        const byslug = Object.fromEntries(relayBuildProcess.stages.map((s) => [s.slug, s.href]));
        expect(byslug).toEqual({
            body: '/relay/body',
            voicings: '/relay/voicings',
            assembly: '/relay/assembly',
        });
    });

    it('exposes the seven voicing slugs as items under the Voicings stage', () => {
        const voicings = relayBuildProcess.stages.find((s) => s.slug === 'voicings');
        expect(voicings).toBeDefined();
        const itemTitles = voicings!.items?.map((i) => i.title) ?? [];
        expect(itemTitles).toEqual(['Lipstick', 'Reef', 'Velvet', 'Arc', 'Torch', 'Current', 'Hammer']);
    });

    it('exposes Print, Bonding, and Finishing as sub-items under the Body stage', () => {
        const body = relayBuildProcess.stages.find((s) => s.slug === 'body');
        expect(body).toBeDefined();
        const itemTitles = body!.items?.map((i) => i.title) ?? [];
        expect(itemTitles).toEqual(['Print', 'Bonding', 'Finishing']);
        expect(body!.items?.[0].href).toBe('/relay/body/print');
        expect(body!.items?.[1].href).toBe('/relay/body/bonding');
        expect(body!.items?.[2].href).toBe('/relay/body/finishing');
    });

    it('every stage has a non-empty summary', () => {
        for (const stage of relayBuildProcess.stages) {
            expect(stage.summary.length).toBeGreaterThan(10);
        }
    });
});
