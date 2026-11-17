import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { describe, expect, it } from 'vitest';
import { AmplifierSpec, AmplifierSection, AmplifierDetail, PrintAmplifierSpec, PrintAmplifierSection, PrintAmplifierDetail } from './amplifier-spec';

describe('amplifier record and control card', () => {
    it.each([false, true])('renders the actual amp MDX with the full control map (print=%s)', async (print) => {
        const { content } = await compileMDX({ source: readFileSync('content/instruments/5E326001.mdx', 'utf8'), options: { parseFrontmatter: true, mdxOptions: { remarkPlugins: [remarkGfm] } }, components: { AmplifierSpec: print ? PrintAmplifierSpec : AmplifierSpec, AmplifierSection: print ? PrintAmplifierSection : AmplifierSection, AmplifierDetail: print ? PrintAmplifierDetail : AmplifierDetail } });
        const html = renderToStaticMarkup(content);
        for (const label of ['Normal 1', 'Normal 2', 'Bright 1', 'Bright 2', 'Normal Volume', 'Bright Volume', 'Tone', 'Standby', 'Power', '8 ohms', '2A', 'Grounding']) expect(html).toContain(label);
        expect(html).not.toContain('Pickup configuration');
        expect(html).toContain('<table>');
        expect(html).toContain('<th>Recorded result</th>');
        expect(html).toContain(print ? 'data-print-instrument-spec' : 'data-amplifier-spec');
    });
    it('rejects empty and unsupported structured content', () => {
        expect(() =>
            renderToStaticMarkup(
                <AmplifierSpec>
                    <div>Not a section</div>
                </AmplifierSpec>
            )
        ).toThrow('unsupported child');
        expect(() => renderToStaticMarkup(<AmplifierSection title="Inputs">{null}</AmplifierSection>)).toThrow('at least one entry');
        expect(() => renderToStaticMarkup(<AmplifierDetail label="">Input</AmplifierDetail>)).toThrow('requires a label');
    });
    it('uses an explicit short print description when supplied', () => {
        const html = renderToStaticMarkup(
            <PrintAmplifierDetail label="Speaker" printDescription="Keep connected.">
                Longer owner explanation.
            </PrintAmplifierDetail>
        );
        expect(html).toContain('Keep connected.');
        expect(html).not.toContain('Longer owner explanation.');
    });
});
