# Guitar wiring diagram workflow

Use this for builder-facing Relay or Coupeville diagrams. The approved Relay Lipstick example is [`public/wiring-diagrams/relay-lipstick-rev-1.0.png`](../../public/wiring-diagrams/relay-lipstick-rev-1.0.png) paired with [`content/relay/wiring/lipstick.mdx`](../../content/relay/wiring/lipstick.mdx). Copy the **process and presentation**, not that model's circuit.

## 1. Confirm the model before drawing

Make a compact build specification from owner decisions and the actual parts. Resolve every blank that affects a wire:

| Input             | Record                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scope             | Platform/model, pickup order, exact pickup variants and lead versions.                                                                           |
| Controls          | Selector positions; every push-push/push-pull state; pot values and taper; cap and resistor values or formulas; output jack.                     |
| Pickup leads      | Hot, coil return, shield/case, and series-junction lead(s) for each pickup. Identify by the supplied guide and meter, not a generic color chart. |
| Operating states  | One row per selector position and switch state, naming every pickup and any split or phase change.                                               |
| Physical hardware | Actual pot rear-view orientation and switch contact continuity in each mechanical state.                                                         |
| Unknowns          | Unconfirmed lead colors, hardware pinouts, polarity, and acoustic choices to check on the bench.                                                 |

Use manufacturer drawings for part orientation. A series junction exposed as **one lead** must be insulated when unused; a conventional four-conductor pickup's **two separate series ends** must first be joined and then insulated. Do not assume all versions of a pickup use the same harness.

## 2. Establish the circuit in text

Write a netlist before generating artwork. Give each signal a short label (`B`, `N`, `BUS`, `OUT`, etc.) and list every terminal on that net. List grounds, unused terminals, capacitor/resistor series junctions, and shields separately. Add a selector/pole contact table for both switch states. Calculate any resistor formula from the measured isolated pickup resistance; label nominal component values as starting values when appropriate.

Check that the netlist produces the approved operating-state table. Treat the netlist as the circuit source of truth; an image generator can draw a plausible but electrically wrong wire.

## 3. Draw and inspect the reference image

- Use a clear, high-contrast builder diagram in the Seymour Duncan/PRS tradition: recognizable parts, continuous colored signal paths, boxed net labels, a compact switching table, and a single unambiguous ground network.
- Put model name, date, and revision at the top. Keep private design notes and small disclaimer text off the published image.
- State the view for every pot. In a rear view with shaft away and lugs down, the physical left/center/right terminals are CW/wiper/CCW. Verify clockwise knob behavior rather than trusting a label.
- Mark selector and DPDT drawings as **functional contact maps** unless they depict the exact part's physical lugs. Verify the real part by continuity; do not bridge two switch poles accidentally.
- Compare the **actual exported image** against the netlist after every edit. Image edits can change unrelated connections or text.

For a builder reference, request two independent reviews: one agent traces electrical connectivity and all operating states; another checks physical lug orientation, lead handling, readability, and whether a builder can follow the drawing. Give both the approved spec and final image, ask for specific pass/fail findings, and re-review any changed final export. This is drawing review, not certification of an unmeasured physical harness.

## 4. Publish the image with a readable page

Lead with a short control summary and the diagram. Make the full-resolution image and download actions visible next to it. Keep the switching table, parts/lead distinctions, complete connection map, build order, and bench checks as searchable text below. A scaled bitmap alone is too small to serve as the whole bench reference.

Keep model-specific working prompts, rejected drafts, and private design notes untracked and outside the public repository. Publish only the approved final image under `public/wiring-diagrams/` and the matching page under the relevant model's content path. Do not silently replace useful page text when adding an image; agree on the page composition with the owner first.

Before merging, inspect the rendered page at desktop and phone widths, confirm the full-size/download links, run `git diff --check`, Prettier, and `npm run build`, and verify that the final text and image still describe the same circuit. After merging, confirm that the production deploy serves the new revision before reporting it live.
