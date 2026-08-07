import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X } from 'lucide-react'

interface ManageSupplierPortalTableToolbarProps {
  searchTerm: string
  typeFilter: 'all' | 'SVP' | 'Public Bidding'
  onSearchChange: (term: string) => void
  onTypeFilterChange: (type: 'all' | 'SVP' | 'Public Bidding') => void
}

export function ManageSupplierPortalTableToolbar({
  searchTerm,
  typeFilter,
  onSearchChange,
  onTypeFilterChange,
}: ManageSupplierPortalTableToolbarProps) {
  return (
    <div className="flex w-full flex-col gap-3 pb-4 md:flex-row md:items-center md:justify-between">
      <div className="flex w-full items-center gap-2 flex-col sm:flex-row">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by project title or ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange('')}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Select value={typeFilter} onValueChange={(value) => onTypeFilterChange(value as 'all' | 'SVP' | 'Public Bidding')}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filter by bidding type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bidding Types</SelectItem>
            <SelectItem value="SVP">SVP</SelectItem>
            <SelectItem value="Public Bidding">Public Bidding</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
