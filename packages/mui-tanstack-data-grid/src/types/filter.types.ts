export type ColumnFilterLogic = 'AND' | 'OR';

export interface ColumnFilterRule {
    id: string;
    columnId: string;
    operator: string;
    value: any;
    columnType?: string;
}

export interface ColumnFilterState {
    filters: ColumnFilterRule[];
    logic: ColumnFilterLogic;
    pendingFilters: ColumnFilterRule[];
    pendingLogic: ColumnFilterLogic;
}
