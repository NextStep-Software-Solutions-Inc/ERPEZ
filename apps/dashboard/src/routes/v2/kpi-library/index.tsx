/**
 * KPI Indicator Library Layout
 * Main layout component using PageContainerDashtail with URL-based tab navigation
 * Lazy-loads tab content based on URL search param (?tab=)
 */

import { Suspense, lazy } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { PageContainerDashtail } from '@/components/v2'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { BarChart2 } from 'lucide-react'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'
import {
  KPI_LIBRARY_TABS,
  kpiLibrarySearchSchema,
  type KpiLibraryTab,
} from './constants'

// Lazy load tab components directly from the feature pages
const MasterKpiPage = lazy(() =>
  import('@/features/planning/master-kpi/pages/MasterKpiPage').then((m) => ({
    default: m.MasterKpiPage,
  })),
)

const RatingScalesPage = lazy(() =>
  import(
    '@/features/planning/rating-scale-template/pages/RatingScaleTemplatePage'
  ).then((m) => ({
    default: m.RatingScaleTemplatePage,
  })),
)

const KpiMeasurementConfiguratorPage = lazy(() =>
  import(
    '@/features/planning/kpi-measurement-configurator/pages/KpiMeasurementConfiguratorPage'
  ).then((m) => ({
    default: m.KpiMeasurementConfiguratorPage,
  })),
)

/**
 * Search params validation using Zod
 * Ensures type-safe URL parameter handling
 */
const searchSchema = kpiLibrarySearchSchema

export const Route = createFileRoute('/v2/kpi-library/')({
  component: KpiIndicatorLibraryLayout,
  validateSearch: searchSchema,
})

/**
 * Render appropriate component based on active tab
 */
function renderTabContent(activeTab: KpiLibraryTab) {
  switch (activeTab) {
    case 'master-kpi':
      return <MasterKpiPage />
    case 'rating-scales':
      return <RatingScalesPage />
    case 'kpi-measurement-configurator':
      return <KpiMeasurementConfiguratorPage />
    default:
      return <MasterKpiPage />
  }
}

function KpiIndicatorLibraryLayout() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/v2/kpi-library/' })

  // derive activeTab from the URL search params (default to 'master-kpi')
  const activeTab = (search?.tab ?? 'master-kpi') as KpiLibraryTab

  /**
   * Handle tab change with URL search param synchronization
   * Updates URL with new tab param using TanStack Router's navigate
   * Preserves existing search params while updating the tab
   */
  const handleTabChange = (tabId: string) => {
    const tabValue = tabId as KpiLibraryTab
    navigate({
      to: '/v2/kpi-library',
      search: (prev: Record<string, any> | undefined) => ({
        ...(prev ?? {}),
        tab: tabValue,
      }),
      replace: false,
    })
  }
  const tabLoadingFallback = (
    <div className="flex items-center justify-center py-12">
      <Spinner size="md" />
    </div>
  )

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.Kpi.View}
      message="You do not have permission to access the KPI Library."
    >
      <div className="w-full space-y-6 pb-10">
        {/* Header - match Fiscal Year & Policies styling */}
        <><Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
    <CardHeader>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <CardTitle className="text-3xl">Key Performance Indicator Library</CardTitle>
          <CardDescription className="text-base">
            Central repository for defining Key Performance Indicators, rating scales, and measurement configurations
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
            <BarChart2 className="h-3.5 w-3.5 mr-1.5" /> KPI Library
          </Badge>
        </div>
      </div>
    </CardHeader>
  </Card><PageContainerDashtail
    mode="tabbed"
    tabs={KPI_LIBRARY_TABS.map((tab) => ({
      id: tab.id,
      label: tab.label,
    }))}
    activeTab={activeTab}
    onTabChange={handleTabChange}
    contentType="cards"
    tabVariant="underline"
  >
      {/* Lazy-loaded Tab Content */}
      <Suspense fallback={tabLoadingFallback}>
        {renderTabContent(activeTab)}
      </Suspense>
    </PageContainerDashtail></>
      </div>
    </RoutePermissionGuard>
  )
}
