/**
 * Market Scoping Create Route
 * URL: /v2/market-scoping/create
 * 
 * Creates a new market scoping form using the multi-step wizard
 */

import { createFileRoute } from '@tanstack/react-router'
import CreateMarketScopingPage from '@/pages/planning/market-scoping/CreateMarketScopingPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(planning)/market-scoping/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Planning.MarketScoping.Manage}
      message="You do not have permission to create Market Scoping forms."
    >
      <CreateMarketScopingPage />
    </RoutePermissionGuard>
  )
}
