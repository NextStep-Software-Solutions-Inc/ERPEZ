import { useState, useEffect } from 'react'
import type { MetaActions } from '@/types/global'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Building2Icon, ShieldCheckIcon } from 'lucide-react'
import {
  useOrgUnits,
  useOrgUnit,
  useUpdateOrgUnit,
  useDeleteOrgUnit,
  usePositions,
} from './hooks/useOrgUnits'
import type { StructuralManagementTabProps } from '@/components/features/planning/organizational-structure/types'
import { PositionsList } from './components/PositionsList'
import { UnitDetailsMetadata } from './components/UnitDetailsMetadata'
import { UnitDetailsHeader } from './components/UnitDetailsHeader'
import { OrgUnitNavigation } from './components/OrgUnitNavigation'
import { organizationConfig } from '@/config/organization.config'
import CreateOfficeDialog from '@/components/features/planning/organizational-structure/dialog/CreateOfficeDialog'
import UpdateOfficeDialog from '@/components/features/planning/organizational-structure/dialog/UpdateOfficeDialog'
import DeleteOfficeDialog from '@/components/features/planning/organizational-structure/dialog/DeleteOfficeDialog'

function StructuralManagementTab({ structuralSearch, selectedUnitId, onSelectUnit }: StructuralManagementTabProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set())
  const { data: units, isLoading: isListLoading, error: listError } = useOrgUnits()
  const normalizedUnitId = selectedUnitId ?? null
  const { data: selectedUnit, isLoading: isUnitLoading, refetch: refetchUnit } = useOrgUnit(normalizedUnitId)
  const { data: positions, isLoading: isPositionsLoading } = usePositions(normalizedUnitId ?? undefined)
  const updateMutation = useUpdateOrgUnit()
  const deleteMutation = useDeleteOrgUnit()

  // Helper function to recursively get all descendant unit IDs
  const getAllDescendantIds = (parentId: string): string[] => {
    if (!units) return []
    const descendants: string[] = []
    const directChildren = units.filter((u) => u.parentId === parentId)
    directChildren.forEach((child) => {
      descendants.push(child.id)
      descendants.push(...getAllDescendantIds(child.id))
    })
    return descendants
  }

  // Helper function to calculate aggregated position count for a unit
  const getAggregatedPositionCount = (unitId: string): number => {
    if (!units) return 0
    const unit = units.find(u => u.id === unitId)
    if (!unit) return 0
    
    const descendantIds = getAllDescendantIds(unitId)
    return [
      unit.positionCount ?? 0,
      ...descendantIds.map(id => {
        const descendant = units.find(u => u.id === id)
        return descendant?.positionCount ?? 0
      })
    ].reduce((sum, count) => sum + count, 0)
  }

  // Helper function to get all parent IDs (ancestors)
  const getParentChain = (unitId: string): string[] => {
    if (!units) return []
    const chain: string[] = []
    let current = units.find((u) => u.id === unitId)
    while (current && current.parentId) {
      chain.push(current.parentId)
      const next = units.find((u) => u.id === current?.parentId)
      current = next
    }
    return chain
  }

  // Initialize expanded units once data is loaded
  useEffect(() => {
    if (units && units.length > 0 && normalizedUnitId) {
      const expanded = new Set<string>()
      expanded.add(normalizedUnitId)
      const parentChain = getParentChain(normalizedUnitId)
      parentChain.forEach((id) => expanded.add(id))
      units.forEach((unit) => {
        if (unit.parentId === normalizedUnitId) {
          expanded.add(unit.id)
        }
      })
      setExpandedUnits(expanded)
    }
  }, [units, normalizedUnitId])

  // Handle toggle expand
  const handleToggleExpand = (unitId: string) => {
    setExpandedUnits((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(unitId)) {
        newSet.delete(unitId)
      } else {
        newSet.add(unitId)
      }
      return newSet
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full pt-4">
      {/* LEFT COLUMN: Organization Tree Navigation */}
      <OrgUnitNavigation
        units={units}
        isLoading={isListLoading}
        error={listError}
        searchText={structuralSearch}
        selectedUnitId={normalizedUnitId}
        expandedUnits={expandedUnits}
        onSelectUnit={(id) => {
          onSelectUnit(id)
          if (id && id === normalizedUnitId) {
            refetchUnit()
          }
        }}
        onToggleExpand={handleToggleExpand}
        onCreateClick={() => setIsCreateOpen(true)}
        getAllDescendantIds={getAllDescendantIds}
        getAggregatedPositionCount={getAggregatedPositionCount}
      />

      {/* RIGHT COLUMN: Unit Details & Metadata Editor */}
      <Card className="lg:col-span-2 flex flex-col shadow-sm bg-card border">
        {isUnitLoading ? (
          <CardContent className="p-12 flex justify-center items-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-default-500 font-medium">Fetching unit details...</p>
            </div>
          </CardContent>
        ) : selectedUnitId && selectedUnit ? (
          <>
            {/* Unit Details Header */}
            <UnitDetailsHeader
              unit={selectedUnit}
              onModifyClick={() => setIsUpdateOpen(true)}
              onDeleteClick={() => setIsDeleteOpen(true)}
              isUpdating={updateMutation.isPending}
              isDeleting={deleteMutation.isPending}
            />

            <CardContent className="px-6 space-y-8">
              {/* Unit Metadata Sections */}
              <UnitDetailsMetadata unit={selectedUnit} />

              {/* Position List Segment */}
              <PositionsList 
                positions={positions}
                isLoading={isPositionsLoading}
                positionCount={selectedUnit ? getAggregatedPositionCount(selectedUnit.id) : 0}
              />

              {/* Administrative Footer */}
              <div className="bg-default-50/50 p-4 rounded-lg border border-dashed border-default-200">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheckIcon className="h-4 w-4 text-default-400" />
                  <h3 className="font-semibold text-default-500 uppercase text-[10px] tracking-wider">Traceability</h3>
                </div>
                <p className="text-[11px] text-default-500 leading-relaxed font-medium">
                  {organizationConfig.policy.unitTraceability}
                </p>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="h-[500px] flex flex-col items-center justify-center p-12 text-center bg-default-50/20">
            <div className="bg-default-100 p-4 rounded-full mb-4">
              <Building2Icon className="h-10 w-10 text-default-400" />
            </div>
            <CardTitle className="text-base font-semibold text-default-900 mb-2">No Organization Selected</CardTitle>
            <p className="text-sm text-default-500 max-w-xs font-medium">
              Select an agency division, office, or regional cluster from the hierarchy tree to manage its identity and government metadata.
            </p>
          </CardContent>
        )}
      </Card>

      <CreateOfficeDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        parentUnits={units || []} 
      />

      <UpdateOfficeDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        unit={selectedUnit || null}
        parentUnits={units || []}
      />

      <DeleteOfficeDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        unitId={selectedUnit?.id}
        unitName={selectedUnit?.name}
        onSuccess={() => {
          // Clear selection after successful deletion
          onSelectUnit(null)
        }}
      />
    </div>
  )
}

export default StructuralManagementTab