#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

function namedArguments(argv) {
    const values = {};
    for (let index = 0; index < argv.length; index += 2) {
        const key = argv[index];
        const value = argv[index + 1];
        if (!key?.startsWith('--') || value === undefined) throw new Error('Usage: allocate-serial.mjs --root <repository> --family <MMM> --completed <YYYY|YYYY-MM-DD>');
        values[key.slice(2)] = value;
    }
    return values;
}

function completionYear(completed) {
    if (!/^\d{4}(?:-\d{2}-\d{2})?$/.test(completed ?? '')) throw new Error(`Invalid completion value: ${completed ?? ''}. Expected YYYY or YYYY-MM-DD.`);

    const year = Number(completed.slice(0, 4));
    if (year < 2000 || year > 2099) throw new Error(`Completion year ${year} cannot be represented by the two-digit serial year.`);

    if (completed.length === 10) {
        const date = new Date(`${completed}T00:00:00Z`);
        if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== completed) throw new Error(`Invalid completion date: ${completed}. Expected YYYY or YYYY-MM-DD.`);
    }

    return year;
}

async function registeredFamilies(root) {
    const source = await readFile(resolve(root, 'config/instrument-model-codes.ts'), 'utf8');
    return new Set([...source.matchAll(/\b([A-Z]{3})\s*:\s*['"]/g)].map((match) => match[1]));
}

async function allocate() {
    const { root = process.cwd(), family, completed } = namedArguments(process.argv.slice(2));
    if (!/^[A-Z]{3}$/.test(family ?? '')) throw new Error(`Invalid family code: ${family ?? ''}. Expected three uppercase letters.`);

    const families = await registeredFamilies(root);
    if (!families.has(family)) throw new Error(`Unregistered family code: ${family}`);

    const year = completionYear(completed);
    const yearPart = String(year).slice(2);
    const entries = await readdir(resolve(root, 'content/instruments'));
    const prefix = `${family}${yearPart}`;
    const indexes = [];

    for (const entry of entries) {
        const match = /^([A-Z]{3})(\d{2})(\d{3})\.mdx$/i.exec(entry);
        if (!match || `${match[1].toUpperCase()}${match[2]}` !== prefix) continue;
        indexes.push(Number(match[3]));
    }

    indexes.sort((left, right) => left - right);
    for (let position = 0; position < indexes.length; position += 1) {
        const expected = position + 1;
        const actual = indexes[position];
        const serial = `${prefix}${String(expected).padStart(3, '0')}`;
        if (position > 0 && actual === indexes[position - 1]) throw new Error(`Duplicate ${prefix}${String(actual).padStart(3, '0')} sequence position.`);
        if (actual > expected) throw new Error(`Sequence gap: missing ${serial}. Create or restore that permanent record before allocating another serial.`);
    }

    const next = indexes.length + 1;
    if (next > 999) throw new Error(`Sequence exhausted for ${family} ${year}.`);
    process.stdout.write(`${prefix}${String(next).padStart(3, '0')}\n`);
}

allocate().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
});
