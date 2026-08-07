import { createFileRoute } from '@tanstack/react-router'
import OverviewPage from '@/pages/planning/OverviewPage'

export const Route = createFileRoute('/v1/planning/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <OverviewPage />
}
