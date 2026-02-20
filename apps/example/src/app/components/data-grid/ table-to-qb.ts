// table-to-qb.ts
import type { TableState } from "@ackplus/react-tanstack-data-table";
import { applyColumnFilterToQueryBuilder, type ColumnFilterRuleForQuery } from "./column-filter-to-query";

export async function buildQBFromTableState(opts: {
    columns: any[];
    filters?: Partial<TableState>;
    isTrash?: boolean;
    mapQuery?: (qb: any, filters?: Partial<TableState>) => Promise<any> | any;
}) {
    const { columns, filters, isTrash, mapQuery } = opts;

    let qb = {};

    // pagination
    if (filters?.pagination) {
        const pageIndex = filters.pagination.pageIndex ?? 0;
        const pageSize = filters.pagination.pageSize ?? 50;
        qb['skip'] = pageIndex * pageSize;
        qb['take'] = pageSize;
    }

    // sorting
    if (filters?.sorting?.length) {
        filters.sorting.forEach((sort) => {
            qb['order'] = { [sort.id]: sort.desc ? 'desc' : 'asc' };
        });
    }

    // global filter
    if (filters?.globalFilter) {
        const globalCols = (columns || []).filter((c: any) => c.enableGlobalFilter);
        const searchCols = globalCols.map((c: any) => c.id || c.accessorKey).filter(Boolean);

        qb['where'] = {
            $or: searchCols.map((col) => ({ [col]: { $iLike: `%${filters.globalFilter}%` } })),
        };

        // IMPORTANT: group OR conditions
        // If your QueryBuilder supports `qb.andWhere` with `$or`, use that.
        // Otherwise your current qb.orWhere approach is ok, but ensure it doesn't break other AND filters.
        // searchCols.forEach((col: string) => qb.orWhere(col, { $iLike: `%${filters.globalFilter}%` }));
    }

    // column filters
    if (filters?.columnFilter?.filters?.length) {
        const { filters: columnFilters, logic } = filters.columnFilter;
        applyColumnFilterToQueryBuilder(qb, {
            filters: columnFilters as ColumnFilterRuleForQuery[],
            logic: logic ?? "AND",
        });
    }

    // trash
    if (isTrash) qb['onlyDeleted'] = true;

    // custom mapping (extra where, joins, etc.)
    if (mapQuery) qb = await mapQuery(qb, filters);

    // CrudDataGrid expects qb.toObject(); ensure plain object has it so setQueryObj(qb.toObject()) works
    const result = typeof (qb as any)?.toObject === 'function' ? (qb as any) : Object.assign(qb, { toObject() { return this; } });
    return result as any;
}
