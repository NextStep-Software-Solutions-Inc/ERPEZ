import { useMemo, useState } from 'react'
import type { MetaActions } from '@/types/global'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TemplateTable } from '@/components/TemplateTable'
import { Button } from '@/components/ui/button'
import { Upload, BriefcaseIcon } from 'lucide-react'
import {
  useAllPositions,
  useOrgUnits,
} from './hooks/useOrgUnits'
import { createPositionColumns, PositionToolbar } from '@/components/features/planning/organizational-structure/table'
import type { StaffingAndPlantillaTabProps } from '@/components/features/planning/organizational-structure/types'
import type { Position as TablePosition } from '@/components/features/planning/organizational-structure/table/types'
import { PlantillaKPICards } from './components'
import { OrganizationalStructureDialogManager } from '@/components/features/planning/organizational-structure'

/**
 * Transform API Position to table Position type
 */
function mapApiPositionToTablePosition(apiPosition: any): TablePosition {
  return {
    id: apiPosition.id,
    title: apiPosition.title,
    code: apiPosition.code,
    orgUnitId: apiPosition.officeId || apiPosition.orgUnitId,
    description: apiPosition.jobDescription || apiPosition.description,
    salaryGrade: apiPosition.salaryGrade
      ? {
          id: apiPosition.salaryGrade.id,
          name: apiPosition.salaryGrade.name,
        }
      : undefined,
    itemNumber: apiPosition.itemNumber,
    authorizedFTE: apiPosition.fte || apiPosition.authorizedFTE,
    status: (apiPosition.operationalStatus?.toLowerCase() || 'active') as 'active' | 'inactive' | 'filled' | 'vacant' | 'frozen',
    createdAt: apiPosition.createdAt || new Date().toISOString(),
    updatedAt: apiPosition.updatedAt || apiPosition.createdAt || new Date().toISOString(),
  }
}

function StaffingAndPlantillaTab({ staffingSearch, unitId }: StaffingAndPlantillaTabProps) {
  const [searchValue, setSearchValue] = useState<string>(staffingSearch || '')
  const [selectedSubUnitId, setSelectedSubUnitId] = useState<string | null>(null)

  const { data: positions = [] } = useAllPositions()
  const { data: units = [] } = useOrgUnits()

  const filteredPositions = useMemo(() => {
    if (!unitId) return positions
    return positions.filter((p) => p.orgUnitId === unitId)
  }, [positions, unitId])

  const subUnits = useMemo(() => {
    if (!unitId) return []
    return units.filter((u) => u.parentId === unitId)
  }, [units, unitId])

  const displayPositions = useMemo(() => {
    // API positions before transformation
    const apiPositions = filteredPositions as any[]

    let results = apiPositions

    if (selectedSubUnitId) {
      results = results.filter((p) => p.officeId === selectedSubUnitId || p.orgUnitId === selectedSubUnitId)
    }

    return results
      .filter((p) =>
        p.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchValue.toLowerCase()) ||
        (
          typeof p.salaryGrade === 'string'
            ? p.salaryGrade.toLowerCase().includes(searchValue.toLowerCase())
            : p.salaryGrade?.name
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())
        ),
      )
      .map(mapApiPositionToTablePosition) as TablePosition[]
  }, [filteredPositions, searchValue, selectedSubUnitId])

  // Map units to the format expected by createPositionColumns
  const tableUnits = units.map((unit) => ({
    id: unit.id,
    name: unit.name,
    code: unit.code,
    type: (unit.category || 'Support') as 'Oversight' | 'Delivery' | 'Support',
    description: unit.address,
    parentId: unit.parentId,
    status: unit.status as 'active' | 'inactive',
  }))

  const columns = createPositionColumns([] as MetaActions, tableUnits)

  return (
    <div className="space-y-6 pt-4">
      <PlantillaKPICards />

      <Card className="shadow-sm bg-card border border-default-200">
        <CardHeader className="py-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <BriefcaseIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-default-900">Plantilla Position Library</CardTitle>
                <p className="text-[10px] font-medium text-default-400 uppercase tracking-wider mt-0.5">Authorized Items per DBM Personal Services Itemization</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 px-3 gap-2 text-default-700 font-medium text-xs">
                <Upload className="h-3.5 w-3.5" /> Batch Import (PSI)
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <TemplateTable
            columns={columns}
            data={displayPositions}
            actions={[] as MetaActions}
            readonly={false}
            toolbar={() => (
              <PositionToolbar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                actions={[] as MetaActions}
                selectedOrgUnitId={unitId ?? undefined}
                subUnits={subUnits}
                selectedSubUnitId={selectedSubUnitId}
                onSubUnitChange={setSelectedSubUnitId}
              />
            )}
            forTab
            fixedPageSize={11}
          />
        </CardContent>
      </Card>

      <OrganizationalStructureDialogManager />
    </div>
  )
}

export default StaffingAndPlantillaTab