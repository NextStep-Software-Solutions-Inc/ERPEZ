import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageContainer } from '@/components/PageContainer'
import { ItemMasterTab } from '@/components/features/planning/procurement-library/tabs/ItemMasterTab'
import { ModesOfProcurementTab } from '@/components/features/planning/procurement-library/tabs/ModesOfProcurementTab'
import { PriceCatalogueTab } from '@/components/features/planning/procurement-library/tabs/PriceCatalogueTab'
import { UnitOfMeasurementTab } from '@/components/features/planning/procurement-library/tabs/UnitOfMeasurementTab'
import { SuppliersTab } from '@/components/features/planning/procurement-library/tabs/SuppliersTab'
import { ProcurementActivitiesTab } from '@/components/features/planning/procurement-library/tabs/ProcurementActivitiesTab'
import { SettingsTab } from '@/components/features/planning/procurement-library/tabs/SettingsTab'

export default function ProcurementLibraryPage() {
  return (
    <PageContainer
      title="Procurement Library"
      description="Centralized reference library for standardized procurement data used in PPMP and APP planning."
      forTable
    >
      <Tabs defaultValue="item-master" className="w-full">
        <TabsList className="flex relative top-4 overflow-auto">
          <TabsTrigger value="item-master" className="whitespace-nowrap">Item Master</TabsTrigger>
          <TabsTrigger value="modes" className="whitespace-nowrap">Modes of Procurement</TabsTrigger>
          <TabsTrigger value="price-catalogue" className="whitespace-nowrap">Price Catalogue</TabsTrigger>
          <TabsTrigger value="uom" className="whitespace-nowrap">Unit of Measurement</TabsTrigger>
          <TabsTrigger value="suppliers" className="whitespace-nowrap">Suppliers</TabsTrigger>
          <TabsTrigger value="activities" className="whitespace-nowrap">Procurement Activities & Timeline</TabsTrigger>
          <TabsTrigger value="settings" className="whitespace-nowrap">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="item-master" className="space-y-4">
          <ItemMasterTab />
        </TabsContent>

        <TabsContent value="modes" className="space-y-4">
          <ModesOfProcurementTab />
        </TabsContent>

        <TabsContent value="price-catalogue" className="space-y-4">
          <PriceCatalogueTab />
        </TabsContent>

        <TabsContent value="uom" className="space-y-4">
          <UnitOfMeasurementTab />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <SuppliersTab />
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <ProcurementActivitiesTab />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
