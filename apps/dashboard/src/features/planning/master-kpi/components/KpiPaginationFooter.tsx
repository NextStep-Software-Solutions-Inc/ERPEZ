/**
 * KPI Pagination Footer Component
 * Displays pagination controls with page size selector
 */

import { motion } from 'framer-motion'
import { interactionAnimations, useReducedMotion } from '@/utils/animation'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface KpiPaginationFooterProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalRows: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const PAGE_SIZE_OPTIONS = ['5', '10', '12', '15', '20']

export function KpiPaginationFooter({
  currentPage,
  totalPages,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
}: KpiPaginationFooterProps) {
  const prefersReducedMotion = useReducedMotion()
  const startRow = (currentPage - 1) * pageSize + 1
  const endRow = Math.min(currentPage * pageSize, totalRows)
  const isFirstPage = currentPage <= 1
  const isLastPage = totalPages === 0 || currentPage >= totalPages

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex items-center justify-between border-t px-4 py-4"
    >
      {/* Results Info */}
      <div className="text-sm text-muted-foreground">
        {totalRows === 0 ? (
          <span>No results</span>
        ) : (
          <span>
            Showing {startRow} to {endRow} of {totalRows} results
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Page Size Selector */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={prefersReducedMotion ? false : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="flex items-center gap-2"
        >
          <label htmlFor="page-size" className="text-sm text-muted-foreground">
            Per page
          </label>
          <Select
            value={pageSize.toString()}
            onValueChange={(val) => onPageSizeChange(parseInt(val))}
          >
            <SelectTrigger id="page-size" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Pagination Controls */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={prefersReducedMotion ? false : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <span className="text-sm text-muted-foreground">
            Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
          </span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <motion.div
                  variants={
                    prefersReducedMotion
                      ? undefined
                      : interactionAnimations.buttonPress
                  }
                  whileTap="tap"
                  whileHover={isFirstPage ? undefined : 'hover'}
                  className={
                    isFirstPage
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                >
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (!isFirstPage) onPageChange(currentPage - 1)
                    }}
                    aria-disabled={isFirstPage}
                  />
                </motion.div>
              </PaginationItem>
              <PaginationItem>
                <motion.div
                  variants={
                    prefersReducedMotion
                      ? undefined
                      : interactionAnimations.buttonPress
                  }
                  whileTap="tap"
                  whileHover={isLastPage ? undefined : 'hover'}
                  className={
                    isLastPage
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                >
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (!isLastPage) onPageChange(currentPage + 1)
                    }}
                    aria-disabled={isLastPage}
                  />
                </motion.div>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </motion.div>
      </div>
    </motion.div>
  )
}
