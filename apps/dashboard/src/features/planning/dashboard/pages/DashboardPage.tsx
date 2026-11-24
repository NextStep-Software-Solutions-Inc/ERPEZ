/**
 * Planning Dashboard Overview Page
 * 
 * Main dashboard page for the Planning module showing executive KPIs, performance charts,
 * budget programming, procurement readiness, and actionable attention items.
 * 
 * @module features/planning/dashboard/pages/DashboardPage
 */

import { useState, useEffect } from 'react'
import { PageContainerDashtail } from '@/components/v2/PageContainerDashtail'
import { useDashboardRole } from '@/hooks/useDashboardRole'
import { usePlanningDashboard } from '../hooks/usePlanningDashboard'
import { KPICards } from '../components/KPICards'
import { DashboardFilters } from '../components/DashboardFilters'
import { OPCRLineChart } from '../components/charts/OPCRLineChart'
import { KPIClassification } from '../components/charts/KPIClassification'
import { UACSObligation } from '../components/charts/UACSObligation'
import { PPMPConsolidationChart } from '../components/charts/PPMPConsolidationChart'
import { AppProcurementReadiness } from '../components/charts/AppProcurementReadiness'
import { PlanningAttentionRequired } from '../components/PlanningAttentionRequired'
import { LayoutDashboard, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Main Dashboard Page Component
 */
export default function DashboardPage() {
  const { isPlanningUser, canAccessGlobalData, departmentId: userDepartmentId } = useDashboardRole()

  const [fiscalYear, setFiscalYear] = useState<number>(new Date().getFullYear())
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null)

  // Auto-set department filter for office users
  useEffect(() => {
    if (!isPlanningUser && userDepartmentId && selectedDeptId !== userDepartmentId) {
      setSelectedDeptId(userDepartmentId)
    }
  }, [isPlanningUser, userDepartmentId, selectedDeptId])

  // Fetch real analytics data
  const {
    fiscalYears,
    departments,
    summary,
    opcrChartData,
    departmentBudgetDistribution,
    ppmpConsolidationData,
    uacsObligationData,
    appProcurementReadinessData,
    kpiClassificationData,
    attentionItems,
    isLoading,
    refetch,
  } = usePlanningDashboard(fiscalYear, selectedDeptId)

  // Sync initial fiscal year once loaded from database
  useEffect(() => {
    if (fiscalYears.length > 0 && !fiscalYears.some((fy) => fy.year === fiscalYear)) {
      const activeFY = fiscalYears.find((fy) => fy.status?.toLowerCase() === 'active') || fiscalYears[0]
      if (activeFY) {
        setFiscalYear(activeFY.year)
      }
    }
  }, [fiscalYears, fiscalYear])

  const handleFiscalYearChange = (year: number) => {
    setFiscalYear(year)
  }

  const handleDepartmentChange = (deptId: string | null) => {
    setSelectedDeptId(deptId)
  }

  return (
    <PageContainerDashtail
      title="Planning Dashboard Overview"
      titleIcon={<LayoutDashboard className="h-6 w-6 text-blue-600" />}
      description="Strategic performance, budget programming, and procurement readiness"
      headerSize="default"
      containerClassName="p-6 bg-gray-50/60"
    >
      <div className="space-y-8">
        {/* ── SECTION 1: GLOBAL FILTERS ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <DashboardFilters
            fiscalYear={fiscalYear}
            fiscalYears={fiscalYears}
            departmentId={selectedDeptId}
            departments={departments}
            showDepartmentFilter={canAccessGlobalData}
            onFiscalYearChange={handleFiscalYearChange}
            onDepartmentChange={handleDepartmentChange}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 self-end sm:self-center font-normal"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Data
          </Button>
        </div>

        {/* ── SECTION 2: EXECUTIVE SNAPSHOT ───────────────────────────────────── */}
        <section className="space-y-2.5">
          <KPICards summary={summary} isLoading={isLoading} />
        </section>

        {/* ── SECTION 3: PLANNING PERFORMANCE ─────────────────────────────────── */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Performance &amp; Commitments
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OPCRLineChart data={opcrChartData} isLoading={isLoading} />
            <KPIClassification data={kpiClassificationData} isLoading={isLoading} />
          </div>
        </section>

        {/* ── SECTION 4: BUDGET PROGRAMMING ───────────────────────────────────── */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Budget Allocation &amp; Programming
          </h3>

          <UACSObligation data={uacsObligationData} isLoading={isLoading} />
        </section>

        {/* ── SECTION 5: PROCUREMENT READINESS ────────────────────────────────── */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Procurement Readiness
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PPMPConsolidationChart data={ppmpConsolidationData} isLoading={isLoading} />
            <AppProcurementReadiness data={appProcurementReadinessData} isLoading={isLoading} />
          </div>
        </section>

        {/* ── SECTION 6: OPERATIONAL ATTENTION REQUIRED ─────────────────────────── */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Operational Summary
          </h3>
          <PlanningAttentionRequired
            items={attentionItems}
            fiscalYear={fiscalYear}
            isLoading={isLoading}
          />
        </section>

        {/* ── Role-based Information Banner ──────────────────────────────────── */}
        {isPlanningUser ? (
          <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-lg flex items-center justify-between">
            <p className="text-xs text-blue-900 font-normal">
              <span className="font-semibold">Planning Office View:</span> Displaying {selectedDeptId ? 'filtered' : 'institutional'} data
              {selectedDeptId && ` for ${departments.find((d) => d.id === selectedDeptId)?.name || 'selected department'}`}.
              Use the organization filter above to scope analytics by office.
            </p>
          </div>
        ) : (
          <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-lg">
            <p className="text-xs text-gray-600 font-normal">
              <span className="font-semibold">Department View:</span> You are viewing data scoped to your assigned department.
            </p>
          </div>
        )}
      </div>
    </PageContainerDashtail>
  )
}
