import { createFileRoute } from '@tanstack/react-router'
import FiscalYearPage from '@/pages/planning/kpi/FiscalYearPage'

export const Route = createFileRoute('/v1/planning/fiscal-year')({
  component: RouteComponent,
})

function RouteComponent() {
  return <FiscalYearPage />
}
