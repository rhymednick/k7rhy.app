# RLY26001 engineering record

Opened 2026-11-15 · prototype Relay-body guitar, working name "Harmonic Triad".

**Status: in repair, not for sale yet.** The owner built it on 2026-03-19. Not every selector position works, so the wiring must be repaired before it is sold. The serial RLY26001 is reserved for it (`RLY` is for real Relay prototypes that are sold; see [`content/instruments/README.md`](../../../content/instruments/README.md)). No instrument record, image set, or route exists yet.

## Decisions

| Date       | Decision                                                                                                                                                                                                                                   | Status   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 2026-11-15 | Sell this prototype instead of disassembling it. Use serial **RLY26001**.                                                                                                                                                                  | Approved |
| 2026-11-15 | Describe it plainly as a prototype that does not match any documented Relay voicing. The owner has not fixed the wording.                                                                                                                  | Proposed |
| 2026-11-15 | Repair the wiring before authoring the instrument record. The owner will supply wiring specifics during the repair.                                                                                                                        | Approved |
| 2026-11-15 | Keep "Santana" out of public copy. The Relay body is Santana-inspired, and the [Lipstick content brief](../../../content/relay/voicings/lipstick/_content-brief.md) says not to say so for trademark reasons. The card's name is internal. | Approved |

## Source facts

Owner-reported on 2026-11-15 unless noted.

- **Built:** 2026-03-19. Completion date for the record: 2026-03-19 (matches serial year `26`). The record cannot be marked completed until the repair is done.
- **Pots:** A500k (audio taper) volume and tone. Both are push-pull per the card.
- **Bridge split resistor:** 2.2 kΩ, **measured** by the owner. The card did not give a value.
- **Not every selector position works.** Which positions fail, and what is wrong, is not yet recorded.
- The only earlier trace in this repository is a 2026-03-21 doc-page scaffold for a "Lipstick Santana" 3D-printed guitar ([spec](../../superpowers/specs/2026-03-21-guitar-lipstick-santana-doc.md), commit `717b843`). It has no circuit, pickup, or wiring data. No engineering record existed before this one.

## Case card (planning document, not evidence of the installed circuit)

Source: [`original-case-card.jpg`](original-case-card.jpg), a photo of the printed card (original IMG_2904, kept in the owner's iCloud folder `Guitar/RLY26001`). Titled "Lipstick Santana v3", subtitle "Harmonic Triad", stamped "Experimental Circuit". The card predates the repair, and the owner says some positions do not work, so treat it as intended design.

**Pickups (per card):**

| Position | Pickup                | DC resistance (card, approximate) |
| -------- | --------------------- | --------------------------------- |
| Neck     | GFS Gold Foil         | 6–7 kΩ                            |
| Middle   | GFS Lipstick          | 6.0 kΩ                            |
| Bridge   | GFS Vintage Humbucker | 8–9 kΩ                            |

**Controls (per card):** 6-way rotary selector, master volume (push-pull), master tone (push-pull), 0.022 µF tone capacitor. The card gives no pot values; see the owner-reported A500k above.

**Intended selector map (per card):**

| Pos. | Intended voice       |
| ---- | -------------------- |
| 1    | Bridge humbucker     |
| 2    | Bridge + Lipstick    |
| 3    | Lipstick only        |
| 4    | Gold Foil + Lipstick |
| 5    | Gold Foil only       |
| 6    | Gold Foil + Bridge   |

**Intended push-pull behavior (per card):**

- **Volume pull:** partial split of the bridge humbucker. The bridge series link goes to ground through a resistor (2.2 kΩ, measured). Best in positions 1, 2, and 6.
- **Tone pull:** reverses gold foil phase in positions 4 and 6. The foil shield and baseplate stay grounded.

**Body (per card):** printed semi-hollow body, full solid spine from neck pocket to bridge, bridge anchored into the spine, two side chambers. The card's pickup geometry was labeled "suggested": gold foil angled about 5–6 mm across its width, Lipstick offset 2–3 mm, humbucker straight or nearly straight. Whether it was built that way is unrecorded.

The card's "Character" descriptions (for example "Thin, glassy, odd in the right way") are the owner's own words, not maker claims and not circuit-derived. Do not reuse them in the record without owner approval.

## Unknowns

- Which selector positions fail, and the failure (no sound, wrong pickups, hum, shorts).
- How the 6-way rotary switch and both push-pulls are actually wired, lug by lug. The owner expects to supply this during the repair.
- Whether the push-pull poles do what the card says.
- Neck, fretboard, scale length, finish, hardware, and any other installed parts.
- Whether the pickup geometry on the card was built as suggested.
- Photos: none yet beyond the card.

## Next actions

1. Owner repairs the wiring, then supplies the lug-by-lug wiring, a cavity photo, and DC resistance at the output jack in every position (volume full up, both push-pull states). PRS26001 followed the same method ([PRS26001 wiring reference](../prs26001/PRS26001-wiring-reference.md)).
2. Build a netlist and operating-state table from that data and run the netlist checker pattern from [wiring-diagrams.md](../wiring-diagrams.md) before any builder-facing diagram.
3. Then author the instrument record per the `author-instrument-record` skill: `publish: false`, tests first, exact-instrument photos with alt text, and a structured control map (required before it can be marked completed).
4. Settle the prototype messaging with the owner before writing owner-facing copy. Keep price, availability, and private history out of the permanent record.
