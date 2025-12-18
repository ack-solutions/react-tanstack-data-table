import columnsMetadataJson from './columns-metadata.json';
import type { FeatureMetadataGroup } from './data-table-metadata';

interface ColumnMetadata {
  columnGroups: FeatureMetadataGroup[];
}

const columnsMetadata = columnsMetadataJson as ColumnMetadata;

export const columnMetadata = columnsMetadata;

export const getColumnGroup = (groupId: string): FeatureMetadataGroup | undefined =>
  columnsMetadata.columnGroups.find((group) => group.id === groupId);

export type ColumnMetadataKey = 'columnGroups';
