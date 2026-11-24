import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OfficeTypesTab } from './OfficeTypesTab'
import { OfficeCategoriesTab } from './OfficeCategoriesTab'
import { AdministrativeLevelsTab } from './AdministrativeLevelsTab'
import { ProcurementWorkflowsTab } from './ProcurementWorkflowsTab'
import { SatelliteClustersTab } from './SatelliteClustersTab'
import { MultiSiteConfigurationTab } from './MultiSiteConfigurationTab'

export function StructureManagementSettings() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="multi-site">
        <TabsList className="grid-cols-6">
          <TabsTrigger value="multi-site">Multi-Site</TabsTrigger>
          <TabsTrigger value="satellite-clusters">Clusters</TabsTrigger>
          <TabsTrigger value="admin-levels">Admin Levels</TabsTrigger>
          <TabsTrigger value="office-types">Office Types</TabsTrigger>
          <TabsTrigger value="office-categories">Categories</TabsTrigger>
          <TabsTrigger value="procurement-workflows">Procurement</TabsTrigger>
        </TabsList>

        <MultiSiteConfigurationTab />
        <SatelliteClustersTab />
        <AdministrativeLevelsTab />
        <OfficeTypesTab />
        <OfficeCategoriesTab />
        <ProcurementWorkflowsTab />
      </Tabs>
    </div>
  )
}
