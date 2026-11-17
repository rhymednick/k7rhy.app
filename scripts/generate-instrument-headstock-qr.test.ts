// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { expect, it } from 'vitest';

it('generates the canonical QR label for a three-character alphanumeric family', async () => {
    const root = await mkdtemp(join(tmpdir(), 'amp-qr-'));
    try {
        await mkdir(join(root, 'content/instruments'), { recursive: true });
        await writeFile(join(root, 'content/instruments/5E326001.mdx'), '');
        execFileSync(process.execPath, [resolve('scripts/generate-instrument-headstock-qr.mjs'), '5E326001'], { cwd: root });
        const svg = await readFile(join(root, 'docs/engineering/strat-cunife/5E326001-headstock-qr.svg'), 'utf8');
        expect(svg).toContain('https://k7rhy.app/sn/5E326001');
        expect(svg).toContain('5E326001 headstock QR label');
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});
