# RLY26002 engineering record

Opened 2026-11-15 · "Torch – Production Prototype", a Relay Torch build kept unchanged after owner-reported player testing.

**Status:** serial reserved, instrument record not started and unpublished. Do not publish or add a route for RLY26002 until the owner approves.

## Decisions

| Date       | Decision                                                                                                                                                                    | Status   |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 2026-11-15 | Document this build as an instrument record named **Torch – Production Prototype**. The body is not fully polished, so the record leans on "prototype" and says so plainly. | Approved |
| 2026-11-15 | Use serial **RLY26002** (`RLY` is for real Relay prototypes that are sold; completion year 2026, owner-confirmed).                                                          | Approved |
| 2026-11-15 | Keep the design unchanged, because the owner reports the tester found it meets the target spec.                                                                             | Approved |
| 2026-11-15 | Do not publish the serial yet. Update only this engineering log.                                                                                                            | Approved |

**Serial note.** [RLY26001](../rly26001/README.md) is reserved for the Harmonic Triad prototype but has no `.mdx` yet. `allocate-serial.mjs` counts only `content/instruments/*.mdx`, so it still emits `RLY26001`. RLY26002 was therefore assigned by hand on 2026-11-15, with the owner's approval. Unresolved: the allocator does not see reservations made in engineering records. Until that is fixed, check `docs/engineering/rly*/` before allocating, or write the `.mdx` stub for the reserved serial first.

## Source facts

Owner-reported on 2026-11-15 unless noted.

- **Model:** Relay Torch, with a P90-type pickup in the middle position.
- **Completed:** 2026. The exact date is not recorded yet; the serial year `26` is confirmed.
- **Pickups:** the specified GFS pickups from the [Torch reference](../relay-torch-reference.md): bridge GFS VEH, middle GFS Mean 90 (P90-type), neck GFS Professional Series Alnico II. The owner has not yet confirmed lead versions.
- **Body:** not a polished body, which is why it is a prototype.
- **Testing:** over the last few months a local Seattle musician, stage name **Sputnik Monroe Jr.**, played and checked it. The owner reports the tester validated that it meets the target spec, so the design stays as built. The owner has not supplied test notes, dates, or measurements, so this is an owner-reported validation, not a documented test result.
- **Privacy:** keep the tester's name out of the permanent owner-facing record unless the owner approves it.

## Unknowns

- Whether the wiring matches the [Torch reference circuit](../relay-torch-reference.md) exactly: A500K volume with no treble bleed, A500K push-pull tone, 22 nF tone capacitor, Edge Contour network (2.2 nF in parallel with 150 kΩ), five-way blade. The owner said the pickups match but has not yet confirmed the controls and wiring.
- Whether any physical measurement has been taken. The Torch reference says its circuit is a specification, not evidence that a harness was measured. Jack DC resistance in each position, with the tone down and up, would verify it, as was done for PRS26001.
- Which pickup lead versions are installed.
- Body, neck, finish, hardware, and what exactly is "not polished".
- Completion date, photographs, and the print/case-card wording.

## Next actions

1. Owner confirms the controls and wiring match the Torch reference, or lists differences. Optionally measure at the jack.
2. Owner supplies exact-instrument photos, build details, the completion date, and how to describe the unpolished body.
3. Author the instrument record with the `author-instrument-record` skill: `publish: false`, tests first, a structured control map covering the five selector positions and both tone push-pull states.
4. Settle the prototype messaging with the owner. Keep price, availability, and private history out of the permanent record.
