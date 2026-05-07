import { describe, it, expect } from 'vitest';
import { relayVoicings } from '@/config/relay-voicings';

describe('relayVoicings config', () => {
    it('contains exactly 7 voicings', () => {
        expect(relayVoicings).toHaveLength(7);
    });

    it('includes all expected voicing slugs', () => {
        const slugs = relayVoicings.map((v) => v.slug);
        expect(slugs).toContain('lipstick');
        expect(slugs).toContain('reef');
        expect(slugs).toContain('velvet');
        expect(slugs).toContain('arc');
        expect(slugs).toContain('torch');
        expect(slugs).toContain('current');
        expect(slugs).toContain('hammer');
    });

    it('every voicing has required string fields', () => {
        for (const voicing of relayVoicings) {
            expect(typeof voicing.slug).toBe('string');
            expect(voicing.slug.length).toBeGreaterThan(0);
            expect(typeof voicing.name).toBe('string');
            expect(typeof voicing.tagline).toBe('string');
            expect(typeof voicing.genres).toBe('string');
            expect(typeof voicing.description).toBe('string');
        }
    });

    it('every voicing status is lab, ready, or concept', () => {
        for (const voicing of relayVoicings) {
            expect(['lab', 'ready', 'concept']).toContain(voicing.status);
        }
    });

    it('marks each voicing with the expected release status', () => {
        const statuses = Object.fromEntries(relayVoicings.map((v) => [v.slug, v.status]));

        expect(statuses).toEqual({
            lipstick: 'ready',
            reef: 'lab',
            velvet: 'ready',
            arc: 'lab',
            torch: 'ready',
            current: 'lab',
            hammer: 'concept',
        });
    });

    it('provides overview metadata for every voicing page', () => {
        for (const voicing of relayVoicings) {
            expect(voicing.interaction.category).toMatch(/primary voice|augment layer|subsystem|shaper|concept/i);
            expect(voicing.pickupMap.selector).toMatch(/3-way|5-way|super-switch/);
            expect(voicing.pickupMap.bridge.type).toBeTruthy();
            expect(voicing.pickupMap.middle.type).toBeTruthy();
            expect(voicing.pickupMap.neck.type).toBeTruthy();
        }
    });

    it('every voicing href points to /relay/voicings/ not /relay/ or /docs/', () => {
        for (const voicing of relayVoicings) {
            if (voicing.href) {
                expect(voicing.href).toMatch(/^\/relay\/voicings\//);
                expect(voicing.href).not.toContain('/docs/');
            }
        }
    });
});
