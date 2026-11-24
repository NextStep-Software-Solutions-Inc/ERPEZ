import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AOBListPage } from '@/features/procurement/aob/components'
import type { AOB } from '@/features/procurement/aob/types'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/abstract-of-bids-aob/')({
  component: AbstractOfBidsAobRoute,
})

function AbstractOfBidsAobRoute() {
  const navigate = useNavigate()

  const handleViewDetails = (aob: AOB) => {
    navigate({
      to: '/v2/abstract-of-bids-aob/$aobId',
      params: { aobId: aob.id },
    })
  }

  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.Aob.Manage}
      message="You do not have permission to view Abstract of Bids (AOB)."
    >
      <AOBListPage onViewDetails={handleViewDetails} />
    </RoutePermissionGuard>
  )
}
