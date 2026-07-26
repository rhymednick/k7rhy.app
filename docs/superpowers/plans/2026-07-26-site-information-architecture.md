# Site Information Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize K7RHY.app around Ham Radio and Guitars, replace Products with Shop and Lab Notes with a Discord-backed Community page, migrate Relay beneath Guitars, retire the blog pipeline, and correct private instrument namespaces.

**Architecture:** Keep one Next.js deployment with four domain-led entry points. Reuse the current product and Relay implementations behind canonical `/shop` and `/guitars/relay` routes, fetch Discord announcements server-side with bounded caching and graceful failure, and retain Content Collections only for private instrument MDX records.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict mode, Content Collections, MDX, Vitest, Testing Library, Next Sitemap, Discord REST API v10, Shopify Storefront links.

## Global Constraints

- Main navigation is exactly Ham Radio, Guitars, Shop, and Community.
- `/docs/...` URLs remain unchanged even though documents are discovered within subject sections.
- `/sn/...` routes remain exact-URL-only: no navigation links, public index, sitemap entries, or search-engine indexing.
- `/relay/...`, `/products/...`, and `/blog` use permanent redirects to their approved canonical equivalents; `/blog/<slug>` returns 404.
- `DISCORD_BOT_TOKEN` remains server-only and announcement responses revalidate every 300 seconds.
- Discord announcement channel ID is exactly `1432603806704603248`.
- Shopify remains authoritative for price, availability, inventory, orders, payment, and checkout; this phase does not change plans, DNS, or storefront hosting.
- `REX` means Relay Example; `RLY` is reserved for real sold Relay prototypes.
- `CVL` means Coupeville; its three-digit index increments across all Coupeville instruments completed in the same year, regardless of submodel.
- Do not delete Rainbow Telecaster photographs used by `REX26001`.
- Preserve 4-space indentation, single quotes, and existing project formatting.

---

## File structure

### New files

- `app/ham-radio/page.tsx` — subject landing page for radio work, relevant docs, and radio shopping.
- `app/guitars/page.tsx` — platform-neutral guitar landing page; it does not expose serial records.
- `app/community/page.tsx` — Discord community introduction and announcement feed composition.
- `components/community/announcement-feed.tsx` — presentational server component for announcement states and messages.
- `components/community/announcement-feed.test.tsx` — feed rendering and safe-link tests.
- `lib/discord.test.ts` — Discord API success and failure contract tests.
- `config/navigation.test.ts` — exact main-navigation contract.
- `app/sn/instrument-metadata.test.ts` — shared assertion for unlisted record metadata.
- `docs/architecture/site-organization.md` — canonical vendor-neutral organizational policy.
- `docs/todos/instrument-record-skill.md` — scoped future skill brief.

### Moved files

- `app/relay/**` → `app/guitars/relay/**` — canonical Relay route tree.
- `app/products/**` → `app/shop/**` — canonical shopping route tree.
- `content/instruments/RLY26001.mdx` → `content/instruments/REX26001.mdx`.
- `content/instruments/CPC26001.mdx` → `content/instruments/CVL26001.mdx`.
- `content/instruments/CPC26001.test.ts` → `content/instruments/CVL26001.test.ts`.
- `public/images/instruments/CPC26001/**` → `public/images/instruments/CVL26001/**`.

### Deleted files

- `app/blog/**`, `components/blog/**`, and `content/blog/**`.
- `components/product/guitar-related-posts.tsx` and `components/product/product-related-posts.tsx`.
- `config/products/guitars/rainbow-tele.tsx`.

### Major modified files

- `config/navigation.ts`, `components/navigation/site-footer.tsx`, `app/page.tsx` — canonical public navigation.
- `next.config.mjs` — compatibility redirects.
- `config/relay-build-process.ts`, `config/relay-voicings.ts`, Relay app/components/content — canonical internal links.
- `config/products/index.ts`, product components/types — sold-listing and blog-coupling removal.
- `lib/discord.ts` — recent-announcement API contract.
- `content-collections.ts`, `package.json`, `package-lock.json`, `next-sitemap.config.js` — blog-pipeline retirement and private-record sitemap policy.
- `config/instrument-model-codes.ts`, instrument content/tests/docs — corrected serial namespaces.
- `app/sn/[serial]/page.tsx`, `app/sn/[serial]/print/page.tsx` — `noindex, nofollow` metadata.
- `AGENTS.md`, `CLAUDE.md` — pointers to canonical project policy.

---

### Task 1: Commit durable organizational memory and future skill brief

**Files:**

- Create: `docs/architecture/site-organization.md`
- Create: `docs/todos/instrument-record-skill.md`
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`

**Interfaces:**

- Consumes: approved design at `docs/superpowers/specs/2026-07-26-site-information-architecture-design.md`.
- Produces: one canonical policy location referenced by vendor-facing agent files; one non-executable future-work brief.

- [ ] **Step 1: Write the canonical architecture document**

Create `docs/architecture/site-organization.md` with these normative sections and statements:

```markdown
# Site Organization

This file is the canonical organizational policy for K7RHY.app. Agents must preserve these rules unless the user explicitly changes them.

## Public information architecture

- Organize the public site first by subject: Ham Radio and Guitars.
- Keep Shop and Community as cross-subject destinations.
- Guitars is platform-neutral. Relay is one guitar platform, not the definition of the Guitars section.
- Surface each document only from its relevant subject area while retaining concise `/docs/...` URLs.

## Publishing and commerce

- Discord announcements replace Lab Notes; do not recreate a local blog without an explicit new decision.
- K7RHY.app explains and presents. Shopify owns price, availability, inventory, orders, payment, and checkout.
- A future Shopify storefront may use `shop.k7rhy.app`; the current `/shop` route must remain a stable navigation concept.

## Serialized instruments

- Serial pages are unlisted permanent records reached by exact URL or case-card QR code.
- Never expose a serial index, link records from public navigation/catalog pages, or include `/sn/...` in sitemaps.
- Emit `noindex, nofollow` for both record and print routes.
- `REX` means Relay Example. Reserve `RLY` for real Relay prototypes that are sold.
- `CVL` means Coupeville. Its final three digits sequence all Coupeville instruments within a completion year, regardless of submodel.
```

- [ ] **Step 2: Write the future instrument-skill brief**

Create `docs/todos/instrument-record-skill.md` specifying:

```markdown
# Future task: serialized instrument authoring skill

Build a narrow agent skill that accepts: serial, record name/submodel, completion date or year, origin, theme, exact-instrument images, related platform link, pickup configuration, control map, owner narrative, and case-card notes.

The skill must validate the `MMMYYNNN` format, registered family code, completion-year match, family/year sequence, exact image existence and alt text, MDX control cardinality, unlisted metadata, print layout, and QR destination.

It should create or update the instrument MDX record, exact-instrument image directory, focused content test, model-code registration when explicitly approved, and printable case-card output. It must never add the record to navigation, a sitemap, or a public index.

Verification must run focused serial/content/render tests, the full Vitest suite, a production build, desktop/mobile record review, Letter/A4 one-page print review, and QR scanning.
```

- [ ] **Step 3: Point all root agent guidance to the canonical document**

Add this concise block near the top-level project guidance in both `AGENTS.md` and `CLAUDE.md`:

```markdown
## Canonical site organization

Before changing navigation, routes, publishing, commerce boundaries, or serialized instruments, read and follow `docs/architecture/site-organization.md`.
```

- [ ] **Step 4: Verify the policy is singular and discoverable**

Run:

```bash
rg -n "Canonical site organization|docs/architecture/site-organization.md" AGENTS.md CLAUDE.md
rg -n "REX|RLY|CVL|noindex|Shopify|Discord" docs/architecture/site-organization.md docs/todos/instrument-record-skill.md
git diff --check
```

Expected: both instruction files point to the same canonical document; the two new documents contain every required decision; no whitespace errors.

- [ ] **Step 5: Commit**

```bash
git add AGENTS.md CLAUDE.md docs/architecture/site-organization.md docs/todos/instrument-record-skill.md
git commit -m "docs: record canonical site organization"
```

---

### Task 2: Establish the four public destinations

**Files:**

- Create: `config/navigation.test.ts`
- Modify: `config/navigation.ts`
- Create: `app/ham-radio/page.tsx`
- Create: `app/guitars/page.tsx`
- Modify: `app/page.tsx`
- Modify: `components/navigation/site-footer.tsx`

**Interfaces:**

- Produces: `navConfig.mainNav` with exact canonical routes; domain landing pages consumed by public navigation.

- [ ] **Step 1: Write the failing navigation test**

Create `config/navigation.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { navConfig } from './navigation';

describe('main navigation', () => {
    it('organizes the site by subject, shopping, and community', () => {
        expect(navConfig.mainNav).toEqual([
            { title: 'Ham Radio', href: '/ham-radio' },
            { title: 'Guitars', href: '/guitars' },
            { title: 'Shop', href: '/shop' },
            { title: 'Community', href: '/community' },
        ]);
    });

    it('keeps radio docs in the radio-specific navigation group', () => {
        expect(navConfig.hamRadioNav.flatMap((group) => group.items).map((item) => item.href)).toEqual(['/docs/dl20w_bnc', '/docs/power_measurement']);
    });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run config/navigation.test.ts`

Expected: FAIL because `mainNav` still contains Products, Relay Guitar, Documentation, and Lab Notes and `hamRadioNav` does not exist.

- [ ] **Step 3: Simplify navigation configuration**

Remove generated blog imports, `generateBlogNavItems`, `blogNav`, and generic `docNav` from `config/navigation.ts`. Define:

```ts
export interface NavigationConfig {
    mainNav: NavItem[];
    hamRadioNav: NavItemWithChildren[];
}

export const navConfig: NavigationConfig = {
    mainNav: [
        { title: 'Ham Radio', href: '/ham-radio' },
        { title: 'Guitars', href: '/guitars' },
        { title: 'Shop', href: '/shop' },
        { title: 'Community', href: '/community' },
    ],
    hamRadioNav: [
        {
            title: 'Documentation',
            items: [
                { title: '20W Dummy Load', href: '/docs/dl20w_bnc', items: [] },
                { title: 'Measuring Power', href: '/docs/power_measurement', items: [] },
            ],
        },
    ],
};
```

Update `components/navigation/docs-layout-wrappers.tsx` to pass `navConfig.hamRadioNav` to `DocsSidebarNav`. The current `/docs` routes are radio documents, so their sidebar remains explicitly radio-scoped. Do not introduce guitar documents into `hamRadioNav`.

- [ ] **Step 4: Add subject landing pages**

Implement `app/ham-radio/page.tsx` with a `PageHero`, a link to `/shop/ham-radio-kits`, and cards linking only to `/docs/dl20w_bnc` and `/docs/power_measurement`.

Implement `app/guitars/page.tsx` as a platform-neutral page with a Relay card linking to `/guitars/relay` and a guitar-shopping link to `/shop/guitars`. Include no `/sn/` links and no wording that equates Guitars with Relay.

- [ ] **Step 5: Update home and footer links**

In `app/page.tsx`, replace `/products` with `/shop`, replace the Lab Notes action with `/community`, and describe Community/Discord rather than posts.

In `components/navigation/site-footer.tsx`, replace Products/Lab Notes footer links with the same four canonical public destinations. Keep the external Discord icon link.

- [ ] **Step 6: Run focused tests and link scans**

Run:

```bash
npx vitest run config/navigation.test.ts
rg -n "/products|/blog|title: 'Relay Guitar'|title: 'Documentation'" config/navigation.ts app/page.tsx components/navigation/site-footer.tsx
rg -n "/sn/" app/guitars/page.tsx
```

Expected: navigation test PASS; first scan returns no obsolete public links; second scan returns no serial links.

- [ ] **Step 7: Commit**

```bash
git add config/navigation.ts config/navigation.test.ts app/ham-radio/page.tsx app/guitars/page.tsx app/page.tsx components/navigation/site-footer.tsx components/navigation/docs-layout-wrappers.tsx components/navigation/mobile-nav.tsx
git commit -m "feat: organize navigation by subject"
```

---

### Task 3: Rename Products to Shop and remove the sold guitar

**Files:**

- Move: `app/products/**` → `app/shop/**`
- Modify: `app/shop/page.tsx`
- Modify: `app/shop/[category]/page.tsx`
- Modify: `components/product/product-category-section.tsx`
- Modify: `components/product/product-teaser-card.tsx`
- Modify: `config/products/index.ts`
- Delete: `config/products/guitars/rainbow-tele.tsx`
- Modify: `types/product.ts`
- Modify: `components/product/guitar-page.tsx`
- Modify: `components/product/ham-radio-kit-page.tsx`
- Delete: `components/product/guitar-related-posts.tsx`
- Delete: `components/product/product-related-posts.tsx`
- Create or modify: `config/products/index.test.ts`

**Interfaces:**

- Produces: canonical `/shop`, `/shop/:category`, and `/shop/:category/:slug` pages; a catalog containing only currently available items.

- [ ] **Step 1: Write the failing catalog test**

Add to `config/products/index.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getAllProducts, getProductsByCategory } from './index';
import { ProductCategory } from '@/types/product';

describe('shop catalog', () => {
    it('does not list the sold Rainbow Telecaster', () => {
        expect(getAllProducts().map((product) => product.slug)).not.toContain('rainbow-tele');
        expect(getProductsByCategory(ProductCategory.GUITARS)).toEqual([]);
    });

    it('does not carry retired blog relationships', () => {
        for (const product of getAllProducts()) {
            expect(product).not.toHaveProperty('relatedBlogTag');
        }
    });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run config/products/index.test.ts`

Expected: FAIL because `rainbow-tele` and `relatedBlogTag` still exist.

- [ ] **Step 3: Move the route tree and update canonical shop links**

Move `app/products` to `app/shop`. Change the page title and back-link copy from Products to Shop. Replace all product card/category paths with:

```ts
const categoryUrl = `/shop/${category}`;
// Product teaser:
<Link href={`/shop/${category}/${product.slug}`}>...</Link>
```

The empty Guitars category must be omitted from `/shop` by the existing `ProductCategorySection` empty-array behavior.

- [ ] **Step 4: Remove the sold listing and blog fields**

Delete the Rainbow config import and set:

```ts
export const guitarConfigs: (Guitar | ProductConfig)[] = [];
```

Remove `relatedBlogTag` from `Product`, the dummy-load config, and example configs. Delete `config/products/guitars/rainbow-tele.tsx` but retain `public/images/products/guitars/rainbow-tele/**` for `REX26001`.

- [ ] **Step 5: Remove related-blog rendering from product pages**

Remove `allBlogs`, generated `Blog` types, `getRelatedPosts`, `BookOpen`, and related-post cards from `guitar-page.tsx` and `ham-radio-kit-page.tsx`. Delete both related-post components.

- [ ] **Step 6: Run focused tests and scans**

Run:

```bash
npx vitest run config/products/index.test.ts components/product/guitar-image-gallery.test.tsx
rg -n "allBlogs|relatedBlogTag|Related Blog|/products" config/products components/product app/shop types/product.ts
test -f public/images/products/guitars/rainbow-tele/front.jpeg
```

Expected: tests PASS; scan returns no matches; shared Rainbow photograph still exists.

- [ ] **Step 7: Commit**

```bash
git add app/shop app/products components/product config/products types/product.ts public/images/products/guitars/rainbow-tele
git commit -m "feat: rename catalog to shop"
```

---

### Task 4: Build the read-only Discord Community feed

**Files:**

- Modify: `lib/discord.ts`
- Create: `lib/discord.test.ts`
- Create: `components/community/announcement-feed.tsx`
- Create: `components/community/announcement-feed.test.tsx`
- Create: `app/community/page.tsx`

**Interfaces:**

- Produces: `fetchRecentAnnouncements(channelId: string, limit?: number): Promise<DiscordAnnouncementsResult>` and `splitDiscordMessageContent(content: string): DiscordMessageSegment[]`.
- Preserves: `fetchPinnedMessages(threadId: string)` for existing Relay callouts.

- [ ] **Step 1: Write failing Discord request tests**

Define the contract in `lib/discord.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchRecentAnnouncements, splitDiscordMessageContent } from './discord';

describe('fetchRecentAnnouncements', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        delete process.env.DISCORD_BOT_TOKEN;
    });

    it('returns unavailable without a bot token', async () => {
        expect(await fetchRecentAnnouncements('1432603806704603248')).toEqual({ status: 'unavailable', messages: [] });
    });

    it('requests a bounded newest-first channel history', async () => {
        process.env.DISCORD_BOT_TOKEN = 'test-token';
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: '1', content: 'Update', author: { username: 'k7rhy', global_name: 'Rhy' }, timestamp: '2026-07-26T12:00:00.000Z' }] });
        vi.stubGlobal('fetch', fetchMock);

        const result = await fetchRecentAnnouncements('1432603806704603248', 10);

        expect(fetchMock).toHaveBeenCalledWith('https://discord.com/api/v10/channels/1432603806704603248/messages?limit=10', expect.objectContaining({ next: { revalidate: 300 } }));
        expect(result.status).toBe('available');
    });

    it.each([new Error('network'), { ok: false, status: 403 }])('returns unavailable for failed Discord access', async (failure) => {
        process.env.DISCORD_BOT_TOKEN = 'test-token';
        vi.stubGlobal(
            'fetch',
            vi.fn().mockImplementation(() => (failure instanceof Error ? Promise.reject(failure) : Promise.resolve(failure)))
        );
        expect(await fetchRecentAnnouncements('1432603806704603248')).toEqual({ status: 'unavailable', messages: [] });
    });
});

describe('splitDiscordMessageContent', () => {
    it('recognizes only http and https links', () => {
        expect(splitDiscordMessageContent('See https://k7rhy.app and javascript:alert(1)')).toEqual([
            { kind: 'text', value: 'See ' },
            { kind: 'link', value: 'https://k7rhy.app' },
            { kind: 'text', value: ' and javascript:alert(1)' },
        ]);
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/discord.test.ts`

Expected: FAIL because the new exports do not exist.

- [ ] **Step 3: Implement the bounded server API contract**

Add these public types and behavior to `lib/discord.ts`:

```ts
export interface DiscordAnnouncement extends DiscordPinnedMessage {}

export type DiscordAnnouncementsResult = { status: 'available'; messages: DiscordAnnouncement[] } | { status: 'unavailable'; messages: [] };

export type DiscordMessageSegment = { kind: 'text' | 'link'; value: string };

export async function fetchRecentAnnouncements(channelId: string, limit = 10): Promise<DiscordAnnouncementsResult> {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) return { status: 'unavailable', messages: [] };
    const boundedLimit = Math.min(Math.max(limit, 1), 20);

    try {
        const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages?limit=${boundedLimit}`, {
            headers: { Authorization: `Bot ${token}` },
            next: { revalidate: 300 },
        });
        if (!response.ok) return { status: 'unavailable', messages: [] };
        return { status: 'available', messages: await response.json() };
    } catch {
        return { status: 'unavailable', messages: [] };
    }
}
```

Implement `splitDiscordMessageContent` with a global `https?:\/\/[^\s]+` matcher. Emit unmatched content as text and matched HTTP(S) URLs as links; never use `dangerouslySetInnerHTML`.

- [ ] **Step 4: Write failing feed component tests**

In `components/community/announcement-feed.test.tsx`, test that available messages render global name, formatted timestamp, text, and `target="_blank" rel="noopener noreferrer"` links; unavailable state renders “Announcements are temporarily unavailable”; an available empty list renders “No announcements yet.”

- [ ] **Step 5: Implement feed and Community page**

`AnnouncementFeed` consumes `DiscordAnnouncementsResult`, renders at most the supplied results, uses `splitDiscordMessageContent`, and prefers `author.global_name ?? author.username`.

`app/community/page.tsx` must call:

```ts
const announcements = await fetchRecentAnnouncements('1432603806704603248', 10);
```

Render a Community hero, an explanation that announcements are read-only on the site and discussion happens in Discord, a join button using `siteConfig.links.discord`, and `<AnnouncementFeed result={announcements} />`.

- [ ] **Step 6: Run focused tests**

Run:

```bash
npx vitest run lib/discord.test.ts components/community/announcement-feed.test.tsx config/relay-discord.test.ts components/relay/relay-voicing-overview.test.tsx
```

Expected: all tests PASS, including existing pinned-thread behavior.

- [ ] **Step 7: Commit**

```bash
git add lib/discord.ts lib/discord.test.ts components/community app/community
git commit -m "feat: show Discord community announcements"
```

---

### Task 5: Move Relay beneath the platform-neutral Guitars section

**Files:**

- Move: `app/relay/**` → `app/guitars/relay/**`
- Modify: `next.config.mjs`
- Modify: `components/navigation/relay-sidebar.tsx`
- Modify: `components/navigation/relay-sidebar.test.tsx`
- Modify: `config/relay-build-process.ts`
- Modify: `config/relay-voicings.ts`
- Modify: Relay components/tests under `components/relay/**`
- Modify: Relay MDX under `content/relay/**`
- Modify: `app/docs/page.tsx`
- Modify: `content/instruments/CVL26001.mdx`
- Modify: `content/instruments/REX26001.mdx`

**Interfaces:**

- Produces: canonical Relay prefix `/guitars/relay`; permanent compatibility redirects from every old `/relay` route.

- [ ] **Step 1: Update redirect tests or add a config assertion**

Import the enhanced default config from `next.config.mjs`, call its `redirects()` method, and assert at minimum:

```ts
expect(await nextConfig.redirects()).toEqual(
    expect.arrayContaining([
        { source: '/relay', destination: '/guitars/relay', permanent: true },
        { source: '/relay/:path*', destination: '/guitars/relay/:path*', permanent: true },
    ])
);
```

Retain specialized legacy rules before the catch-all, but change their destinations to `/guitars/relay/...`.

- [ ] **Step 2: Move the App Router tree**

Move the complete `app/relay` directory to `app/guitars/relay`. Do not leave duplicate canonical page implementations under `app/relay`.

- [ ] **Step 3: Update all canonical Relay links**

Mechanically replace internal route strings from `/relay` to `/guitars/relay` in runtime code, tests, and active MDX content. Update `PLATFORM_HREF`, breadcrumbs, tab base paths, voicing fallbacks, build-process links, and related instrument links.

Do not rewrite historical design/plan documents. They describe earlier states and are not runtime navigation.

- [ ] **Step 4: Update redirect order**

In `next.config.mjs`, make all pre-existing Relay legacy patterns land directly on canonical `/guitars/relay/...` destinations, then append exact and catch-all migration redirects. This prevents redirect chains such as `/relay/lipstick` → `/relay/voicings/lipstick` → `/guitars/relay/voicings/lipstick`.

- [ ] **Step 5: Run Relay tests and active-link scan**

Run:

```bash
npx vitest run config/relay-discord.test.ts components/navigation/relay-sidebar.test.tsx components/relay components/doc/relay-voicing-grid.test.tsx
rg -n "['\"(]/relay" app components config content --glob '*.{ts,tsx,mdx}'
```

Expected: tests PASS; active-link scan finds old `/relay` only in `next.config.mjs` redirect sources.

- [ ] **Step 6: Commit**

```bash
git add app/guitars/relay app/relay next.config.mjs components/navigation components/relay components/doc config/relay-build-process.ts config/relay-voicings.ts content/relay content/instruments/REX26001.mdx content/instruments/CVL26001.mdx app/docs/page.tsx
git commit -m "feat: nest Relay beneath guitars"
```

---

### Task 6: Correct serial namespaces and make records unlisted

**Files:**

- Modify: `config/instrument-model-codes.ts`
- Move/modify: `content/instruments/REX26001.mdx`
- Move/modify: `content/instruments/CVL26001.mdx`
- Move/modify: `content/instruments/CVL26001.test.ts`
- Move/modify: `public/images/instruments/CVL26001/placeholder.svg`
- Modify: `content/instruments/README.md`
- Modify: current instrument unit tests and fixtures under `lib/instruments/**`, `components/instrument/**`, and `app/sn/**`
- Modify: `app/sn/[serial]/page.tsx`
- Modify: `app/sn/[serial]/print/page.tsx`
- Create: `app/sn/instrument-metadata.test.ts`

**Interfaces:**

- Produces: `REX26001` example and `CVL26001` Coupeville record; `noindex, nofollow` metadata for every serial route.

- [ ] **Step 1: Write failing serial-code assertions**

Update `lib/instruments/serial.test.ts` to assert:

```ts
expect(parseInstrumentSerial('REX26001')).toMatchObject({ modelCode: 'REX', modelDescription: 'Relay Example', year: 2026, index: 1 });
expect(parseInstrumentSerial('CVL26001')).toMatchObject({ modelCode: 'CVL', modelDescription: 'Coupeville', year: 2026, index: 1 });
expect(() => parseInstrumentSerial('RLY26001')).not.toThrow();
expect(() => parseInstrumentSerial('CPC26001')).toThrow('Unknown instrument model code: CPC');
```

Keep `RLY: 'Relay'` registered but unused so the namespace is reserved.

- [ ] **Step 2: Run the serial test to verify it fails**

Run: `npx vitest run lib/instruments/serial.test.ts`

Expected: FAIL because `REX`/`CVL` are unknown and `CPC` remains registered.

- [ ] **Step 3: Register canonical namespaces**

Set the model map entries to:

```ts
REX: 'Relay Example',
RLY: 'Relay',
CVL: 'Coupeville',
```

Remove `CPC`.

- [ ] **Step 4: Rename records, tests, and assets**

Rename both MDX files and the Coupeville test/asset directory. Within contents, replace every former serial, image path, placeholder label, QR expectation, and example reference. Keep `name: 'Coupeville Current'`; only its family code changes.

Update `content/instruments/README.md` to copy `REX26001.mdx` as the example and explicitly state that no authoring action may add records to navigation or sitemap output.

- [ ] **Step 5: Add record metadata tests and implementation**

Test `generateMetadata` from the record and print routes with a published fixture and assert:

```ts
expect(metadata.robots).toEqual({ index: false, follow: false });
```

Add `robots: { index: false, follow: false }` to the successful metadata return in `app/sn/[serial]/page.tsx`. Preserve the canonical exact-record URL. Print metadata already uses this policy; keep and test both success and missing-record branches.

- [ ] **Step 6: Update all current fixtures**

Replace `RLY26001` with `REX26001` in generic example fixtures and `CPC26001` with `CVL26001` in current Coupeville runtime/content tests. Do not rewrite historical specs/plans.

- [ ] **Step 7: Run focused instrument tests**

Run:

```bash
npx vitest run lib/instruments content/instruments/CVL26001.test.ts components/instrument app/sn/instrument-metadata.test.ts
rg -n "RLY26001|CPC26001" app components config content lib --glob '*.{ts,tsx,mdx,svg,md}'
```

Expected: tests PASS; scan returns no active runtime/content occurrences of former serials.

- [ ] **Step 8: Commit**

```bash
git add config/instrument-model-codes.ts content/instruments public/images/instruments lib/instruments components/instrument app/sn
git commit -m "fix: canonize instrument serial namespaces"
```

---

### Task 7: Retire Lab Notes and the blog build pipeline

**Files:**

- Delete: `app/blog/**`
- Delete: `components/blog/**`
- Delete: `content/blog/**`
- Modify: `content-collections.ts`
- Modify: `next-sitemap.config.js`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `next.config.mjs`

**Interfaces:**

- Produces: instrument-only Content Collections config; `/blog` index redirect; no individual blog implementation.

- [ ] **Step 1: Write sitemap privacy and retirement tests**

Create `next-sitemap.config.test.ts` that imports the config and asserts:

```ts
expect(await config.transform(config, '/sn/CVL26001')).toBeNull();
expect(await config.transform(config, '/sn/CVL26001/print')).toBeNull();
expect(await config.transform(config, '/community')).toMatchObject({ loc: '/community' });
expect(await config.transform(config, '/shop')).toMatchObject({ loc: '/shop' });
```

Also assert the Next redirect list contains `{ source: '/blog', destination: '/community', permanent: true }` and contains no `/blog/:slug` redirect.

- [ ] **Step 2: Run the sitemap test to verify it fails**

Run: `npx vitest run next-sitemap.config.test.ts`

Expected: FAIL because sitemap config imports blogs and does not exclude `/sn`.

- [ ] **Step 3: Reduce Content Collections to instruments**

Rewrite `content-collections.ts` imports to:

```ts
import { defineCollection, defineConfig } from '@content-collections/core';
import { z } from 'zod';
import { validateInstrumentDocument } from './lib/instruments/validation';
```

Delete `blogSchema`, cache constants/helpers, the blog collection/transform, `axios`, filesystem cache operations, and `crypto`. Export:

```ts
export default defineConfig({ collections: [instruments] });
```

- [ ] **Step 4: Delete blog implementation and content**

Delete the three blog directories. Confirm no runtime imports refer to generated `Blog` or `allBlogs`; Task 3 must already have removed product consumers.

- [ ] **Step 5: Simplify sitemap and add the blog-index redirect**

Remove the generated `allBlogs` import. Begin `transform` with:

```js
if (path === '/sn' || path.startsWith('/sn/')) return null;
```

Keep default entries for public routes. Add only the exact `/blog` → `/community` permanent redirect to `next.config.mjs`; deleted individual routes naturally return 404.

- [ ] **Step 6: Remove blog-only dependencies**

Run `npm uninstall @google/generative-ai axios` after confirming `rg -n "from 'axios'|@google/generative-ai" --glob '!package-lock.json'` finds no remaining consumers. This updates both package files. Do not remove Content Collections or MDX packages.

- [ ] **Step 7: Run focused retirement verification**

Run:

```bash
npx vitest run next-sitemap.config.test.ts
rg -n "allBlogs|generated.*Blog|content/blog|GOOGLE_GENERATIVE_AI_API_KEY|CLEAR_AI_SUMMARY_CACHE|ai-summary" --glob '!docs/superpowers/**' --glob '!package-lock.json'
test ! -d app/blog
test ! -d components/blog
test ! -d content/blog
```

Expected: test PASS; scan has no runtime/build matches; all retired directories are absent.

- [ ] **Step 8: Commit**

```bash
git add app/blog components/blog content/blog content-collections.ts next-sitemap.config.js next-sitemap.config.test.ts next.config.mjs package.json package-lock.json
git commit -m "refactor: retire Lab Notes publishing"
```

---

### Task 8: Add all compatibility redirects and eliminate stale public links

**Files:**

- Modify: `next.config.mjs`
- Create or modify: `next.config.test.ts`
- Modify: any remaining active file reported by the stale-link scan.

**Interfaces:**

- Consumes: canonical `/shop`, `/guitars/relay`, and `/community` routes.
- Produces: direct one-hop permanent redirects with no internal reliance on legacy URLs.

- [ ] **Step 1: Complete the redirect matrix test**

Assert the exported redirect list contains:

```ts
[
    { source: '/products', destination: '/shop', permanent: true },
    { source: '/products/:path*', destination: '/shop/:path*', permanent: true },
    { source: '/relay', destination: '/guitars/relay', permanent: true },
    { source: '/relay/:path*', destination: '/guitars/relay/:path*', permanent: true },
    { source: '/blog', destination: '/community', permanent: true },
];
```

Assert there is no redirect with `source: '/blog/:path*'` or `source: '/sn/:path*'`.

- [ ] **Step 2: Run the test and fix omissions**

Run: `npx vitest run next.config.test.ts`

Expected before final fixes: FAIL for any missing migration rule. Add exact and catch-all rules after specialized legacy rules, keeping every destination canonical and avoiding chains.

- [ ] **Step 3: Scan and repair active links**

Run:

```bash
rg -n "/products|/blog|['\"(]/relay" app components config content lib --glob '*.{ts,tsx,mdx}'
```

Update all internal navigation to `/shop`, `/community`, or `/guitars/relay`. The only allowed old-route occurrences are redirect `source` values and tests explicitly asserting compatibility behavior.

- [ ] **Step 4: Run redirect and navigation tests**

Run:

```bash
npx vitest run next.config.test.ts config/navigation.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add next.config.mjs next.config.test.ts app components config content lib
git commit -m "fix: preserve legacy navigation links"
```

---

### Task 9: Full verification and rendered smoke review

**Files:**

- Modify only files required by failures attributable to this implementation.

**Interfaces:**

- Verifies the complete approved design; produces no new feature boundary.

- [ ] **Step 1: Identify and format changed source files**

Run `git diff --name-only e02f6ec..HEAD -- '*.ts' '*.tsx' '*.js' '*.mjs' '*.md' '*.mdx'` and copy the returned existing paths as literal arguments to `npx prettier --write`. Exclude deleted paths. This base commit is the final approved-spec commit immediately before this implementation plan, so the list contains only work from this feature.

- [ ] **Step 2: Run the full test suite**

Run: `npx vitest run`

Expected: all tests PASS.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: exit 0 with no new warnings attributable to changed files.

- [ ] **Step 4: Run the production build and sitemap generation**

Run: `npm run build`

Expected: tests and Next build PASS; route output contains `/ham-radio`, `/guitars`, `/guitars/relay`, `/shop`, `/community`, `/sn/[serial]`, and `/sn/[serial]/print`; Content Collections generates instruments without blog or Google AI activity; sitemap generation succeeds.

- [ ] **Step 5: Verify generated sitemap privacy**

Run:

```bash
rg -n "/sn/|/blog/|/products|/relay" public/sitemap*.xml
rg -n "/ham-radio|/guitars|/shop|/community" public/sitemap*.xml
```

Expected: first scan returns no legacy or serial URLs; second scan finds the new public destinations.

- [ ] **Step 6: Smoke-test rendered routes**

Start `npm run dev`, then verify in a browser at desktop and mobile widths:

- `/` shows the new canonical calls to action.
- `/ham-radio` links only radio content and existing concise docs URLs.
- `/guitars` is platform-neutral, links Relay, and exposes no serial record.
- `/guitars/relay` and representative nested Relay pages render with correct sidebar/breadcrumb links.
- `/shop` contains the dummy-load kit and no Rainbow Telecaster.
- `/community` renders its introduction and either recent announcements or the graceful unavailable state.
- `/sn/REX26001` and `/sn/CVL26001` work by exact URL and emit a robots meta tag containing `noindex, nofollow`.
- `/blog/example-retired-post` returns 404.
- `/blog`, `/products`, and `/relay` redirect in one hop to their canonical destinations.

- [ ] **Step 7: Recheck scope and working tree**

Run:

```bash
git diff --check
git status --short
git diff --stat
```

Expected: no whitespace errors; only planned files are changed; no temporary screenshots, build caches, generated AI summary cache, or secrets are staged.

- [ ] **Step 8: Route failures back to their owning task**

If verification finds a defect, return to the task that owns that file, add or strengthen its focused regression test, implement the correction, rerun that task's focused verification, and use that task's explicit staging list. Do not create an empty verification commit.
