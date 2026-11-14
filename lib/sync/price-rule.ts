/**
 * Price rule between Reverb and Shopify. Reverb leads: the owner sets the
 * Reverb price, and Shopify sells about 5% lower because it carries no
 * marketplace fee. Prices only ever flow Reverb → Shopify (owner, 2026-11-13).
 */

export const SHOPIFY_DISCOUNT = 0.05;
export const SHOPIFY_ROUND_TO = 5;

/** Reverb price less 5%, rounded down to the next $5. */
export function shopifyPriceFor(reverbPrice: number): number {
    if (!Number.isFinite(reverbPrice) || reverbPrice <= 0) {
        throw new Error(`Invalid Reverb price: ${reverbPrice}`);
    }
    // Round to cents first so float noise can't drop a price a whole step.
    const discounted = Math.round(reverbPrice * (1 - SHOPIFY_DISCOUNT) * 100) / 100;
    return Math.floor(discounted / SHOPIFY_ROUND_TO) * SHOPIFY_ROUND_TO;
}
