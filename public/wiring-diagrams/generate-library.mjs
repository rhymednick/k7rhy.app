#!/usr/bin/env node
/**
 * Generates a draw.io custom shape library from the SVG components in ./components/
 *
 * Usage:
 *   node generate-library.mjs
 *
 * Output:
 *   relay-guitar-wiring.xml  — import this file into draw.io via File > Open Library
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(__dirname, 'components');
const metadataPath = join(componentsDir, 'metadata.json');
const outputPath = join(__dirname, 'relay-guitar-wiring.xml');

const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));

const shapes = [];

for (const [name, config] of Object.entries(metadata)) {
    const svgPath = join(componentsDir, `${name}.svg`);
    const svgContent = readFileSync(svgPath, 'utf-8');
    const base64 = Buffer.from(svgContent).toString('base64');

    const pointsStyle = config.points?.length
        ? `points=${JSON.stringify(config.points)};`
        : '';

    const style = [
        'shape=image',
        `image=data:image/svg+xml;base64,${base64}`,
        'aspect=fixed',
        'strokeColor=none',
        'fillColor=none',
        pointsStyle,
    ]
        .filter(Boolean)
        .join(';');

    // Build the mxGraphModel XML for this shape
    const xml =
        `<mxGraphModel>` +
        `<root>` +
        `<mxCell id="0"/>` +
        `<mxCell id="1" parent="0"/>` +
        `<mxCell id="2" value="" style="${style}" vertex="1" parent="1">` +
        `<mxGeometry x="0" y="0" width="${config.w}" height="${config.h}" as="geometry"/>` +
        `</mxCell>` +
        `</root>` +
        `</mxGraphModel>`;

    shapes.push({
        xml,
        w: config.w,
        h: config.h,
        aspect: 'fixed',
        title: config.title,
    });
}

// draw.io library format: <mxlibrary>JSON_ARRAY</mxlibrary>
const library = `<mxlibrary>${JSON.stringify(shapes)}</mxlibrary>`;
writeFileSync(outputPath, library, 'utf-8');

console.log(`✓ Generated relay-guitar-wiring.xml with ${shapes.length} shapes:`);
for (const s of shapes) {
    console.log(`  • ${s.title} (${s.w}×${s.h})`);
}
