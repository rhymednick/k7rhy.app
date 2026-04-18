import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { zipSync, strToU8 } from 'fflate';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const files = searchParams.getAll('files');
    const name = searchParams.get('name') ?? 'download';

    if (!files.length) {
        return NextResponse.json({ error: 'No files specified' }, { status: 400 });
    }

    const entries: Record<string, Uint8Array> = {};

    for (const href of files) {
        // Only allow files from /public — prevent path traversal
        const normalized = path.normalize(href).replace(/^(\.\.(\/|\\|$))+/, '');
        const abs = path.join(process.cwd(), 'public', normalized);

        if (!abs.startsWith(path.join(process.cwd(), 'public'))) {
            return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
        }

        try {
            const data = fs.readFileSync(abs);
            const filename = path.basename(normalized);
            entries[filename] = new Uint8Array(data);
        } catch {
            return NextResponse.json({ error: `File not found: ${href}` }, { status: 404 });
        }
    }

    const zipped = zipSync(entries);

    return new NextResponse(Buffer.from(zipped), {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${name}.zip"`,
        },
    });
}
