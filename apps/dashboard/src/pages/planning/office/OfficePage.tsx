import { useNavigate, useSearch } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import { SkeletonTable } from '@/components/SkeletonLoader'

const OfficeTab = lazy(() => import('./OfficeTab'))
const DeliveryUnitTab = lazy(() => import('./DeliveryUnitTab'))
const OrganizationalClusterTab = lazy(
  () => import('./OrganizationalClusterTab'),
)

function OfficePage() {
  const search = useSearch({ from: '/planning/office/' })
  const navigate = useNavigate()

  const {
    officeNameSearch,
    deliveryUnitSearch,
    clusterSearch,
    // officeAssignmentSearch 
  } = search

  return (
    <Suspense fallback={<SkeletonTable columns={4} rows={15} />}>
      <TabsContent value="office" className="space-y-4">
        <OfficeTab officeSearch={officeNameSearch} />
      </TabsContent>

      <TabsContent value="delivery-unit" className="space-y-4">
        <DeliveryUnitTab
          deliveryUnitSearch={deliveryUnitSearch}
          navigate={navigate}
          search={search}
        />
      </TabsContent>

      <TabsContent value="organizational-cluster" className="space-y-4">
        <OrganizationalClusterTab
          clusterSearch={clusterSearch}
          navigate={navigate}
          search={search}
        />
      </TabsContent>
    </Suspense>
  )
}

export default OfficePage
