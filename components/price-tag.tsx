import { getCachedPrice } from '@/lib/amazon-prices';

interface PriceTagProps {
    /** Key from data/price-cache.json (e.g. "guitar-neck") */
    itemKey: string;
    /** Shown if the key is not found in the cache */
    fallback: string;
}

/**
 * Renders a product price from data/price-cache.json.
 * Update the cache file manually when prices change.
 */
export function PriceTag({ itemKey, fallback }: PriceTagProps) {
    const price = getCachedPrice(itemKey, fallback);
    return <span>{price}</span>;
}
