import { describe, it, expect } from 'vitest';
import { relayModels } from '@/config/relay-models';

describe('relayModels config', () => {
    it('contains exactly 7 models', () => {
        expect(relayModels).toHaveLength(7);
    });

    it('includes all expected model keys', () => {
        const keys = relayModels.map((m) => m.modelKey);
        expect(keys).toContain('lipstick');
        expect(keys).toContain('reef');
        expect(keys).toContain('velvet');
        expect(keys).toContain('arc');
        expect(keys).toContain('torch');
        expect(keys).toContain('current');
        expect(keys).toContain('hammer');
    });

    it('every model has required string fields', () => {
        for (const model of relayModels) {
            expect(typeof model.modelKey).toBe('string');
            expect(model.modelKey.length).toBeGreaterThan(0);
            expect(typeof model.name).toBe('string');
            expect(typeof model.tagline).toBe('string');
            expect(typeof model.genres).toBe('string');
            expect(typeof model.description).toBe('string');
        }
    });

    it('every model status is lab or ready', () => {
        for (const model of relayModels) {
            expect(['lab', 'ready']).toContain(model.status);
        }
    });

    it('every model href points to /relay/ not /docs/relay/', () => {
        for (const model of relayModels) {
            if (model.href) {
                expect(model.href).toMatch(/^\/relay\//);
                expect(model.href).not.toContain('/docs/');
            }
        }
    });
});
