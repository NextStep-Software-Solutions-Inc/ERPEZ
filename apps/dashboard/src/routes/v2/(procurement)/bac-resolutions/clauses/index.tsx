import { createFileRoute } from '@tanstack/react-router'
import { ManageWhereasClausesPage } from '@/features/procurement/bac-resolution/pages'

export const Route = createFileRoute(
  '/v2/(procurement)/bac-resolutions/clauses/',
)({
  component: ManageWhereasClausesRoute,
})

function ManageWhereasClausesRoute() {
  return <ManageWhereasClausesPage />
}
