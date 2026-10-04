# Electric Hurdy-Gurdy — Design Conversation Inventory

## Source

- **Source:** Owner's referenced ChatGPT conversation, `Design 3D Printed Hurdy Gurdy` (conversation ID `6ac1ee2a-2b0c-83e8-a932-ba3a7a0f632c`), and the owner's follow-up instructions in the Codex conversation reviewed 2026-10-04.
- **Reviewed:** 2026-10-04. The date of each earlier conversation turn is not available in this inventory.
- **Scope:** Mechanical orientation, print and interchange requirements, hardware, player layout, and the Rev B4 test direction.
- **Limit:** Owner statements establish preferences and supplied measurements. Generated CAD and assistant calculations establish only design proposals until measured on hardware.

### HG-001 — Wheel bows across the strings

**Statement:** The wheel's surface motion at the contact point must cross the strings, as a bow does.

**Evidence:** Corrected. The owner said, “the rotation of the wheel needs to be across the string and not along it,” then said the revised musical geometry “looks right to me.”

**Proposed classification:** Reference design. **Dependency:** Physical wheel contact and sound remain untested.

### HG-002 — Starting mechanical envelope and editable files

**Statement:** Design around a 160 mm-class wheel and approximately 345 mm melody scale; use a separate-component STEP assembly for Shapr3D and STL exports for printable parts.

**Evidence:** Confirmed in the owner's request: “Use a 160 mm-class wheel and approximately 345 mm melody scale as starting dimensions,” and “Target Shapr3D interoperability with STEP as the editable master format and STL exports for printable parts.” The same request permits engineering adjustments.

**Proposed classification:** Reference design. **Dependency:** Dimensions are design targets, not measured performance.

### HG-003 — Modular printed structure

**Statement:** Make the body modular for approximately 256 mm print beds and suitable for PET-CF; prefer a printed load path, with metal support allowed if needed.

**Evidence:** Confirmed in the owner's brief: “Make the body modular for approximately 256 mm print beds and suitable for PET-CF.” Later, the owner said, “I can add metal supports to the instrument, but I prefer to avoid it if possible,” and warned that the earlier structure and tuner plate were too weak.

**Proposed classification:** Reference design. **Dependency:** Printed joints and creep need load testing.

### HG-004 — Crank at the tail

**Statement:** Put the crank at the outside tail end so the player can reach it.

**Evidence:** Corrected. The owner first said, “The crank is unreachable,” then clarified, “outside edge meant tail end.”

**Proposed classification:** Reference design.

### HG-005 — Guitar strings as a trial, no tuning preference

**Statement:** Explore the owner's available electric guitar strings, including 9–42 and probably 10–46 sets, without assuming a preferred tuning or key.

**Evidence:** Confirmed by the owner's statements “I have several electric sets, definitely some 9-42, but probably some 10-46” and “I have no tuning/key preference.” The owner later said, “That sounds like a good plan.” No actual string response has been reported.

**Proposed classification:** Reference design. **Dependency:** Final gauge, pitch, tension, and wheel response remain experimental.

### HG-006 — Guitar tuner orientation and access

**Statement:** Consider guitar machine heads with physically accessible buttons and a sufficiently braced plate; the earlier depiction of how guitar tuners work and the thin tuner plate were rejected.

**Evidence:** Corrected by explicit owner feedback: “your idea of how guitar tuners works is kind of comical” and “the plate holding the tuners is far too weak.” No tuner make or model has been selected by the owner.

**Proposed classification:** Reference design. **Dependency:** Exact hole and anti-rotation pattern await chosen hardware.

### HG-007 — Far-edge keys and full cover

**Statement:** Put key buttons on the far edge so the left hand reaches over the strings; cover the complete keyed string span.

**Evidence:** Confirmed by the owner's direct answer “Yes, far edge” and separate instruction, “The string cover needs to cover the span of the keys too.”

**Proposed classification:** Reference design. **Dependency:** Hand comfort and return action need a physical test.

### HG-008 — String anchor and load path

**Statement:** Provide a credible structural path for string tension through the tuner support, body, and tail anchors.

**Evidence:** Confirmed design constraint from the owner's feedback: “The structure won't survive string tension,” “I wonder if the string anchor will survive the tension,” and “the plate holding the tuners is far too weak.” The Rev B4 bulkheads, ribs, and crossbolts are assistant-designed responses, not owner-validated hardware.

**Proposed classification:** Reference design. **Dependency:** Actual tension and PET-CF behavior remain unmeasured.

### HG-009 — Pickup dimensions and independent adjustment

**Statement:** The owner's GFS lipstick pickup bodies are 18 × 72 mm with 77 mm mounting-hole centers and depth broadly similar to a humbucker. Independently adjustable, removable mounts are desired.

**Evidence:** Confirmed by the owner's measurements, “The cylinders are 18mm x 72mm. The mounting holes are 77mm from center to center,” and later comment, “I like the idea of having multiple pickups that can be adjusted independently.” Three pickup channels and their placements are prototype design choices; the owner questioned whether multiple pickups are needed and did not require all three permanently.

**Proposed classification:** Reference design. **Dependency:** Ear, wire-exit, and installed depth dimensions need measurement.

### HG-010 — Tangents must withstand actuation

**Statement:** Replace fragile exposed printed tangents with a more supported arrangement before testing.

**Evidence:** Corrected. The owner said the earlier tangents would “break off in a heartbeat” and doubted they would survive one activation. Rev B4's short steel tangents are a proposed response, not a durability result.

**Proposed classification:** Reference design. **Dependency:** Check PET-CF bosses, inserts, string contact, and return under repeated use.

### HG-011 — Rev B4 is a test candidate

**Statement:** Rev B4 is worth printing and testing; it is not a validated instrument design.

**Evidence:** Confirmed by the owner's statement that Rev B4 “looks like something that might be worth testing.” No physical test results have been supplied.

**Proposed classification:** Validation plan.

### HG-012 — Restrict key throw in the next revision

**Statement:** Add a positive limit to key travel in the revision after Rev B4 testing.

**Evidence:** Confirmed by the owner's explicit request to “restrict the throw on the keys so that they can only move so far.” The owner intends to supply other changes after testing.

**Proposed classification:** Reference design. **Dependency:** Choose stop position and mechanism from physical test results; current 3 mm nominal travel is not a validated limit.

### HG-013 — Keep this work unpublished

**Statement:** Preserve this information as internal engineering records without publishing the design or starting a new site build.

**Evidence:** Confirmed by the owner's 2026-10-04 request: “add this info as engineering records to the repo” and “doesn't generate a new build because we won't be publishing it.”

**Proposed classification:** Project or governance principle. **Dependency:** Future publication requires a separate owner decision.
