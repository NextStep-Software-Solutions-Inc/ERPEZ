import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus } from 'lucide-react'
import { UnitTreeItem } from '.'
import type { OrgUnit } from '@/services/mock/orgUnits'

interface OrgUnitNavigationProps {
  units: OrgUnit[] | undefined
  isLoading: boolean
  error: Error | null
  searchText: string | undefined
  selectedUnitId: string | null
  expandedUnits: Set<string>
  onSelectUnit: (id: string | null) => void
  onToggleExpand: (unitId: string) => void
  onCreateClick: () => void
  getAllDescendantIds: (parentId: string) => string[]
  getAggregatedPositionCount: (unitId: string) => number
}

export function OrgUnitNavigation({
  units,
  isLoading,
  error,
  searchText,
  selectedUnitId,
  expandedUnits,
  onSelectUnit,
  onToggleExpand,
  onCreateClick,
  getAllDescendantIds,
  getAggregatedPositionCount,
}: OrgUnitNavigationProps) {
  const filteredUnits = units?.filter(u => 
    !searchText || 
    u.name.toLowerCase().includes(searchText.toLowerCase()) || 
    u.code.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <Card className="lg:col-span-1 flex flex-col h-fit lg:min-h-[600px] bg-card border shadow-sm">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-default-900 uppercase tracking-wider">Agency Hierarchy</CardTitle>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-default-500" onClick={onCreateClick}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 px-4 pt-4">
        <div className="space-y-1.5 pr-4 pb-4">
          {isLoading && <p className="text-sm text-default-500 animate-pulse font-medium">Loading hierarchy...</p>}
          {error && <p className="text-sm text-destructive font-semibold">Error loading structural data</p>}

          {filteredUnits && (
            <>
              {filteredUnits
                .filter((u) => !u.parentId)
                .map((rootUnit) => (
                <UnitTreeItem
                  key={rootUnit.id}
                  unit={rootUnit}
                  selectedUnitId={selectedUnitId}
                  onSelectUnit={onSelectUnit}
                  filteredUnits={filteredUnits}
                  expandedUnits={expandedUnits}
                  onToggleExpand={onToggleExpand}
                  getAllDescendantIds={getAllDescendantIds}
                  getAggregatedPositionCount={getAggregatedPositionCount}
                />
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
