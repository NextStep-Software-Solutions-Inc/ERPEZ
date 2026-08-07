import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import OfficePage from '@/pages/planning/office/OfficePage'
import OfficeLayout from '@/pages/planning/office/OfficeLayout'

const searchSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),

  // generic search
  search: z.string().optional(),

  // Office-specific search fields
  officeNameSearch: z.string().optional(),
  officeHeadSearch: z.string().optional(),
  addressSearch: z.string().optional(),
  emailSearch: z.string().optional(),

  // Cluster-specific search fields
  clusterSearch: z.string().optional(),

  // Delivery Unit search fields
  deliveryUnitSearch: z.string().optional(),

  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),

  tab: z
    .enum(['office', 'delivery-unit', 'organizational-cluster'])
    .optional()
    .default('office'),

  create: z.boolean().optional(),
  delete: z.boolean().optional(),
  edit: z.string().optional(),
  lock: z.boolean().optional(),
  unlock: z.boolean().optional(),
})

export const Route = createFileRoute('/v1/planning/office/')({
  component: RouteComponent,
  validateSearch: searchSchema,
})

function RouteComponent() {
  return (
    <OfficeLayout>
      <OfficePage />
    </OfficeLayout>
  )
}
