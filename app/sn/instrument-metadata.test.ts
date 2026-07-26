import { describe, expect, it } from 'vitest';
import { privateInstrumentRobots } from './instrument-metadata';

describe('serialized instrument metadata', () => {
    it('keeps exact-URL record and print pages out of search indexes', () => {
        expect(privateInstrumentRobots).toEqual({ index: false, follow: false });
    });
});
