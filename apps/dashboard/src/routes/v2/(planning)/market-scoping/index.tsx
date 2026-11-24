/**
 * Market Scoping Dashboard Route
 * URL: /v2/planning/market-scoping
 * 
 * Main list view for all market scoping forms with filtering and actions
 */

import { createFileRoute } from '@tanstack/react-router'
import MarketScopingDashboardPage from '@/pages/planning/market-scoping/MarketScopingDashboardPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute(
  '/v2/(planning)/market-scoping/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.MarketScoping.View}
      message="You do not have permission to view Market Scoping."
    >
      <MarketScopingDashboardPage />
    </RoutePermissionGuard>
  )
}
