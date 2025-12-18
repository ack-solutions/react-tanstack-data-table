import sortingMetadataJson from './sorting-metadata.json';
import type { FeatureMetadataGroup } from './data-table-metadata';

interface SortingMetadata {
  columnGroups: FeatureMetadataGroup[];
  tableGroups: FeatureMetadataGroup[];
}

const sortingMetadata = sortingMetadataJson as SortingMetadata;

export const sortingColumnMetadata = sortingMetadata.columnGroups;
export const sortingTableMetadata = sortingMetadata.tableGroups;

export const getSortingColumnGroup = (groupId: string): FeatureMetadataGroup | undefined =>
  sortingMetadata.columnGroups.find((group) => group.id === groupId);

export const getSortingTableGroup = (groupId: string): FeatureMetadataGroup | undefined =>
  sortingMetadata.tableGroups.find((group) => group.id === groupId);
