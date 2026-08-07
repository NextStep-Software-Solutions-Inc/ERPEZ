import { createLazyFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

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
    <Suspense fallback={<div>Loading Consolidated PR details...</div>}>
      <ConsolidatedPrDetailsPage consolidatedPrId={consolidatedPrId} />
    </Suspense>
  )
}
