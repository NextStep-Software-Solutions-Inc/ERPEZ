import { createFileRoute } from '@tanstack/react-router'
import DetailsPanel from '@/features/procurement/bac-resolution/components/DetailsPanel'

export const Route = createFileRoute(
  '/v2/(procurement)/bac-resolutions/$resolutionId/',
)({
  component: BacResolutionDetailRoute,
})

function BacResolutionDetailRoute() {
  const { resolutionId } = Route.useParams()

  return (
    <DetailsPanel
      selectedId={resolutionId}
      role="procurement-staff"
      handleViewConsolidatedPrDetails={() => {}}
    />
  )
}
