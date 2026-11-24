import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'
import ProcurementDashboardPage from '@/features/procurement/dashboard/pages/ProcurementDashboardPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const procurementDashboardSearchSchema = z.object({
  tab: z.enum(['overview', 'analytics', 'reports']).optional().default('overview'),
  fiscalYear: z.coerce.number().int().optional().default(new Date().getFullYear()),
  officeId: z.string().optional(),
  quarter: z.coerce.number().int().min(1).max(4).optional(),
  procurementMode: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.string().optional(),
})

export type ProcurementDashboardSearchParams = z.infer<typeof procurementDashboardSearchSchema>

export const Route = createFileRoute('/v2/(procurement)/procurement-dashboard/')({
  validateSearch: procurementDashboardSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={[
        PERMISSIONS.Procurement.Ppmp.View,
        PERMISSIONS.Procurement.App.Manage,
        PERMISSIONS.Procurement.Pr.Manage,
      ]}
      message="You do not have permission to view the Procurement Dashboard."
    >
      <ProcurementDashboardPage />
    </RoutePermissionGuard>
  )
}
