import type { Column, ColumnDef } from '@tanstack/react-table';

export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'actions';

export function getColumnType(column: Column<any, unknown>): ColumnType {
    if (column?.columnDef?.type) return column.columnDef.type as ColumnType;
    return 'text';
}

export function getCustomFilterComponent(column: Column<any, unknown>): any {
    return column?.columnDef?.filterComponent || column?.columnDef?.editComponent;
}

export function getColumnOptions(column: Column<any, unknown>): any[] {
    if (column?.columnDef?.options) return column.columnDef.options || [];
    if (getColumnType(column) === 'boolean') {
        return [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
        ];
    }
    return [];
}

/** Ensure every column (and nested group) has a stable `id`. */
export function withIdsDeep<T>(cols: ColumnDef<T, any>[]): ColumnDef<T, any>[] {
    return cols.map((c, i) => ({
        ...c,
        id: c.id ?? (c as any).accessorKey ?? `col_${i}`,
        ...(Array.isArray((c as any).columns) && { columns: withIdsDeep((c as any).columns) }),
    }));
}

export function isColumnFilterable(column: Column<any, unknown>): boolean {
    if (column?.columnDef?.filterable !== undefined) return column.columnDef.filterable;
    return true;
}
