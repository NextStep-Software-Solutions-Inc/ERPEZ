import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/v1/finance/fund-receiving')({
  component: RouteComponent,
})

function RouteComponent() {
  return <FundReceiving />
}

function FundReceiving() {
  return <div>FundReceiving</div>
}

export default FundReceiving
