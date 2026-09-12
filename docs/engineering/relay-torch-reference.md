# Relay Torch reference circuit

**Revision:** 1.0

**Adopted:** 2026-09-12

**Authority:** Owner-approved [Relay Torch case card inventory](extraction/sources/2026-09-12-relay-torch-case-card.md), candidates RTC-001 through RTC-006 and RTC-008.

This is the current Relay Torch electrical reference. It specifies the circuit to build; the source card is not evidence that a physical Torch harness has been assembled or measured. A shunted 1 MΩ master volume is a separate future experiment, not a substitution in this revision.

## Parts and operating states

- Bridge: hotter humbucker; middle: P90-type primary pickup; neck: fuller humbucker. The current Relay parts catalog names GFS VEH, Mean 90, and Professional Series Alnico II respectively. Identify the actual lead versions supplied before soldering.
- Standard five-way blade: (1) bridge; (2) bridge and middle in parallel; (3) middle; (4) neck and middle in parallel; (5) neck.
- Master volume: A500K audio taper, no treble bleed.
- Master tone: A500K audio-taper push-pull pot, wired as a standard modern tone control; 22 nF (`0.022 µF`, `223`) capacitor; no no-load modification.
- Global Edge Contour: 2.2 nF (`0.0022 µF`, `222`) capacitor in parallel with a 150 kΩ resistor, forming one two-terminal network. Tone push-pull down bypasses this network; pulled up inserts it in series between selector output and volume input.
- Mono output jack; common ground including pickup returns, separate shields/cases, pot cases, selector chassis if conductive, cavity shield, bridge/string ground, and jack sleeve.

## Functional netlist

| Node   | Connections                                                                                                                                         |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SEL`  | Five-way selector common output; down-state direct contact; one end of both parallel Edge components.                                               |
| `EDGE` | Other ends of both the 2.2 nF capacitor and 150 kΩ resistor joined; up-state Edge contact.                                                          |
| `BUS`  | Push-pull common; volume input; tone input. Down connects `SEL` directly to `BUS`; up connects `SEL` through the Edge network to `BUS`.             |
| `OUT`  | Volume wiper; output jack tip.                                                                                                                      |
| `GND`  | Volume grounded track end; 22 nF tone-cap return; pickup returns and separate shields/cases; conductive hardware and shielding; output jack sleeve. |

Each pickup hot feeds only its respective functional selector input. Insulate unused humbucker series-junction lead(s): a single supplied split lead remains separate and capped; two supplied series ends must be joined according to that pickup's wiring guide and the joint insulated. Do not infer pickup hot or return from a generic GFS color chart.

The tone branch connects `BUS` to the tone pot's CCW end, then the tone wiper through the 22 nF capacitor to `GND`; the CW end is unused. The output-side volume wiper is **not** the tone feed. There is no connection between `BUS` and `OUT` except through the A500K volume track and wiper; no treble-bleed network is fitted.

For rear-view pots with shafts pointing away and lugs down, physical left/center/right correspond to CW/wiper/CCW. Thus the volume lugs are `BUS`/`OUT`/`GND` left to right, while the tone lugs are unused/capacitor/`BUS` left to right. Verify clockwise volume increases level and clockwise tone brightens. The selector and push-pull contacts above are **functional mappings**, not manufacturer-specific physical lug numbers; identify actual contacts by continuity in every mechanical state.

## Verification boundary

Meter all five selector positions and both push-pull states before soldering, then verify that only the selected pickup(s) reach `SEL`, that down joins `SEL` directly to `BUS`, and that up places the Edge network between them. Confirm `OUT` reaches jack tip, all designated grounds reach sleeve, and there is no accidental ground short or input-to-output bypass. Tap-test all ten operating states and check knob direction. Listening and measured behavior of a built instrument remain to be documented separately.
