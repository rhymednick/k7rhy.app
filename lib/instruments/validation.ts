import { existsSync } from 'fs';
import { join } from 'path';
import type { InstrumentFrontmatter } from '@/types/instrument';
import { parseInstrumentSerial } from './serial';

export function validateInstrumentDocument(path: string, data: InstrumentFrontmatter) {
    const serialData = parseInstrumentSerial(path);

    if (data.images.length === 0) {
        throw new Error(`${serialData.serial} requires at least one instrument image`);
    }

    if (!data.completed && data.publish) throw new Error(`${serialData.serial} cannot publish before completion`);
    if (!data.completed && !data.started) throw new Error(`${serialData.serial} requires a completion or build start date`);

    if (data.completed && !/<InstrumentSpec[\s>/]/.test(data.content)) {
        throw new Error(`${serialData.serial} requires an InstrumentSpec voice and control map once completed`);
    }

    if (data.started && Number(data.started.slice(0, 4)) !== serialData.year) {
        throw new Error(`${serialData.serial} year does not match start date ${data.started}`);
    }

    if (data.completed && Number(data.completed.slice(0, 4)) !== serialData.year) {
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
