import { createFileRoute } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { ManageAOBListPage } from '@/features/procurement/aob/components'
import type { AOB } from '@/features/procurement/aob/types'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/manage-aob/')({
  component: ManageAobRoute,
})

function ManageAobRoute() {
  const navigate = useNavigate()

  const handleViewDetails = (aob: AOB) => {
    navigate({
      to: '/v2/manage-aob/$aobId',
      params: { aobId: aob.id },
    })
  }

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Aob.Manage}
      message="You do not have permission to manage AOBs."
    >
      <ManageAOBListPage onViewDetails={handleViewDetails} />
    </RoutePermissionGuard>
  )
}
