# Serialized instrument authoring

1. Add or edit the three-letter description in `config/instrument-model-codes.ts`.
2. Copy `REX26001.mdx` to the new uppercase `MMMYYNNN.mdx` filename.
3. Keep `publish: false` while replacing every identity field, image, pickup, selector, and pot state.
4. Put exact-instrument photographs under `public/images/instruments/<SERIAL>/` and give each useful alt text.
5. Run `npx vitest run` and `npm run build`.
6. Preview `/sn/<SERIAL>` in light, dark, desktop, and mobile layouts.
7. Preview `/sn/<SERIAL>/print` on Letter and A4 and scan its QR code.
8. Set `publish: true`, rerun `npm run build`, and deploy.

Serialized records are unlisted. Never add them to public navigation, product pages, sitemap output, or a public serial index. Owners reach them by exact URL or the QR code on their case card.

Selector children are numbered from their order. Three-way selectors require three children; five-way selectors require five. Standard pots require one `normal` position. Push-pull and push-push pots require one `down` and one `up` position.
