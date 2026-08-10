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

interface OPCRPaginationFooterProps {
  readonly pageNumber: number
  readonly pageSize: number
  readonly totalPageNumber: number
  readonly totalRows?: number
  readonly onPageChange: (pageNumber: number) => void
  readonly onPageSizeChange?: (pageSize: number) => void
}

const PAGE_SIZE_OPTIONS = ['5', '10', '20', '50', '100']

export default function OPCRPaginationFooter({
  pageNumber,
  pageSize,
  totalPageNumber,
  totalRows,
  onPageChange,
  onPageSizeChange,
}: OPCRPaginationFooterProps) {
  const prefersReducedMotion = useReducedMotion()
  const isFirstPage = pageNumber <= 1
  const isLastPage = totalPageNumber === 0 || pageNumber >= totalPageNumber

  const startRow = (pageNumber - 1) * pageSize + 1
  const endRow = totalRows !== undefined ? Math.min(pageNumber * pageSize, totalRows) : pageNumber * pageSize

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 bg-white px-4 py-4 gap-4 mt-6 rounded-b-xl"
    >
      {/* Results Info */}
      <div className="text-sm text-muted-foreground">
        {totalRows !== undefined ? (
          totalRows === 0 ? (
            <span>No results</span>
          ) : (
            <span>
              Showing {startRow} to {endRow} of {totalRows} results
            </span>
          )
        ) : (
          <span>Page {totalPageNumber === 0 ? 0 : pageNumber} of {totalPageNumber}</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Page Size Selector */}
        {onPageSizeChange && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={prefersReducedMotion ? false : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="flex items-center gap-2"
          >
            <label htmlFor="opcr-page-size" className="text-sm text-muted-foreground whitespace-nowrap">
              Per page
            </label>
            <Select
              value={pageSize.toString()}
              onValueChange={(val) => onPageSizeChange(parseInt(val, 10))}
            >
              <SelectTrigger id="opcr-page-size" className="w-20 bg-gray-50 border-gray-200">
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
        )}

        {/* Pagination Controls */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={prefersReducedMotion ? false : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <span className="text-sm text-muted-foreground min-w-[70px] text-center">
            Page {totalPageNumber === 0 ? 0 : pageNumber} of {totalPageNumber}
          </span>
          <Pagination className="mx-0 w-auto">
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
                      if (!isFirstPage) {
                        onPageChange(pageNumber - 1)
                      }
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
                      if (!isLastPage) {
                        onPageChange(pageNumber + 1)
                      }
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
