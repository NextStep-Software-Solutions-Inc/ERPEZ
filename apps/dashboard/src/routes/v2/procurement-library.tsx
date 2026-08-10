import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import ProcurementLibraryPageV2 from '@/pages/planning/settings/procurement-library/ProcurementLibraryPageV2'

const searchSchema = z.object({
  tab: z
    .enum([
      'ItemMaster',
      'catalog',
      'Modes',
      'UOM',
      'Pricing',
      'Suppliers',
      'Activities',
      'Settings',
    ])
    .optional()
    .default('ItemMaster'),
})

export const Route = createFileRoute('/v2/procurement-library')({
  component: RouteComponent,
  validateSearch: searchSchema,
})

function RouteComponent() {
  return <ProcurementLibraryPageV2 />
}
