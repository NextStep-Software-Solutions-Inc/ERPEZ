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
import type { TabFilter } from '@/components/features/planning/organizational-structure/types'

interface PlantillaFiltersProps {
  localSearch: string
  onSearchChange: (value: string) => void
  selectedOfficeId: string | null
  onOfficeChange: (value: string | null) => void
  filter: TabFilter
  onFilterChange: (value: TabFilter) => void
  units: OrgUnit[]
  allPositions: Position[]
}

export function PlantillaFilters({
  localSearch,
  onSearchChange,
  selectedOfficeId,
  onOfficeChange,
  filter,
  onFilterChange,
  units,
  allPositions,
}: PlantillaFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
      <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
        {/* Search Field */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-default-400" />
          <Input 
            placeholder="Search Item No, Designation, Grade..." 
            className="pl-9 h-10 bg-default-50 border-default-200 focus:bg-card text-sm font-medium placeholder:text-default-400 rounded-md" 
            value={localSearch}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        {/* Office/Division Filter */}
        <div className="relative w-full md:w-80">
          {selectedOfficeId ? (
            <div className="flex items-center gap-2 h-10 px-3 bg-primary/5 border border-primary/20 rounded-md">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary flex-1 truncate">
                {units?.find(u => u.id === selectedOfficeId)?.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-primary/10"
                onClick={() => onOfficeChange(null)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Select value="" onValueChange={onOfficeChange}>
              <SelectTrigger className="h-10 bg-default-50 border-default-200 focus:bg-card text-sm font-medium rounded-md">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-default-400" />
                  <SelectValue placeholder="Filter by Office/Division..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                {units?.filter((unit) => {
                  // Show all units that have positions
                  const hasPositions = allPositions?.some((p) => p.orgUnitId === unit.id)
                  return hasPositions
                }).map((unit) => {
                  // Calculate nesting level for visual indentation
                  let level = 0
                  let current = unit
                  while (current.parentId) {
                    level++
                    current = units?.find(u => u.id === current.parentId) || current
                    if (current.parentId === undefined) break
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
      
      {/* Status Filter */}
      <div className="flex p-1 bg-default-100 rounded-lg">
        {(['all', 'filled', 'vacant'] as const).map((t) => (
          <Button 
            key={t}
            variant={filter === t ? 'soft' : 'ghost'} 
            size="sm" 
            className={`capitalize h-8 px-4 font-semibold text-[10px] rounded-md transition-all ${
              filter === t ? 'bg-card text-default-900 shadow-sm' : 'text-default-500 hover:text-default-900'
            }`}
            onClick={() => onFilterChange(t)}
          >
            {t}
          </Button>
        ))}
      </div>
    </div>
  )
}
