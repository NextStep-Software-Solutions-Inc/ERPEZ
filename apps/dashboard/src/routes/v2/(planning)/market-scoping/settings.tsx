/**
 * Market Scoping Settings Route
 * URL: /v2/market-scoping/settings
 * 
 * Unified settings page with tabs for Activity Types and Parameters management
 */

import { createFileRoute } from '@tanstack/react-router'
import MarketScopingSettingsPage from '@/pages/planning/market-scoping/MarketScopingSettingsPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute(
  '/v2/(planning)/market-scoping/settings'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.MarketScoping.Manage}
      message="You do not have permission to access Market Scoping Settings."
    >
      <MarketScopingSettingsPage />
    </RoutePermissionGuard>
  )
}
