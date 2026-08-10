import { useEffect } from 'react'
import { PageContainerDashtail } from '@/components/v2/PageContainerDashtail'
import { useDashboardRole } from '@/hooks/useDashboardRole'
import { ShoppingCart } from 'lucide-react'
import { useProcurementDashboardStore } from '../store/procurementDashboardStore'
import { ProcurementDashboardHeader } from '../components/DashboardHeader'
import { KPIStrip } from '../components/KPIStrip'
import { ProcurementFunnel } from '../components/ProcurementFunnel'
import { PrConsolidationAndTatTracker } from '../components/PrConsolidationAndTatTracker'
import { BacBiddingContractsAnalytics } from '../components/BacBiddingContractsAnalytics'
import { TaskQueue } from '../components/TaskQueue'

export default function ProcurementDashboardPage() {
  const { canAccessGlobalData, departmentId: userDepartmentId } = useDashboardRole()

  const {
    filters,
    kpiSummary,
    funnelData,
    tatData,
    consolidationProgress,
    rfqStatusList,
    aobQueueItems,
    poFulfillment,
    contracts,
    tasks,
    departments,
    isLoading,
    setFilters,
    loadMockData,
  } = useProcurementDashboardStore()

  // Load mock data on mount
  useEffect(() => {
    loadMockData()
  }, [loadMockData])

  // Auto-set department filter for office users
  useEffect(() => {
    if (!canAccessGlobalData && userDepartmentId && filters.departmentId !== userDepartmentId) {
      setFilters({ departmentId: userDepartmentId })
    }
  }, [canAccessGlobalData, userDepartmentId, filters.departmentId, setFilters])

  const handleFiscalYearChange = (year: number) => setFilters({ fiscalYear: year })
  const handleDepartmentChange = (deptId: string | null) => setFilters({ departmentId: deptId })

  return (
    <PageContainerDashtail
      title="Procurement Dashboard"
      titleIcon={<ShoppingCart className="h-6 w-6 text-blue-600" />}
      description="Procurement lifecycle overview — PR, RFQ, BAC, NOA, PO, NTP, and Contracts"
      headerSize="default"
      containerClassName="p-6 bg-gray-50"
    >
      <div className="space-y-6">
        {/* ── Global filters ── */}
        <ProcurementDashboardHeader
          fiscalYear={filters.fiscalYear}
          departmentId={filters.departmentId}
          departments={departments}
          showDepartmentFilter={canAccessGlobalData}
          onFiscalYearChange={handleFiscalYearChange}
          onDepartmentChange={handleDepartmentChange}
        />

        {/* ── KPI strip ── */}
        <KPIStrip summary={kpiSummary} isLoading={isLoading} />

        {/* ── Procurement pipeline funnel ── */}
        <ProcurementFunnel stages={funnelData} isLoading={isLoading} />

        {/* ── PR Consolidation & TAT Tracker ── */}
        <PrConsolidationAndTatTracker
          consolidation={consolidationProgress}
          tatData={tatData}
          fiscalYear={filters.fiscalYear}
          isLoading={isLoading}
        />

        {/* ── BAC, Bidding & Contracts Analytics (3-col) ── */}
        <BacBiddingContractsAnalytics
          rfqList={rfqStatusList}
          aobItems={aobQueueItems}
          poFulfillment={poFulfillment}
          contracts={contracts}
          isLoading={isLoading}
        />

        {/* ── Smart task queue ── */}
        <TaskQueue tasks={tasks} isLoading={isLoading} />
      </div>
    </PageContainerDashtail>
  )
}
