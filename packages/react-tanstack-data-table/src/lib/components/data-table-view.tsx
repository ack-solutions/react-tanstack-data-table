/**
 * DataTableView – presentational layer for DataTable.
 * Renders based on engine result; no fetch, export, or API logic.
 */
import { Table, TableContainer, TableBody, Box, Paper } from '@mui/material';
import React, { useCallback } from 'react';

import { getSlotComponentWithProps, mergeSlotProps } from '../utils/slot-helpers';
import { TableHeader } from './headers';
import { DataTablePagination } from './pagination';
import { DataTableRow, LoadingRows, EmptyDataRow } from './rows';
import { DataTableToolbar, BulkActionsToolbar } from './toolbar';
import type { DataTableProps } from '../types/data-table.types';
import type { EngineResult } from '../hooks/use-data-table-engine';

export interface DataTableViewProps<T = any> extends DataTableProps<T> {
    engine: EngineResult<T>;
}

export function DataTableView<T extends Record<string, any>>({
    engine,
    extraFilter = null,
    footerFilter = null,
    enableGlobalFilter = true,
    enableColumnVisibility = true,
    enableColumnFilter = false,
    enableExport = false,
    enableReset = true,
    enableTableSizeControl = true,
    enableColumnPinning = false,
    enableRefresh = false,
    enableBulkActions = false,
    bulkActions,
    enableRowSelection = false,
    enableColumnDragging = false,
    enableColumnResizing = false,
    enableStickyHeaderOrFooter = false,
    maxHeight = '400px',
    enableVirtualization = false,
    enablePagination = false,
    tableProps = {},
    enableHover = true,
    enableStripes = false,
    emptyMessage = 'No data available',
    skeletonRows = 5,
    onRowClick,
    selectOnRowClick = false,
    renderSubComponent,
    slots = {},
    slotProps = {},
}: DataTableViewProps<T>) {
    const {
        table,
        refs,
        derived,
        state,
        actions,
    } = engine;

    const {
        tableContainerRef,
        apiRef,
    } = refs;

    const {
        tableLoading,
        rows,
        visibleLeafColumns,
        useFixedLayout,
        tableStyle,
        isSomeRowsSelected,
        selectedRowCount,
        tableTotalRow,
    } = derived;

    const {
        pagination,
        selectionState,
        tableSize,
    } = state;

    const {
        handleColumnReorder,
        renderRowModel,
    } = actions;

    const rowVirtualizer = renderRowModel.rowVirtualizer;

    const renderTableRows = useCallback(() => {
        if (tableLoading) {
            const { component: LoadingRowComponent, props: loadingRowProps } = getSlotComponentWithProps(
                slots,
                slotProps || {},
                'loadingRow',
                LoadingRows,
                {}
            );
            return (
                <LoadingRowComponent
                    rowCount={enablePagination ? Math.min(pagination.pageSize, skeletonRows) : skeletonRows}
                    colSpan={table.getAllColumns().length}
                    slots={slots}
                    slotProps={slotProps}
                    {...loadingRowProps}
                />
            );
        }
        if (rows.length === 0) {
            const { component: EmptyRowComponent, props: emptyRowProps } = getSlotComponentWithProps(
                slots,
                slotProps || {},
                'emptyRow',
                EmptyDataRow,
                {}
            );
            return (
                <EmptyRowComponent
                    colSpan={table.getAllColumns().length}
                    message={emptyMessage}
                    slots={slots}
                    slotProps={slotProps}
                    {...emptyRowProps}
                />
            );
        }
        if (enableVirtualization && !enablePagination && rows.length > 0) {
            const virtualItems = rowVirtualizer.getVirtualItems();
            return (
                <>
                    {virtualItems.length > 0 && (
                        <tr>
                            <td
                                colSpan={table.getAllColumns().length}
                                style={{
                                    height: `${virtualItems[0]?.start ?? 0}px`,
                                    padding: 0,
                                    border: 0,
                                }}
                            />
                        </tr>
                    )}
                    {virtualItems.map((virtualRow) => {
                        const row = rows[virtualRow.index];
                        if (!row) return null;
                        return (
                            <DataTableRow
                                key={row.id}
                                row={row}
                                enableHover={enableHover}
                                enableStripes={enableStripes}
                                isOdd={virtualRow.index % 2 === 1}
                                renderSubComponent={renderSubComponent}
                                disableStickyHeader={enableStickyHeaderOrFooter}
                                onRowClick={onRowClick}
                                selectOnRowClick={selectOnRowClick}
                                slots={slots}
                                slotProps={slotProps}
                            />
                        );
                    })}
                    {virtualItems.length > 0 && (
                        <tr>
                            <td
                                colSpan={table.getAllColumns().length}
                                style={{
                                    height: `${rowVirtualizer.getTotalSize() -
                                        (virtualItems[virtualItems.length - 1]?.end ?? 0)}px`,
                                    padding: 0,
                                    border: 0,
                                }}
                            />
                        </tr>
                    )}
                </>
            );
        }
        return rows.map((row, index) => (
            <DataTableRow
                key={row.id}
                row={row}
                enableHover={enableHover}
                enableStripes={enableStripes}
                isOdd={index % 2 === 1}
                renderSubComponent={renderSubComponent}
                disableStickyHeader={enableStickyHeaderOrFooter}
                onRowClick={onRowClick}
                selectOnRowClick={selectOnRowClick}
                slots={slots}
                slotProps={slotProps}
            />
        ));
    }, [
        tableLoading,
        rows,
        enableVirtualization,
        enablePagination,
        pagination.pageSize,
        skeletonRows,
        table,
        slotProps,
        emptyMessage,
        rowVirtualizer,
        enableHover,
        enableStripes,
        renderSubComponent,
        enableStickyHeaderOrFooter,
        onRowClick,
        selectOnRowClick,
        slots,
    ]);

    const { component: RootComponent, props: rootSlotProps } = getSlotComponentWithProps(
        slots,
        slotProps || {},
        'root',
        Box,
        {}
    );
    const { component: ToolbarComponent, props: toolbarSlotProps } = getSlotComponentWithProps(
        slots,
        slotProps || {},
        'toolbar',
        DataTableToolbar,
        {}
    );
    const { component: BulkActionsComponent, props: bulkActionsSlotProps } = getSlotComponentWithProps(
        slots,
        slotProps || {},
        'bulkActionsToolbar',
        BulkActionsToolbar,
        {}
    );
    const { component: TableContainerComponent, props: tableContainerSlotProps } = getSlotComponentWithProps(
        slots,
        slotProps || {},
        'tableContainer',
        TableContainer,
        {}
    );
    const { component: TableComponent, props: tableComponentSlotProps } = getSlotComponentWithProps(
        slots,
        slotProps || {},
        'table',
        Table,
        {}
    );
    const { component: BodyComponent, props: bodySlotProps } = getSlotComponentWithProps(
        slots,
        slotProps || {},
        'body',
        TableBody,
        {}
    );
    const { component: FooterComponent, props: footerSlotProps } = getSlotComponentWithProps(
        slots,
        slotProps || {},
        'footer',
        Box,
        {}
    );
    const { component: PaginationComponent, props: paginationSlotProps } = getSlotComponentWithProps(
        slots,
        slotProps || {},
        'pagination',
        DataTablePagination,
        {}
    );

    return (
        <RootComponent {...rootSlotProps}>
            {(enableGlobalFilter || extraFilter) ? (
                <ToolbarComponent
                    extraFilter={extraFilter}
                    enableGlobalFilter={enableGlobalFilter}
                    enableColumnVisibility={enableColumnVisibility}
                    enableColumnFilter={enableColumnFilter}
                    enableExport={enableExport}
                    enableReset={enableReset}
                    enableTableSizeControl={enableTableSizeControl}
                    enableColumnPinning={enableColumnPinning}
                    enableRefresh={enableRefresh}
                    {...toolbarSlotProps}
                    refreshButtonProps={{
                        loading: tableLoading,
                        showSpinnerWhileLoading: false,
                        onRefresh: () => apiRef.current?.data?.refresh?.(true),
                        ...toolbarSlotProps.refreshButtonProps,
                    }}
                />
            ) : null}

            {enableBulkActions && enableRowSelection && isSomeRowsSelected ? (
                <BulkActionsComponent
                    selectionState={selectionState}
                    selectedRowCount={selectedRowCount}
                    bulkActions={bulkActions}
                    sx={{
                        position: 'relative',
                        zIndex: 2,
                        ...bulkActionsSlotProps.sx,
                    }}
                    {...bulkActionsSlotProps}
                />
            ) : null}

            <TableContainerComponent
                component={Paper}
                ref={tableContainerRef}
                sx={{
                    width: '100%',
                    overflowX: 'auto',
                    ...(enableStickyHeaderOrFooter && {
                        maxHeight,
                        overflowY: 'auto',
                    }),
                    ...(enableVirtualization && {
                        maxHeight,
                        overflowY: 'auto',
                    }),
                    ...tableContainerSlotProps?.sx,
                }}
                {...tableContainerSlotProps}
            >
                <TableComponent
                    size={tableSize}
                    stickyHeader={enableStickyHeaderOrFooter}
                    style={{
                        ...tableStyle,
                        ...tableProps?.style,
                    }}
                    {...mergeSlotProps(tableProps || {}, tableComponentSlotProps)}
                >
                    {useFixedLayout ? (
                        <colgroup>
                            {visibleLeafColumns().map((column) => (
                                <col
                                    key={column.id}
                                    style={{
                                        width: column.getSize(),
                                        minWidth: column.columnDef.minSize,
                                        maxWidth: column.columnDef.maxSize,
                                    }}
                                />
                            ))}
                        </colgroup>
                    ) : null}
                    <TableHeader
                        draggable={enableColumnDragging}
                        enableColumnResizing={enableColumnResizing}
                        enableStickyHeader={enableStickyHeaderOrFooter}
                        onColumnReorder={handleColumnReorder}
                        slots={slots}
                        slotProps={slotProps}
                    />
                    <BodyComponent {...bodySlotProps}>
                        {renderTableRows()}
                    </BodyComponent>
                </TableComponent>
            </TableContainerComponent>

            {enablePagination ? (
                <FooterComponent
                    sx={{
                        ...(enableStickyHeaderOrFooter && {
                            position: 'sticky',
                            bottom: 0,
                            backgroundColor: 'background.paper',
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            zIndex: 1,
                        }),
                        ...footerSlotProps.sx,
                    }}
                    {...footerSlotProps}
                >
                    <PaginationComponent
                        footerFilter={footerFilter}
                        pagination={pagination}
                        totalRow={tableTotalRow}
                        {...paginationSlotProps}
                    />
                </FooterComponent>
            ) : null}
        </RootComponent>
    );
}
