import filteringMetadataJson from './filtering-metadata.json';
import type { FeatureMetadataGroup } from './data-table-metadata';

interface FilteringMetadata {
  operatorGroups: FeatureMetadataGroup[];
}

const filteringMetadata = filteringMetadataJson as FilteringMetadata;

export const filteringOperatorMetadata = filteringMetadata;

export const getOperatorGroup = (groupId: string): FeatureMetadataGroup | undefined =>
  filteringMetadata.operatorGroups.find((group) => group.id === groupId);
