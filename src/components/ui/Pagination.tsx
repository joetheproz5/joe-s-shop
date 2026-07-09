import React, { useCallback } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { clsx } from '@/lib/utils'

/**
 * Props for the Pagination component.
 *
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={3}
 *   totalPages={20}
 *   totalItems={500}
 *   pageSize={25}
 *   onPageChange={setPage}
 *   onPageSizeChange={setSize}
 *   pageSizeOptions={[10, 25, 50, 100]}
 * />
 * ```
 */
export interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Total number of items across all pages */
  totalItems: number
  /** Number of items per page */
  pageSize: number
  /** Callback when the page changes */
  onPageChange: (page: number) => void
  /** Callback when the page size changes */
  onPageSizeChange?: (size: number) => void
  /** Available page size options */
  pageSizeOptions?: number[]
  /** Whether to show the "Showing X-Y of Z" info text */
  showInfo?: boolean
  /** Whether to show the page size selector */
  showPageSizeSelector?: boolean
  /** Additional class names */
  className?: string
}

/**
 * Generates the visible page numbers with ellipsis.
 */
function getPageNumbers(current: number, total: number): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [1]

  if (current > 3) {
    pages.push('ellipsis-start')
  }

  const rangeStart = Math.max(2, current - 1)
  const rangeEnd = Math.min(total - 1, current + 1)

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push('ellipsis-end')
  }

  pages.push(total)

  return pages
}

/**
 * A page navigation component with prev/next buttons, page numbers,
 * current page indicator, page size selector, and result count info.
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showInfo = true,
  showPageSizeSelector = false,
  className,
}: PaginationProps) {
  const pages = getPageNumbers(currentPage, totalPages)
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page)
      }
    },
    [currentPage, totalPages, onPageChange]
  )

  return (
    <nav
      className={clsx('flex flex-col sm:flex-row items-center justify-between gap-4', className)}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Info text */}
      {showInfo && (
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Showing{' '}
          <span className="font-medium text-surface-700 dark:text-surface-300">{startItem}</span>
          {' - '}
          <span className="font-medium text-surface-700 dark:text-surface-300">{endItem}</span>
          {' of '}
          <span className="font-medium text-surface-700 dark:text-surface-300">{totalItems}</span>
          {' results'}
        </p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="First page"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Previous page */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-0.5 mx-1">
          {pages.map((page, idx) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <span
                  key={page}
                  className="px-1.5 py-1 text-sm text-surface-400 dark:text-surface-500"
                  aria-hidden="true"
                >
                  ...
                </span>
              )
            }

            const isActive = page === currentPage

            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                aria-label={`Page ${page}`}
                aria-current={isActive ? 'page' : undefined}
                className={clsx(
                  'min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-600 text-white dark:bg-primary-500'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                )}
              >
                {page}
              </button>
            )
          })}
        </div>

        {/* Next page */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>

        {/* Last page */}
        <button
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
          className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Last page"
        >
          <ChevronsRight size={16} />
        </button>

        {/* Page size selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="ml-3 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-2 py-1 text-sm text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}
      </div>
    </nav>
  )
}
