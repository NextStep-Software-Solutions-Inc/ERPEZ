/**
 * Edit KPI Dialog
 * Step 2: KPI Activation - Dialog for editing KPI configuration
 * 
 * Follows pattern from CreateKpiDialog with mutation hook
 * Handles dialog state, form submission, and API calls
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient, createMutationHookFromTemplate } from 'erpez-shared-lib'
import EditKpiForm, { type EditKpiFormValues } from '../forms/EditKpiForm'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { updateFYActiveKpiRequest } from '../handlers/updateFYActiveKpiRequest'
import type { MasterKPI } from '../../shared/utils/mockMasterKPIs'

const useUpdateFYActiveKpi = createMutationHookFromTemplate(updateFYActiveKpiRequest)

interface EditKpiDialogProps {
  isOpen: boolean
  onClose: () => void
  kpi: MasterKPI | null
  onSaveComplete?: () => void | Promise<void>
}

export default function EditKpiDialog({
  isOpen,
  onClose,
  kpi,
  onSaveComplete,
}: EditKpiDialogProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingData, setPendingData] = useState<EditKpiFormValues | null>(null)
  
  const { mutateAsync: updateKpiMutate, isPending } = useUpdateFYActiveKpi()
  const queryClient = useQueryClient()

  if (!kpi) {
    return null
  }

  const handleShowConfirmation = (data: EditKpiFormValues) => {
    setPendingData(data)
    setShowConfirmation(true)
  }

  const handleConfirmSave = async () => {
    if (!pendingData) return
    
    try {
      // Call API using the mutation hook (following CreateKpiDialog pattern)
      await toast.promise(
        updateKpiMutate(
          {
            pathParams: { kpiId: kpi.id as string },
            payload: pendingData,
          },
          {
            onSuccess: async () => {
              // Invalidate queries to refresh data
              await queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  query.queryKey[0].includes('fy-active-kpis'),
              })
              
              // Call completion callback if provided
              if (onSaveComplete) {
                await onSaveComplete()
              }
              
              setShowConfirmation(false)
              setShowUnsavedWarning(false)
              onClose()
            },
          },
        ),
        {
          loading: `Updating KPI "${pendingData.name}"...`,
          success: `KPI "${pendingData.name}" updated successfully!`,
          error: (error: any) => {
            // Extract error message from API response
            let errorMessage = 'Failed to update KPI'
            
            // Check response data first (API error response)
            if (error?.response?.data) {
              const responseData = error.response.data
              errorMessage = responseData.message || 
                           responseData.errors?.message ||
                           JSON.stringify(responseData)
            }
            // Fallback to error message
            else if (error?.message) {
              errorMessage = error.message
            }
            
            return errorMessage
          },
        },
      )
    } catch (error) {
      // Error is already shown by toast.promise
      console.error('KPI update error:', error)
    }
  }

  const handleCancel = () => {
    setShowUnsavedWarning(true)
  }

  const handleConfirmDiscard = () => {
    setShowUnsavedWarning(false)
    onClose()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !showUnsavedWarning && !showConfirmation) {
      handleCancel()
    }
  }

  return (
    <>
      <ResponsiveDialog
        size="2xl"
        open={isOpen && !showUnsavedWarning && !showConfirmation}
        onOpenChange={handleOpenChange}
        title={`Edit KPI: ${kpi.name}`}
        description="Modify the KPI configuration for the selected fiscal year"
        className="h-[90vh] sm:max-w-3xl"
      >
        <EditKpiForm
          kpiId={kpi.id as string}
          onSubmit={handleShowConfirmation}
          onCancel={handleCancel}
          isLoading={isPending}
        />
      </ResponsiveDialog>

      {/* Confirmation Dialog */}
      <ConfirmAlertDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        title="Confirm Changes"
        description={`Are you sure you want to update "${kpi.name}"? This will modify the KPI configuration in the system.`}
        onConfirm={handleConfirmSave}
        confirmLabel="Update KPI"
        cancelLabel="Cancel"
      />

      {/* Unsaved Changes Warning */}
      <ConfirmAlertDialog
        open={showUnsavedWarning}
        onOpenChange={setShowUnsavedWarning}
        title="Unsaved Changes"
        description="You have unsaved changes that will be lost. Are you sure you want to continue?"
        onConfirm={handleConfirmDiscard}
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
      />
    </>
  )
}
