import { Suspense, lazy, useMemo, type ReactNode } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FunctionCategory } from '@/features/planning/master-kpi/types'
import { getCategoryVisuals } from '@/pages/planning/commitments/utils/functions'
import type { KPIAssignment } from '@/features/planning/kpi-assignment/types'

import { useNavigate, useSearch } from '@tanstack/react-router'

// Lazy load all tab content components for better performance
const KpiAssignedContent = lazy(() =>
  import('./KpiAssignedContent').then((mod) => ({
    default: mod.KpiAssignedContent,
  })),
)

const KpiIndicatorContent = lazy(() =>
  import('./KpiIndicatorContent').then((mod) => ({
    default: mod.KpiIndicatorContent,
  })),
)

type TabType = 'assigned' | 'indicator'

interface TabConfig {
  readonly id: TabType
  readonly label: string
  readonly ariaLabel: string
}

interface StrategicTargetTabsContainerProps {
  readonly handleBackFromLevel4: () => void
  readonly selectedOffice: { readonly id: string; readonly name: string } | null
  readonly kpiAssignments: KPIAssignment[]
  readonly isLoading: boolean
  readonly queryError: Error | null
  readonly fiscalYearId: string | null
  readonly functionCategory: FunctionCategory | null
  readonly onKPIAssignmentClick?: (kpiAssignmentId: string) => void
}

export function StrategicTargetTabsContainer({
  handleBackFromLevel4,
  selectedOffice,
  kpiAssignments,
  isLoading,
  queryError,
  fiscalYearId,
  functionCategory,
  onKPIAssignmentClick,
}: StrategicTargetTabsContainerProps): ReactNode {
  const navigate = useNavigate({ from: '/v2/commitments' })
  const search = useSearch({ from: '/v2/commitments/' })

  const currentTab: TabType =
    search.strategicTargetTabView === 'shoppable-kpis' ||
    search.strategicTargetTabView === 'KeyPerformanceIndicator'
      ? 'indicator'
      : 'assigned'

  const handleTabChange = (value: string) => {
    const tabType = value as TabType
    navigate({
      search: {
        ...search,
        strategicTargetTabView:
          tabType === 'indicator' ? 'shoppable-kpis' : 'kpiAssigned',
      },
    })
  }

  const categoryVisuals = useMemo(() => {
    return functionCategory &&
      Object.values(FunctionCategory).includes(functionCategory)
      ? getCategoryVisuals(functionCategory)
      : getCategoryVisuals(FunctionCategory.CORE)
  }, [functionCategory])

  const tabConfig: readonly TabConfig[] = useMemo(
    () => [
      {
        id: 'assigned',
        label: 'KPI Assigned',
        ariaLabel: 'View assigned KPIs',
      },
      {
        id: 'indicator',
        label: 'Shoppable KPIs',
        ariaLabel: 'View shoppable KPIs',
      },
    ],
    [],
  )

  const renderTabContent = (tabId: TabType): ReactNode => {
    const loadingFallback = (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-3 text-sm font-medium text-gray-600">
          Loading{' '}
          {tabId === 'assigned'
            ? 'assigned KPIs'
            : 'shoppable KPIs'}
          ...
        </span>
      </div>
    )

    switch (tabId) {
      case 'assigned':
        return (
          <Suspense fallback={loadingFallback}>
            <KpiAssignedContent
              kpiAssignments={kpiAssignments}
              isLoading={isLoading}
              queryError={queryError}
              onKPIAssignmentClick={onKPIAssignmentClick}
            />
          </Suspense>
        )
      case 'indicator':
        return (
          <Suspense fallback={loadingFallback}>
            <KpiIndicatorContent />
          </Suspense>
        )
      default:
        const exhaustiveCheck: never = tabId
        return exhaustiveCheck
    }
  }

  return (
    <div className="bg-white">
      <div className="w-full px-4 py-6">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={handleBackFromLevel4}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            aria-label="Back to function types"
            type="button"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Back to Functions</span>
          </button>
        </div>

        {/* Title Section with Function Type Badge */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-900">
                Strategic Targets
              </h2>
              <Badge
                className={`${categoryVisuals.badgeBgColor} ${categoryVisuals.badgeTextColor}`}
              >
                {categoryVisuals.title}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              {selectedOffice?.name} • Fiscal Year{' '}
              {fiscalYearId?.split('-')[0] || fiscalYearId}
            </p>
          </div>
        </div>

        {/* Tabs using shadcn/ui */}
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            {tabConfig.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                aria-label={tab.ariaLabel}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          {tabConfig.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              {renderTabContent(tab.id)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
