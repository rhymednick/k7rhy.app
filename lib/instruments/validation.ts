import { existsSync } from 'fs';
import { join } from 'path';
import type { InstrumentFrontmatter } from '@/types/instrument';
import { parseInstrumentSerial } from './serial';

export function validateInstrumentDocument(path: string, data: InstrumentFrontmatter) {
    const serialData = parseInstrumentSerial(path);

    if (data.images.length === 0) {
        throw new Error(`${serialData.serial} requires at least one instrument image`);
    }

    const completedYear = Number(data.completed.slice(0, 4));
    if (completedYear !== serialData.year) {
        throw new Error(`${serialData.serial} year does not match completion date ${data.completed}`);
    }

    for (const image of data.images) {
        if (!image.src.startsWith('/') || image.alt.trim().length === 0) {
            throw new Error(`${serialData.serial} has an invalid instrument image`);
        }

        const absolutePath = join(process.cwd(), 'public', image.src.replace(/^\//, ''));
        if (!existsSync(absolutePath)) {
            throw new Error(`${serialData.serial} image does not exist: ${image.src}`);
        }
    }

    return serialData;
}
