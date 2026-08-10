import { createFileRoute } from '@tanstack/react-router'
import ProcurementDashboardPage from '@/features/procurement/dashboard/pages/ProcurementDashboardPage'

export const Route = createFileRoute('/v2/(procurement)/procurement-dashboard/')({
  component: ProcurementDashboardPage,
})
