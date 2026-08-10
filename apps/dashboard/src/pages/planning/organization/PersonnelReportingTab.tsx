import { useMemo, useState } from 'react'
import {
  useOrgUnits,
} from './hooks/useOrgUnits'
import type { PersonnelReportingTabProps } from '@/components/features/planning/organizational-structure/types'
import PersonnelIncumbencyCard from './components/PersonnelIncumbencyCard'
import ReportingPanel from './components/ReportingPanel'
import PMTBodyDialog from '@/components/features/planning/organizational-structure/dialog/PMTBodyDialog'
import { OrganizationalStructureDialogManager } from '@/components/features/planning/organizational-structure'

function PersonnelReportingTab({ unitId }: PersonnelReportingTabProps) {
  const { data: units } = useOrgUnits()
  
  // Query hooks (personnel positions will be fetched inside the card)

  // Local state
  const [selectedReportingChainOfficeId, setSelectedReportingChainOfficeId] = useState<string | null>(null)
  const [isPMTDialogOpen, setIsPMTDialogOpen] = useState(false)
  const [isManualOverrideEnabled, setIsManualOverrideEnabled] = useState(false)
  
  // Extract organization UACS code (top-level org unit is the organization)
  const organizationUacsCode = useMemo(() => {
    const topLevelOrg = units?.find((u) => u.parentId === null)
    return topLevelOrg?.uacsCode || '100010100001'
  }, [units])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
      <PersonnelIncumbencyCard
        unitId={unitId}
        units={units || []}
        selectedReportingChainOfficeId={selectedReportingChainOfficeId}
      />

      <ReportingPanel
        units={units || []}
        unitId={unitId}
        selectedReportingChainOfficeId={selectedReportingChainOfficeId}
        onSelectReportingChainOffice={setSelectedReportingChainOfficeId}
        isManualOverrideEnabled={isManualOverrideEnabled}
        onManualOverrideChange={setIsManualOverrideEnabled}
        onOpenPMTDialog={() => setIsPMTDialogOpen(true)}
      />

      <PMTBodyDialog
        open={isPMTDialogOpen}
        onOpenChange={setIsPMTDialogOpen}
        organizationUacsCode={organizationUacsCode}
        allOrgUnits={units || []}
      />

      <OrganizationalStructureDialogManager />
    </div>
  )
}

export default PersonnelReportingTab