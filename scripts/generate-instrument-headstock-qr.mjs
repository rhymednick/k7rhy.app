#!/usr/bin/env node

import { writeFile, mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QRCodeSVG } from 'qrcode.react';

const root = process.cwd();
const outputDirectory = join(root, 'docs/engineering/strat-cunife');

await mkdir(outputDirectory, { recursive: true });

for (const serial of process.argv.slice(2)) {
    if (!/^[A-Z]{3}\d{5}$/.test(serial)) throw new Error(`Invalid serial: ${serial}`);
    await access(join(root, 'content/instruments', `${serial}.mdx`));

    const url = `https://k7rhy.app/sn/${serial}`;
    const qr = renderToStaticMarkup(
        React.createElement(QRCodeSVG, {
            value: url,
            size: 236,
            level: 'H',
            marginSize: 4,
            bgColor: 'transparent',
            fgColor: '#000000',
        })
    ).replace('<svg ', '<svg x="35" y="7" ');

    const artwork = `<svg xmlns="http://www.w3.org/2000/svg" width="54mm" height="25mm" viewBox="0 0 540 250" role="img" aria-labelledby="title description">
<title id="title">${serial} headstock QR label</title>
<desc id="description">Transparent headstock label with a QR code for ${url}, a short record invitation, and instrument number ${serial}.</desc>
<path d="M12 25v200M276 25v200" fill="none" stroke="#000000" stroke-width="1.8"/>
${qr}
<g fill="#000000" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="32">
  <text x="297" y="62">Scan for this</text>
  <text x="297" y="96">instrument’s</text>
  <text x="297" y="130">build record.</text>
  <text x="297" y="175" font-size="28">Instrument No.</text>
</g>
<text x="297" y="218" fill="#000000" font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="700" letter-spacing="2">${serial}</text>
</svg>
`;

    const path = join(outputDirectory, `${serial}-headstock-qr.svg`);
    await writeFile(path, artwork);
    process.stdout.write(`${path}\n`);
}
