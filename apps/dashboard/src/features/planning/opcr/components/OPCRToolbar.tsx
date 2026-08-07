import { Search } from 'lucide-react'
import DebouncedInput from '@/components/ui/DebouncedInput'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFiscalYearQueries } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/hooks/useFiscalYearQueries'

interface OPCRToolbarProps {
  readonly searchQuery: string
  readonly onSearchChange: (value: string) => void
  readonly fiscalYearId?: string
  readonly commitmentStatus?: string
  readonly reviewStatus?: string
  readonly onFiscalYearChange?: (value: string) => void
  readonly onCommitmentStatusChange?: (value: string) => void
  readonly onReviewStatusChange?: (value: string) => void
  readonly showSearch?: boolean
  readonly showFiscalYear?: boolean
  readonly showCommitmentStatus?: boolean
  readonly showReviewStatus?: boolean
  readonly searchPlaceholder?: string
}

const COMMITMENT_STATUSES = [
  { label: 'All Commitment Status', value: 'ALL' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Submitted', value: 'Submitted' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
]

const REVIEW_STATUSES = [
  { label: 'All Review Status', value: 'ALL' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Submitted', value: 'Submitted' },
  { label: 'Returned', value: 'Returned' },
  { label: 'Finalized', value: 'Finalized' },
]

export default function OPCRToolbar({
  searchQuery,
  onSearchChange,
  fiscalYearId = '',
  commitmentStatus = '',
  reviewStatus = '',
  onFiscalYearChange,
  onCommitmentStatusChange,
  onReviewStatusChange,
  showSearch = true,
  showFiscalYear = true,
  showCommitmentStatus = true,
  showReviewStatus = true,
  searchPlaceholder = 'Search OPCR...',
}: OPCRToolbarProps) {
  const { fiscalYears } = useFiscalYearQueries()

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between bg-white p-4 rounded-xl shadow-xs border border-gray-100 mb-6">
      {showSearch && (
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <DebouncedInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="pl-9 w-full bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            debounceMs={400}
          />
        </div>
      )}

      {(showFiscalYear || showCommitmentStatus || showReviewStatus) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {showFiscalYear && onFiscalYearChange && (
            <Select
              value={fiscalYearId || 'ALL'}
              onValueChange={(value) => onFiscalYearChange(value === 'ALL' ? '' : value)}
            >
              <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200 focus:bg-white">
                <SelectValue placeholder="Select Fiscal Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Years</SelectItem>
                {fiscalYears.map((fy) => (
                  <SelectItem key={fy.id} value={fy.id}>
                    {fy.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showCommitmentStatus && onCommitmentStatusChange && (
            <Select
              value={commitmentStatus || 'ALL'}
              onValueChange={(value) => onCommitmentStatusChange(value === 'ALL' ? '' : value)}
            >
              <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200 focus:bg-white">
                <SelectValue placeholder="Select Commitment Status" />
              </SelectTrigger>
              <SelectContent>
                {COMMITMENT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showReviewStatus && onReviewStatusChange && (
            <Select
              value={reviewStatus || 'ALL'}
              onValueChange={(value) => onReviewStatusChange(value === 'ALL' ? '' : value)}
            >
              <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200 focus:bg-white">
                <SelectValue placeholder="Select Review Status" />
              </SelectTrigger>
              <SelectContent>
                {REVIEW_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  )
}

