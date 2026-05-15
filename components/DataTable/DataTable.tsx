'use client';

import * as React from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type Props<TData> = {
  title: string;
  data: TData[];
  columns: ColumnDef<TData, any>[];
  loading?: boolean;
  pageIndex?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (pageIndex: number) => void;
};

export function DataTable<TData extends { id: string }>({
  title,
  data,
  columns,
  loading = false,
  pageIndex,
  pageSize = 10,
  totalItems,
  onPageChange,
}: Props<TData>) {
  const isManualPagination =
    typeof totalItems === 'number' && typeof onPageChange === 'function';

  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const resolvedPageIndex = isManualPagination
    ? pageIndex ?? 0
    : table.getState().pagination.pageIndex;
  const resolvedPageSize = isManualPagination
    ? pageSize
    : table.getState().pagination.pageSize;
  const resolvedPageCount = isManualPagination
    ? Math.max(1, Math.ceil((totalItems ?? 0) / pageSize))
    : table.getPageCount();
  const resolvedTotalItems = isManualPagination ? totalItems ?? 0 : data.length;
  const canPreviousPage = isManualPagination
    ? resolvedPageIndex > 0
    : table.getCanPreviousPage();
  const canNextPage = isManualPagination
    ? resolvedPageIndex + 1 < resolvedPageCount
    : table.getCanNextPage();

  const handlePreviousPage = () => {
    if (isManualPagination) {
      onPageChange?.(Math.max(0, resolvedPageIndex - 1));
      return;
    }

    table.previousPage();
  };

  const handleNextPage = () => {
    if (isManualPagination) {
      onPageChange?.(Math.min(resolvedPageCount - 1, resolvedPageIndex + 1));
      return;
    }

    table.nextPage();
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">{title}</h1>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <th className="px-4 py-2 text-left w-[70px]">No</th>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2 text-left">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, idx) => (
                <tr key={idx} className="border-t animate-pulse">
                  {[...Array(columns.length + 1)].map((_, i) => (
                    <td key={i} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-6 text-gray-500"
                >
                  Tidak ada data tersedia.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, rowIndex) => (
                <tr key={row.id} className="border-t hover:bg-accent/20">
                  <td className="px-4 py-2 align-top text-muted-foreground">
                    {resolvedPageIndex * resolvedPageSize + rowIndex + 1}
                  </td>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && data.length > 0 && (
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={!canPreviousPage}
          >
            <ArrowLeft /> Sebelumnya
          </Button>
          <span className="text-sm">
            Halaman {resolvedPageIndex + 1} dari {resolvedPageCount} • Total {resolvedTotalItems} data
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={!canNextPage}
          >
            Selanjutnya <ArrowRight />
          </Button>
        </div>
      )}
    </Card>
  );
}
