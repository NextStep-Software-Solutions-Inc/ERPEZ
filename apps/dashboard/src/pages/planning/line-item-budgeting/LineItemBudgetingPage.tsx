/**
 * Line-Item Budgeting (LIB) Module - Main Page
 * Layer 4: Budget & Operations Sub-Module
 *
 * Orchestration of Line-Item Budgeting Core Engine for Budget & Operations
 * Bridges operational planning (OPCR/WFP) with procurement
 */

import React from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'
import { FundClusterTab } from '../../../features/planning/agency-master-budget/tabs/FundClusterTab'
import { LineItemBudgetTab } from './tabs/LineItemBudgetTab'
import { CeilingManagementTab } from './tabs/CeilingManagementTab'
import { DepartmentCeilingTab } from './tabs/DepartmentCeilingTab'
// import { RealignmentTab } from '../../../features/planning/line-item-budgeting/realignment'
// import { RealignmentProjectTab } from './tabs/RealignmentProjectTab'
import type { LineItemBudgetingTab } from '@/routes/v2/line-item-budgeting'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RealignmentTab } from './tabs/RealignmentTab'

/**
 * Tab configuration with metadata
 */
const TAB_CONFIG: Array<{
  id: LineItemBudgetingTab
  label: string
  description: string
  icon: string
}> = [
  {
    id: 'master-budget',
    label: 'Fund Source',
    description: 'Agency Fund Source Setup - The Source of Truth',
    icon: '📋',
  },
  {
    id: 'ceiling-management',
    label: 'Ceiling Management',
    description: 'Ceiling Management & Allocation Dashboard for Budget Office',
    icon: '👥',
  },
  {
    id: 'department-ceiling',
    label: 'Dept. Ceilings',
    description: 'Assign Budget Ceilings to Departments (Sub-Allocation)',
    icon: '🏢',
  },
  {
    id: 'line-item-budget',
    label: 'Line-Item Budget',
    description: 'Dynamic Line-Item Budget with Real-Time Aggregation',
    icon: '📊',
  },
  // {
  //   id: 'subdu-libs',
  //   label: 'Sub-DU Lib Management',
  //   description: 'Review and Approve Sub-DU LIB Submissions',
  //   icon: '💰',
  // },
  {
    id: 'realignment',
    label: 'Realignment',
    description: 'Budget Realignment & Modification Workflow',
    icon: '↔️',
  },
]

/**
 * Component mapping for tabs
 * Maps tab identifiers to their corresponding React components
 */
const TAB_COMPONENTS: Record<LineItemBudgetingTab, React.ComponentType> = {
  'line-item-budget': LineItemBudgetTab,
  'master-budget': FundClusterTab,
  'ceiling-management': CeilingManagementTab,
  'department-ceiling': DepartmentCeilingTab,
  realignment: RealignmentTab,
}

export default function LineItemBudgetingPage() {
  const navigate = useNavigate({ from: '/v2/line-item-budgeting' })
  const { tab } = useSearch({ from: '/v2/line-item-budgeting' })

  const activeTab = TAB_CONFIG.some((t) => t.id === tab) ? tab : 'master-budget'

  const handleTabChange = (newTab: LineItemBudgetingTab) => {
    navigate({
      search: (prev) => ({
        ...prev,
        libActivityId: undefined,
        libId: undefined,
        officeId: undefined,
        wfpObjectiveActivityId: undefined,
        opcrActivityId: undefined,
        tab: newTab,
        ...(newTab !== 'realignment'
          ? {
              fiscalYearId: undefined,
              selectedYear: undefined,
              source: undefined,
            }
          : {}),
        ...(newTab === 'line-item-budget'
          ? {
              pageNumber: prev.pageNumber,
              pageSize: prev.pageSize,
            }
          : {}),
      }),
    })
  }

  // compute number of tabs to distribute equally across the TabsList
  const tabsCount = TAB_CONFIG.length

  return (
    <div className="w-full space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl">
                Line-Item Budgeting (LIB)
              </CardTitle>
              <CardDescription className="text-base">
                Centralized reference library for standardized budgeting data
                used in planning and procurement
              </CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
              <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Reference Library
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Manage and configure budgeting reference datass
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(newTab) =>
              handleTabChange(newTab as LineItemBudgetingTab)
            }
            className="w-full"
          >
            {/* Tab Navigation */}
            <TabsList
              // Use horizontal scroll on very small screens, switch to a responsive grid on sm+
              className="flex gap-2 overflow-x-auto pb-2 sm:grid sm:w-full sm:gap-2 sm:bg-muted/50 sm:p-2 sm:mb-6"
              // Make columns equal to number of tabs on sm+ so they distribute evenly and don't overlap
              style={{
                gridTemplateColumns: `repeat(${tabsCount}, minmax(0, 1fr))`,
              }}
            >
              {TAB_CONFIG.map((tabConfig) => (
                <TabsTrigger
                  key={tabConfig.id}
                  value={tabConfig.id}
                  className="whitespace-nowrap text-xs sm:text-sm"
                  title={tabConfig.description}
                >
                  <span className="mr-2">{tabConfig.icon}</span>
                  <span className="hidden sm:inline">{tabConfig.label}</span>
                  <span className="sm:hidden">{tabConfig.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Contents */}
            {TAB_CONFIG.map((tabItem) => {
              const TabComponent = TAB_COMPONENTS[tabItem.id]
              return (
                <TabsContent
                  key={tabItem.id}
                  value={tabItem.id}
                  className="space-y-4"
                >
                  <TabComponent />
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
