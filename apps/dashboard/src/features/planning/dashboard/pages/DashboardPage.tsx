/**
 * Planning Dashboard Overview Page
 * 
 * Main dashboard page for the Planning module showing KPIs, charts,
 * and Smart Task Cards with role-based filtering.
 * 
 * @module features/planning/dashboard/pages/DashboardPage
 */

import { useEffect } from 'react'
import { PageContainerDashtail } from '@/components/v2/PageContainerDashtail'
import { useDashboardRole } from '@/hooks/useDashboardRole'
import { useDashboardStore } from '../store/dashboardStore'
import { KPICards } from '../components/KPICards'
import { DashboardFilters } from '../components/DashboardFilters'
import { OPCRLineChart } from '../components/charts/OPCRLineChart'
import { MFOBarChart } from '../components/charts/MFOBarChart'
import { BudgetHeatmap } from '../components/charts/BudgetHeatmap'
import { KPIHealthDonutChart } from '../components/charts/KPIHealthDonutChart'
import { PPMPConsolidationChart } from '../components/charts/PPMPConsolidationChart'
import { UACSObligation } from '../components/charts/UACSObligation'
import { AppProcurementReadiness } from '../components/charts/AppProcurementReadiness'
import { GAAUtilization } from '../components/charts/GAAUtilization'
import { KPIClassification } from '../components/charts/KPIClassification'
import { LayoutDashboard } from 'lucide-react'

/**
 * Main Dashboard Page Component
 */
export default function DashboardPage() {
  // Get user role and permissions
  const { isPlanningUser, canAccessGlobalData, departmentId: userDepartmentId } = useDashboardRole()

  // Get dashboard state from Zustand store
  const {
    filters,
    summary,
    opcrChartData,
    mfoStatusData,
    budgetHeatmapData,
    kpiHealthData,
    ppmpConsolidationData,
    uacsObligationData,
    appProcurementReadinessData,
    gaaUtilizationData,
    kpiClassificationData,
    departments,
    isLoading,
    setFilters,
    loadMockData,
  } = useDashboardStore()

  // Load mock data on mount
  useEffect(() => {
    loadMockData()
  }, [loadMockData])

  // Auto-set department filter for office users
  useEffect(() => {
    if (!isPlanningUser && userDepartmentId && filters.departmentId !== userDepartmentId) {
      setFilters({ departmentId: userDepartmentId })
    }
  }, [isPlanningUser, userDepartmentId, filters.departmentId, setFilters])

  // Handle filter changes
  const handleFiscalYearChange = (year: number) => {
    setFilters({ fiscalYear: year })
  }

  const handleDepartmentChange = (deptId: string | null) => {
    setFilters({ departmentId: deptId })
  }

  return (
    <PageContainerDashtail
      title="Planning Dashboard Overview"
      titleIcon={<LayoutDashboard className="h-6 w-6 text-blue-600" />}
      description="Strategic performance, budget, and procurement insights"
      headerSize="default"
      containerClassName="p-6 bg-gray-50"
    >
      <div className="space-y-6">
        {/* Global Filters */}
        <DashboardFilters
          fiscalYear={filters.fiscalYear}
          departmentId={filters.departmentId}
          departments={departments}
          showDepartmentFilter={canAccessGlobalData}
          onFiscalYearChange={handleFiscalYearChange}
          onDepartmentChange={handleDepartmentChange}
        />

        {/* KPI Summary Cards */}
        <section>
          <KPICards summary={summary} isLoading={isLoading} />
        </section>

        {/* Charts Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard Analytics
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OPCR Line Chart */}
            <OPCRLineChart data={opcrChartData} isLoading={isLoading} />

            {/* MFO Bar Chart */}
            <MFOBarChart data={mfoStatusData} isLoading={isLoading} />

            {/* Budget Heatmap - Full width */}
            <div className="lg:col-span-2">
              <BudgetHeatmap data={budgetHeatmapData} isLoading={isLoading} />
            </div>

            {/* KPI Health Donut */}
            <KPIHealthDonutChart data={kpiHealthData} isLoading={isLoading} />

            {/* PPMP Consolidation Chart */}
            <PPMPConsolidationChart data={ppmpConsolidationData} isLoading={isLoading} />

            {/* UACS Obligation vs Allotment */}
            <div className="lg:col-span-2">
              <UACSObligation data={uacsObligationData} isLoading={isLoading} />
            </div>

            {/* APP Procurement Readiness + GAA Utilization side by side */}
            <AppProcurementReadiness data={appProcurementReadinessData} isLoading={isLoading} />
            <GAAUtilization data={gaaUtilizationData} isLoading={isLoading} />

            {/* KPI Classification — full width */}
            <div className="lg:col-span-2">
              <KPIClassification data={kpiClassificationData} isLoading={isLoading} />
            </div>
          </div>
        </section>

        {/* Role-based Information Banner */}
        {isPlanningUser && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Planning Office View:</span> You are viewing {filters.departmentId ? 'filtered' : 'aggregated'} data
              {filters.departmentId && ` for ${departments.find((d) => d.id === filters.departmentId)?.name || 'selected department'}`}.
              Change the organization filter above to view different departments or all departments.
            </p>
          </div>
        )}

        {!isPlanningUser && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Department View:</span> You are viewing data
              for your assigned department. Contact the Planning Office for assistance.
            </p>
          </div>
        )}
      </div>
    </PageContainerDashtail>
  )
}
