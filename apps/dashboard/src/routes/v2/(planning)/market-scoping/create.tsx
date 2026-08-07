/**
 * Market Scoping Create Route
 * URL: /v2/market-scoping/create
 * 
 * Creates a new market scoping form using the multi-step wizard
 */

import { createFileRoute } from '@tanstack/react-router'
import CreateMarketScopingPage from '@/pages/planning/market-scoping/CreateMarketScopingPage'

export const Route = createFileRoute('/v2/(planning)/market-scoping/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreateMarketScopingPage />
}
