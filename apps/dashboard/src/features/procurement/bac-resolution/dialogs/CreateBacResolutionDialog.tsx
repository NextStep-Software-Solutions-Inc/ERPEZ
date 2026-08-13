import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { CreateBACProjectPayload } from '../handlers/createBacProjectRequest'
import { CreateBacResolutionForm } from '../forms/CreateBacResolutionForm'
import { getAPPItemsRequest } from '@/features/planning/app-consolidation/handlers/getAPPItemsRequest'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'

interface CreateBacResolutionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (values: CreateBACProjectPayload) => Promise<void> | void
  apiConsolidatedPrs: any[]
}

const useAPPItems = createQueryHookFromTemplate(getAPPItemsRequest)

export function CreateBacResolutionDialog({
  open,
  onOpenChange,
  onCreate,
  apiConsolidatedPrs,
}: CreateBacResolutionDialogProps) {
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)

  // Fetch APP Items using the query blueprint
  const { data: appItemsResponse, isLoading: isLoadingAppItems } = useAPPItems({
    pathParams: {},
    queryParams: {},
    enabled: open, // Only fetch when dialog is open
  })

  const apiAppItems = appItemsResponse?.data ?? []

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      setShowDiscardWarning(true)
      return
    }

    onOpenChange(nextOpen)
  }

  const formId = 'create-bac-resolution-form'

  return (
    <>
      <ResponsiveDialogDashtail
        open={open && !showDiscardWarning}
        onOpenChange={handleOpenChange}
        title="Create BAC Resolution"
        description="Start a new BAC Resolution by selecting a procurement source."
        size="lg"
        showCloseButton
        // isLoading={isLoadingAppItems}
      >
        <CreateBacResolutionForm
          formId={formId}
          onSubmit={onCreate}
          onCancel={() => handleOpenChange(false)}
          onDirtyChange={setIsDirty}
          apiAppItems={apiAppItems}
          apiConsolidatedPrs={apiConsolidatedPrs}
        />
      </ResponsiveDialogDashtail>

      <ConfirmAlertDialog
        open={showDiscardWarning}
        onOpenChange={setShowDiscardWarning}
        title="Discard draft?"
        description="You have unsaved BAC Resolution draft data. Do you want to discard it?"
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        onConfirm={() => {
          setShowDiscardWarning(false)
          setIsDirty(false)
          onOpenChange(false)
        }}
      />
    </>
  )
}
