/**
 * Procurement Library Page - V2
 * Leverages Dashtail UI design system for consistent visual design
 */

import { useNavigate, useSearch } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Package as PackageIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { ItemMasterTab } from '@/components/features/planning/procurement-library/tabs/ItemMasterTab'
import { ModesOfProcurementTab } from '@/components/features/planning/procurement-library/tabs/ModesOfProcurementTab'
import { PriceCatalogueTab } from '@/components/features/planning/procurement-library/tabs/PriceCatalogueTab'
import { UnitOfMeasurementTab } from '@/components/features/planning/procurement-library/tabs/UnitOfMeasurementTab'
import { SuppliersTab } from '@/components/features/planning/procurement-library/tabs/SuppliersTab'
import { ProcurementActivitiesTab } from '@/components/features/planning/procurement-library/tabs/ProcurementActivitiesTab'
import { SettingsTab } from '@/components/features/planning/procurement-library/tabs/SettingsTab'

const CatalogMasterPage = lazy(() =>
  import('@/features/planning/ppmp/catalog/components/CatalogMasterPage').then(
    (module) => ({ default: module.CatalogMasterPage }),
  ),
)

/**
 * Tab configuration with metadata
 */
const TAB_CONFIG = [
  {
    id: 'ItemMaster',
    label: 'Item Master',
    description: 'Manage procurement items and inventory',
    icon: '📦',
  },
  {
    id: 'catalog',
    label: 'Catalog',
    description: 'Manage the PPMP catalog workspace',
    icon: '🗂️',
  },
  {
    id: 'Modes',
    label: 'Modes of Procurement',
    description: 'Define procurement methods',
    icon: '🔄',
  },
  {
    id: 'Pricing',
    label: 'Price Catalogue',
    description: 'Manage price listings',
    icon: '💰',
  },
  {
    id: 'UOM',
    label: 'Unit of Measurement',
    description: 'Configure units of measurement',
    icon: '📏',
  },
  {
    id: 'Suppliers',
    label: 'Suppliers',
    description: 'Manage supplier information',
    icon: '🏢',
  },
  {
    id: 'Activities',
    label: 'Procurement Activities & Timeline',
    description: 'Define procurement activities and timelines',
    icon: '⏱️',
  },
  {
    id: 'Settings',
    label: 'Settings',
    description: 'Manage categories and UNSPSC codes',
    icon: '⚙️',
  },
]

/**
 * Component mapping for tabs
 */
const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  'ItemMaster': ItemMasterTab,
  catalog: CatalogMasterPage,
  'Modes': ModesOfProcurementTab,
  'Pricing': PriceCatalogueTab,
  'UOM': UnitOfMeasurementTab,
  'Suppliers': SuppliersTab,
  'Activities': ProcurementActivitiesTab,
  'Settings': SettingsTab,
}

export default function ProcurementLibraryPageV2() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/v2/procurement-library' })

  const { tab } = search

  const setActiveTab = (newTab: string) => {
    navigate({
      to: `/v2/procurement-library`,
      search: { tab: newTab as typeof tab },
      replace: true,
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl">Procurement Library</CardTitle>
              <CardDescription className="text-base">
                Centralized reference library for standardized procurement data used in PPMP and APP planning
              </CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
              <PackageIcon className="h-3.5 w-3.5 mr-1.5" /> Reference Library
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage and configure procurement reference data</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation */}
            <div className="w-full overflow-x-auto pb-1 mb-6">
              <TabsList className="inline-flex h-auto w-auto min-w-full justify-start gap-1.5 bg-muted/50 p-1.5 rounded-lg">
                {TAB_CONFIG.map((tab) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="shrink-0 px-3.5 py-2 text-xs sm:text-sm font-medium whitespace-nowrap rounded-md"
                    title={tab.description}
                  >
                    <span className="mr-1.5">{tab.icon}</span>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Contents */}
            {TAB_CONFIG.map((tab) => {
              const TabComponent = TAB_COMPONENTS[tab.id]
              return (
                <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                  {/* Tab content */}
                  {TabComponent &&
                    (tab.id === 'catalog' ? (
                      <Suspense
                        fallback={
                          <div className="flex h-64 items-center justify-center">
                            <Spinner size="lg" />
                          </div>
                        }
                      >
                        <TabComponent />
                      </Suspense>
                    ) : (
                      <TabComponent />
                    ))}
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
