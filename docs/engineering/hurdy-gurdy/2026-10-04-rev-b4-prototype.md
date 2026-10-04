# Electric Hurdy-Gurdy Rev B4 — Unpublished Prototype Record

- **Date:** 2026-10-04
- **Status:** CAD assembled and nominal clearances checked; released as a print-and-fit test candidate. No physical build, string-load test, durability test, or listening result is recorded.
- **Decision:** [Rev B4 prototype direction](../../decisions/2026-10-04-hurdy-gurdy-prototype-direction.md)
- **Source inventory:** [Owner conversation and corrections](../extraction/sources/2026-10-04-hurdy-gurdy-design-conversation.md)
- **Publication:** Internal engineering record only; no route or public asset is linked to it.

## Owner-provided constraints

- GFS lipstick pickup cylindrical body: **18 × 72 mm**; mounting-hole centers: **77 mm**. Depth was described as broadly similar to a humbucker, not measured precisely.
- The owner has electric guitar string sets including **9–42**, probably **10–46**, and possibly heavier sets. No tuning or key preference was specified.
- The wheel must act across the strings. The crank must be reachable at the tail. Key buttons belong on the far edge; the player's left hand reaches over a cover spanning the full keyed section.
- The body should fit approximately **256 mm** print beds, suit PET-CF, and minimize metal support where practical. String anchors and tuner support must survive tension.
- STEP is the editable Shapr3D interchange assembly; STL files serve print preparation. Keep parts separately selectable.

## Rev B4 CAD configuration

These values describe the generated model. They are not measurements of an assembled instrument.

| Subsystem | Model and intended test |
|---|---|
| Wheel and string path | 160 mm wheel, 10 mm D shaft, two 6000-2RS bearings, 345 mm nut-to-bridge scale. Shaft runs parallel to the strings; wheel rim motion crosses them. Four string lanes have a nominal 0.5 mm wheel crown rise relative to the straight nut-to-bridge line. Actual bridge and nut shimming must establish usable contact. |
| Initial strings | Three .024 wound electric strings provisionally at C4 (two melody, one trompette) and one .032 wound at G3 (drone). The build guide estimates about 250 N total pull using published string-tension data; actual tension and response remain unmeasured. |
| String loads | A 16 mm tuner plate attaches to two deep ribs with six M4 fasteners; rib tongues and nut web use two transverse M5 through-bolts. Four ball ends seat against steel washers at a 14 mm tail web tied to the walls by two M5 bolts. These are unqualified PET-CF joints. |
| Tuners and crank | Four vertical tuner posts pass through the plate, with gear cases below and accessible worm shafts/buttons at the sides. CAD contains clearance envelopes, not a drilled template for a purchased tuner. The crank projects from the tail. |
| Keyboard and tangents | 18 far-edge keys; nominal 3 mm travel. Each key has two 6 × 8 mm bosses and a short M2.5 steel tangent in a metal insert. Nominal rest gap is 2.3 mm with about 0.7 mm modeled engagement after full travel. Key return, fine intonation adjustment, and a positive travel stop are unresolved. |
| Cover and pickups | Two removable cover panels span all 18 keys. Three separate slotted pickup carriages serve melody, drone, and trompette strings inside the vibrating span. The model uses the supplied 18 × 72 mm, 77 mm-center pickup envelope; real underside and wire-exit fit need checking. |
| Modular print parts | 107 printable parts in the current kit; largest modeled print-part extent is 228 mm, within the 256 mm target. PET-CF fit coupons are provided for tuner bushing and insert holes. |

## Evidence and limits

The local Rev B4 package contains `rev_b4_assembly.step`, `rev_b4_master.FCStd`, `rev_b4_print_kit.zip`, an engineering drawing PDF with side elevation and wheel cross-section, the build guide, and CAD audit data. These generated files remain in the separate local Rev B4 deliverables folder; this repository records decisions and test status, and does not store or publish the CAD package.

The STEP assembly was reimported and its native shapes and nominal clearances were checked. The audit reported 361 separate assembly objects, 107 printable parts, and no modeled penetration in the checked wheel, key, pickup, tuner, fastener, crank, and print-part interfaces. The drawings show intended string-wheel intersection. CAD checks cannot establish wheel traction, PET-CF strength or creep, actual tuner fit, key feel, tangent survival, acoustic quality, or pickup balance.

## Hardware and first-print limits (reviewed 2026-10-04)

There is no complete purchase-ready bill of materials. The M2.5 insert is a **3.8 mm diameter × 5.7 mm long reference cylinder**, and the tangent is a **2.5 mm diameter × 10 mm long smooth reference cylinder**. Neither defines a selected, fitted commercial part. Each key needs two inserts and two tangents; keys 17–18 therefore need four of each for a fit trial. The printed insert coupon varies the **hole** diameter (3.6, 3.8, 4.0 mm), not the insert's diameter. Actual insert outside diameter, length, installation, and retention must be checked on the coupon and one key before purchasing a full set.

The string moves sideways into the tangent, so it would touch the **side** of a real M2.5 set screw. The CAD omits threads and cannot show string abrasion. A standard threaded set screw is suitable only as a provisional insert/adjustment fit gauge; a smooth string-contact surface remains an unresolved design requirement. The earlier build guide overreached by asking for string contact and reliable return from just two keys and a cover. Those three parts allow a hand-reach and boss-quality check. Adding `Keyboard_floor.stl`, `Keyboard_guide_inner.stl`, and `Keyboard_guide_outer.stl` permits a clamped guided-motion dry fit, but Rev B4 still has no return spring or positive travel stop. The local build guide now states these limits explicitly.

## Physical test and next revision

Start with the fit coupons and keys 17–18, including a reliable return mechanism and finger reach with the cover installed. Fit actual tuners before drilling their anti-rotation features. Assemble the load path, then bring strings to pitch gradually while measuring nut-to-bridge length, wheel contact, joint movement, and tuning drift. Test bowing and tangent action before printing the complete keyboard. Record findings here or in a dated follow-up test record.

The owner requested a **positive key-travel stop for the next revision**. Rev B4 models 3 mm nominal press but has no stop. Final travel and a serviceable stop design depend on the physical test; additional owner changes are pending.
