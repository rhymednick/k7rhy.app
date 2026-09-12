# Relay Arc lug-map source — reconciliation inventory

## Source and authority

- **Artifact supplied by owner:** `relay_arc_correct_lug_map.html`, titled “Relay Arc Correct Lug-by-Lug Wiring Map”; local file modified 2026-05-10 and supplied as the “Relay Arc reference build” on 2026-09-12.
- **SHA-256 of supplied HTML:** `f216a3f717048aedd033e644322b61d098e48b1032d5db6783003ec6927e6321`.
- **Status:** Source evidence for the Arc circuit. Do not publish its physical lug map verbatim: on 2026-09-12 the owner confirmed the site's pickup placement, approved remapping the file's Arc Mode behavior to it, selected the established rear-view tone-pot wiring, and resolved the position-4 split overlap. The reconciled circuit and diagram were reviewed and published as Relay Arc Revision 1.0.

## Circuit described by the file

The HTML places a GFS Dream 180 at bridge, GFS Liverpool Vintage at middle, and GFS Vintage 59 at neck. A four-pole five-way super switch selects bridge, bridge plus middle, middle, neck plus middle, or neck. Pole A selects audio; poles B and C send the selected Dream 180 and Vintage 59 series junctions to a shared partial-split path; pole D is unused. The Liverpool is **never coil-split**.

The tone push-pull uses one pole to connect the selected humbucker series junctions through **3.3 kΩ to ground** when pulled up; down leaves the split path open. Its other pole selects either a direct Liverpool-hot path (down) or a **680 pF capacitor in series** with Liverpool hot (up). The output of that pole is the Liverpool signal presented to the five-way switch. The source's five-position table consequently describes partial Dream 180 split in positions 1–2, partial Vintage 59 split in positions 4–5, and Liverpool bright path in positions 2–4.

The source also specifies A500k master volume, a **1 nF capacitor in parallel with 150 kΩ** across volume input and wiper, A500k push-pull master tone with 22 nF (`0.022 µF`) capacitor, and a mono output jack. It gives generic GFS green hot, red/white series, black/bare ground colors, while separately allowing a two-conductor Liverpool. Actual lead versions must be identified from their supplied guides and meter readings rather than applying a generic color chart.

## Conflict with the current site

The Arc voicing page, wiring page, and parts catalog all place **Liverpool at bridge, Dream 180 at middle, Vintage 59 at neck**. This placement was present in the repo before the source file's May 2026 modification and was explicitly reaffirmed by the owner on 2026-09-12. The current wiring page publishes a basic five-way harness and leaves the tone push-pull switch lugs open; it does not include the source's Arc Mode or treble bleed. Neither the source's switch pole assignments nor its operating-state table can be copied to that placement.

The source numbers volume and tone pot lugs without defining the rear-view orientation. It also grounds one outer tone lug while putting the 22 nF capacitor from the wiper to ground. The owner instead selected the established rear-view A500k tone wiring: shaft away and lugs down, physical left/CW unused, center/wiper through 22 nF to ground, right/CCW fed from volume input. The matching rear-view volume wiring is left/CW input, center/wiper output, right/CCW ground. Verify clockwise volume increases level and clockwise tone brightens.

## Owner-approved behavioral remap

With the confirmed site placement, the selected pickups are Liverpool bridge in positions 1–2, Dream 180 middle in positions 2–4, and Vintage 59 neck in positions 4–5. The owner approved carrying over the source's _behavior_: Liverpool takes the direct/680 pF path in positions 1–2, Dream 180 is partially split in positions **2–3**, and Vintage 59 is partially split in positions **4–5**. Dream 180 remains full in position 4. This became the approved Revision 1.0 builder reference.

The file's single shared split bus cannot be remapped literally: in position 4, Dream 180 and Vintage 59 are selected together, so their series junctions would be tied even with Arc Mode down. The owner chose to split **only Vintage 59** in position 4. Therefore the Dream 180 series junction reaches the split bus only in positions 2–3, and the Vintage 59 junction reaches it only in positions 4–5. The two series junctions must never connect to each other through the selector in any position.

Before publication, verify the actual super-switch and push-pull contact states and humbucker lead arrangements and polarity. Keep this inventory in engineering notes rather than placing the superseded pickup order on the public Arc model page.
