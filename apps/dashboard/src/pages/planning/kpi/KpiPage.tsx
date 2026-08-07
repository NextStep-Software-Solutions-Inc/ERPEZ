import { useSearch } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import { SkeletonTable } from '@/components/SkeletonLoader'

const KpiTab = lazy(() => import('./KpiTab'))
const KpiAssignmentForDuTab = lazy(() => import('./KpiAssignmentForDuTab'))
const FunctionAllocationTab = lazy(() => import('./FunctionAllocationTab'))

function KpiPage() {
  const search = useSearch({ from: '/planning/kpi/' })

  const { fiscalYearSearch, kpiAssignmentForDuSearch } = search

  return (
    <Suspense fallback={<SkeletonTable columns={4} rows={15} />}>
      <TabsContent value="kpi" className="space-y-4">
        <KpiTab />
      </TabsContent>
      <TabsContent value="function-allocation" className="space-y-4">
        <FunctionAllocationTab fiscalYearSearch={fiscalYearSearch} />
      </TabsContent>
      <TabsContent value="kpi-assignment-for-du" className="space-y-4">
        <KpiAssignmentForDuTab
          kpiAssignmentForDuSearch={kpiAssignmentForDuSearch}
        />
      </TabsContent>
    </Suspense>
  )
}

export default KpiPage
