import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/v1/planning/fund-receive/$fundSourceId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/planning/fund-receive/$fundSourceId/"!</div>
}
