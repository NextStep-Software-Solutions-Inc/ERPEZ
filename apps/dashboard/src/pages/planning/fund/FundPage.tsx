import { useSearch } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import { SkeletonTable } from '@/components/SkeletonLoader'

const FundSourceTab = lazy(() => import('./FundSourceTab'))
const FundReceivingTab = lazy(() => import('./FundReceivingTab'))
const BudgetAllocationTab = lazy(() => import('./BudgetAllocationTab'))
const FundMonitoringTab = lazy(() => import('./FundMonitoringTab'))

export default function FundPage() {
  const search = useSearch({ from: '/planning/fund/' })

  const {
    fundSourceSearch,
    fundReceivingSearch,
    budgetAllocationSearch,
    fundMonitoringSearch,
  } = search

  return (
    <Suspense fallback={<SkeletonTable columns={4} rows={15} />}>
      <TabsContent value="fund-source" className="space-y-4">
        <FundSourceTab fundSourceSearch={fundSourceSearch} />
      </TabsContent>
      <TabsContent value="fund-receiving" className="space-y-4">
        <FundReceivingTab fundReceivingSearch={fundReceivingSearch} />
      </TabsContent>
      <TabsContent value="budget-allocation" className="space-y-4">
        <BudgetAllocationTab budgetAllocationSearch={budgetAllocationSearch} />
      </TabsContent>
      <TabsContent value="fund-monitoring" className="space-y-4">
        <FundMonitoringTab fundMonitoringSearch={fundMonitoringSearch} />
      </TabsContent>
    </Suspense>
  )
}
