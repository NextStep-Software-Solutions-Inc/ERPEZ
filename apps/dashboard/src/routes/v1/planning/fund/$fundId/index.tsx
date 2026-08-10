import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/v1/planning/fund/$fundId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/planning/fund/$fundId/"!</div>
}
