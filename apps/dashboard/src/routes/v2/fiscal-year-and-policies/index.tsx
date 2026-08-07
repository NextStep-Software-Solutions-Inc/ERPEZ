import { createFileRoute, useSearch, useNavigate } from '@tanstack/react-router'
import { Suspense, lazy, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { PageContainerDashtail } from '@/components/v2'
import { PolicySidebarLayout } from '@/features/planning/fiscal-year-and-policies/components/layout/PolicySidebarLayout'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  POLICY_DOMAINS,
  POLICY_TABS,
  getDomainByTab,
  getTabsByDomain,
  fiscalYearPoliciesSearchSchema,
  type PolicyDomain,
} from './_constants'

/**
 * Sub-navigation component that renders to the right of main tabs
 */
function PolicySubNavigation({
  activeDomain,
  activeTab,
  onNavigate,
}: {
  activeDomain: PolicyDomain
  activeTab: string
  onNavigate: any
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const availableSubFeatures = getTabsByDomain(activeDomain)

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-sm hover:bg-primary"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Show Labels' : 'Hide Labels'}
        >
          {!isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </Button>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pr-2">
          {availableSubFeatures.map((sub) => {
            const Icon = sub.icon
            const isActive = activeTab === sub.id

            const navItem = (
              <Button
                key={sub.id}
                variant={isActive ? 'soft' : 'ghost'}
                size="sm"
                className={cn(
                  'h-8 gap-2 relative transition-all duration-200 px-2.5',
                  isActive
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'text-muted-foreground hover:text-foreground',
                  !isCollapsed && 'min-w-[120px] justify-start',
                )}
                onClick={() =>
                  onNavigate({
                    search: (prev: any) => ({ ...prev, tab: sub.id }),
                  })
                }
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    className="text-xs font-medium truncate"
                  >
                    {sub.label}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeSubTabUnderline"
                    className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Button>
            )

            if (isCollapsed) {
              return (
                <Tooltip key={sub.id} delayDuration={0}>
                  <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {sub.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return navItem
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}

/**
 * Lazy load sub-feature pages from their respective modular folders
 */
const FiscalYearManagementPage = lazy(
  () =>
    import(
      '@/features/planning/fiscal-year-and-policies/fiscal-year-management/pages/FiscalYearManagementPage'
    ),
)
const EconomicIndicatorsPage = lazy(() =>
  import(
    '@/features/planning/economic-indicators/pages/EconomicIndicatorsPage'
  ).then((module) => ({ default: module.EconomicIndicatorsPage })),
)
const DataMigrationsPage = lazy(
  () =>
    import(
      '@/features/planning/fiscal-year-and-policies/data-migrations/pages/DataMigrationsPage'
    ),
)
const BudgetCallPage = lazy(
  () =>
    import(
      '@/features/planning/fiscal-year-and-policies/budget-call/pages/BudgetCallPage'
    ),
)
const ProcurementThresholdsPage = lazy(
  () =>
    import(
      '@/features/planning/fiscal-year-and-policies/procurement-thresholds/pages/ProcurementThresholdsPage'
    ),
)
const WorkflowMatricesPage = lazy(
  () =>
    import(
      '@/features/planning/fiscal-year-and-policies/annual-signatory-matrix/pages/AnnualSignatoryMatrixPage'
    ),
)
const SpmsFunctionConfigPage = lazy(() =>
  import(
    '@/features/planning/spms-function-config/pages/SpmsFunctionConfigPage'
  ).then((module) => ({ default: module.SpmsFunctionConfigPage })),
)
const GeneralRatingScalePage = lazy(
  () =>
    import(
      '@/features/planning/fiscal-year-and-policies/general-rating-scale/pages/GeneralRatingScalePage'
    ),
)

export const Route = createFileRoute('/v2/fiscal-year-and-policies/')({
  component: FiscalYearAndPoliciesPage,
  validateSearch: fiscalYearPoliciesSearchSchema,
})

/**
 * Render appropriate component based on active tab
 */
function renderTabContent(activeTab: string) {
  switch (activeTab) {
    case 'fiscal-year-management':
      return <FiscalYearManagementPage />
    case 'economic-indicators':
      return <EconomicIndicatorsPage />
    case 'data-migrations':
      return <DataMigrationsPage />
    case 'budget-call':
      return <BudgetCallPage />
    case 'procurement-thresholds':
      return <ProcurementThresholdsPage />
    case 'workflow-matrices':
      return <WorkflowMatricesPage />
    case 'spms-function-weights':
      return <SpmsFunctionConfigPage />
    case 'rating-scale':
      return <GeneralRatingScalePage />
    default:
      return <FiscalYearManagementPage />
  }
}

function FiscalYearAndPoliciesPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/v2/fiscal-year-and-policies/' })
  const activeTab = (search.tab as string) || 'fiscal-year-management'
  const activeDomain = getDomainByTab(activeTab)

  /**
   * Handle domain change via Top Tabs
   * Navigates to the first sub-feature of that domain
   */
  const handleDomainChange = (domainId: string) => {
    const domainValue = domainId as PolicyDomain
    const firstTab = Object.values(POLICY_TABS).find(
      (tab) => tab.domain === domainValue,
    )?.id

    navigate({
      to: '/v2/fiscal-year-and-policies',
      search: (prev) => ({
        tab: firstTab || 'fiscal-year-management',
        page: typeof prev.page === 'string' ? Number(prev.page) : prev.page,
        limit: typeof prev.limit === 'string' ? Number(prev.limit) : prev.limit,
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
    <div className="w-full space-y-6 pb-10">
      {/* Header - match Direct Acquisition Request styling */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Fiscal Year & Policies</CardTitle>
              <CardDescription className="text-base">
                Manage institutional fiscal year configurations, financial policies, and governance matrix
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <Calendar className="h-3.5 w-3.5 mr-1.5" /> Fiscal Year
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <PageContainerDashtail
        mode="tabbed"
        activeTab={activeDomain}
        onTabChange={handleDomainChange}
        tabs={POLICY_DOMAINS.map((domain) => ({
          id: domain.id,
          label: domain.label,
          description: domain.description,
        }))}
        afterTabs={
          <PolicySubNavigation
            activeDomain={activeDomain}
            activeTab={activeTab}
            onNavigate={navigate}
          />
        }
      >
        <PolicySidebarLayout activeDomain={activeDomain} activeTab={activeTab}>
          <Suspense fallback={tabLoadingFallback}>
            {renderTabContent(activeTab)}
          </Suspense>
        </PolicySidebarLayout>
      </PageContainerDashtail>
    </div>
  )
}
