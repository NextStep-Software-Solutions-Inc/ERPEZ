import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' }, // newly included status
  { value: 'for-approval', label: 'For Approval' },
  { value: 'returned', label: 'Returned' },
  { value: 'approved', label: 'Approved' },
] as const

type PurchaseOrderListFilter = (typeof STATUS_OPTIONS)[number]['value']

type PurchaseOrderActionBarProps = {
  search: string
  onSearchChange: (value: string) => void
  statusFilter?: PurchaseOrderListFilter
  onStatusFilterChange?: (value: PurchaseOrderListFilter) => void
}

export function PurchaseOrderActionBar({
  search,
  onSearchChange,
  statusFilter = 'all',
  onStatusFilterChange,
}: PurchaseOrderActionBarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search PO number, supplier, or description"
          className="pl-9"
        />
      </div>

      {/* Status filter — same Select style as Item Master Toolbar */}
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Filter by Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
