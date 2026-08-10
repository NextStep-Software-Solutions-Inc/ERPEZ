import { forwardRef, useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getFiscalYearsRequest } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/handlers/getFiscalYearsRequest'
import type { FiscalYear } from '../types/types'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'

// Query hook for fiscal years
const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)

export interface ReusableFiscalYearSelectorProps {
  onFiscalYearChange?: (
    fiscalYear: FiscalYear | null,
    fiscalYearId: string,
  ) => void
  autoSelectFirst?: boolean // default: false
  label?: string // default: "Select Fiscal Year"
  placeholder?: string // default: "Select a fiscal year"
  disabled?: boolean // default: false
  size?: 'sm' | 'md' | 'lg' // default: 'md'
  pageSize?: number // default: 25 (items per page for infinite scroll)
  value?: string // The selected fiscal year ID
  showAllOption?: boolean // default: false
  allOptionLabel?: string // default: "All Fiscal Years"
}

export interface ReusableFiscalYearSelectorRef {
  selectedFiscalYearId: string
  selectedFiscalYear: FiscalYear | null
  fiscalYears: FiscalYear[]
  isLoading: boolean
}

export const ReusableFiscalYearSelector = forwardRef<
  ReusableFiscalYearSelectorRef,
  ReusableFiscalYearSelectorProps
>(
  (
    {
      onFiscalYearChange,
      autoSelectFirst = false,
      label = 'Select Fiscal Year',
      placeholder = 'Select a fiscal year',
      disabled = false,
      size = 'md',
      pageSize = 25,
      value,
      showAllOption = false,
      allOptionLabel = 'All Fiscal Years',
    },
    ref,
  ) => {
    const [selectedFiscalYearId, setSelectedFiscalYearId] = useState<string>(
      value || '',
    )
    const [accumulatedFiscalYears, setAccumulatedFiscalYears] = useState<
      FiscalYear[]
    >([])

    const [selectedFiscalYear, setSelectedFiscalYear] =
      useState<FiscalYear | null>(null)

    // Sync internal state with external value
    useEffect(() => {
      if (value !== undefined && value !== selectedFiscalYearId) {
        setSelectedFiscalYearId(value || '')
        const matchingFY =
          accumulatedFiscalYears.find((fy) => fy.id === value) || null
        setSelectedFiscalYear(matchingFY)
      }
    }, [value, accumulatedFiscalYears])
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMorePages, setHasMorePages] = useState(true)

    // Fetch fiscal years for current page
    const {
      data: fiscalYearsData,
      isLoading,
      isError,
      error,
    } = useFiscalYears({
      pathParams: {},
      queryParams: {
        pageSize,
        pageNumber: currentPage,
        sorts: 'year',
      },
    })

    const paginationMeta =
      fiscalYearsData?.pageNumber !== undefined
        ? {
            currentPageNum: fiscalYearsData.pageNumber,
            totalPageNum: fiscalYearsData.totalPageNumber,
            loadMore: fiscalYearsData.loadMore,
            totalRows: fiscalYearsData.totalRows,
          }
        : null

    const currentPageItems = fiscalYearsData?.data || []

    // Accumulate fiscal years from multiple pages (infinite scroll)
    useEffect(() => {
      if (currentPageItems.length > 0) {
        setAccumulatedFiscalYears((prev) => {
          // Avoid duplicates by checking if items already exist
          const existingIds = new Set(prev.map((fy) => fy.id))
          const newItems = currentPageItems.filter(
            (item) => !existingIds.has(item.id),
          )
          return [...prev, ...newItems].sort((a, b) => a.year - b.year)
        })

        // Update hasMorePages based on API response
        if (paginationMeta) {
          setHasMorePages(paginationMeta.loadMore)
        }
      }
    }, [currentPageItems, paginationMeta])

    // Expose state via ref
    useEffect(() => {
      if (ref && typeof ref === 'object') {
        ref.current = {
          selectedFiscalYearId,
          selectedFiscalYear,
          fiscalYears: accumulatedFiscalYears,
          isLoading,
        }
      }
    }, [
      ref,
      selectedFiscalYearId,
      selectedFiscalYear,
      accumulatedFiscalYears,
      isLoading,
    ])

    // Auto-select first fiscal year on mount
    useEffect(() => {
      if (
        autoSelectFirst &&
        accumulatedFiscalYears.length > 0 &&
        !selectedFiscalYearId
      ) {
        const firstFY = accumulatedFiscalYears[0]
        setSelectedFiscalYearId(firstFY.id)
        setSelectedFiscalYear(firstFY)
        // Don't call callback for auto-select (as per spec)
      }
    }, [accumulatedFiscalYears, selectedFiscalYearId, autoSelectFirst])

    // Handle fiscal year change - fires ONLY on user selection
    const handleFiscalYearChange = (fyId: string) => {
      setSelectedFiscalYearId(fyId)
      const selectedFY =
        fyId === 'all'
          ? null
          : accumulatedFiscalYears.find((fy) => fy.id === fyId) || null
      setSelectedFiscalYear(selectedFY)

      // Fire callback on user selection
      if (onFiscalYearChange) {
        onFiscalYearChange(selectedFY, fyId)
      }
    }

    // Auto-load next page when accumulated items fall below a threshold relative to remaining total
    useEffect(() => {
      if (
        hasMorePages &&
        !isLoading &&
        paginationMeta &&
        accumulatedFiscalYears.length < pageSize * 2 && // Keep at least 2 pages worth loaded
        currentPage < paginationMeta.totalPageNum
      ) {
        setCurrentPage((prev) => prev + 1)
      }
    }, [
      hasMorePages,
      isLoading,
      accumulatedFiscalYears.length,
      pageSize,
      currentPage,
      paginationMeta,
    ])

    // Log errors but don't display (silent disable as per spec)
    if (isError) {
      console.error('Failed to fetch fiscal years:', error)
    }

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor="fiscal-year-selector" className="text-sm">
            {label}
          </Label>
        )}
        <Select
          value={selectedFiscalYearId}
          onValueChange={handleFiscalYearChange}
          disabled={isLoading || disabled}
        >
          <SelectTrigger
            id="fiscal-year-selector"
            size={size}
            variant="faded"
            color="primary"
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {showAllOption && (
              <SelectItem value="all">{allOptionLabel}</SelectItem>
            )}
            {accumulatedFiscalYears.map((fy: FiscalYear) => (
              <SelectItem key={fy.id} value={fy.id}>
                {fy.year} - {fy.description}
              </SelectItem>
            ))}
            {isLoading && currentPage > 1 && (
              <div className="py-2 px-2 text-center text-sm text-muted-foreground">
                Loading more fiscal years...
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    )
  },
)

ReusableFiscalYearSelector.displayName = 'ReusableFiscalYearSelector'
