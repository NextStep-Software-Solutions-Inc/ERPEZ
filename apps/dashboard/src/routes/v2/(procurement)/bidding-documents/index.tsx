import { createFileRoute } from '@tanstack/react-router'
import { BiddingDocumentsPage } from '@/features/procurement/bidding-documents'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(procurement)/bidding-documents/')({
  component: BiddingDocumentsRoute,
})

function BiddingDocumentsRoute() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.BiddingDocuments.View}
      message="You do not have permission to view Bidding Documents."
    >
      <BiddingDocumentsPage />
    </RoutePermissionGuard>
  )
}
