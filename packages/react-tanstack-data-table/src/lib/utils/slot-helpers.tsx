/**
 * Enhanced Slot Helper Utilities
 *
 * Utilities to help with rendering slotted components with enhanced prop merging,
 * type safety, and full customization support.
 */
import { ComponentType, createElement } from 'react';
import { DataTableSlots } from '../types/slots.types';

/**
 * Enhanced slot component retrieval with better type safety
 */
export function getSlotComponent<T, K extends keyof DataTableSlots<T>>(
    slots: Partial<DataTableSlots<T>> | undefined,
    slotName: K,
    fallback: ComponentType<any>,
): ComponentType<any> {
    return (slots?.[slotName] as ComponentType<any>) || fallback;
}

/**
 * Merge slot props with default props and user overrides
 * Handles special cases for MUI sx prop, style prop, and className
 */
export function mergeSlotProps(
    defaultProps: Record<string, any> = {},
    slotProps: Record<string, any> = {},
    userProps: Record<string, any> = {}
): Record<string, any> {
    // Deep merge objects, giving priority to user props
    const merged = { ...defaultProps };
    
    // Merge slot props
    Object.keys(slotProps).forEach(key => {
        const slotValue = slotProps[key];
        const mergedValue = merged[key];
        
        if (key === 'sx' && typeof slotValue === 'object' && typeof mergedValue === 'object') {
            // Special handling for MUI sx prop
            merged[key] = { ...mergedValue, ...slotValue };
        } else if (key === 'style' && typeof slotValue === 'object' && typeof mergedValue === 'object') {
            // Special handling for style prop
            merged[key] = { ...mergedValue, ...slotValue };
        } else if (key === 'className' && typeof slotValue === 'string' && typeof mergedValue === 'string') {
            // Special handling for className prop
            merged[key] = `${mergedValue} ${slotValue}`.trim();
        } else {
            merged[key] = slotValue;
        }
    });
    
    // Merge user props (highest priority)
    Object.keys(userProps).forEach(key => {
        const userValue = userProps[key];
        const mergedValue = merged[key];
        
        if (key === 'sx' && typeof userValue === 'object' && typeof mergedValue === 'object') {
            // Special handling for MUI sx prop
            merged[key] = { ...mergedValue, ...userValue };
        } else if (key === 'style' && typeof userValue === 'object' && typeof mergedValue === 'object') {
            // Special handling for style prop
            merged[key] = { ...mergedValue, ...userValue };
        } else if (key === 'className' && typeof userValue === 'string' && typeof mergedValue === 'string') {
            // Special handling for className prop
            merged[key] = `${mergedValue} ${userValue}`.trim();
        } else {
            merged[key] = userValue;
        }
    });
    
    return merged;
}

/**
 * Enhanced slot component retrieval with automatic prop merging
 */
export function getSlotComponentWithProps<T, K extends keyof DataTableSlots<T>>(
    slots: Partial<DataTableSlots<T>> | undefined,
    slotProps: Record<string, any> = {},
    slotName: K,
    fallback: ComponentType<any>,
    defaultProps: Record<string, any> = {}
): {
    component: ComponentType<any>;
    props: Record<string, any>;
} {
    const component = getSlotComponent(slots, slotName, fallback);
    const props = mergeSlotProps(
        defaultProps,
        slotProps[slotName as string] || {},
        {}
    );
    
    return { component, props };
}

/**
 * Utility to check if a slot is overridden by user
 */
export function isSlotOverridden<T, K extends keyof DataTableSlots<T>>(
    slots: Partial<DataTableSlots<T>> | undefined,
    slotName: K
): boolean {
    return Boolean(slots?.[slotName]);
}

/**
 * Utility to get all overridden slots
 */
export function getOverriddenSlots<T>(
    slots: Partial<DataTableSlots<T>> | undefined
): Array<keyof DataTableSlots<T>> {
    if (!slots) return [];
    return Object.keys(slots).filter(key => Boolean(slots[key as keyof DataTableSlots<T>])) as Array<keyof DataTableSlots<T>>;
}

/**
 * Type-safe slot prop extractor
 */
export function extractSlotProps<T, K extends keyof DataTableSlots<T>>(
    slotProps: Record<string, any> | undefined,
    slotName: K
): Record<string, any> {
    return (slotProps?.[slotName as string] || {}) as Record<string, any>;
}

/**
 * Enhanced slot component with better prop handling
 */
export function createEnhancedSlotComponent<T, K extends keyof DataTableSlots<T>>(
    slots: Partial<DataTableSlots<T>> | undefined,
    slotName: K,
    fallback: ComponentType<any>,
    baseProps: Record<string, any> = {}
): ComponentType<any> {
    const SlotComponent = getSlotComponent(slots, slotName, fallback);
    
    return function EnhancedSlot(props: any) {
        const mergedProps = mergeSlotProps(baseProps, {}, props);
        return createElement(SlotComponent, mergedProps);
    };
}

/**
 * Utility to validate slot props at runtime (development only)
 */
export function validateSlotProps<T, K extends keyof DataTableSlots<T>>(
    slotName: K,
    props: any,
    requiredProps: string[] = []
): boolean {
    if (process.env.NODE_ENV === 'development') {
        const missingProps = requiredProps.filter(prop => !(prop in props));
        if (missingProps.length > 0) {
            console.warn(`Missing required props for slot "${String(slotName)}": ${missingProps.join(', ')}`);
            return false;
        }
    }
    return true;
}

/**
 * Helper to create slot props with proper typing
 */
export function createSlotProps(
    table: any,
    additionalProps: Record<string, any> = {}
): Record<string, any> {
    return {
        table,
        ...additionalProps,
    };
}

/**
 * Enhanced slot component wrapper that handles all prop merging automatically
 */
export function withSlotProps<T, K extends keyof DataTableSlots<T>>(
    slots: Partial<DataTableSlots<T>> | undefined,
    slotProps: Record<string, any> = {},
    slotName: K,
    fallback: ComponentType<any>
) {
    return function SlotWrapper(props: any) {
        const SlotComponent = getSlotComponent(slots, slotName, fallback);
        const mergedProps = mergeSlotProps(
            {},
            slotProps[slotName as string] || {},
            props
        );
        
        return createElement(SlotComponent, mergedProps);
    };
}
