/**
 * Predefined options for guitar product configuration
 * These enums and constants make data entry easier and ensure consistency
 */

import {
    PickupType,
    PickupPosition,
    SwitchType,
    KnobType,
    Material,
} from '@/types/product';

/**
 * All available pickup types
 */
export const PICKUP_TYPES = Object.values(PickupType);

/**
 * All available pickup positions
 */
export const PICKUP_POSITIONS = Object.values(PickupPosition);

/**
 * All available switch types
 */
export const SWITCH_TYPES = Object.values(SwitchType);

/**
 * All available knob types
 */
export const KNOB_TYPES = Object.values(KnobType);

/**
 * All available materials (for both core and shell)
 */
export const MATERIALS = Object.values(Material);

/**
 * Human-readable labels for pickup types
 */
export const PICKUP_TYPE_LABELS: Record<PickupType, string> = {
    [PickupType.HUMBUCKER]: 'Humbucker',
    [PickupType.SINGLE_COIL]: 'Single-coil',
    [PickupType.P90]: 'P90',
    [PickupType.MINI_HUMBUCKER]: 'Mini-humbucker',
    [PickupType.LIPSTICK]: 'Lipstick',
    [PickupType.FILTERTRON]: 'Filtertron',
    [PickupType.JAZZMASTER]: 'Jazzmaster',
    [PickupType.TELECASTER]: 'Telecaster',
};

/**
 * Human-readable labels for pickup positions
 */
export const PICKUP_POSITION_LABELS: Record<PickupPosition, string> = {
    [PickupPosition.BRIDGE]: 'Bridge',
    [PickupPosition.NECK]: 'Neck',
    [PickupPosition.MIDDLE]: 'Middle',
    [PickupPosition.BRIDGE_MIDDLE]: 'Bridge + Middle',
    [PickupPosition.NECK_MIDDLE]: 'Neck + Middle',
};

/**
 * Human-readable labels for switch types
 */
export const SWITCH_TYPE_LABELS: Record<SwitchType, string> = {
    [SwitchType.THREE_WAY_TOGGLE]: '3-way Toggle',
    [SwitchType.FIVE_WAY_BLADE]: '5-way Blade',
    [SwitchType.THREE_WAY_BLADE]: '3-way Blade',
    [SwitchType.TOGGLE]: 'Toggle',
    [SwitchType.MINI_TOGGLE]: 'Mini-toggle',
    [SwitchType.ROTARY]: 'Rotary',
};

/**
 * Human-readable labels for knob types
 */
export const KNOB_TYPE_LABELS: Record<KnobType, string> = {
    [KnobType.VOLUME]: 'Volume',
    [KnobType.TONE]: 'Tone',
    [KnobType.PUSH_PULL_VOLUME]: 'Push-pull Volume',
    [KnobType.PUSH_PUSH_VOLUME]: 'Push-push Volume',
    [KnobType.PUSH_PULL_TONE]: 'Push-pull Tone',
    [KnobType.PUSH_PUSH_TONE]: 'Push-push Tone',
    [KnobType.COIL_SPLIT]: 'Coil-split',
    [KnobType.PHASE_REVERSE]: 'Phase Reverse',
    [KnobType.SERIES_PARALLEL]: 'Series/Parallel',
};

/**
 * Human-readable labels for materials
 */
export const MATERIAL_LABELS: Record<Material, string> = {
    [Material.NYLON_CF_PA12]: 'Nylon-CF (PA12-CF)',
    [Material.NYLON_CF_PA6]: 'Nylon-CF (PA6-CF)',
    [Material.PC_CF]: 'PC-CF',
    [Material.PC]: 'PC',
    [Material.PC_ABS]: 'PC-ABS',
    [Material.ABS]: 'ABS',
    [Material.ABS_CF]: 'ABS-CF',
    [Material.ABS_GF]: 'ABS-GF',
    [Material.ASA]: 'ASA',
    [Material.ASA_CF]: 'ASA-CF',
    [Material.ASA_GF]: 'ASA-GF',
    [Material.PLA]: 'PLA',
    [Material.PLA_CF]: 'PLA-CF',
    [Material.PLA_GF]: 'PLA-GF',
    [Material.PETG]: 'PETG',
    [Material.PETG_CF]: 'PETG-CF',
    [Material.NYLON]: 'Nylon',
    [Material.WOOD_FILLED_PLA]: 'Wood-filled PLA',
};

