/**
 * KPI Indicator Library Layout
 * Main layout component using PageContainerDashtail with URL-based tab navigation
 * Lazy-loads tab content based on URL search param (?tab=)
 */

import { Suspense, lazy } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { PageContainerDashtail } from '@/components/v2'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
  const getTabLoadingFallback = (tab: KpiLibraryTab) => {
    switch (tab) {
      case 'master-kpi':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="border-b">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-72" />
                  </div>
                  <Skeleton className="h-10 w-36" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex gap-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex justify-between pt-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case 'rating-scales':
        return (
          <Card>
            <CardHeader className="border-b-2">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-36" />
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="flex overflow-hidden h-[calc(100vh-280px)]">
                <div className="w-80 shrink-0 border-r p-4 space-y-3">
                  <Skeleton className="h-8 w-full" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
                <div className="flex-1 p-6 space-y-6">
                  <div className="flex justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-64" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                  </div>
                  <Skeleton className="h-28 w-full rounded-lg" />
                  <Skeleton className="h-48 w-full rounded-lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      case 'kpi-measurement-configurator':
        return (
          <div className="space-y-4">
            <Card className="p-4 space-y-4">
              <div className="flex flex-wrap gap-4 justify-between items-center">
                <Skeleton className="h-10 w-64" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </Card>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" />
          </div>
        )
    }
  }

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.Kpi.View}
      message="You do not have permission to access the KPI Library."
    >
      <div className="w-full space-y-6 pb-10">
        {/* Header - match Fiscal Year & Policies styling */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
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
        </Card>
        <PageContainerDashtail
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
          <Suspense fallback={getTabLoadingFallback(activeTab)}>
            {renderTabContent(activeTab)}
          </Suspense>
        </PageContainerDashtail>
      </div>
    </RoutePermissionGuard>
  )
}
