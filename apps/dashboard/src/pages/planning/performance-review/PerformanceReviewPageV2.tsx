/**
 * Performance Review – Main Page (v2)
 * Orchestrates all 5 workflow steps in a tab/stepper layout.
 * Pattern mirrors ProcurementLibraryPageV2.tsx
 */

import { Suspense, lazy } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { TrendingUp } from 'lucide-react'

const SelfRatingPage = lazy(() => import('./SelfRatingPage'))
const PMTWorkspacePage = lazy(() => import('./PMTWorkspacePage'))
const OutputWorkflowPage = lazy(() => import('./OutputWorkflowPage'))
const LogicEnginePage = lazy(() => import('./LogicEnginePage'))
const AgencyRankingPage = lazy(() => import('./AgencyRankingPage'))

const TAB_CONFIG = [
  {
    id: 'SelfRating',
    label: 'Self-Rating',
    description: 'Ratee assessment and OPCR selection',
    icon: '📝',
  },
  {
    id: 'PMTWorkspace',
    label: 'PMT Workspace',
    description: 'PMT review and finalization',
    icon: '🧑‍⚖️',
  },
  {
    id: 'OutputWorkflow',
    label: 'Output Workflow',
    description: 'Output summary and reporting',
    icon: '📊',
  },
  {
    id: 'LogicEngine',
    label: 'Logic Engine',
    description: 'Calculation and rating logic view',
    icon: '🧮',
  },
  {
    id: 'AgencyRanking',
    label: 'Agency Ranking',
    description: 'Finalized agency ranking dashboard',
    icon: '🏆',
  },
] as const

const TAB_COMPONENTS: Record<
  (typeof TAB_CONFIG)[number]['id'],
  React.ComponentType
> = {
  SelfRating: SelfRatingPage,
  PMTWorkspace: PMTWorkspacePage,
  OutputWorkflow: OutputWorkflowPage,
  LogicEngine: LogicEnginePage,
  AgencyRanking: AgencyRankingPage,
}

export default function PerformanceReviewPageV2() {
  const navigate = useNavigate({ from: '/v2/performance-review' })
  const { tab } = useSearch({ from: '/v2/performance-review' })

  const activeTab = tab

  const setActiveTab = (newTab: string) => {
    navigate({
      to: '/v2/performance-review',
      search: (prev) => ({
        ...prev,
        tab: newTab as (typeof TAB_CONFIG)[number]['id'],
        opcrId: undefined,
      }),
      replace: true,
    })
  }

  const tabLoadingFallback = (
    <div className="flex items-center justify-center py-12">
      <Spinner size="md" />
    </div>
  )

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <CardTitle className="text-3xl">Performance Review</CardTitle>
              <CardDescription className="text-base">
                Centralized OPCR performance assessment workflow for
                self-rating, PMT finalization, reporting, and ranking.
              </CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Performance
              Management
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Management</CardTitle>
          <CardDescription>
            Manage OPCR performance workflow tabs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5 gap-2 bg-muted/50 p-2 mb-6">
              {TAB_CONFIG.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="whitespace-nowrap text-xs sm:text-sm"
                  title={tab.description}
                >
                  <span className="hidden sm:inline mr-1">{tab.icon}</span>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <Suspense fallback={tabLoadingFallback}>
              {TAB_CONFIG.map((tab) => {
                const TabComponent = TAB_COMPONENTS[tab.id]
                return (
                  <TabsContent
                    key={tab.id}
                    value={tab.id}
                    className="space-y-4"
                  >
                    <TabComponent />
                  </TabsContent>
                )
              })}
            </Suspense>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
