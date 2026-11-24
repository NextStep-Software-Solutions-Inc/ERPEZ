/**
 * Planning Dashboard Route
 * 
 * Route definition for the Planning Dashboard Overview page.
 * Accessible at /v2/dashboard (the (planning) group is a layout group, not part of the URL)
 * 
 * @module routes/v2/(planning)/dashboard
 */

import { createFileRoute } from '@tanstack/react-router'
import DashboardPage from '@/features/planning/dashboard/pages/DashboardPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(planning)/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={[
        PERMISSIONS.Planning.Dashboard.ViewGlobal,
        PERMISSIONS.Planning.Dashboard.ViewOffice,
      ]}
      message="You do not have permission to view the Planning Dashboard."
    >
      <DashboardPage />
    </RoutePermissionGuard>
  )
}
