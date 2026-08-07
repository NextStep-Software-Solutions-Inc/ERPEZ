import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/v1/planning/function-allocation/$fiscalYearId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/planning/fiscal-year/$fiscalYearId/"!</div>
}
