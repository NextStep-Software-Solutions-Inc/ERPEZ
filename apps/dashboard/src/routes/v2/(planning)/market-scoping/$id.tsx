/**
 * Market Scoping Details Route
 * URL: /v2/planning/market-scoping/:id
 * 
 * View and manage a specific market scoping form
 * - View details (read-only or edit mode based on status)
 * - Submit for approval (Draft only)
 * - Approve/Reject (for authorized users)
 * - Generate PDF (Approved only)
 */

import { createFileRoute } from '@tanstack/react-router'
import MarketScopingDetailsPage from '@/pages/planning/market-scoping/MarketScopingDetailsPage'

export const Route = createFileRoute(
  '/v2/(planning)/market-scoping/$id'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <MarketScopingDetailsPage id={id} />
}
