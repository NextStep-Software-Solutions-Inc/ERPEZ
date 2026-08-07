import { createFileRoute } from '@tanstack/react-router'
import { DirectContractingRequestPage } from '@/features/procurement/direct-contracting/pages/DirectContractingRequestPage'

export const Route = createFileRoute('/v2/(procurement)/direct-contracting-request/')({
  component: DirectContractingRequestRoute,
})

function DirectContractingRequestRoute() {
  return <DirectContractingRequestPage />
}
