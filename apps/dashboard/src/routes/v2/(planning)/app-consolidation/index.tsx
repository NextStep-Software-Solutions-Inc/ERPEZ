import { createFileRoute } from '@tanstack/react-router'
import { CreateAPPDialog, SelectPPMPDialog } from '@/features/planning/app-consolidation/dialogs'
import { SupplementalAPPDialog } from '@/features/planning/app-consolidation/dialogs/SupplementalAPPDialog'
import { SupplementalPPMPSelectionDialog } from '@/features/planning/app-consolidation/dialogs/SupplementalPPMPSelectionDialog'
import { APPConsolidationPage } from '@/pages/planning/app-consolidation/APPConsolidationPage'
import { RoutePermissionGuard } from '@/components/RoutePermissionGuard'
import { PERMISSIONS } from '@/constants/permissions'

export const Route = createFileRoute('/v2/(planning)/app-consolidation/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RoutePermissionGuard
      permission={PERMISSIONS.Procurement.App.Manage}
      message="You do not have permission to access APP Consolidation."
    >
      <APPConsolidationPage />
      <CreateAPPDialog />
      <SelectPPMPDialog />
      <SupplementalAPPDialog />
      <SupplementalPPMPSelectionDialog />
    </RoutePermissionGuard>
  )
}
