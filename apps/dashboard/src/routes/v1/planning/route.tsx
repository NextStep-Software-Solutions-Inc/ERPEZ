import { createFileRoute } from '@tanstack/react-router'
import UnifiedLayout from '@/components/layout/UnifiedLayout'

export const Route = createFileRoute('/v1/planning')({
  component: RouteComponent,
})

function RouteComponent() {
  return <UnifiedLayout />
}
