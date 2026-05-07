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

    it('marks Voicings as live, Body as in-progress, Assembly as planned at PR #2 ship time', () => {
        const byslug = Object.fromEntries(relayBuildProcess.stages.map((s) => [s.slug, s.status]));
        expect(byslug).toEqual({
            body: 'in-progress',
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

    it('every stage has a non-empty summary', () => {
        for (const stage of relayBuildProcess.stages) {
            expect(stage.summary.length).toBeGreaterThan(10);
        }
    });
});
