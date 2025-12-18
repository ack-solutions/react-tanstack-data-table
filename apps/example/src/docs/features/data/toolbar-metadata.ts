import toolbarMetadataJson from './toolbar-metadata.json';
import type { FeatureMetadataGroup } from './data-table-metadata';

interface ToolbarMetadata {
  tableGroups: FeatureMetadataGroup[];
  slotPropGroups: FeatureMetadataGroup[];
}

const toolbarMetadata = toolbarMetadataJson as ToolbarMetadata;

export const toolbarTableGroups = toolbarMetadata.tableGroups;
export const toolbarSlotPropGroups = toolbarMetadata.slotPropGroups;

export const getToolbarTableGroup = (groupId: string): FeatureMetadataGroup | undefined =>
  toolbarMetadata.tableGroups.find((group) => group.id === groupId);

export const getToolbarSlotPropGroup = (groupId: string): FeatureMetadataGroup | undefined =>
  toolbarMetadata.slotPropGroups.find((group) => group.id === groupId);

