import paginationMetadataJson from './pagination-metadata.json';
import type { FeatureMetadataGroup } from './data-table-metadata';

interface PaginationMetadata {
  tableGroups: FeatureMetadataGroup[];
  slotPropGroups: FeatureMetadataGroup[];
}

const paginationMetadata = paginationMetadataJson as PaginationMetadata;

export const paginationTableGroups = paginationMetadata.tableGroups;
export const paginationSlotPropGroups = paginationMetadata.slotPropGroups;

export const getPaginationTableGroup = (groupId: string): FeatureMetadataGroup | undefined =>
  paginationMetadata.tableGroups.find((group) => group.id === groupId);

export const getPaginationSlotPropGroup = (groupId: string): FeatureMetadataGroup | undefined =>
  paginationMetadata.slotPropGroups.find((group) => group.id === groupId);
