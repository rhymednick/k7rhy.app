import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getInstrumentWiringReference, instrumentWiringReferences } from './wiring-reference';

describe('instrument wiring references', () => {
    const references = Object.values(instrumentWiringReferences);

    it('names each diagram by its serial and current revision', () => {
        for (const reference of references) {
            expect(reference.diagram).toBe(`/wiring-diagrams/${reference.serial}-wiring-rev-${reference.revision}.png`);
            expect(existsSync(join(process.cwd(), 'public', reference.diagram))).toBe(true);
            expect(reference.diagramAlt).toContain(reference.serial);
        }
    });

    it('records the instrument as built rather than as a build guide', () => {
        for (const reference of references) {
            const text = JSON.stringify(reference);
            expect(text).not.toMatch(/before (wiring|soldering|installing)|bench|tap-test|continuity meter|must be|identify (the|actual)|confirm/i);
            expect(reference).not.toHaveProperty('buildSteps');
            expect(reference).not.toHaveProperty('checks');
        }
    });

    it('describes the treble bleed in the same order on both instruments', () => {
        for (const reference of references) {
            expect(reference.parts.join(' ')).toContain('1,200 pF capacitor in parallel with a 150 kΩ resistor, from the volume input, then a 20 kΩ resistor to the volume wiper');
        }
    });

    it('returns undefined for a serial without a wiring reference', () => {
        expect(getInstrumentWiringReference('CVL26001')).toBeUndefined();
    });
});
