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

export const Route = createFileRoute('/v2/(planning)/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DashboardPage />
}
