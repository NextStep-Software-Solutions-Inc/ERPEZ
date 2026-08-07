import { Badge } from '@/components/ui/badge'
import { Building2Icon, ChevronDown } from 'lucide-react'
import type { OrgUnit } from '@/services/mock/orgUnits'

interface UnitTreeItemProps {
  unit: OrgUnit
  selectedUnitId: string | null
  onSelectUnit: (id: string | null) => void
  filteredUnits: OrgUnit[]
  expandedUnits: Set<string>
  onToggleExpand: (id: string) => void
  getAllDescendantIds: (id: string) => string[]
  getAggregatedPositionCount: (unitId: string) => number
}

export default function UnitTreeItem({
  unit,
  selectedUnitId,
  onSelectUnit,
  filteredUnits,
  expandedUnits,
  onToggleExpand,
  getAllDescendantIds,
  getAggregatedPositionCount,
}: UnitTreeItemProps) {
  // Get child units
  const childUnits = filteredUnits.filter((u) => u.parentId === unit.id)
  const hasChildren = childUnits.length > 0
  const isSelected = selectedUnitId === unit.id
  const isExpanded = expandedUnits.has(unit.id)
  
  // Calculate total positions including descendants
  const totalPositions = getAggregatedPositionCount(unit.id)

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        {hasChildren && (
          <button
            onClick={() => onToggleExpand(unit.id)}
            className="p-0.5 hover:bg-default-100 rounded transition-colors"
          >
            <ChevronDown
              className={`h-4 w-4 text-default-400 transition-transform ${
                isExpanded ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>
        )}
        {!hasChildren && <div className="w-5" />}

        <button
          onClick={() => onSelectUnit(unit.id)}
          className={`flex-1 text-left px-3 py-2 rounded-md transition-all flex items-center gap-3 text-sm group ${
            isSelected
              ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary'
              : 'text-default-700 hover:bg-default-100 font-medium'
          }`}
        >
          <Building2Icon
            className={`h-4 w-4 flex-shrink-0 ${
              isSelected ? 'text-primary' : 'text-default-400'
            }`}
          />
          <span className="truncate flex-1">{unit.name}</span>
          <Badge
            className={`ml-auto font-medium px-2 py-0 h-5 border-none flex-shrink-0 ${
              isSelected ? 'bg-primary text-primary-foreground' : ''
            }`}
          >
            {totalPositions}
          </Badge>
        </button>
      </div>

      {/* Render child units recursively */}
      {hasChildren && isExpanded && (
        <div className="ml-4 pl-4 border-l border-default-200 space-y-1">
          {childUnits.map((child) => (
            <UnitTreeItem
              key={child.id}
              unit={child}
              selectedUnitId={selectedUnitId}
              onSelectUnit={onSelectUnit}
              filteredUnits={filteredUnits}
              expandedUnits={expandedUnits}
              onToggleExpand={onToggleExpand}
              getAllDescendantIds={getAllDescendantIds}
              getAggregatedPositionCount={getAggregatedPositionCount}
            />
          ))}
        </div>
      )}
    </div>
  )
}
