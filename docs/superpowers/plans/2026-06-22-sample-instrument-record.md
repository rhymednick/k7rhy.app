# Sample Instrument Record Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a polished `RLY26001` demonstration record that lets the owner review both the web detail page and printable case card.

**Architecture:** Reuse the validated instrument MDX collection, existing record route, compound control components, and current Rainbow Tele photography. This is a content-only change: no component, schema, route, or styling behavior changes.

**Tech Stack:** Next.js 15 App Router, MDX, Content Collections, React 19, Tailwind CSS.

## Global Constraints

- Preserve the approved `MMMYYNNN` serial format and `/sn/<SERIAL>` route.
- Keep the site header, footer, typography, colors, branding, QR destination, and one-page case-card layout unchanged.
- Exercise the three-way selector, push-pull volume, and push-push tone structures with complete position descriptions.
- Use only imagery already present in the repository.

---

### Task 1: Publish and polish the demonstration record

**Files:**
- Modify: `content/instruments/RLY26001.mdx`

**Interfaces:**
- Consumes: the existing `InstrumentSpec`, `PickupConfiguration`, `Pickup`, `PickupDetail`, `ControlLayout`, `Selector`, `SelectorPosition`, `Pot`, and `PotPosition` MDX components.
- Produces: a published record resolved at `/sn/RLY26001` and `/sn/RLY26001/print`.

- [x] **Step 1: Replace placeholder copy with finished demonstration copy**

Set `publish: true`, retain the existing photo, and describe the instrument as a K7RHY-voiced Relay Lipstick demonstration build. Give each pickup, switch position, and pot state short practical language that helps a player find the instrument's voices.

- [x] **Step 2: Validate the content model**

Run: `npx vitest run lib/instruments components/instrument`

Expected: all instrument validation, route, record-page, and case-card tests pass.

- [x] **Step 3: Build the production route**

Run: `npm run build`

Expected: Content Collections accepts `RLY26001.mdx`, Next.js emits `/sn/[serial]` and `/sn/[serial]/print`, and sitemap generation completes.

- [x] **Step 4: Review both rendered surfaces**

Run: `npm run dev`

Open `/sn/RLY26001`, then `/sn/RLY26001/print`. Confirm the web page retains normal site navigation, the case card remains one page, and the QR encodes the canonical record URL.

- [x] **Step 5: Commit and push the sample**

```bash
git add content/instruments/RLY26001.mdx docs/superpowers/plans/2026-06-22-sample-instrument-record.md
git commit -m "content: publish sample instrument record"
git push
```
