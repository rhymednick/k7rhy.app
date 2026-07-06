import { describe, it, expect } from 'vitest';
import { relayBuildProcess } from '@/config/relay-build-process';

describe('relayBuildProcess config', () => {
    it('contains five stages in build order', () => {
        expect(relayBuildProcess.stages.map((s) => s.slug)).toEqual(['body', 'voicings', 'parts', 'wiring', 'assembly']);
    });

    it('numbers stages 1..5 in order', () => {
        expect(relayBuildProcess.stages.map((s) => s.number)).toEqual([1, 2, 3, 4, 5]);
    });

    it('points each stage at its in-site route', () => {
        const byslug = Object.fromEntries(relayBuildProcess.stages.map((s) => [s.slug, s.href]));
        expect(byslug).toEqual({
            body: '/relay/body',
            voicings: '/relay/voicings',
            parts: '/relay/parts',
            wiring: '/relay/wiring',
            assembly: '/relay/assembly',
        });
    });

    it('keeps Body sub-items as print/bond/finish only (Parts is now its own step)', () => {
        const body = relayBuildProcess.stages.find((s) => s.slug === 'body')!;
        expect(body.items?.map((i) => i.title)).toEqual(['Print', 'Bonding', 'Finishing']);
    });

    it('lists the seven voicings under the Voicing step', () => {
        const voicings = relayBuildProcess.stages.find((s) => s.slug === 'voicings')!;
        expect(voicings.items?.map((i) => i.title)).toEqual(['Lipstick', 'Reef', 'Velvet', 'Arc', 'Torch', 'Current', 'Hammer']);
    });

    it('every stage has a non-empty summary', () => {
        for (const stage of relayBuildProcess.stages) {
            expect(stage.summary.length).toBeGreaterThan(10);
        }
    });
});
