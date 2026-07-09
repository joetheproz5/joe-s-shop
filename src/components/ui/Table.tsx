import React, { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react'
import { clsx } from '@/lib/utils'
import { Skeleton } from './Skeleton'

/**
 * Props for the DataTable component.
 *
 * @example
 * ```tsx
 * const columns: ColumnDef<User>[] = [...]
 * <DataTable columns={columns} data={users} />
 * ```
 */
export interface DataTableProps<TData, TValue = unknown> {
  /** Column definitions for @tanstack/react-table */
  columns: ColumnDef<TData, TValue>[]
  /** Data array to render in the table */
  data: TData[]
  /** Whether the table is in a loading state */
  isLoading?: boolean
  /** Number of skeleton rows to show when loading */
  skeletonRowCount?: number
  /** Text to display when the table has no data */
  emptyMessage?: string
  /** Content for the bulk actions slot (shown above the table when rows are selected) */
  bulkActions?: React.ReactNode
  /** Content to render above the table (title, filters, etc.) */
  topContent?: React.ReactNode
  /** Content to render below the table (pagination, info, etc.) */
  bottomContent?: React.ReactNode
  /** Whether to enable row selection */
  enableRowSelection?: boolean
  /** Callback when row selection changes */
  onSelectionChange?: (selectedRows: TData[]) => void
  /** Additional class names for the table wrapper */
  className?: string
}

/**
 * A data table component built on @tanstack/react-table with sorting,
 * pagination, row selection, bulk actions, empty/loading states, and
 * responsive horizontal scroll.
 */
export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  isLoading = false,
  skeletonRowCount = 5,
  emptyMessage = 'No data found.',
  bulkActions,
  topContent,
  bottomContent,
  enableRowSelection = false,
  onSelectionChange,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const columnsWithSelection = useMemo(() => {
    if (!enableRowSelection) return columns
    return [
      {
        id: 'select',
        header: ({ table }: { table: ReturnType<typeof useReactTable<TData>> }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            aria-label="Select all rows"
            className="rounded border-surface-300 text-primary-600 focus:ring-primary-500 dark:border-surface-600 dark:bg-surface-800"
          />
        ),
        cell: ({ row }: { row: { getIsSelected: () => boolean; getToggleSelectedHandler: () => () => void } }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label="Select row"
            className="rounded border-surface-300 text-primary-600 focus:ring-primary-500 dark:border-surface-600 dark:bg-surface-800"
          />
        ),
        size: 40,
      } as unknown as ColumnDef<TData, TValue>,
      ...columns,
    ]
  }, [columns, enableRowSelection])

  const table = useReactTable({
    data,
    columns: columnsWithSelection,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
    },
    enableRowSelection,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
      setRowSelection(newSelection)
      if (onSelectionChange) {
        const selectedRows = table
          .getFilteredSelectedRowModel()
          .rows.map((r) => r.original)
        onSelectionChange(selectedRows as TData[])
      }
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const selectedCount = Object.keys(rowSelection).filter(Boolean).length

  return (
    <div className={clsx('w-full', className)}>
      {/* Top content / Bulk actions */}
      {selectedCount > 0 && bulkActions && (
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-primary-50 dark:bg-primary-950 px-4 py-3 text-sm text-primary-800 dark:text-primary-200">
          <span className="font-medium">{selectedCount} selected</span>
          <div className="flex items-center gap-2 ml-auto">{bulkActions}</div>
        </div>
      )}

      {topContent && <div className="mb-3">{topContent}</div>}

      {/* Table container */}
      <div className="overflow-x-auto rounded-xl border border-surface-200 dark:border-surface-700">
        <table className="w-full min-w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={clsx(
                      'px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-400',
                      header.column.getCanSort() && 'cursor-pointer select-none hover:text-surface-900 dark:hover:text-surface-200'
                    )}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    onClick={header.column.getToggleSortingHandler()}
                    aria-sort={
                      header.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : header.column.getIsSorted() === 'desc'
                          ? 'descending'
                          : undefined
                    }
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-surface-400 dark:text-surface-500">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp size={14} />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronsUpDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="bg-white dark:bg-surface-900 divide-y divide-surface-100 dark:divide-surface-800">
            {isLoading ? (
              // Skeleton rows
              Array.from({ length: skeletonRowCount }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  {table.getHeaderGroups()[0]?.headers.map((_, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[80%]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={table.getHeaderGroups()[0]?.headers.length || 1} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-surface-400 dark:text-surface-500">
                    <Inbox size={40} strokeWidth={1.5} />
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data rows
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={clsx(
                    'transition-colors',
                    'hover:bg-surface-50 dark:hover:bg-surface-800/50',
                    row.getIsSelected() && 'bg-primary-50/50 dark:bg-primary-950/30'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-surface-800 dark:text-surface-200"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom content */}
      {bottomContent && <div className="mt-3">{bottomContent}</div>}

      {/* Built-in pagination controls */}
      {!isLoading && table.getPageCount() > 1 && !bottomContent && (
        <div className="mt-4 flex items-center justify-between text-sm text-surface-600 dark:text-surface-400">
          <div className="flex items-center gap-2">
            <span>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <span className="text-surface-400 dark:text-surface-500">|</span>
            <span>{table.getFilteredRowModel().rows.length} rows</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
