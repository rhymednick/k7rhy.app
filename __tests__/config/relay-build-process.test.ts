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

    it('routes Live stages to in-site routes and non-Live stages to Discord', () => {
        for (const stage of relayBuildProcess.stages) {
            if (stage.status === 'live') {
                expect(stage.isDiscord ?? false).toBe(false);
                expect(stage.href).toMatch(/^\/relay\//);
            } else {
                expect(stage.isDiscord).toBe(true);
                expect(stage.href).toMatch(/^https:\/\/discord\./);
            }
        }
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
