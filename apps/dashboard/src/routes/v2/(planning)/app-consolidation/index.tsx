import { createFileRoute } from '@tanstack/react-router'
import { CreateAPPDialog, SelectPPMPDialog } from '@/features/planning/app-consolidation/dialogs'
import { SupplementalAPPDialog } from '@/features/planning/app-consolidation/dialogs/SupplementalAPPDialog'
import { SupplementalPPMPSelectionDialog } from '@/features/planning/app-consolidation/dialogs/SupplementalPPMPSelectionDialog'
import { APPConsolidationPage } from '@/pages/planning/app-consolidation/APPConsolidationPage'

export const Route = createFileRoute('/v2/(planning)/app-consolidation/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <APPConsolidationPage />
      <CreateAPPDialog />
      <SelectPPMPDialog />
      <SupplementalAPPDialog />
      <SupplementalPPMPSelectionDialog />
    </>
  )
}
