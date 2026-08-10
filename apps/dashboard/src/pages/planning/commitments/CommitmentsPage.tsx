/**
 * Office Performance Commitment and Review (OPCR) Page
 * Leverages Dashtail UI design system for consistent visual design
 */

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
import { TooltipProvider } from '@/components/ui/tooltip'
import { Loader2, TrendingUp } from 'lucide-react'
import React, { Suspense, lazy } from 'react'
import { commitmentSearchSchema } from '@/routes/v2/commitments'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
// Lazy load tab components
const StrategicTargetTab = lazy(() => import('./tabs/StrategicTargetTab'))
const OPCRTab = lazy(() => import('./tabs/OPCRTab'))
const ApprovalWorkflowTab = lazy(() => import('./tabs/ApprovalWorkflowTab'))
const ConsolidateOPCRTab = lazy(
  () => import('@/features/planning/opcr/consolidation/ConsolidateOPCRTab'),
)

/**
 * Fallback loading component for lazy-loaded tabs
 */
const TabLoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading tab content...</p>
    </div>
  </div>
)

/**
 * Tab configuration with metadata
 */
const TAB_CONFIG = [
  {
    id: 'strategicTarget',
    label: 'Strategic Target',
    description: 'Manage strategic targets and objectives',
    icon: '🎯',
  },
  {
    id: 'opcr',
    label: 'OPCR',
    description: 'Manage Office Performance Commitment and Review records',
    icon: '📋',
  },
  {
    id: 'consolidate',
    label: 'Consolidate OPCR',
    description: 'Consolidate and review Master KPI data by office allocation',
    icon: '🔀',
  },
  {
    id: 'approvalWorkflow',
    label: 'Approval Workflow',
    description: 'Configure approval processes and workflows',
    icon: '✅',
  },
]

/**
 * Component mapping for tabs
 */
const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  strategicTarget: StrategicTargetTab,
  opcr: OPCRTab,
  consolidate: ConsolidateOPCRTab,
  approvalWorkflow: ApprovalWorkflowTab,
}

type CommitmentTabs = z.infer<typeof commitmentSearchSchema>['tab']

function CommitmentsPage() {
  const navigate = useNavigate({ from: '/v2/commitments' })
  const search = useSearch({ from: '/v2/commitments/' })
  const activeTab = search.tab
  const TEMP_SUB_OFFICE_ID = import.meta.env.VITE_TEMP_SUB_OFFICE_ID
  const setActiveTab = (newTab: CommitmentTabs) => {
    navigate({
      search: {
        tab: newTab,
      },
      replace: true,
    })
  }

  const navigation = useNavigate({ from: '/v2/commitments' })

  const hasOfficeId = !!search.officeId

  const handleToggleOffice = () => {
    navigation({
      from: '/v2/commitments',
      search: (prev) => {
        if (hasOfficeId) {
          // Remove officeId if it exists
          const { officeId, ...rest } = prev
          return rest
        }
        // Add officeId if it doesn't exist and TEMP_SUB_OFFICE_ID is defined
        if (!TEMP_SUB_OFFICE_ID) {
          return prev
        }
        return { ...prev, officeId: TEMP_SUB_OFFICE_ID }
      },
    })
  }

  return (
    <TooltipProvider>
      <div className="w-full space-y-6">
        {/* Header Card */}
        <Card className="bg-linear-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl">
                  Office Performance Commitment and Review (OPCR)
                </CardTitle>
                <CardDescription className="text-base">
                  Manage commitments, strategic targets, activities, and
                  approval workflows for OPCR
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="h-fit px-3 py-1 font-semibold"
              >
                <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Performance
                Management
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Manage and configure commitments data
                </CardDescription>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                <Button
                  onClick={handleToggleOffice}
                  variant={hasOfficeId ? 'default' : 'outline'}
                >
                  {hasOfficeId ? 'Remove Office Filter' : 'Toggle Office'}
                </Button>
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as CommitmentTabs)}
              className="w-full"
            >
              {/* Tab Navigation */}
              <TabsList className="grid w-full grid-cols-4 gap-2 bg-muted/50 p-2 mb-6">
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

              {/* Tab Contents */}
              {TAB_CONFIG.map((tab) => {
                const TabComponent = TAB_COMPONENTS[tab.id]
                return (
                  <TabsContent
                    key={tab.id}
                    value={tab.id}
                    className="space-y-4"
                  >
                    <Suspense fallback={<TabLoadingFallback />}>
                      <TabComponent />
                    </Suspense>
                  </TabsContent>
                )
              })}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}

export default CommitmentsPage
