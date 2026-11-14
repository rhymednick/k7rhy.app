/**
 * Price rule between Shopify and Reverb. Shopify is the hub and leads on
 * price; Reverb gets a markup that covers its selling fees. Prices only flow
 * Shopify → Reverb (owner, 2026-11-13). Change the rule here.
 */

export const REVERB_MARKUP = 0.05;
export const REVERB_ROUND_TO = 5;

/** Shopify price plus 5%, rounded up to the next $5. */
export function reverbPriceFor(shopifyPrice: number): number {
    if (!Number.isFinite(shopifyPrice) || shopifyPrice <= 0) {
        throw new Error(`Invalid Shopify price: ${shopifyPrice}`);
    }
    // Round to cents first so float noise (e.g. 771.7500000001) can't push a price up a step.
    const marked = Math.round(shopifyPrice * (1 + REVERB_MARKUP) * 100) / 100;
    return Math.ceil(marked / REVERB_ROUND_TO) * REVERB_ROUND_TO;
}
