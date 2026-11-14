/**
 * Guitar specification vocabulary (pickups, switches, controls, materials).
 *
 * Shop listings no longer live here: Shopify owns them, and lib/shop/ reads
 * them. See docs/decisions/2026-11-13-shopify-driven-shop.md.
 */

export enum PickupType {
    HUMBUCKER = 'humbucker',
    SINGLE_COIL = 'single-coil',
    P90 = 'p90',
    MINI_HUMBUCKER = 'mini-humbucker',
    LIPSTICK = 'lipstick',
    FILTERTRON = 'filtertron',
    JAZZMASTER = 'jazzmaster',
    TELECASTER = 'telecaster',
}

export enum PickupPosition {
    BRIDGE = 'bridge',
    NECK = 'neck',
    MIDDLE = 'middle',
    BRIDGE_MIDDLE = 'bridge-middle',
    NECK_MIDDLE = 'neck-middle',
}

export enum SwitchType {
    THREE_WAY_TOGGLE = '3-way-toggle',
    FIVE_WAY_BLADE = '5-way-blade',
    THREE_WAY_BLADE = '3-way-blade',
    TOGGLE = 'toggle',
    MINI_TOGGLE = 'mini-toggle',
    ROTARY = 'rotary',
}

export enum KnobType {
    VOLUME = 'volume',
    TONE = 'tone',
    PUSH_PULL_VOLUME = 'push-pull-volume',
    PUSH_PUSH_VOLUME = 'push-push-volume',
    PUSH_PULL_TONE = 'push-pull-tone',
    PUSH_PUSH_TONE = 'push-push-tone',
    COIL_SPLIT = 'coil-split',
    PHASE_REVERSE = 'phase-reverse',
    SERIES_PARALLEL = 'series-parallel',
}

export enum Material {
    NYLON_CF_PA12 = 'nylon-cf-pa12',
    NYLON_CF_PA6 = 'nylon-cf-pa6',
    PC_CF = 'pc-cf',
    PC = 'pc',
    PC_ABS = 'pc-abs',
    ABS = 'abs',
    ABS_CF = 'abs-cf',
    ABS_GF = 'abs-gf',
    ASA = 'asa',
    ASA_CF = 'asa-cf',
    ASA_GF = 'asa-gf',
    PLA = 'pla',
    PLA_CF = 'pla-cf',
    PLA_GF = 'pla-gf',
    PETG = 'petg',
    PETG_CF = 'petg-cf',
    NYLON = 'nylon',
    WOOD_FILLED_PLA = 'wood-filled-pla',
}

export interface SwitchPosition {
    position: string; // e.g., "1", "2", "3" or "Up", "Down", "Middle"
    description: string; // What that position does
}

export interface Pickup {
    type: PickupType;
    position: PickupPosition;
    resistance?: number; // Ohms
    brand?: string;
}

export interface Control {
    type: KnobType | SwitchType;
    usage: string; // Description of what it does
    switchPositions?: SwitchPosition[]; // For switches
    isPushPull?: boolean; // For push-pull knobs
    isPushPush?: boolean; // For push-push knobs
}
