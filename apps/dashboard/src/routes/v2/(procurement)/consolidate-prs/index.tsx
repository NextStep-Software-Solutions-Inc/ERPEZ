import { createFileRoute } from '@tanstack/react-router'
import ConsolidatePrsPage from '@/pages/procurement/ConsolidatePrsPage'

export const Route = createFileRoute('/v2/(procurement)/consolidate-prs/')({
  component: ConsolidatePrsRoute,
})

function ConsolidatePrsRoute() {
  return <ConsolidatePrsPage />
}
