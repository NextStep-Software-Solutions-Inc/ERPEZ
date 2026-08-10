import { createFileRoute } from '@tanstack/react-router'
import { ManageBacResolutionsPage } from '@/features/procurement/bac-resolution/pages'

export const Route = createFileRoute('/v2/(procurement)/manage-bac-resolutions/')({
  component: ManageBacResolutionsRoute,
})

function ManageBacResolutionsRoute() {
  return <ManageBacResolutionsPage />
}
