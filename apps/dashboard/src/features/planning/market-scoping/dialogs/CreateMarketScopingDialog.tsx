/**
 * Create Market Scoping Dialog
 * Opens a multi-step wizard in a responsive dialog for creating new market scoping forms
 * Location: src/features/planning/market-scoping/dialogs/
 *
 * References:
 * - documentations/market-scoping-integration.md
 */

import { useState } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { FormWizard } from '../forms/FormWizard'
import { useQueryClient } from '@tanstack/react-query'
import { useCreateMarketScoping, useUpdateMarketScoping } from '../utils/hooks'
import { transformFormToApiPayload } from '../utils/transformFormToApiPayload'
import {
  createMarketScopingDialogOpenAtom,
  draftMarketScopingAtom,
  resetFormStateAtom,
} from '../atoms/marketScopingStateAtom'
import api from '@/services/api'
import keycloak from '@/auth/keycloak'
import type { MarketScopingForm } from '../types/marketScopingTypes'
import type {
  CreateMarketScopingRequest,
  UpdateMarketScopingRequest,
} from '../types/marketScopingApiTypes'

interface CreateMarketScopingDialogProps {
  title?: string
  description?: string
  onSuccess?: () => void // ← add this
  userProfile?: {
    readonly name: string
    readonly designation: string
    readonly departmentUnit: string
    readonly agencyName: string
  }
  libActivities?: readonly {
    readonly id: string
    readonly name: string
    readonly budget: number
  }[]
}

export function CreateMarketScopingDialog({
  title = 'Create Market Scoping Form',
  description = 'Complete the 4-step wizard to create a new market scoping form.',
  onSuccess,
  userProfile,
  libActivities,
}: CreateMarketScopingDialogProps = {}) {
  const [open, setOpen] = useAtom(createMarketScopingDialogOpenAtom)
  const [draft] = useAtom(draftMarketScopingAtom)
  const resetFormState = useAtom(resetFormStateAtom)[1]
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { mutate: createMarketScoping } = useCreateMarketScoping()
  const { mutate: updateMarketScoping } = useUpdateMarketScoping()

  // Derive isDirty from persisted form data atom
  const isDirty = draft !== null && Object.keys(draft).length > 0

  const handleFormSubmit = async (submittedData: MarketScopingForm) => {
    try {
      // Get current logged-in user ID from Keycloak for fallback
      const authUserId = keycloak.subject
      if (!submittedData.userId && !authUserId) {
        throw new Error(
          'User ID not found. Please ensure you are logged in or select a representative.',
        )
      }

      // Transform form data to API payload using the selected representative userId and upload attachments
      const payload = await transformFormToApiPayload(
        submittedData,
        authUserId || '',
      )

      const isEdit = submittedData.id && !submittedData.id.startsWith('temp-')

      // Call API mutation and wait for the promise
      return new Promise<void>((resolve, reject) => {
        const handleSuccess = (formId: string, successMessage: string) => {
          resetFormState()
          setOpen(false)
          toast.success(successMessage)

          // Invalidate query to refresh dashboard table
          queryClient.invalidateQueries({ queryKey: ['/market-scopings'] })
          queryClient.invalidateQueries({
            queryKey: ['market-scoping', formId],
          })

          onSuccess?.()

          setTimeout(() => {
            navigate({
              to: '/v2/market-scoping/$id',
              params: { id: formId },
            })
          }, 100)

          resolve()
        }

        const handleError = (error: unknown) => {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to save form.'
          reject(new Error(errorMessage))
        }

        if (isEdit) {
          updateMarketScoping(
            {
              pathParams: { id: submittedData.id! },
              payload: payload as UpdateMarketScopingRequest,
            },
            {
              onSuccess: async () => {
                if (submittedData.status === 'PendingApproval') {
                  try {
                    await api.post(
                      `/market-scopings/${submittedData.id}/submit`,
                    )
                    handleSuccess(
                      submittedData.id!,
                      'Market Scoping form submitted for approval successfully!',
                    )
                  } catch (err: unknown) {
                    handleError(err)
                  }
                } else {
                  handleSuccess(
                    submittedData.id!,
                    'Market Scoping draft updated successfully!',
                  )
                }
              },
              onError: handleError,
            },
          )
        } else {
          createMarketScoping(
            {
              pathParams: {},
              payload: payload as CreateMarketScopingRequest,
            },
            {
              onSuccess: async (response) => {
                const formId = response.data
                if (!formId) {
                  reject(
                    new Error(
                      'Unable to determine market scoping ID from response.',
                    ),
                  )
                  return
                }
                if (submittedData.status === 'PendingApproval') {
                  try {
                    await api.post(`/market-scopings/${formId}/submit`)
                    handleSuccess(
                      formId,
                      'Market Scoping form submitted for approval successfully!',
                    )
                  } catch (err: unknown) {
                    handleError(err)
                  }
                } else {
                  handleSuccess(
                    formId,
                    'Market Scoping draft created successfully!',
                  )
                }
              },
              onError: handleError,
            },
          )
        }
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save form.'
      throw new Error(errorMessage)
    }
  }

  const handleCancelRequest = () => {
    if (isDirty) {
      setShowDiscardWarning(true)
    } else {
      setOpen(false)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      handleCancelRequest()
    } else {
      setOpen(true)
    }
  }

  const handleConfirmDiscard = () => {
    resetFormState()
    setShowDiscardWarning(false)
    setOpen(false)
  }

  return (
    <>
      <ResponsiveDialog
        open={open && !showDiscardWarning}
        onOpenChange={handleOpenChange}
        title={title}
        description={description}
        size="lg"
        showCloseButton
      >
        <FormWizard
          onFormSubmit={handleFormSubmit}
          onCancel={handleCancelRequest}
          userProfile={userProfile}
          libActivities={libActivities}
        />
      </ResponsiveDialog>

      <ConfirmAlertDialog
        open={showDiscardWarning}
        onOpenChange={setShowDiscardWarning}
        title="Discard Draft?"
        description="You have unsaved form data. Closing this dialog will discard your work. Continue?"
        onConfirm={handleConfirmDiscard}
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
      />
    </>
  )
}
