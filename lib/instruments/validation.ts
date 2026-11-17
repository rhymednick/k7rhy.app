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

    const spec = data.kind === 'amplifier' ? 'AmplifierSpec' : 'InstrumentSpec';
    if (data.completed && !new RegExp(`<${spec}[\\s>/]`).test(data.content)) {
        throw new Error(`${serialData.serial} requires an ${spec} voice and control map once completed`);
    }

    if (data.started && Number(data.started.slice(0, 4)) !== serialData.year) {
        throw new Error(`${serialData.serial} year does not match start date ${data.started}`);
    }

    if (data.completed && Number(data.completed.slice(0, 4)) !== serialData.year) {
        throw new Error(`${serialData.serial} year does not match completion date ${data.completed}`);
    }

    for (const image of data.images) {
        let remote = false;
        try {
            const url = new URL(image.src);
            remote = url.protocol === 'https:' && url.hostname === 'cdn.shopify.com' && !url.username && !url.password && url.pathname.startsWith('/s/files/1/0663/5293/9165/files/');
        } catch {
            /* Local photographs have no URL scheme. */
        }
        if ((!image.src.startsWith('/') && !remote) || image.alt.trim().length === 0) {
            throw new Error(`${serialData.serial} has an invalid instrument image`);
        }

        if (remote) continue;
        const absolutePath = join(process.cwd(), 'public', image.src.replace(/^\//, ''));
        if (!existsSync(absolutePath)) {
            throw new Error(`${serialData.serial} image does not exist: ${image.src}`);
        }
    }

    return serialData;
}
