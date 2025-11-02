import virtualizationMetadataJson from './virtualization-metadata.json';
import type { FeatureMetadataGroup } from './data-table-metadata';

interface VirtualizationMetadata {
  tableGroups: FeatureMetadataGroup[];
  slotPropGroups: FeatureMetadataGroup[];
}

const virtualizationMetadata = virtualizationMetadataJson as VirtualizationMetadata;

export const virtualizationTableGroups = virtualizationMetadata.tableGroups;
export const virtualizationSlotPropGroups = virtualizationMetadata.slotPropGroups;

export const getVirtualizationTableGroup = (groupId: string): FeatureMetadataGroup | undefined =>
  virtualizationMetadata.tableGroups.find((group) => group.id === groupId);

export const getVirtualizationSlotPropGroup = (groupId: string): FeatureMetadataGroup | undefined =>
  virtualizationMetadata.slotPropGroups.find((group) => group.id === groupId);

