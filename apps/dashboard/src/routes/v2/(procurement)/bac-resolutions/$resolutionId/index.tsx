import { createFileRoute } from '@tanstack/react-router'
import { BacResolutionsPage } from '@/features/procurement/bac-resolution/pages'

export const Route = createFileRoute(
  '/v2/(procurement)/bac-resolutions/$resolutionId/',
)({
  component: BacResolutionDetailRoute,
})

function BacResolutionDetailRoute() {
  const { resolutionId } = Route.useParams()

  return <BacResolutionsPage selectedId={resolutionId} />
}
