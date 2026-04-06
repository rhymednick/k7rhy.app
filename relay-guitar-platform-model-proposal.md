# Relay Guitar Platform — Model Proposal

This page proposes the initial Relay Guitar Platform lineup for MakerWorld. The goal is not to make six guitars that differ only on paper. Each model should have a clear tonal identity, a clear reason to exist, and a control layout that feels like a player’s instrument rather than a puzzle.

## Platform-wide design philosophy

The Relay platform stays a **3-pickup platform**. That is part of the point. Three pickups are uncommon in 3D-printed guitars, and they let the line feel like a family instead of a collection of unrelated one-offs.

Across the family, the design rules are:

- Each model should have a **distinct emotional center**
- Each model should have a **small, understandable control story**
- Special functions should be used to **improve expression**, not just add mode count
- The control layout should remain as consistent as possible unless a model has a compelling reason to break the pattern

## Platform control strategy

The platform should **not** force every model into the same selector logic. That would make the line less musical, not more coherent.

The better rule is:

- Use a **3-way selector** when the middle pickup is a **curated auxiliary / shaping voice**
- Use a **5-way blade** when the middle pickup is one of the model’s **core voices**

That gives the line two clear control families:

### 3-way family
For models where the middle pickup acts as a modifier, enhancer, or alternate layer.

- **Relay Lipstick**
- **Relay Current**

Default 3-way meaning:

1. Bridge  
2. Bridge + Neck  
3. Neck

### 5-way family
For models where the middle pickup deserves direct access as a true pickup position.

- **Relay Velvet**
- **Relay Arc**
- **Relay Torch**
- **Relay Hammer**

Default 5-way meaning:

1. Bridge  
2. Bridge + Middle  
3. Middle  
4. Neck + Middle  
5. Neck

This is a better product rule than forcing a universal selector layout, because it ties the control scheme directly to the pickup’s job.

---

## Relay Lipstick

### What it is

Relay Lipstick is the reference model and first release. This is the expressive, articulate, signature model in the family. It is the one with the clearest “Relay” identity: dual humbuckers with a middle lipstick, familiar core behavior, and one musically curated alternate voice layer.

### Why someone would choose it

Choose Relay Lipstick if you want:

- strong clean articulation
- expressive pick response
- a bridge tone that can still get a little angry
- a special alternate voice that adds character without turning the instrument into a novelty
- a guitar that feels familiar in the hands but still has a recognizable personality

This is the model for players who want **touch sensitivity and personality** more than sheer output or maximum tonal coverage.

### Recommended GFS pickups

- **Neck:** GFS Professional Series Alnico II Humbucker
- **Middle:** GFS Pro-Tube Lipstick, middle / ~6K class
- **Bridge:** GFS VEH humbucker

### Proposed control layout

- **3-way selector**
  - 1 = Bridge humbucker
  - 2 = Bridge + Neck
  - 3 = Neck humbucker

- **Master volume**
  - Main output control for the entire guitar

- **Push-pull / push-push on volume: “Lipstick Voice”**
  - Adds the middle lipstick pickup
  - Simultaneously forces the bridge into a **partial split**
  - Applies the chosen compensation / correction network so the added lipstick voice stays alive and usable instead of going weak and apologetic

- **Master tone**
  - Main treble rolloff

- **Push-pull / push-push on tone: “Voice contour”**
  - Reserved for the final cap / resistor contour choice derived from prototype testing
  - Functionally, this would give the player either:
    - the more open / direct voicing, or
    - the shaped voicing that recreates the feel of the preferred prototype network

### Control intent

Relay Lipstick should behave like a normal player’s guitar first. The lipstick function should feel like a second identity of the same instrument, not a special effect.

---

## Relay Velvet

### What it is

Relay Velvet is the warm, fat, classy club model. This is not “Relay Lipstick, but jazzier.” It is a distinct instrument with a different center of gravity. Velvet should feel warm, authoritative, and present.

### Why someone would choose it

Choose Relay Velvet if you want:

- a neck voice with body and polish
- a middle voice with real presence, not just sparkle
- a guitar that can lead the room without getting sharp or brittle
- warm chord melody, rich rhythm work, and a more elegant stage voice

This is the model for the player who wants the band to orbit around the guitarist in a classy room.

### Recommended GFS pickups

- **Neck:** GFS Professional Series Alnico II Humbucker
- **Middle:** GFS Retrotron Nashville
- **Bridge:** GFS Professional Series Alnico II Humbucker

### Proposed control layout

- **5-way blade**
  - 1 = Bridge
  - 2 = Bridge + Middle
  - 3 = Middle
  - 4 = Neck + Middle
  - 5 = Neck

- **Master volume**
  - Main output control

- **Master tone**
  - Main treble rolloff

- **Push-pull / push-push on tone: “Velvet focus”**
  - Suggested function: a subtle voicing shift rather than a split
  - Recommended implementation concept:
    - down = fullest, warmest baseline voice
    - up = slightly clarified / tightened response for ensemble playing
  - This could be implemented through a small load or contour network, not necessarily a split

### Control intent

Relay Velvet should not feel clever. It should feel poised. The Nashville is there to add **presence and focus**, not novelty, which is why Velvet deserves direct 5-way access to its middle-based voices.

---

## Relay Arc

### What it is

Relay Arc is the airy, spatial, chime-forward model. It is the one that emphasizes width, shimmer, and clarity without becoming thin or brittle.

### Why someone would choose it

Choose Relay Arc if you want:

- openness and shimmer
- spatial clarity in chords
- a guitar that feels expansive and dimensional
- a cleaner, more “lit from within” character than the other models

This is the model for the player who wants air, separation, and a sense of space.

### Recommended GFS pickups

- **Neck:** GFS Vintage 59 Humbucker
- **Middle:** GFS Dream 180
- **Bridge:** GFS Retrotron Liverpool

### Proposed control layout

- **5-way blade**
  - 1 = Bridge
  - 2 = Bridge + Middle
  - 3 = Middle
  - 4 = Neck + Middle
  - 5 = Neck

- **Master volume**
  - Main output control

- **Master tone**
  - Main treble rolloff

- **Push-pull / push-push on tone: “Arc air”**
  - Suggested function: a brightness / openness contour
  - down = slightly fuller / more grounded
  - up = more airy and present
  - Use a subtle network, not a drastic EQ gimmick

### Control intent

Arc should not be warm and clubby like Velvet, and it should not be rude like Torch. It should feel **open, ringing, and alive**.

---

## Relay Torch

### What it is

Relay Torch is the rude, vocal-mid, more modern-radio / broadly popular model. This is the model that may end up having the widest immediate appeal, because its tonal center is closer to the way many players hear “alive” and “hooky” in modern music.

### Why someone would choose it

Choose Relay Torch if you want:

- attitude
- vocal mids
- a guitar that feels more contemporary and immediate
- some danger and edge without becoming a metal guitar
- a sound that cuts, hooks, and feels emotionally direct

This is the model for players who want the guitar to talk back.

### Recommended GFS pickups

- **Neck:** GFS Professional Series Alnico II Humbucker
- **Middle:** GFS Mean 90
- **Bridge:** GFS VEH humbucker

### Proposed control layout

- **5-way blade**
  - 1 = Bridge
  - 2 = Bridge + Middle
  - 3 = Middle
  - 4 = Neck + Middle
  - 5 = Neck

- **Master volume**
  - Main output control

- **Master tone**
  - Main treble rolloff

- **Push-pull / push-push on tone: “Torch edge”**
  - Suggested function: bridge partial split or bridge contour
  - Recommended default:
    - down = full bridge authority
    - up = more open / more articulate bridge behavior for players who want a little less shove
  - This should be tested carefully so the model keeps its core identity

### Control intent

Torch should be the most emotionally direct non-metal model in the line. It should feel current, punchy, and a little dangerous.

---

## Relay Current

### What it is

Relay Current is the punchy, cutting, immediate model. It is less warm than Velvet, less spacious than Arc, and less throaty than Torch. It is about speed, edge definition, and strong projection.

### Why someone would choose it

Choose Relay Current if you want:

- fast attack
- crisp upper-mid presence
- a guitar that jumps out of the amp
- a more percussive and cutting voice

This is the model for players who want the line’s sharpest non-metal tool.

### Recommended GFS pickups

- **Neck:** GFS Vintage 59 Humbucker
- **Middle:** GFS Retrotron Hot Nashville
- **Bridge:** GFS Professional Series Alnico V HOT Humbucker

### Proposed control layout

- **3-way selector**
  - 1 = Bridge
  - 2 = Bridge + Neck
  - 3 = Neck

- **Master volume**
  - Main output control

- **Push-pull / push-push on volume: “Add Hot Nashville”**
  - Adds the middle pickup
  - Creates the fast, cutting alternate voice that defines the model

- **Master tone**
  - Main treble rolloff

- **Push-pull / push-push on tone: “Current snap”**
  - Suggested function: a contour that increases bite and immediacy
  - Keep it subtle
  - This model should sound pointed, not icepicky

### Control intent

Current should feel responsive and quick, with strong transient definition and less bloom than Velvet or Arc.

---

## Relay Hammer

### What it is

Relay Hammer is the dedicated heavy model. It is the least subtle guitar in the family and should not pretend otherwise.

### Why someone would choose it

Choose Relay Hammer if you want:

- high-gain authority
- tight, aggressive attack
- modern metal focus
- the heaviest, most forceful Relay voice

This is the specialty brute of the line.

### Recommended GFS pickups

- **Neck:** GFS Crunchy Rails
- **Middle:** GFS Power Rails
- **Bridge:** GFS Crunchy Rails

### Proposed control layout

- **5-way blade switch**
  - Hammer is the one current model where I would seriously recommend breaking from the 3-way pattern
  - Reason: metal players often value direct access to distinct pickup combinations more than elegant restraint
  - Proposed baseline:
    1. Bridge
    2. Bridge + Middle
    3. Middle
    4. Neck + Middle
    5. Neck

- **Master volume**
  - Main output control

- **Push-pull / push-push on volume: “Kill / bypass option”**
  - This slot could support either:
    - a blower / bypass concept, or
    - a kill-style function
  - This is the one model where a more overtly aggressive special function makes sense

- **Master tone**
  - Main treble rolloff

- **Push-pull / push-push on tone: “Coil mode / attack mode”**
  - Suggested use: a tighter or more focused alternate mode
  - Exact implementation should depend on bench testing; not all hot pickups reward splitting

### Control intent

Hammer should not be burdened with elegance. It should be direct, forceful, and immediately legible to the player it is built for.

---

## Recommendations on selector strategy

### Keep the 3-way for:
- Relay Lipstick
- Relay Current

### Use the 5-way for:
- Relay Velvet
- Relay Arc
- Relay Torch
- Relay Hammer

Reason:
Lipstick and Current treat the middle pickup as a curated auxiliary layer. Velvet, Arc, Torch, and Hammer all benefit from direct access to the middle pickup as a true core voice.

---

## Recommendation on push-pull vs push-push

### Use push-push when:
- you want fast access during actual playing
- the model’s special voice is something the player may engage often

### Use push-pull when:
- accidental activation would be annoying
- the special function is more of a setup / deliberate mode change

My current instinct:

- **Lipstick:** push-push on volume, push-pull on tone
- **Velvet:** push-push on volume, push-pull on tone
- **Arc:** push-push on volume, push-pull on tone
- **Torch:** push-push on volume, push-pull on tone
- **Current:** push-push on volume, push-pull on tone
- **Hammer:** model-specific; could justify push-push on both

---

## Open design questions

These are the questions worth answering before freezing the platform:

1. Should the **middle-add control** behave the same way across the whole line, for the sake of consistency?
2. Should the **tone push control** always be a contour / voice shift, or should some models use it for split behavior?
3. Should Relay Hammer be allowed to break platform consistency with a **5-way blade**, or should the line stay visually unified with the 3-way?
4. Should any model get a **dedicated no-load tone** or a similar premium passive feature, or is that unnecessary complexity?
5. Do you want the entire family to feel like variations on one professional control grammar, or do you want each model to teach its own behavior?

---

## Bottom-line proposal

If the goal is a coherent launchable family, this is the current best proposal:

- **Relay Lipstick** = expressive signature model, 3-way family
- **Relay Velvet** = warm club authority, 5-way family
- **Relay Arc** = chime and spatial clarity, 5-way family
- **Relay Torch** = rude, vocal, modern appeal, 5-way family
- **Relay Current** = punch and cutting immediacy, 3-way family
- **Relay Hammer** = heavy specialty model, 5-way family

The strongest next step would be to refine the exact push-control functions inside each control family rather than forcing the whole platform into one selector grammar.
