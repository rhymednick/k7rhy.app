import React from 'react';

export type PickupType = 'humbucker' | 'lipstick' | 'p90' | 'single';
export type SelectorType = '3-way' | '5-way';

interface WiringDiagramProps {
    /** Set to true for Lab models where the final diagram isn't ready */
    placeholder?: boolean;
    modelName?: string;
}

function PlaceholderDiagram({ modelName }: { modelName?: string }) {
    return (
        <div className="my-6 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 py-10 text-sm text-muted-foreground">
            <span className="font-medium">Wiring diagram</span>
            <span>{modelName ? `${modelName} diagram in progress` : 'Diagram in progress'}</span>
            <span className="text-xs">Published when design is validated</span>
        </div>
    );
}

/** Lipstick prototype: 3-way selector, bridge+neck humbuckers, middle lipstick via blend */
function LipstickDiagram() {
    return (
        <div className="my-6 overflow-x-auto">
            <svg
                viewBox="0 0 520 300"
                className="mx-auto w-full max-w-[520px]"
                aria-label="Relay Lipstick wiring diagram"
                role="img"
            >
                {/* Background */}
                <rect width="520" height="300" rx="12" fill="currentColor" className="text-muted/20" />

                {/* ── Pickup symbols ── */}
                {/* Bridge humbucker */}
                <g transform="translate(60, 40)">
                    <rect x="0" y="0" width="80" height="30" rx="4" fill="none" stroke="currentColor" className="text-border" strokeWidth="1.5" />
                    <rect x="4" y="4" width="34" height="22" rx="2" fill="currentColor" className="text-muted-foreground/20" />
                    <rect x="42" y="4" width="34" height="22" rx="2" fill="currentColor" className="text-muted-foreground/20" />
                    <text x="40" y="-8" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">BRIDGE</text>
                </g>

                {/* Middle lipstick */}
                <g transform="translate(220, 40)">
                    <rect x="0" y="0" width="80" height="18" rx="9" fill="none" stroke="currentColor" className="text-border" strokeWidth="1.5" />
                    <text x="40" y="-8" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">MIDDLE</text>
                </g>

                {/* Neck humbucker */}
                <g transform="translate(380, 40)">
                    <rect x="0" y="0" width="80" height="30" rx="4" fill="none" stroke="currentColor" className="text-border" strokeWidth="1.5" />
                    <rect x="4" y="4" width="34" height="22" rx="2" fill="currentColor" className="text-muted-foreground/20" />
                    <rect x="42" y="4" width="34" height="22" rx="2" fill="currentColor" className="text-muted-foreground/20" />
                    <text x="40" y="-8" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">NECK</text>
                </g>

                {/* ── 3-way switch ── */}
                <g transform="translate(200, 130)">
                    <rect x="0" y="0" width="120" height="28" rx="4" fill="none" stroke="currentColor" className="text-border" strokeWidth="1.5" />
                    {[0, 1, 2].map((i) => (
                        <circle key={i} cx={20 + i * 40} cy={14} r={6} fill="none" stroke="currentColor" className="text-muted-foreground/50" strokeWidth="1.5" />
                    ))}
                    <text x="60" y="46" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">3-WAY SELECTOR</text>
                </g>

                {/* ── Controls row ── */}
                {/* Volume pot */}
                <g transform="translate(120, 200)">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" className="text-border" strokeWidth="1.5" />
                    <circle cx="20" cy="20" r="8" fill="currentColor" className="text-muted-foreground/30" />
                    <text x="20" y="48" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">VOL</text>
                </g>

                {/* Tone pot (humbucker) */}
                <g transform="translate(220, 200)">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" className="text-border" strokeWidth="1.5" />
                    <circle cx="20" cy="20" r="8" fill="currentColor" className="text-muted-foreground/30" />
                    <text x="20" y="48" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">TONE HB</text>
                </g>

                {/* Tone pot (lipstick blend) */}
                <g transform="translate(320, 200)">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" className="text-border" strokeWidth="1.5" />
                    <circle cx="20" cy="20" r="8" fill="currentColor" className="text-muted-foreground/30" />
                    <text x="20" y="48" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">BLEND</text>
                </g>

                {/* ── Output jack ── */}
                <g transform="translate(430, 200)">
                    <rect x="0" y="0" width="36" height="36" rx="18" fill="none" stroke="currentColor" className="text-border" strokeWidth="1.5" />
                    <circle cx="18" cy="18" r="6" fill="currentColor" className="text-muted-foreground/40" />
                    <text x="18" y="54" textAnchor="middle" className="text-[10px] fill-muted-foreground font-mono">OUTPUT</text>
                </g>

                {/* ── Wiring connections (hot signals) ── */}
                {/* Bridge → switch pos 1 */}
                <line x1="100" y1="70" x2="210" y2="137" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
                {/* Neck → switch pos 3 */}
                <line x1="420" y1="70" x2="310" y2="137" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
                {/* Middle → blend pot */}
                <line x1="260" y1="58" x2="340" y2="200" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
                {/* Switch → volume */}
                <line x1="230" y1="158" x2="140" y2="200" stroke="#ef4444" strokeWidth="1.5" opacity="0.7" />
                {/* Volume → output */}
                <line x1="160" y1="218" x2="430" y2="218" stroke="#ef4444" strokeWidth="1.5" opacity="0.7" />

                {/* ── Legend ── */}
                <g transform="translate(20, 270)">
                    <line x1="0" y1="6" x2="20" y2="6" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="26" y="10" className="text-[9px] fill-muted-foreground">Hot</text>
                    <line x1="60" y1="6" x2="80" y2="6" stroke="#f59e0b" strokeWidth="1.5" />
                    <text x="86" y="10" className="text-[9px] fill-muted-foreground">Lipstick blend</text>
                </g>

                <text x="260" y="290" textAnchor="middle" className="text-[9px] fill-muted-foreground/50">
                    Provisional — subject to change after physical validation
                </text>
            </svg>
        </div>
    );
}

export function RelayWiringDiagram({ placeholder = false, modelName }: WiringDiagramProps) {
    if (placeholder) return <PlaceholderDiagram modelName={modelName} />;
    return <LipstickDiagram />;
}
