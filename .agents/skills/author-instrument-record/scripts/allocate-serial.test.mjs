import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const allocator = new URL('./allocate-serial.mjs', import.meta.url);

async function repository(files = []) {
    const root = await mkdtemp(join(tmpdir(), 'instrument-serial-'));
    await mkdir(join(root, 'config'), { recursive: true });
    await mkdir(join(root, 'content/instruments'), { recursive: true });
    await writeFile(join(root, 'config/instrument-model-codes.ts'), "export const INSTRUMENT_MODEL_CODES = { RLY: 'Relay', REX: 'Relay Example', CVL: 'Coupeville', '5E3': '5E3-style tube amplifier' };\n");
    await Promise.all(files.map((name) => writeFile(join(root, 'content/instruments', name), '---\npublish: false\n---\n')));
    return root;
}

function allocate(root, family, completed) {
    return spawnSync(process.execPath, [allocator.pathname, '--root', root, '--family', family, '--completed', completed], { encoding: 'utf8' });
}

test('allocates 001 for an empty family/year sequence', async () => {
    const result = allocate(await repository(), 'CVL', '2026');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), 'CVL26001');
});

test('allocates exactly the next contiguous sequence number', async () => {
    const result = allocate(await repository(['CVL26001.mdx', 'CVL26002.mdx', 'CVL25001.mdx', 'RLY26001.mdx']), 'CVL', '2026-07-26');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), 'CVL26003');
});

test('rejects a gap instead of skipping around it', async () => {
    const result = allocate(await repository(['CVL26001.mdx', 'CVL26003.mdx']), 'CVL', '2026');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /missing CVL26002/i);
});

test('rejects unknown families and malformed completion values', async () => {
    const root = await repository();
    const unknown = allocate(root, 'ZZZ', '2026');
    assert.notEqual(unknown.status, 0);
    assert.match(unknown.stderr, /unregistered family code: ZZZ/i);

    const malformed = allocate(root, 'CVL', 'July 2026');
    assert.notEqual(malformed.status, 0);
    assert.match(malformed.stderr, /expected YYYY or YYYY-MM-DD/i);
});

test('allocates numeric family prefixes from quoted registry keys and counts their records', async () => {
    const result = allocate(await repository(['5E326001.mdx', '5E326002.mdx']), '5E3', '2026');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), '5E326003');
});

test('preserves gap detection for numeric family prefixes', async () => {
    const result = allocate(await repository(['5E326002.mdx']), '5E3', '2026');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /missing 5E326001/i);
});
