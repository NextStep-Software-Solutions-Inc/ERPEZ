import { createFileRoute } from '@tanstack/react-router'
import { BacResolutionsPage } from '@/features/procurement/bac-resolution/pages'

export const Route = createFileRoute('/v2/(procurement)/bac-resolutions/')({
  component: BacResolutionsRoute,
})

function BacResolutionsRoute() {
  return <BacResolutionsPage />
}
