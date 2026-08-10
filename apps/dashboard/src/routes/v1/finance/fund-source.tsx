import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/v1/finance/fund-source')({
  component: RouteComponent,
})

function RouteComponent() {
  return <FundSource />
}

function FundSource() {
  return <div>FundSource</div>
}

export default FundSource
