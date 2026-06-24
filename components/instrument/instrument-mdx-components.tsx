import baseComponents from '@/components/mdx-components';
import { PrintControlLayout, PrintInstrumentSpec, PrintPickup, PrintPickupConfiguration, PrintPickupDetail, PrintPot, PrintPotPosition, PrintSelector, PrintSelectorPosition } from './instrument-print-spec';

export const instrumentMdxComponents = baseComponents;

export const instrumentPrintMdxComponents = {
    ...baseComponents,
    InstrumentSpec: PrintInstrumentSpec,
    PickupConfiguration: PrintPickupConfiguration,
    Pickup: PrintPickup,
    PickupDetail: PrintPickupDetail,
    ControlLayout: PrintControlLayout,
    Selector: PrintSelector,
    SelectorPosition: PrintSelectorPosition,
    Pot: PrintPot,
    PotPosition: PrintPotPosition,
};
