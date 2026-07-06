# Relay Content Ideas Ledger

> **What this is:** Distilled ideas mined from the retired first-generation Relay content (deleted 2026-07-05, recoverable from git history). That material was AI-assisted exploration and was never validated against real builds — **nothing here is canonical**. Treat every item as a structural suggestion or a claim to verify on a real instrument before it becomes site content. This file is not routed and never appears on the site.
>
> Source files (all deleted): `content/relay/electronics/{overview,wiring,design-boundaries}.mdx`, `content/relay/setup/{playable,professional,optimization}.mdx`, `content/relay/assembly/{overview,checkpoints}.mdx`, `content/relay/lipstick/compatibility.mdx`.

## Structure ideas worth reusing

- **Setup ladder (three tiers):** Getting Playable (minimum viable setup) → Fine-Tuning (action/intonation/pickup balance refinement) → When to Call a Luthier. The tier framing ("everything in Fine-Tuning is refinement, not requirement") is a good completeness-friendly shape for future setup docs.
- **Checkpoint checklists between stages:** after bonding / after hardware mounting / neck dry-fit / after stringing / before setup. Checklists as gates ("do each one before moving on") fit the build-stage structure well.
- **Electronics-first vs hardware-first assembly sequencing** presented as two valid orders with "best for" guidance rather than one prescribed path.
- **Design Boundaries page shape:** "what you can change / what you should not / if you deviate, document it and tell Discord." Strong fit for the teaching philosophy (equip deviation, don't forbid it). The Arc wiring guide already gestures at this; could become a per-voicing or platform-level section.
- **"What to tell a luthier" framing:** anticipate skepticism about a 3D-printed body (PET-CF, pocket to spec, what you want done, bring the parts list). The luthier page also claimed a $60–$150 setup price range — verify locally before publishing.

## Claims to verify on a real build before publishing

- **Neck/pocket spec (from compatibility page):** 24.75" scale non-negotiable; Fender-style heel; heel width/length dims were never filled in (`[TODO]`). Identical-spec budget necks vary enough to need pocket sanding — this matches the shipped guitar-neck item note, probably true.
- **Bridge:** fixed hardtail string-through only; tremolo not compatible; mounting-hole spacing and saddle string spacing dims were never documented.
- **Pickup constraints (lipstick circuit):** humbuckers must stay in PAF range (~7–9kΩ DC; >10kΩ buries the lipstick); lipstick is not interchangeable with a Strat single-coil (impedance/output differ, tone + treble-bleed values tuned to the GFS Pro Tube). Plausible, matches the registry pickup maps — but stated with more precision than was ever measured.
- **Controls cavity:** full-size CTS-style pots fit; mini pots unsupported (cavity walls too thin). Worth confirming on a current-revision body print.
- **Kwikplug rationale:** GFS chosen partly because Kwikplug makes pickup swaps easy — good marketing/teaching point if it's actually why.
- **Pickup height baseline** and target action ranges were all `[TODO]` — the pages implied measured values that never existed.

## Wiring/bench content ideas (some already superseded)

The retired wiring pages were skeletons full of `[TODO]`s; the shipped per-voicing wiring guides (e.g. Arc) already do this job better. Still unclaimed ideas:

- Solder-station tools list (iron wattage/tip, rosin-core, flux pen, helping hands, heat shrink, multimeter-is-essential).
- Bench-test-before-install procedure: continuity per selector position, no lugs shorted to ground, screwdriver-tap signal test through an amp.
- Shielding process walkthrough (foil application, section continuity, ground attachment) — currently only asserted as mandatory, never documented.
- Treble bleed explainer (why volume roll-off gets muddy without it) — nice "build the intuitive model" sidebar for a wiring guide.

## Assembly content ideas

- Ferrules are the one irreversible step — dry-fit gates before pressing them (no rocking, string line centered nut→bridge, straight-edge neck angle, four bolt holes align). Repeated in two retired files; likely sound, still verify wording against a real install.
- "Stop and post photos in Discord before doing anything irreversible" as the standing escalation rule.
