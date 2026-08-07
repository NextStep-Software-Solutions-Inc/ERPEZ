import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LibStats } from '../utils/libStatsUtils'
import { ALL_STATUSES } from '../utils/statusUtils'

interface FilterPanelProps {
  open: boolean
  selectedStatuses: string[]
  selectedSourceTypes: string[]
  selectedYear: string
  stats: LibStats
  onStatusChange: (status: string) => void
  onSourceTypeChange: (type: string) => void
  onYearChange: (year: string) => void
  onClear: () => void
}

const SOURCE_TYPES = ['OPCR', 'WFP']

export const FilterPanel = ({
  open,
  selectedStatuses,
  selectedSourceTypes,
  selectedYear,
  stats,
  onStatusChange,
  onSourceTypeChange,
  onYearChange,
  onClear,
}: FilterPanelProps) => {
  if (!open) return null

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Status Filter */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Status</p>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((status) => (
            <Badge
              key={status}
              variant={
                selectedStatuses.includes(status) ? undefined : 'outline'
              }
              className="cursor-pointer"
              onClick={() => onStatusChange(status)}
            >
              {status}
            </Badge>
          ))}
        </div>
      </div>

      {/* Source Type Filter */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Source Type</p>
        <div className="flex gap-2">
          {SOURCE_TYPES.map((type) => (
            <Badge
              key={type}
              variant={
                selectedSourceTypes.includes(type) ? undefined : 'outline'
              }
              className="cursor-pointer"
              onClick={() => onSourceTypeChange(type)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Fiscal Year Filter */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Fiscal Year</p>
        <Select value={selectedYear} onValueChange={onYearChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {stats.years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="w-full"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  )
}
