import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { BacResolutionsPage } from '@/features/procurement/bac-resolution/pages'

const searchSchema = z.object({
  selectedResolutionId: z.string().optional(),
})

export const Route = createFileRoute('/v2/(procurement)/bac-resolutions/')({
  validateSearch: searchSchema,
  component: BacResolutionsRoute,
})

function BacResolutionsRoute() {
  const search = Route.useSearch()

  return (
    <BacResolutionsPage selectedResolutionId={search.selectedResolutionId} />
  )
}
