import { createLazyFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

const ConsolidatedPrDetailsPage = lazy(() =>
  import('@/pages/procurement/ConsolidatedPrDetailsPage').then((module) => ({
    default: module.ConsolidatedPrDetailsPage,
  })),
)

export const Route = createLazyFileRoute(
  '/v2/(procurement)/consolidate-prs/$consolidatedPrId',
)({
  component: ConsolidatedPrDetailsRoute,
})

function ConsolidatedPrDetailsRoute() {
  const { consolidatedPrId } = Route.useParams()

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Pr.Manage}
      message="You do not have permission to view Consolidated PR details."
    >
      <Suspense fallback={<div>Loading Consolidated PR details...</div>}>
        <ConsolidatedPrDetailsPage consolidatedPrId={consolidatedPrId} />
      </Suspense>
    </RoutePermissionGuard>
  )
}
