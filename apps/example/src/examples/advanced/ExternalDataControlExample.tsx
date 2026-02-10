import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import {
  ColumnDef,
  DataRefreshContext,
  DataTable,
  DataTableApi,
  TableState,
} from '@ackplus/react-tanstack-data-table';
import { Employee, employees } from '../data';

const SOURCE_DATA: Employee[] = [...employees];

const DEFAULT_QUERY_STATE: Partial<TableState> = {
  pagination: { pageIndex: 0, pageSize: 10 },
  sorting: [],
  globalFilter: '',
  columnFilter: {
    filters: [],
    logic: 'AND',
    pendingFilters: [],
    pendingLogic: 'AND',
  },
};

function runClientQuery(state: Partial<TableState>) {
  let filtered = [...SOURCE_DATA];

  if (state.globalFilter) {
    const searchValue = String(state.globalFilter).toLowerCase();
    filtered = filtered.filter((row) => {
      return (
        row.name.toLowerCase().includes(searchValue)
        || row.email.toLowerCase().includes(searchValue)
        || row.department.toLowerCase().includes(searchValue)
      );
    });
  }

  if (state.sorting && state.sorting.length > 0) {
    const [{ id, desc }] = state.sorting;
    filtered.sort((a, b) => {
      const aValue = a[id as keyof Employee];
      const bValue = b[id as keyof Employee];
      if (aValue < bValue) return desc ? 1 : -1;
      if (aValue > bValue) return desc ? -1 : 1;
      return 0;
    });
  }

  const pageIndex = state.pagination?.pageIndex ?? 0;
  const pageSize = state.pagination?.pageSize ?? 10;
  const start = pageIndex * pageSize;
  const end = start + pageSize;

  return {
    rows: filtered.slice(start, end),
    total: filtered.length,
  };
}

export function ExternalDataControlExample() {
  const apiRef = useRef<DataTableApi<Employee>>(null);
  const queryStateRef = useRef<Partial<TableState>>(DEFAULT_QUERY_STATE);

  const [queryState, setQueryState] = useState<Partial<TableState>>(DEFAULT_QUERY_STATE);
  const [rows, setRows] = useState<Employee[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshReason, setRefreshReason] = useState('initial');

  const refreshRows = useCallback(async (
    state: Partial<TableState>,
    meta: { reason?: string; force?: boolean } = {}
  ) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, meta.force ? 400 : 200));
    const result = runClientQuery(state);
    setRows(result.rows);
    setTotalRows(result.total);
    setRefreshReason(`${meta.reason || 'state-change'}${meta.force ? ' (force)' : ''}`);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refreshRows(queryState, { reason: 'state-change' });
  }, [queryState, refreshRows]);

  const handleDataStateChange = useCallback((state: Partial<TableState>) => {
    queryStateRef.current = state;
    setQueryState(state);
  }, []);

  const handleRefreshData = useCallback(async (context: DataRefreshContext) => {
    await refreshRows(queryStateRef.current, {
      reason: context.options.reason,
      force: context.options.force,
    });
  }, [refreshRows]);

  const handleDataChange = useCallback((nextData: Employee[]) => {
    setRows(nextData);
  }, []);

  const columns = useMemo<ColumnDef<Employee>[]>(() => [
    { accessorKey: 'name', header: 'Name', enableSorting: true },
    { accessorKey: 'email', header: 'Email', enableSorting: true },
    { accessorKey: 'department', header: 'Department', enableSorting: true },
    {
      accessorKey: 'salary',
      header: 'Salary',
      enableSorting: true,
      cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue<Employee['status']>();
        return <Chip label={status} size="small" color={status === 'active' ? 'success' : 'default'} />;
      },
    },
  ], []);

  const updateFirstRow = useCallback(() => {
    const first = rows[0];
    if (!first) return;
    apiRef.current?.data.updateRow(String(first.id), {
      name: `${first.name} (Edited)`,
    });
  }, [rows]);

  const insertNewRow = useCallback(() => {
    apiRef.current?.data.insertRow({
      id: `new-${Date.now()}`,
      name: 'New External Row',
      email: 'new.external@example.com',
      department: 'Engineering',
      position: 'Developer',
      salary: 83000,
      status: 'active',
      joinDate: new Date().toISOString().slice(0, 10),
      location: 'Remote',
    }, 0);
  }, []);

  const deleteFirstRow = useCallback(() => {
    const first = rows[0];
    if (!first) return;
    apiRef.current?.data.deleteRow(String(first.id));
  }, [rows]);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
        External Data Control (No Query Library Inside DataTable)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Data fetch and row updates are managed outside the table through `onDataStateChange`,
        `onRefreshData`, and `onDataChange`.
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={updateFirstRow}>
          Update First Row
        </Button>
        <Button variant="outlined" onClick={insertNewRow}>
          Insert Row
        </Button>
        <Button variant="outlined" onClick={deleteFirstRow}>
          Delete First Row
        </Button>
        <Button variant="contained" onClick={() => apiRef.current?.data.refresh()}>
          Refresh
        </Button>
        <Button variant="contained" color="warning" onClick={() => apiRef.current?.data.refresh({ force: true, reason: 'manual-hard-refresh' })}>
          Hard Refresh
        </Button>
      </Stack>

      <Typography variant="caption" sx={{ display: 'block', mb: 1.5 }}>
        Last refresh reason: {refreshReason}
      </Typography>

      <DataTable
        ref={apiRef}
        columns={columns}
        dataMode="server"
        data={rows}
        totalRow={totalRows}
        loading={loading}
        idKey="id"
        enablePagination
        enableSorting
        enableGlobalFilter
        enableRefresh
        onDataStateChange={handleDataStateChange}
        onRefreshData={handleRefreshData}
        onDataChange={handleDataChange}
      />
    </Box>
  );
}
