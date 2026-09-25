# White CuNiFe S-Type builds

Date: 2026-09-24 · updated 2026-09-25

## Current state — owner confirmed, 2026-09-25

Both guitars are built and wired to the final specification below. The owner confirmed on 2026-09-25:

- **Completion.** Both records use `completed: '2026-09-24'` with the date label **Built**. This supersedes the `started` date and the “Record date” label.
- **Tuners.** Guyker locking tuners are confirmed on both guitars.
- **Pickup shields.** All three Fender CuNiFe pickups on each guitar have isolated shield ground leads, tested by the owner. This settles the middle-cover concern for `STR26001`'s switched middle coil return.
- **Specification status.** Treat every approved choice in this file as installed and confirmed. Earlier notes below that call parts unconfirmed, not installed, or not bench validated are historical.
- **Wiring references, Rev 1.1.** The serial pages and diagrams now read as an as-built record rather than a build and test guide: the build outline, bench checks, and “meter before wiring” notes are removed. Each diagram title includes its serial, both diagrams describe the treble bleed in the same order (`BUS → (1,200 pF ∥ 150 kΩ) → junction → 20 kΩ → OUT`), and the `STR26002` selector table labels its columns by position. Rev 1.0 files are removed; the Rev 1.1 PNGs are `public/wiring-diagrams/STR26001-wiring-rev-1.1.png` and `STR26002-wiring-rev-1.1.png`.
- **Owner copy.** “New” is removed from the pickup description, and repeated control wording is trimmed.
- **Voice and control map, 2026-09-25 — implemented.** Both records now carry an `InstrumentSpec`, so their case cards are complete. Voices are inferred from the as-built wiring and Fender's published description of the set (vintage-style voice, deep lows, present mids, sparkling highs, clarity under distortion; reverse-wound middle to eliminate hum). Series pairs on `STR26001` are described as louder, thicker, and hum-canceling, which follows from the series connection of a reverse-wound middle; this is circuit inference, not a measurement. A new `Toggle` control represents each guitar's mini switch. Validation now rejects a completed record without an `InstrumentSpec`.
- **Public diagrams.** The owner accepts that the diagram PNGs are publicly reachable while the records remain unpublished.

Both records remain `publish: false` with placeholder illustrations until exact-instrument photographs are added and publication is approved.

## History

### Record decision — implemented locally, 2026-09-24

The owner reserved `STR26001` and `STR26002` for two white S-type guitars being assembled from purchased parts. Both records now use the standalone name **CuNiFe S-Type**; the earlier working names with `1` and `2` are superseded. Both have poplar bodies and maple necks. `STR26001` has a bamboo pickguard; `STR26002` has a black pickguard. Both records use 2026 serials and September 24, 2026 as the build start date. Both remain unpublished and use owner-approved temporary image placeholders until exact-instrument photographs are available. The owner has purchased Fender CuNiFe Stratocaster pickup sets directly from Fender and selected Guyker locking tuners for both builds. Exact tuner model and installation status remain unconfirmed.

This implements an in-progress record state with `started` and no `completed` value. It supersedes the assumption that every local record must already have a completion date. Completion, installed specifications, exact photographs, and publication remain unresolved.

**Owner-facing copy decision, 2026-09-24 — implemented locally:** each serial page must read as a concise, independent ownership record. The serial appears in page metadata, not descriptive prose; neither page calls its guitar the first or second of a pair. The owner replaced the provisional “bamboo-like” language with **bamboo pickguard** and asked for a direct builder origin, without emphasis on purchased parts. The page highlights the new Fender pickups sourced directly from Fender and explains the musical purpose of its particular switch. This supersedes the earlier working names, parts-centered origin lines, and build-plan narrative. The engineering details below retain sourcing and validation history outside the owner-facing copy.

### Final specification — owner approved

The [shared wiring discussion](https://chatgpt.com/share/6ab58f95-50fc-83e8-98cc-6d8afc3a772b) raised a conventional five-way base, a series option in positions 2 and 4, and neck-add as candidates. It does not establish a verified contact map or an installed circuit. No proposed control state is represented as installed in either record.

**Owner decision, 2026-09-24 — approved final build specification:** both guitars use an A250K audio master volume, an A500K audio master tone, and a latching micro switch in the third control position. `STR26001` uses a four-pole five-way super switch and a DPDT on-on micro switch to select parallel or series bridge–middle and middle–neck pairs in positions 2 and 4. `STR26002` uses a standard five-way and an SPST on-off micro switch to add the neck pickup in parallel. This supersedes the previously approved master-volume/two-tone format and the earlier undecided switch hardware. These are final **build choices**, not claims that the parts are installed or bench validated. The guitars do not combine series and neck-add on the same instrument.

**Tone network, 2026-09-24 — approved build target:** one 22 nF (`0.022 µF`, code `223`) non-polarized capacitor per guitar on its master tone. Feed the master tone from the selected output/volume-input bus so it works in every position and mode; never attach it to an intermediate series junction. This is a chosen component value, not a measured installed part or a promise of final voicing. A later change would require a new owner decision. [Seymour Duncan's capacitor guide](https://www.seymourduncan.com/blog/latest-updates/what-tone-capacitors-do-i-need-for-my-guitar) describes the value's behavior.

**Treble bleed, 2026-09-24 — approved final build specification, implemented in both local records:** add a network across each A250K master volume's pickup-input lug and output/wiper lug. The network is a 1,200 pF capacitor in parallel with a 150 kΩ resistor; that parallel pair is in series with a 20 kΩ resistor. This follows the [Fender American Professional SSS Stratocaster service manual](https://www.fmicassets.com/Damroot/Original/10001/Fender%20Am%20Pro%20Stratocaster%20011301XXXX%20REV%20B%2011-12-2018.pdf), which specifies a 250K volume control and those three treble-bleed values. [Fender's explanation](https://www.fender.com/articles/maintenance/how-a-treble-bleed-circuit-can-affect-your-tone) describes the series/parallel arrangement and its purpose: preserving clarity as the volume is reduced. The A500K tone pot presents less load than an A250K tone pot when fully open; the treble bleed addresses volume-rolloff behavior, not that full-volume load. The prior no-treble-bleed volume design is superseded. These values are selected for the builds; the response of the actual Fender CuNiFe pickup/cable combination has not been measured.

| Five-way position (1 = bridge) | STR26001, normal | STR26001, series engaged | STR26002, neck-add off | STR26002, neck-add on                        |
| ------------------------------ | ---------------- | ------------------------ | ---------------------- | -------------------------------------------- |
| 1                              | Bridge           | Bridge                   | Bridge                 | Bridge ∥ Neck                                |
| 2                              | Bridge ∥ Middle  | Bridge — Middle          | Bridge ∥ Middle        | Bridge ∥ Middle ∥ Neck                       |
| 3                              | Middle           | Middle                   | Middle                 | Middle ∥ Neck (duplicates normal position 4) |
| 4                              | Middle ∥ Neck    | Middle — Neck            | Middle ∥ Neck          | Middle ∥ Neck (unchanged)                    |
| 5                              | Neck             | Neck                     | Neck                   | Neck (unchanged)                             |

`∥` means parallel; `—` means in series. The table is the approved **functional target**, not a builder-facing lug map. [Seymour Duncan describes the standard neck-add connection](https://www.seymourduncan.com/blog/tips-and-tricks/guitar-wiring-explored-switches-part-1). The abstract contact design for `STR26001` appears below; verify the actual blade, DPDT, pickup leads, and middle pickup cover isolation before soldering.

**Pot and switch inventory, 2026-09-24 — owner reported:** one A250K push-pull, a few small inexpensive A250K pots, a few B250K pots, many A500K regular and push-pull pots, some DPDT and SPST micro switches, one or two four-pole super switches, and many standard five-ways. Exact counts, measured resistance, switch contact maps, shaft/bushing fit, and condition are unknown. This supersedes the earlier generic “limited 250 kΩ pots” note.

**Parts allocation — final specification:** each guitar has one A250K audio master volume, one A500K audio master tone, one 22 nF tone capacitor, one 1,200 pF treble-bleed capacitor, 150 kΩ and 20 kΩ treble-bleed resistors, and one visible third-hole micro switch. The existing small-body A250K pots may serve as the master volumes if they fit and operate acceptably; the physical supplier and exact installed units are not yet recorded. No push-pull function is part of the final control scheme. [Seymour Duncan's pot guide](https://www.seymourduncan.com/blog/latest-updates/what-are-potentiometers) explains the taper distinction.

**Superseded control choices:** the master-volume/two-tone layout, A500K push-pull neck-add, A250K push-pull series option, and Free-Way blade were earlier candidates. The owner replaced them on 2026-09-24 with a master tone and visible third-hole toggles. This gives up separate bridge and neck/middle tone settings in exchange for a single consistent tone control and an explicit mode switch. A common [mini-toggle needs a 1/4-inch mounting hole](https://www.stewmac.com/electronics/components-and-parts/switches/mini-toggle-switches-dpdt), while a common [Strat pickguard pot hole is 3/8 inch](https://www.stewmac.com/parts-and-hardware/all-hardware-and-parts-by-instrument/electric-guitar-parts/strat-pickguard); the actual guards and toggles determine the required mounting bushing or adapter.

**Functional contact topology for `STR26001` — owner-approved operating states, analytically checked but not bench tested:** the owner's true four-pole/five-throw super switch plus one DPDT preserves the five normal states and makes only positions 2 and 4 series. Keep bridge and neck coil returns grounded. The middle coil is the upper coil in both series pairs. `BUS` is the selector output and volume input; `B_H`, `M_H`, and `N_H` are pickup coil hots; `B_C`, `M_C`, and `N_C` are coil returns; `GND` is the common ground. `OUTER_ROUTE`, `J`, and `M_RETURN_ROUTE` are isolated intermediate nets, never permanently joined to `BUS` or `GND`.

| Four-pole super-switch pole | Common        | Position 1 | Position 2       | Position 3 | Position 4       | Position 5 |
| --------------------------- | ------------- | ---------- | ---------------- | ---------- | ---------------- | ---------- |
| A                           | `BUS`         | `B_H`      | `M_H`            | `M_H`      | `M_H`            | `N_H`      |
| B                           | `OUTER_ROUTE` | open       | `B_H`            | open       | `N_H`            | open       |
| C                           | `J`           | open       | `B_H`            | open       | `N_H`            | open       |
| D                           | `M_C`         | open       | `M_RETURN_ROUTE` | `GND`      | `M_RETURN_ROUTE` | open       |

| DPDT pole | Common           | Normal/parallel throw | Series throw |
| --------- | ---------------- | --------------------- | ------------ |
| X         | `OUTER_ROUTE`    | `BUS`                 | open         |
| Y         | `M_RETURN_ROUTE` | `GND`                 | `J`          |

`B_C` and `N_C` stay on `GND`. In positions 2 and 4, normal mode joins both selected hots to `BUS` and grounds `M_C`; series mode removes the outer hot from `BUS` and joins `M_C` to the selected outer hot. Position 3 grounds `M_C` directly via pole D in either mode. `M_C` is intentionally isolated in positions 1 and 5, where the middle pickup is unselected. This is a **functional contact map**, not a physical lug diagram. The master tone would be a 22 nF shunt network fed from `BUS`; the master volume input is also `BUS`. The middle pickup shield/cover must remain separately grounded when `M_C` is lifted. Verify actual pickup polarity, middle-cover isolation, super-switch contact continuity, DPDT throw orientation, and cavity clearance before soldering. [Seymour Duncan explains the four independent poles of a super switch](https://www.seymourduncan.com/blog/latest-updates/guitar-wiring-explored-introducing-the-super-switch-part-2).

An abstract connectivity check of these contacts produced the intended pickup paths in all ten states: normal `B`, `B ∥ M`, `M`, `M ∥ N`, `N`; series-mode `B`, `M — B`, `M`, `M — N`, `N`. This checks the logical netlist only; it does not validate the actual switches, lead identification, magnetic/electrical phase, or cover isolation.

**Superseded interaction concern:** putting series and neck-add on separate guitars eliminates combined switch states. A direct neck-on jumper on a single guitar with series routing could have bypassed a pickup by tying a series junction to the output; that mixed-mode circuit is no longer in scope for these builds.

Fender's [CuNiFe Stratocaster pickup set specification](https://www.fender.com/products/cunife-stratocaster-pickup-set) confirms an SSS set with a reverse-wound middle pickup, adjustable pole pieces, nominal DC resistances of 9.6/10.0/10.5 kΩ, and nominal inductances of 3.8/4.2/4.6 H from neck to bridge. These are product specifications, not measurements of either guitar.

The [Fender pickup-set wiring diagram](https://www.fmicassets.com/Damroot/Original/10008/Diagram_0992367000_CuNiFe-Stratocaster-Pickup-Set.pdf) is the manufacturer reference for lead identification. The logical mode table and functional contact topology above are established; physical lug orientation, pickup phase, chrome-cover isolation, and final harness behavior have not been observed. The owner accepts the design without requiring a pre-build verification step. Do not describe those physical properties as measured or bench validated in engineering records.

### Headstock QR and record labels — implemented locally

The owner's [headstock mockup](headstock-mockup-reference.png) establishes a separate QR-and-record block to the right of the company identification. The printable block has a thin vertical divider, a QR code, another divider, italic serif text reading “Scan for this instrument’s build record.”, “Instrument No.”, and the bold serial. The QR is logo-free, preserving the owner's earlier scale-test decision despite the logo shown in the mockup. Company identification and “Built in Coupeville, Washington” are outside this print file.

`STR26001-headstock-qr.svg` and `STR26002-headstock-qr.svg` are 54 × 25 mm transparent vector labels. The matching PNG files are white-background previews only. Each QR encodes the canonical `https://k7rhy.app/sn/<SERIAL>` URL with high error correction. Both labels decoded to their correct URLs when rendered at the intended width and 300 dpi over a maple-colored background using macOS Vision. This layout supersedes the earlier 32 × 38 mm vertical QR-and-serial label. Regenerate the vector files with:

```bash
node scripts/generate-instrument-headstock-qr.mjs STR26001 STR26002
```

The files are held under `docs/engineering/`, outside deployed public assets. Production URLs return 404 while the records remain unpublished. A printed proof on the actual label material and a phone scan at final physical size are still required before applying a headstock label.

### Individual wiring references — implemented locally, logically reviewed

The owner requested a separate builder-facing wiring diagram for each one-of-a-kind guitar, linked from its serial page without displaying the image on that page. (Superseded in part by Rev 1.1 above.) `STR26001-wiring-reference.md` and `STR26002-wiring.md` are the circuit sources, paired with editable SVGs and generators under this directory. The final 2400-pixel-wide PNGs are copied to `public/wiring-diagrams/`, and each local serial page links to `/sn/<SERIAL>/wiring`. Those noindex wiring pages provide a full-size/downloadable diagram plus searchable operating states, parts, contact map, netlist, build outline, and bench checks. The records and their wiring pages remain unpublished.

Both final PNGs were compared at full resolution with the approved Relay Arc presentation and independently reviewed for electrical states and physical/readability guidance. The 001 contact map produces the specified five normal and five series states; the 002 blade and neck-add switch produce its specified ten states. The treble-bleed, tone, volume, jack, and ground paths match the text sources. The visual reviewer checked rear-view pot orientation, legibility, and the explicit functional-contact labeling. After the 002 title was aligned with 001, its final export received a second presentation review. The reviews validate the **drawn functional circuit**, not an assembled harness. In particular, the 001 middle pickup cover must be identified and kept grounded separately from its switchable coil return; actual switch lugs, leads, phase, and cavity fit remain bench checks.
