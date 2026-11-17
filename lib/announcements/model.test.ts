// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { linkedText, plan, renderListing, type Listing } from './model';
const record = 'https://k7rhy.app/sn/STR26001';
const wiring = record + '/wiring';
const listing: Listing = {
    id: '123',
    title: 'Tomatillo',
    description: 'A custom-assembled S-type with a series switch for the paired-pickup positions. Includes a tweed hardshell case.',
    price: 799,
    currency: 'USD',
    available: true,
    ready: true,
    links: [
        { label: 'Purchase', url: 'https://shop.k7rhy.app/products/test' },
        { label: 'Details', url: 'https://k7rhy.app/shop/guitars/test' },
        { label: 'Instrument record', url: record },
        { label: 'Related', url: wiring },
    ],
};
describe('compact announcement links', () => {
    it('links existing approved words and includes the record in the description paragraph', () => {
        const content = renderListing(listing, 'Available');
        expect(content).toContain(`[series switch for the paired-pickup positions](${wiring})`);
        expect(content).toContain(`case. See the [instrument record](${record}).`);
        expect(content).toContain('[Purchase](https://shop.k7rhy.app/products/test) · [Product details](https://k7rhy.app/shop/guitars/test)');
        expect(content).not.toContain('Related:');
        expect(content).not.toContain('Instrument record:');
        expect(listing.description).toBe('A custom-assembled S-type with a series switch for the paired-pickup positions. Includes a tweed hardshell case.');
    });
    it('keeps an unfamiliar related page as named prose and escapes owner Markdown', () => {
        const content = renderListing({ ...listing, description: '**Owner words** [unexpected](https://example.com).', links: [{ label: 'Related', url: 'https://example.com/guide' }] }, 'Available');
        expect(content).toContain('\\*\\*Owner words\\*\\* \\[unexpected\\]');
        expect(content).toContain('See the [related page](https://example.com/guide).');
    });
    it('edits an existing message in place without making another listing or price-drop post', () => {
        const oldContent = 'Previous full URL message';
        const result = plan('123', { messageId: '456', channelId: '789', content: oldContent, price: 799, currency: 'USD' }, listing, false, '789');
        expect(result.actions).toHaveLength(1);
        expect(result.actions[0]).toMatchObject({ kind: 'edit', target: '456', purpose: 'listing' });
        expect(result.actions[0].content).toContain('[instrument record]');
    });
    it('uses a named link in price-drop notices', () => {
        const result = plan('123', { messageId: '456', channelId: '789', content: renderListing(listing, 'Available'), price: 900, currency: 'USD' }, listing, false, '789');
        expect(result.actions.find((x) => x.purpose === 'drop')?.content).toContain('[View listing](https://discord.com/channels/1432214244459417693/789/456)');
    });
    it('keeps all collected launch links named and all posted messages within Discord limits', () => {
        const packet = JSON.parse(readFileSync('docs/engineering/discord-announcement-copy.json', 'utf8'));
        for (const item of packet.records) {
            const links = [{ label: 'Purchase', url: item.purchase_url }, { label: 'Details', url: item.details_url }, { label: 'Instrument record', url: item.record_url }, ...item.related_urls.map((url: string) => ({ label: 'Related', url }))];
            const content = renderListing({ ...listing, title: item.product_name, description: item.description, links }, 'Available');
            expect(content.length).toBeLessThanOrEqual(2000);
            for (const { url } of links) expect(content).toContain(`](${url})`);
        }
    });
    it('rejects executable links and protects parentheses in legitimate URL destinations', () => {
        expect(() => linkedText('Unsafe', 'javascript:alert(1)')).toThrow('HTTPS');
        expect(linkedText('Guide', 'https://example.com/guide_(1)')).toBe('[Guide](https://example.com/guide_%281%29)');
    });
});
