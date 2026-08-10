import { createFileRoute } from '@tanstack/react-router'
import { BiddingDocumentsPage } from '@/features/procurement/bidding-documents'

export const Route = createFileRoute('/v2/(procurement)/bidding-documents/')({
  component: BiddingDocumentsRoute,
})

function BiddingDocumentsRoute() {
  return <BiddingDocumentsPage />
}
