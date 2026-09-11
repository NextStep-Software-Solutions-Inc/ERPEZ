import { RotateCcw, Search } from 'lucide-react'
import {
  PROCUREMENT_CATEGORY_LABELS,
  type ProcurementCategory,
} from '../../bidding-schedule/types'
import type {
  BiddingMasterCalendarFilters,
  BiddingMasterCalendarResolutionOption,
  DerivedCalendarProjectStatus,
} from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BiddingMasterCalendarFiltersPanelProps {
  filters: BiddingMasterCalendarFilters
  resolutionOptions?: BiddingMasterCalendarResolutionOption[]
  milestoneOptions: Array<{ value: string; label: string }>
  officeOptions: string[]
  fiscalYearOptions: string[]
  onChange: (nextFilters: BiddingMasterCalendarFilters) => void
  onReset: () => void
}

const STATUS_OPTIONS: Array<{
  value: DerivedCalendarProjectStatus
  label: string
}> = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'due-soon', label: 'Due Soon' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'completed-locked', label: 'Completed / Locked' },
]

function toSelectValue(value: string[] | undefined) {
  return value && value.length > 0 ? value[0] : 'all'
}

function toArrayValue(value: string): string[] {
  return value === 'all' ? [] : [value]
}

export function BiddingMasterCalendarFiltersPanel({
  filters,
  resolutionOptions = [],
  milestoneOptions,
  officeOptions,
  fiscalYearOptions,
  onChange,
  onReset,
}: BiddingMasterCalendarFiltersPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects or BAC..."
          value={filters.searchTerm}
          onChange={(e) =>
            onChange({ ...filters, searchTerm: e.target.value })
          }
          className="pl-8"
        />
      </div>

      <Select
        value={filters.bacResolutionId || 'all'}
        onValueChange={(value) =>
          onChange({
            ...filters,
            bacResolutionId: value === 'all' ? null : value,
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="BAC Resolution" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All BAC Resolutions</SelectItem>
          {resolutionOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.number} — {option.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={toSelectValue(filters.milestoneKeys)}
        onValueChange={(value) =>
          onChange({ ...filters, milestoneKeys: toArrayValue(value) })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Milestone" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Milestones</SelectItem>
          {milestoneOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={toSelectValue(filters.procurementCategories)}
        onValueChange={(value) =>
          onChange({
            ...filters,
            procurementCategories: toArrayValue(
              value,
            ) as ProcurementCategory[],
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {(
            Object.entries(PROCUREMENT_CATEGORY_LABELS) as [
              ProcurementCategory,
              string,
            ][]
          ).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={toSelectValue(filters.offices)}
        onValueChange={(value) =>
          onChange({ ...filters, offices: toArrayValue(value) })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Office" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Offices</SelectItem>
          {officeOptions.map((office) => (
            <SelectItem key={office} value={office}>
              {office}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={toSelectValue(filters.derivedStatuses)}
        onValueChange={(value) =>
          onChange({
            ...filters,
            derivedStatuses: toArrayValue(
              value,
            ) as typeof filters.derivedStatuses,
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Project Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={toSelectValue(filters.fiscalYears)}
        onValueChange={(value) =>
          onChange({ ...filters, fiscalYears: toArrayValue(value) })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Fiscal Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Fiscal Years</SelectItem>
          {fiscalYearOptions.map((fiscalYear) => (
            <SelectItem key={fiscalYear} value={fiscalYear}>
              FY {fiscalYear}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={filters.dateRangeStart ?? ''}
        onChange={(event) =>
          onChange({
            ...filters,
            dateRangeStart: event.target.value || null,
          })
        }
      />

      <div className="flex gap-2">
        <Input
          type="date"
          value={filters.dateRangeEnd ?? ''}
          onChange={(event) =>
            onChange({
              ...filters,
              dateRangeEnd: event.target.value || null,
            })
          }
        />
        <Button
          type="button"
          variant="outline"
          color="secondary"
          className="shrink-0 gap-2"
          onClick={onReset}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  )
}
