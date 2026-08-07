import { createFileRoute } from '@tanstack/react-router'
import { ContractPage } from '@/features/procurement/contract'

export const Route = createFileRoute('/v2/(procurement)/contracts-consulting-infrastructure/')({
  component: ContractsConsultingInfrastructureRoute,
})

function ContractsConsultingInfrastructureRoute() {
  return <ContractPage />
}
