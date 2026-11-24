import { useSearch } from '@tanstack/react-router'
import { Suspense, lazy, useState } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import { SkeletonTable } from '@/components/SkeletonLoader'
import SettingsTab from './SettingsTab'

const StructuralManagementTab = lazy(() => import('./StructuralManagementTab'))
const StaffingAndPlantillaTab = lazy(() => import('./StaffingAndPlantillaTab'))
const PersonnelReportingTab = lazy(() => import('./PersonnelReportingTab'))
const OperationalRolesTab = lazy(() => import('./OperationalRolesTab'))

export default function OrganizationStructurePage() {
  const search = useSearch({ from: '/v2/_planning/organization/' })
  const { structuralSearch, staffingSearch } = search

  // NEW: Shared state for the selected Office/Unit
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)

  return (
    <Suspense fallback={<SkeletonTable columns={5} rows={15} />}>
      <TabsContent value="structural-management">
        {/* Tab 1 SETS the unit */}
        <StructuralManagementTab 
          structuralSearch={structuralSearch} 
          onSelectUnit={setSelectedUnitId} 
          selectedUnitId={selectedUnitId}
        />
      </TabsContent>
      
      <TabsContent value="staffing-and-plantilla">
        {/* Tab 2 FILTERS by the unit set in Tab 1 */}
        <StaffingAndPlantillaTab 
          staffingSearch={staffingSearch} 
        />
      </TabsContent>
      
      <TabsContent value="personnel-reporting">
        {/* Tab 3 defines reporting lines FOR that unit */}
        <PersonnelReportingTab />
      </TabsContent>

      <TabsContent value="operational-roles">
        {/* Tab 4 manages ERP operational business roles per member */}
        <OperationalRolesTab />
      </TabsContent>
      
      <TabsContent value="settings">
        {/* Tab 5 defines settings FOR that unit */}
        <SettingsTab 
          staffingSearch={staffingSearch} 
          unitId={selectedUnitId}
        />
      </TabsContent>
    </Suspense>
  )
}
