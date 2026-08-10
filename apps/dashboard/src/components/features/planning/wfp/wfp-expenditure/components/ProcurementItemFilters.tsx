import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProcurementItemFiltersProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  typeFilter: string
  onTypeFilterChange: (filter: string) => void
  cseFilter: string
  onCseFilterChange: (filter: string) => void
  uniqueTypes: string[]
  onClearFilters: () => void
}

export function ProcurementItemFilters({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  cseFilter,
  onCseFilterChange,
  uniqueTypes,
  onClearFilters,
}: ProcurementItemFiltersProps) {
  const hasActiveFilters = searchTerm || typeFilter !== '__all' || cseFilter !== '__all'

  return (
    <div className="space-y-3 px-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, description, or code..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All Types</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select value={cseFilter} onValueChange={onCseFilterChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Filter by CSE" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All Items</SelectItem>
              <SelectItem value="cse">CSE Only</SelectItem>
              <SelectItem value="non-cse">Non-CSE Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="h-9"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
