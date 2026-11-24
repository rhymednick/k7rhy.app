import { describe, expect, it } from 'vitest';
// @ts-expect-error plain ES module without type declarations
import { svgDoc, wire, terminal, toggle3, pot, netLabel } from './draw.mjs';
// @ts-expect-error plain ES module without type declarations
import { verifyDrawing } from './verify-drawings.mjs';

type Result = { ok: boolean; problems: string[] };
const verify = (svg: string, opts: { expectedMode?: 'DIRECT' | 'OFF' | 'REACTIVE'; terminals: string[] }) => verifyDrawing(svg, opts) as Result;

// BUS runs left to right, OUT runs top to bottom, and they cross at (200,100).
const crossing = (dot: boolean) =>
    svgDoc(
        400,
        300,
        'Crossing',
        [
            wire('BUS', [
                [100, 100],
                [300, 100],
            ]),
            wire(
                'OUT',
                [
                    [200, 50],
                    [200, 150],
                ],
                dot ? { dot: [[200, 100]] } : undefined
            ),
            terminal('SEL.C', 100, 100),
            terminal('VOL.IN', 300, 100),
            terminal('VOL.W', 200, 50),
            terminal('JACK.TIP', 200, 150),
        ].join('')
    );
const crossingTerminals = ['SEL.C', 'VOL.IN', 'VOL.W', 'JACK.TIP'];

describe('drawing verifier', () => {
    it('treats a crossing with no dot as two separate nets', () => {
        expect(verify(crossing(false), { terminals: crossingTerminals })).toEqual({ ok: true, problems: [] });
    });

    it('fails when a junction dot joins nets the netlist keeps apart', () => {
        const result = verify(crossing(true), { terminals: crossingTerminals });
        expect(result.ok).toBe(false);
        expect(result.problems.join('\n')).toMatch(/VOL\.W|JACK\.TIP/);
    });

    it('fails when the SW.REACTIVE to TONE.CW wire is missing and names REACT', () => {
        const svg = svgDoc(400, 300, 'Missing wire', [terminal('TONE.CW', 100, 200), terminal('SW.REACTIVE', 300, 200)].join(''));
        const result = verify(svg, { terminals: ['TONE.CW', 'SW.REACTIVE'] });
        expect(result.ok).toBe(false);
        expect(result.problems.join('\n')).toContain('REACT');
    });

    it('fails when the same two terminals are wired but the netlist keeps them apart', () => {
        const svg = svgDoc(
            400,
            300,
            'Wrong wire',
            [
                wire('REACT', [
                    [100, 200],
                    [300, 200],
                ]),
                terminal('TONE.CW', 100, 200),
                terminal('JACK.TIP', 300, 200),
            ].join('')
        );
        expect(verify(svg, { terminals: ['TONE.CW', 'JACK.TIP'] }).ok).toBe(false);
    });

    it('fails when a drawn terminal is missing or extra', () => {
        const result = verify(crossing(false), { terminals: ['SEL.C', 'VOL.IN', 'VOL.W'] });
        expect(result.ok).toBe(false);
        expect(result.problems.join('\n')).toContain('JACK.TIP');
    });

    it('fails when text is smaller than 14 px', () => {
        const svg = crossing(false).replace('</svg>', '<text x="10" y="10" font-size="12">tiny</text></svg>');
        expect(verify(svg, { terminals: crossingTerminals }).ok).toBe(false);
    });

    describe('toggle', () => {
        const switchDrawing = (mode: 'DIRECT' | 'OFF' | 'REACTIVE' | null) =>
            svgDoc(
                600,
                400,
                'Switch',
                [
                    toggle3('SW', 300, 150, mode),
                    wire('BUS', [
                        [240, 150],
                        [240, 60],
                    ]),
                    terminal('VOL.IN', 240, 60),
                    wire('REACT', [
                        [360, 150],
                        [360, 60],
                    ]),
                    terminal('TONE.CW', 360, 60),
                    wire('TB-SW', [
                        [300, 240],
                        [300, 330],
                    ]),
                    terminal('CB.2', 300, 330),
                ].join('')
            );
        const terminals = ['SW.C', 'SW.DIRECT', 'SW.OFF', 'SW.REACTIVE', 'VOL.IN', 'TONE.CW', 'CB.2'];

        it('joins SW.C to BUS and not to REACT when drawn in Direct', () => {
            expect(verify(switchDrawing('DIRECT'), { expectedMode: 'DIRECT', terminals })).toEqual({ ok: true, problems: [] });
            const wrong = verify(switchDrawing('DIRECT'), { expectedMode: 'REACTIVE', terminals });
            expect(wrong.ok).toBe(false);
            expect(wrong.problems.join('\n')).toMatch(/SW\.C/);
        });

        it('joins SW.C to REACT when drawn in Reactive and leaves Off open', () => {
            expect(verify(switchDrawing('REACTIVE'), { expectedMode: 'REACTIVE', terminals }).ok).toBe(true);
            expect(verify(switchDrawing('OFF'), { expectedMode: 'OFF', terminals }).ok).toBe(true);
            expect(verify(switchDrawing('OFF'), { expectedMode: 'DIRECT', terminals }).ok).toBe(false);
        });

        it('labels the throws Direct, Off and Reactive', () => {
            const svg = switchDrawing(null);
            for (const word of ['Direct', 'Off', 'Reactive']) expect(svg).toContain(`>${word}<`);
        });
    });

    it('draws a rear-view pot with CW, wiper and CCW labels and left, center, right lugs', () => {
        const svg = pot('TONE', 300, 200, { view: 'rear', ends: { left: 'TONE.CW', wiper: 'TONE.W', right: 'TONE.CCW' } });
        for (const word of ['CW', 'Wiper', 'CCW']) expect(svg).toContain(`>${word}<`);
        const xs = ['TONE.CW', 'TONE.W', 'TONE.CCW'].map((n) => Number(new RegExp(`data-terminal="${n.replace('.', '\\.')}"[^>]*cx="([\\d.]+)"`).exec(svg)?.[1]));
        expect(xs[0]).toBeLessThan(xs[1]);
        expect(xs[1]).toBeLessThan(xs[2]);
    });

    it('rejects a net label whose net does not exist', () => {
        const svg = svgDoc(400, 300, 'Label', netLabel('NOPE', 100, 100));
        expect(verify(svg, { terminals: [] }).ok).toBe(false);
        expect(verify(svgDoc(400, 300, 'Label', netLabel('REACT', 100, 100)), { terminals: [] }).ok).toBe(true);
    });
});
