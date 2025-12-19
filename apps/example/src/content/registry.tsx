import { ComponentType } from 'react';
import { OverviewSection as Overview } from '../docs/Overview';
import { QuickStartSection as Quickstart } from '../docs/QuickStart';
import { Features as FeaturesOverview } from '../docs/Features';
import { ExamplesSection as Demos } from '../docs/Examples';
import { ApiSection } from '../docs/Api';
import { PropsSection } from '../docs/Props';
import { ColumnsPage } from '../docs/features/ColumnsPage';
import { FilteringPage } from '../docs/features/FilteringPage';
import { SortingPage } from '../docs/features/SortingPage';
import { PaginationPage } from '../docs/features/PaginationPage';
import { SelectionPage } from '../docs/features/SelectionPage';
import { VirtualizationPage } from '../docs/features/VirtualizationPage';
import { ExportPage } from '../docs/features/ExportPage';
import { ToolbarPage } from '../docs/features/ToolbarPage';
import { DataTablePropsPage } from '../docs/features/DataTablePropsPage';
import { PinningPage } from '../docs/features/PinningPage';
import { ExpansionPage } from '../docs/features/ExpansionPage';
import { LayoutPage } from '../docs/features/LayoutPage';
import { AccessibilityPage } from '../docs/features/AccessibilityPage';
import { LocalizationPage } from '../docs/features/LocalizationPage';

export const contentRegistry: Record<string, ComponentType> = {
  overview: Overview,
  quickstart: Quickstart,
  features: FeaturesOverview,
  demos: Demos,
  columns: ColumnsPage,
  pinning: PinningPage,
  expansion: ExpansionPage,
  filtering: FilteringPage,
  sorting: SortingPage,
  pagination: PaginationPage,
  selection: SelectionPage,
  virtualization: VirtualizationPage,
  export: ExportPage,
  toolbar: ToolbarPage,
  'datatable-props': DataTablePropsPage,
  api: ApiSection,
  props: PropsSection,
  layout: LayoutPage,
  accessibility: AccessibilityPage,
  localization: LocalizationPage
};
