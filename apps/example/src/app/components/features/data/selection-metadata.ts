import selectionMetadataJson from './selection-metadata.json';
import type { FeatureMetadataGroup } from './data-table-metadata';

interface SelectionMetadata {
  tableGroups: FeatureMetadataGroup[];
  slotPropGroups: FeatureMetadataGroup[];
}

const selectionMetadata = selectionMetadataJson as SelectionMetadata;

export const selectionTableGroups = selectionMetadata.tableGroups;
export const selectionSlotPropGroups = selectionMetadata.slotPropGroups;

export const getSelectionTableGroup = (groupId: string): FeatureMetadataGroup | undefined =>
  selectionMetadata.tableGroups.find((group) => group.id === groupId);

export const getSelectionSlotPropGroup = (groupId: string): FeatureMetadataGroup | undefined =>
  selectionMetadata.slotPropGroups.find((group) => group.id === groupId);

