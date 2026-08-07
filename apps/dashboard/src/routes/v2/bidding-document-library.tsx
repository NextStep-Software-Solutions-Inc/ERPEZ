import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import BiddingDocumentLibraryPage from '@/pages/planning/settings/bidding-document-library/BiddingDocumentLibraryPage'

const searchSchema = z.object({
  tab: z.enum(['SystemAdmin', 'BACSecretariat']).catch('SystemAdmin'),
})

export const Route = createFileRoute('/v2/bidding-document-library')({
  component: RouteComponent,
  validateSearch: searchSchema,
})

function RouteComponent() {
  return <BiddingDocumentLibraryPage />
}
