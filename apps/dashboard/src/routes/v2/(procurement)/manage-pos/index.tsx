import { createFileRoute } from '@tanstack/react-router'
import { ProcurementPlaceholderPage } from '@/pages/procurement/ProcurementPlaceholderPage'

export const Route = createFileRoute('/v2/(procurement)/manage-pos/')({
  component: ManagePosRoute,
})

function ManagePosRoute() {
  return (
    <ProcurementPlaceholderPage
      title="Manage POS"
      description="Purchase orders management placeholder page for procurement."
    />
  )
}
