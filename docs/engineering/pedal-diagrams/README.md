# Pedal diagram generators (shared)

Shared drawing and netlist-checking code for the small silicon pedal builds: [Bazz Fuss](../bazz-fuss/README.md), [Bosstone](../bosstone/README.md) and [Electra](../electra/README.md). The style follows `docs/engineering/fuzz-face`.

- `pedaldraw.py`: stripboard and breadboard renderers. Each layout is built from part, hole, cut, link and wire lists, its connectivity is checked against the circuit's netlist, and only then is the SVG and PNG written. A mismatch stops the script.
- `spice/`: ngspice operating-point and clipping checks for the three circuits (`ngspice -b bosstone.cir`). `models.lib` has standard 2N3904, 2N2222, 2N3906 and 1N4148 models plus a generic red LED (`LEDR`, about 1.6 V at 1 mA). These are simulations, not bench measurements.

Regenerate everything:

```sh
pip install schemdraw matplotlib cairosvg
for c in bazz-fuss bosstone electra; do python3 docs/engineering/$c/generate.py; done
```
