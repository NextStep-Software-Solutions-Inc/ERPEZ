import { createFileRoute } from '@tanstack/react-router'
import AppFormPage from '@/pages/planning/app/AppFormPage'

export const Route = createFileRoute(
  '/v2/(planning)/annual-performance-planning',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <AppFormPage />
}