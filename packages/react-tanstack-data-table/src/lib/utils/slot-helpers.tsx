/**
 * Slot Helper Utilities
 *
 * Utilities to help with rendering slotted components
 */
import { ComponentType } from 'react';

import { DataTableSlots } from '../types/slots.types';


/**
 * Get slot component or fallback to default
 */
export function getSlotComponent<T, K extends keyof DataTableSlots<T>>(
    slots: Partial<DataTableSlots<T>> | undefined,
    slotName: K,
    fallback: ComponentType<any>,
): ComponentType<any> {
    return (slots?.[slotName] as ComponentType<any>) || fallback;
}

/**
 * Render a slot component with merged props
 */
export function renderSlot(
    slotComponent: ComponentType<any>,
    defaultProps: any,
    slotProps?: any,
) {
    const mergedProps = {
        ...defaultProps,
        ...slotProps,
    };

    const Component = slotComponent;
    return <Component {...mergedProps} />;
}

/**
 * Higher-order component factory for creating slottable components
 */
export function createSlottableComponent<T, K extends keyof DataTableSlots<T>>(
    slotName: K,
    defaultComponent: ComponentType<any>,
) {
    return function SlottableComponent(props: {
        slots?: Partial<DataTableSlots<T>>;
        slotProps?: any;
        componentProps: any;
    }) {
        const SlotComponent = getSlotComponent(
            props.slots,
            slotName,
            defaultComponent,
        );

        return renderSlot(
            SlotComponent,
            props.componentProps,
            props.slotProps?.[slotName],
        );
    };
}
