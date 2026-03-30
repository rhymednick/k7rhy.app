import priceCache from '@/data/price-cache.json';

type CacheEntry = { title: string; price: string };
type PriceCache = { lastUpdated: string | null; items: Record<string, CacheEntry> };

const cache = priceCache as PriceCache;

/**
 * Returns the cached price for an item key, or the fallback value if not found.
 * Update data/price-cache.json manually when prices change.
 */
export function getCachedPrice(key: string, fallback: string): string {
    return cache.items[key]?.price ?? fallback;
}
