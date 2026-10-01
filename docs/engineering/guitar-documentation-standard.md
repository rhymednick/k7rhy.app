# Guitar documentation standard

- **Date:** 2026-10-01
- **Status:** approved by owner merge; the items under "Not yet applied" need owner decisions
- **Source:** [Zebrawood guitar documentation conversation inventory](extraction/sources/2026-07-30-zebrawood-guitar-documentation-conversation.md), candidates ZGDC-009 through ZGDC-025, promoted 2026-10-01
- **Related:** [Guitar wiring diagram workflow](wiring-diagrams.md), which governs how builder diagrams are drawn, checked, and published

This standard covers wiring documentation for Relay and Coupeville guitars and their serialized instruments. **Must** marks a requirement, **should** a recommendation, and _for example_ an illustration that is not a rule (ZGDC-024).

## Requirements

1. **Intent first.** A wiring package starts with the design intent and musical goal before implementation detail (ZGDC-009). On a published wiring page, the opening control summary carries this.
2. **Conventional schematics.** When a package includes a schematic, it uses conventional notation and explains how the circuit operates, not how it is assembled (ZGDC-011).
3. **Never mirror.** A component drawing keeps its canonical orientation. It is never mirrored to match an installation; an installation may rotate the part, not reflect it (ZGDC-014).
4. **Positional lug language.** Name pot lugs by position (left, center, right) tied to the stated view, adding numbers only where they help, and always state the view (ZGDC-015).
5. **Name every connection.** Every net or wire has a consistent label so assembly and debugging can trace it (ZGDC-016). The published pages use boxed net labels such as `BUS`, `OUT`, and `GND`; the source's `N_HOT` and `BUS_GND` were examples, not a required scheme.
6. **Readable bench pages.** One concept per figure, few crossed wires, white space, large labels, and printable on US Letter without scaling (ZGDC-017).
7. **Validation.** Include continuity checks, output-jack resistance readings or ranges, tap tests, expected control behavior, and failure guidance where it helps (ZGDC-019). Exact values belong to the design or product, not to this standard.
8. **Declare the revision.** A product or instrument page names the exact revision of the reference design it uses instead of copying the design (ZGDC-022). Published wiring pages carry the diagram's revision and date.
9. **Identify reusable designs.** A reusable wiring design has a stable name and explicit revisions (ZGDC-021). The source's `RL-HAR-*` identifiers were examples, not adopted.
10. **Listening notes.** After a build, record surprises, strengths, useful settings or playing contexts, possible changes, and compatible future modifications (ZGDC-020). These belong with the serialized instrument (see RCCP-024 in the ledger).
11. **Knowledge classes.** Keep cross-product rules in standards, reusable solutions in reference designs, consequential rationale in decision records, and product discoveries in product documentation or listening notes (ZGDC-023).
12. **Decision records.** A significant decision records its status, context, the decision, its consequences, and references (ZGDC-025). The [decision-record rules in AGENTS.md](../../AGENTS.md) add date and supersession.

## Not yet applied

These accepted conventions differ from, or are not yet confirmed against, how the current published wiring pages are built. They stay "Needs resolution" in the ledger until the owner decides how to apply them.

- **Separate specification and assembly guide (ZGDC-010).** The current Relay wiring pages combine the circuit (switch table, connection map) with assembly (build outline, bench checks) on one page.
- **Harness layout from the cavity top view (ZGDC-012).** No current page has a physical harness layout; the diagrams are functional contact maps.
- **Canonical pot view (ZGDC-013).** Pot drawings use the view from the underside of the mounted pot, looking at the solder lugs "with the lugs facing you". The published diagrams state "rear view, shaft away, lugs down", with left, center, and right as CW, wiper, and CCW. Confirm that these are the same view before adopting it: the source records that an earlier drawing reversed the view.
- **Wiring-package contents (ZGDC-018).** The baseline lists overview, schematic, harness layout, component details, grounding, assembly sequence, validation, revision history, and design intent. Current pages have no schematic, harness layout, or revision history, and do not say which sections may be omitted.

## Provenance

The owner accepted ZGDC-009 through ZGDC-025 in the source conversation (2026-07-30; repeated "Agreed" replies, per the inventory's extraction notes) and approved their promotion on 2026-10-01 by merging this standard.
