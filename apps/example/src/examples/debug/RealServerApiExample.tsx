import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  DataTable,
  DataTableApi,
  ColumnDef,
  TableFilters,
  DEFAULT_SELECTION_COLUMN_NAME,
} from '@ackplus/react-tanstack-data-table';

const DUMMYJSON_BASE = 'https://dummyjson.com';
const FDA_BASE = 'https://api.fda.gov/drug/event.json';

type ApiSource = 'dummyjson' | 'fda';
/** Toggle to test API call path: onFetchData (table owns fetch) vs onFetchStateChange (parent owns fetch, like CrudDataGrid) */
type FetchMode = 'onFetchData' | 'onFetchStateChange';

// ----- DummyJSON (208 users) -----
interface DummyJsonUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: string;
  company?: { name: string; title: string; department: string };
  domain?: string;
}

export interface RealApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: string;
  companyName: string;
  companyTitle: string;
  domain: string;
}

function mapDummyJsonUser(user: DummyJsonUser): RealApiUser {
  return {
    id: String(user.id),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    age: user.age,
    gender: user.gender,
    companyName: user.company?.name ?? '',
    companyTitle: user.company?.title ?? '',
    domain: user.domain ?? '',
  };
}

// ----- openFDA (20M+ adverse events) -----
interface FdaEventResult {
  safetyreportid: string;
  receivedate?: string;
  serious?: string;
  primarysource?: { reportercountry?: string };
  patient?: { patientsex?: string; reaction?: Array<{ reactionmeddrapt?: string }> };
  drug?: Array<{ medicinalproduct?: string }>;
}

export interface FdaEventRow {
  id: string;
  receivedate: string;
  serious: string;
  country: string;
  patientSex: string;
  drug: string;
  reaction: string;
}

function mapFdaEventToRow(event: FdaEventResult): FdaEventRow {
  const drug = event.drug?.[0]?.medicinalproduct ?? '';
  const reaction = event.patient?.reaction?.[0]?.reactionmeddrapt ?? '';
  return {
    id: event.safetyreportid,
    receivedate: event.receivedate ?? '',
    serious: event.serious === '1' ? 'Yes' : 'No',
    country: event.primarysource?.reportercountry ?? '',
    patientSex: event.patient?.patientsex === '1' ? 'Male' : event.patient?.patientsex === '2' ? 'Female' : '',
    drug,
    reaction,
  };
}

interface FdaResponse {
  meta?: { results?: { total: number; skip: number; limit: number } };
  results?: FdaEventResult[];
}

// ----- Columns -----
const dummyJsonColumns: ColumnDef<RealApiUser>[] = [
  { accessorKey: 'id', header: 'ID', enableSorting: true, enableGlobalFilter: true },
  { accessorKey: 'firstName', header: 'First name', enableSorting: true, enableGlobalFilter: true },
  { accessorKey: 'lastName', header: 'Last name', enableSorting: true, enableGlobalFilter: true },
  { accessorKey: 'email', header: 'Email', enableSorting: true, enableGlobalFilter: true },
  { accessorKey: 'age', header: 'Age', enableSorting: true },
  { accessorKey: 'gender', header: 'Gender', enableSorting: true, enableGlobalFilter: true },
  { accessorKey: 'companyName', header: 'Company', enableSorting: true, enableGlobalFilter: true },
  { accessorKey: 'companyTitle', header: 'Title', enableSorting: true, enableGlobalFilter: true },
  { accessorKey: 'domain', header: 'Domain', enableSorting: true, enableGlobalFilter: true },
];

const fdaColumns: ColumnDef<FdaEventRow>[] = [
  { accessorKey: 'id', header: 'Report ID', enableSorting: false, enableGlobalFilter: true },
  { accessorKey: 'receivedate', header: 'Receive date', enableSorting: true, enableGlobalFilter: true },
  { accessorKey: 'serious', header: 'Serious', enableSorting: false },
  { accessorKey: 'country', header: 'Country', enableSorting: false, enableGlobalFilter: true },
  { accessorKey: 'patientSex', header: 'Sex', enableSorting: false },
  { accessorKey: 'drug', header: 'Drug', enableSorting: false, enableGlobalFilter: true },
  { accessorKey: 'reaction', header: 'Reaction', enableSorting: false, enableGlobalFilter: true },
];

type RowType = RealApiUser | FdaEventRow;

/**
 * Real server-side example: DummyJSON (208 users) or openFDA (20M+ events).
 * Use this page in isolation to debug server-side DataTable behavior.
 */
export function RealServerApiExample() {
  const [apiSource, setApiSource] = useState<ApiSource>('fda');
  const [fetchMode, setFetchMode] = useState<FetchMode>('onFetchData');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  const [requestedFilters, setRequestedFilters] = useState<Partial<TableFilters> | null>(null);
  const [rows, setRows] = useState<RowType[]>([]);
  const [total, setTotal] = useState(0);
  const apiRef = useRef<DataTableApi<RowType>>(null);

  const fetchDummyJson = useCallback(async (filters: Partial<TableFilters>) => {
    const pageIndex = filters.pagination?.pageIndex ?? 0;
    const pageSize = filters.pagination?.pageSize ?? 10;
    const skip = pageIndex * pageSize;
    const search = (filters.globalFilter ?? '').trim();
    const sort = filters.sorting?.[0];

    let url: string;
    if (search) {
      url = `${DUMMYJSON_BASE}/users/search?q=${encodeURIComponent(search)}&limit=${pageSize}&skip=${skip}`;
    } else {
      url = `${DUMMYJSON_BASE}/users?limit=${pageSize}&skip=${skip}`;
    }
    if (sort) {
      const order = sort.desc ? 'desc' : 'asc';
      const sortBy =
        sort.id === 'companyName' ? 'company.name' : sort.id === 'companyTitle' ? 'company.title' : sort.id;
      url += `&sortBy=${encodeURIComponent(sortBy)}&order=${order}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
    const json = await res.json();
    const data = (json.users ?? []).map(mapDummyJsonUser);
    const total = json.total ?? 0;
    return { data, total };
  }, []);

  const fetchFda = useCallback(async (filters: Partial<TableFilters>) => {
    const pageIndex = filters.pagination?.pageIndex ?? 0;
    const pageSize = Math.min(filters.pagination?.pageSize ?? 10, 1000);
    const skip = Math.min(pageIndex * pageSize, 25000);
    const search = (filters.globalFilter ?? '').trim();
    const sort = filters.sorting?.[0];

    const params = new URLSearchParams();
    params.set('limit', String(pageSize));
    params.set('skip', String(skip));

    if (search) {
      params.set('search', `patient.reaction.reactionmeddrapt:"${search.replace(/"/g, '')}"`);
    }
    if (sort?.id === 'receivedate') {
      params.set('sort', `receivedate:${sort.desc ? 'desc' : 'asc'}`);
    }

    const url = `${FDA_BASE}?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
    const json: FdaResponse = await res.json();
    const data = (json.results ?? []).map(mapFdaEventToRow);
    const total = json.meta?.results?.total ?? 0;
    return { data, total };
  }, []);

  const handleFetchData = useCallback(
    async (filters: Partial<TableFilters>) => {
      console.log('[DirectExample] onFetchData', {
        pageIndex: filters?.pagination?.pageIndex,
        pageSize: filters?.pagination?.pageSize,
      });
      setLoading(true);
      setError(null);
      setFetchCount((prev) => prev + 1);
      try {
        const result =
          apiSource === 'fda' ? await fetchFda(filters) : await fetchDummyJson(filters);
        setLoading(false);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Request failed';
        setError(message);
        setLoading(false);
        return { data: [], total: 0 };
      }
    },
    [apiSource, fetchFda, fetchDummyJson]
  );

  const handleFetchStateChange = useCallback((filters: Partial<TableFilters>) => {
    console.log('[DirectExample] onFetchStateChange', {
      pageIndex: filters?.pagination?.pageIndex,
      pageSize: filters?.pagination?.pageSize,
    });
    setRequestedFilters(filters);
  }, []);

  useEffect(() => {
    if (fetchMode !== 'onFetchStateChange' || requestedFilters === null) return;
    console.log('[DirectExample] fetch effect run', {
      pageIndex: requestedFilters?.pagination?.pageIndex,
      pageSize: requestedFilters?.pagination?.pageSize,
    });
    let cancelled = false;
    setLoading(true);
    setError(null);
    setFetchCount((prev) => prev + 1);
    const doFetch = async () => {
      try {
        const result =
          apiSource === 'fda'
            ? await fetchFda(requestedFilters as Partial<TableFilters>)
            : await fetchDummyJson(requestedFilters as Partial<TableFilters>);
        if (!cancelled) {
          console.log('[DirectExample] fetch effect result', { rows: result.data.length, total: result.total });
          setRows(result.data);
          setTotal(result.total);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Request failed');
          setRows([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    doFetch();
    return () => {
      cancelled = true;
    };
  }, [fetchMode, requestedFilters, apiSource, fetchFda, fetchDummyJson]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Data source</InputLabel>
          <Select
            value={apiSource}
            label="Data source"
            onChange={(e) => setApiSource(e.target.value as ApiSource)}
          >
            <MenuItem value="fda">openFDA – Drug events (~20M records)</MenuItem>
            <MenuItem value="dummyjson">DummyJSON – Users (208 records)</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel>API call</InputLabel>
          <Select
            value={fetchMode}
            label="API call"
            onChange={(e) => setFetchMode(e.target.value as FetchMode)}
          >
            <MenuItem value="onFetchData">onFetchData (default)</MenuItem>
            <MenuItem value="onFetchStateChange">onFetchStateChange (like Crud)</MenuItem>
          </Select>
        </FormControl>
        <Card variant="outlined" sx={{ minWidth: 120 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h6" color="primary">
              {fetchCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              API calls
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ minWidth: 100 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="h6" color={loading ? 'warning.main' : 'success.main'}>
              {loading ? 'Loading…' : 'Ready'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {apiSource === 'dummyjson' ? (
        <DataTable<RealApiUser>
          key={`dummyjson-${fetchMode}`}
          ref={apiRef as React.RefObject<DataTableApi<RealApiUser>>}
          columns={dummyJsonColumns}
          dataMode="server"
          {...(fetchMode === 'onFetchStateChange'
            ? {
                onFetchStateChange: handleFetchStateChange,
                data: rows as RealApiUser[],
                totalRow: total,
                initialLoadData: true,
              }
            : { onFetchData: handleFetchData })}
          enableRowSelection
          enableMultiRowSelection
          enableColumnVisibility
          enableGlobalFilter
          enableSorting
          enablePagination
          enableRefresh
          enableStickyHeaderOrFooter
          maxHeight={`calc(100svh - ${300}px)`}
          selectMode="page"
          skeletonRows={15}
          idKey="id"
          loading={loading}
          initialState={{
            columnPinning: { left: [DEFAULT_SELECTION_COLUMN_NAME] },
            pagination: { pageIndex: 0, pageSize: 10 },
          }}
          slotProps={{ pagination: { rowsPerPageOptions: [10, 25, 50, 200, 1000] } }}
        />
      ) : (
        <DataTable<FdaEventRow>
          key={`fda-${fetchMode}`}
          ref={apiRef as React.RefObject<DataTableApi<FdaEventRow>>}
          columns={fdaColumns}
          dataMode="server"
          {...(fetchMode === 'onFetchStateChange'
            ? {
                onFetchStateChange: handleFetchStateChange,
                data: rows as FdaEventRow[],
                totalRow: total,
                initialLoadData: true,
              }
            : { onFetchData: handleFetchData })}
          enableRowSelection
          enableMultiRowSelection
          enableColumnVisibility
          enableGlobalFilter
          skeletonRows={15}
          enableSorting
          enablePagination
          enableRefresh
          enableStickyHeaderOrFooter
          maxHeight={`calc(100svh - ${300}px)`}
          selectMode="page"
          idKey="id"
          loading={loading}
          initialState={{
            columnPinning: { left: [DEFAULT_SELECTION_COLUMN_NAME] },
            pagination: { pageIndex: 0, pageSize: 10 },
          }}
          slotProps={{ pagination: { rowsPerPageOptions: [10, 25, 50, 100, 500, 1000] } }}
        />
      )}
    </Box>
  );
}
