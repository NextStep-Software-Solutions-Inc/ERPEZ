import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import BiddingDocumentLibraryPage from '@/pages/planning/settings/bidding-document-library/BiddingDocumentLibraryPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

const searchSchema = z.object({
  tab: z
    .enum(['SystemAdmin', 'BACSecretariat', 'PublicPortal'])
    .catch('SystemAdmin'),
})

export const Route = createFileRoute('/v2/bidding-document-library')({
  component: RouteComponent,
  validateSearch: searchSchema,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.BiddingDocuments.View}
      message="You do not have permission to access the Bidding Document Library."
    >
      <BiddingDocumentLibraryPage />
    </RoutePermissionGuard>
  )
}
