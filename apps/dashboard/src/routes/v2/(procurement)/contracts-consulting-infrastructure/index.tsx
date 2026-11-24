import { createFileRoute } from '@tanstack/react-router'
import { ContractPage } from '@/features/procurement/contract'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/contracts-consulting-infrastructure/')({
  component: ContractsConsultingInfrastructureRoute,
})

function ContractsConsultingInfrastructureRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Po.Manage}
      message="You do not have permission to view Contracts."
    >
      <ContractPage />
    </RoutePermissionGuard>
  )
}
