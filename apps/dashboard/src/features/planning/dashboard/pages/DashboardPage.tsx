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
import { LayoutDashboard, RefreshCw, Info, Building2 } from 'lucide-react'
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
      titleIcon={<LayoutDashboard className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
      description="Strategic performance, budget programming, and procurement readiness"
      headerSize="default"
      containerClassName="p-4 sm:p-6 bg-slate-50/50 dark:bg-background min-h-screen"
      contentClassName="pt-5"
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
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs bg-card hover:bg-muted text-foreground border-border shadow-2xs self-end sm:self-center font-medium h-9 px-3.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* ── SECTION 2: EXECUTIVE SNAPSHOT ───────────────────────────────────── */}
        <section className="space-y-2.5">
          <KPICards summary={summary} isLoading={isLoading} />
        </section>

        {/* ── SECTION 3: PLANNING PERFORMANCE ─────────────────────────────────── */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <span className="h-3.5 w-1 rounded-full bg-blue-600 dark:bg-blue-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Performance &amp; Commitments
            </h3>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OPCRLineChart data={opcrChartData} isLoading={isLoading} />
            <KPIClassification data={kpiClassificationData} isLoading={isLoading} />
          </div>
        </section>

        {/* ── SECTION 4: BUDGET PROGRAMMING ───────────────────────────────────── */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <span className="h-3.5 w-1 rounded-full bg-amber-500 dark:bg-amber-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Budget Allocation &amp; Programming
            </h3>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          <UACSObligation data={uacsObligationData} isLoading={isLoading} />
        </section>

        {/* ── SECTION 5: PROCUREMENT READINESS ────────────────────────────────── */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <span className="h-3.5 w-1 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Procurement Readiness
            </h3>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PPMPConsolidationChart data={ppmpConsolidationData} isLoading={isLoading} />
            <AppProcurementReadiness data={appProcurementReadinessData} isLoading={isLoading} />
          </div>
        </section>

        {/* ── SECTION 6: OPERATIONAL ATTENTION REQUIRED ─────────────────────────── */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <span className="h-3.5 w-1 rounded-full bg-rose-500 dark:bg-rose-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Operational Summary
            </h3>
            <div className="flex-1 h-px bg-border/60" />
          </div>
          <PlanningAttentionRequired
            items={attentionItems}
            fiscalYear={fiscalYear}
            isLoading={isLoading}
          />
        </section>

        {/* ── Role-based Information Banner ──────────────────────────────────── */}
        {isPlanningUser ? (
          <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/50 rounded-xl flex items-start sm:items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Info className="h-4 w-4" />
            </div>
            <p className="text-xs text-blue-950 dark:text-blue-200 font-normal leading-relaxed">
              <span className="font-semibold text-blue-900 dark:text-blue-100">Planning Office View:</span> Displaying {selectedDeptId ? 'filtered' : 'institutional'} data
              {selectedDeptId && ` for ${departments.find((d) => d.id === selectedDeptId)?.name || 'selected department'}`}.
              {' '}Use the organization filter above to scope analytics by office.
            </p>
          </div>
        ) : (
          <div className="p-3.5 bg-card border border-border/80 rounded-xl flex items-start sm:items-center gap-3 shadow-2xs">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted-foreground font-normal leading-relaxed">
              <span className="font-semibold text-foreground">Department View:</span> You are viewing data scoped to your assigned department.
            </p>
          </div>
        )}
      </div>
    </PageContainerDashtail>
  )
}
