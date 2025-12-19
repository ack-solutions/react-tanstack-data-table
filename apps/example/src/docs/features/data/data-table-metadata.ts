import metadataJson from './data-table-metadata.json';

export interface FeatureMetadataItem {
  name: string;
  type: string;
  defaultValue: string;
  description: string;
  possibleValues: string[];
}

export interface FeatureMetadataGroup {
  id: string;
  title: string;
  description: string;
  items: FeatureMetadataItem[];
}

export interface DataTableMetadata {
  propGroups: FeatureMetadataGroup[];
  slotGroups: FeatureMetadataGroup[];
  slotPropGroups: FeatureMetadataGroup[];
}

const metadata = metadataJson as DataTableMetadata;

export const dataTableMetadata = metadata;

export const findGroup = (
  section: keyof DataTableMetadata,
  groupId: string
): FeatureMetadataGroup | undefined => {
  return metadata[section].find((group) => group.id === groupId);
};

export const flattenGroups = (
  section: keyof DataTableMetadata
): FeatureMetadataItem[] => {
  return metadata[section].flatMap((group) => group.items);
};

export type MetadataSection = keyof DataTableMetadata;
