import React, { useState, useCallback, useRef } from 'react';
import { DataTable, ColumnDef, DataTableApi, TableFilters } from '@ackplus/react-tanstack-data-table';
import { employees, Employee } from '../data';

/**
 * Server-Side Data Example
 * 
 * Advanced example demonstrating:
 * - Server-side data fetching
 * - Debounced search
 * - Loading states
 * - Custom filtering
 */
export function ServerSideExample() {
  const apiRef = useRef<DataTableApi<Employee>>(null);
  const [loading, setLoading] = useState(false);

  // Simulate server-side data fetching
  const handleFetchData = useCallback(async (filters: Partial<TableFilters>) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredData = [...employees];

    // Apply global filter (search)
    if (filters.globalFilter) {
      const searchTerm = filters.globalFilter.toLowerCase();
      filteredData = filteredData.filter(
        emp => 
          emp.name.toLowerCase().includes(searchTerm) ||
          emp.email.toLowerCase().includes(searchTerm) ||
          emp.department.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    if (filters.sorting && filters.sorting.length > 0) {
      const sort = filters.sorting[0];
      filteredData.sort((a, b) => {
        const aVal = a[sort.id as keyof Employee];
        const bVal = b[sort.id as keyof Employee];
        if (aVal < bVal) return sort.desc ? 1 : -1;
        if (aVal > bVal) return sort.desc ? -1 : 1;
        return 0;
      });
    }

    // Apply pagination
    const pageIndex = filters.pagination?.pageIndex || 0;
    const pageSize = filters.pagination?.pageSize || 10;
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    const paginatedData = filteredData.slice(start, end);

    setLoading(false);

    return {
      data: paginatedData,
      total: filteredData.length,
    };
  }, []);

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: true,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      enableSorting: true,
    },
    {
      accessorKey: 'position',
      header: 'Position',
      enableSorting: true,
    },
    {
      accessorKey: 'salary',
      header: 'Salary',
      enableSorting: true,
      cell: ({ getValue }) => {
        const value = getValue<number>();
        return `$${value.toLocaleString()}`;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
    },
  ];

  return (
    <DataTable
      ref={apiRef}
      columns={columns}
      dataMode="server"
      onFetchData={handleFetchData}
      enableSorting
      enableGlobalFilter
      enablePagination
      loading={loading}
      idKey="id"
    />
  );
}

