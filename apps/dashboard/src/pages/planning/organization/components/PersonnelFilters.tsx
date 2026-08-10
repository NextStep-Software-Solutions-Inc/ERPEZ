import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Building2, X } from 'lucide-react'

interface PersonnelFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedFilterOfficeId: string | null
  onFilterChange: (value: string) => void
  onClearFilter: () => void
  units: OrgUnit[]
  positions: Position[]
}

export function PersonnelFilters({
  searchQuery,
  onSearchChange,
  selectedFilterOfficeId,
  onFilterChange,
  onClearFilter,
  units,
  positions,
}: PersonnelFiltersProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
      {/* Search Input */}
      <div className="flex-1 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-default-400 pointer-events-none" />
        <Input
          placeholder="Search personnel by name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm border-default-200 focus:border-primary focus:ring-primary/20"
        />
      </div>

      {/* Office/Division Filter */}
      <div className="flex items-center gap-3">
        <Building2 className="h-4 w-4 text-default-400 flex-shrink-0" />
        {selectedFilterOfficeId ? (
          <div className="flex items-center gap-2 h-9 px-3 bg-primary/5 border border-primary/20 rounded-md">
            <span className="text-sm font-medium text-primary truncate">
              {units?.find(u => u.id === selectedFilterOfficeId)?.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-primary/10"
              onClick={onClearFilter}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Select value="" onValueChange={onFilterChange}>
            <SelectTrigger className="h-9 w-full max-w-sm bg-white border-default-200 text-sm font-medium rounded-md">
              <SelectValue placeholder="Filter by Office/Division..." />
            </SelectTrigger>
            <SelectContent>
              {units?.filter((unit) => {
                // Show all units that have positions
                const hasPositions = positions?.some((p) => p.orgUnitId === unit.id)
                return hasPositions
              }).map((unit) => {
                // Calculate nesting level for visual indentation
                let level = 0
                let current = unit
                const visitedIds = new Set<string>()
                while (current.parentId) {
                  // Prevent infinite loops in case of cyclic parent relationships
                  if (visitedIds.has(current.id)) {
                    break
                  }
                  visitedIds.add(current.id)

                  const parent = units?.find((u) => u.id === current.parentId)
                  if (!parent) {
                    // Break if parent cannot be found to avoid infinite loop
                    break
                  }

                  level++
                  current = parent
                }
                return (
                  <SelectItem key={unit.id} value={unit.id}>
                    <span style={{ paddingLeft: `${level * 16}px`, display: 'inline-block' }}>
                      {level > 0 ? '└─ ' : ''}
                      {unit.name}
                    </span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
