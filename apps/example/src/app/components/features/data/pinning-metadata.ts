import pinningMetadataJson from './pinning-metadata.json';
import type { FeatureMetadataGroup } from './data-table-metadata';

interface PinningMetadata {
  tableGroups: FeatureMetadataGroup[];
  slotPropGroups: FeatureMetadataGroup[];
}

const pinningMetadata = pinningMetadataJson as PinningMetadata;

export const pinningTableGroups = pinningMetadata.tableGroups;
export const pinningSlotPropGroups = pinningMetadata.slotPropGroups;

export const getPinningTableGroup = (groupId: string): FeatureMetadataGroup | undefined =>
  pinningMetadata.tableGroups.find((group) => group.id === groupId);

export const getPinningSlotPropGroup = (groupId: string): FeatureMetadataGroup | undefined =>
  pinningMetadata.slotPropGroups.find((group) => group.id === groupId);

