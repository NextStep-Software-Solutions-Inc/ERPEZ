import { createFileRoute } from '@tanstack/react-router'
import { APPDetailsPage } from '@/pages/planning/app-consolidation/APPDetailsPage'

export const Route = createFileRoute('/v2/(planning)/app-consolidation/$appId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <APPDetailsPage />
}
