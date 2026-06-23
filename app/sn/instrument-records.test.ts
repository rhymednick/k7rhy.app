import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'app/sn/instrument-records.css'), 'utf8');

describe('instrument case-card print geometry', () => {
    it('fits Letter and A4 at 100% with printer-safe tolerance', () => {
        expect(css).toMatch(/@page\s*{[^}]*size:\s*auto;/s);
        expect(css).toMatch(/@media print[\s\S]*?main:has\(\.instrument-case-card\)\s*{[\s\S]*?width:\s*7\.2in;[\s\S]*?height:\s*9\.8in;/);
        expect(css).toMatch(/@media print[\s\S]*?\.instrument-case-card\s*{[\s\S]*?width:\s*7\.57in;[\s\S]*?height:\s*10\.3in;[\s\S]*?transform:\s*scale\(0\.95\);/);
    });
});
