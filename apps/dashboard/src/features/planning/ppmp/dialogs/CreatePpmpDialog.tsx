import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import SubmitButton from '@/components/SubmitButton'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import {
  CreatePpmpMetadataForm,
  type CreatePpmpMetadataFormValues,
} from '../forms'
import { createPpmpFormDataAtom } from '../atoms'
import { type CreatePPMPPayload, createPpmpRequest } from '../handlers'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'

const FORM_ID = 'create-ppmp-form'

interface CreatePpmpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  preSelectedOfficeId?: string
  defaultIsMaster?: boolean
}
const useCreatePpmp = createMutationHookFromTemplate(createPpmpRequest)
export function CreatePpmpDialog({
  open,
  onOpenChange,
  title = 'Create New PPMP',
  description = 'Fill in the basic details for your Procurement Management Plan.',
  preSelectedOfficeId,
  defaultIsMaster = false,
}: CreatePpmpDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)
  const [formData, setFormData] = useAtom(createPpmpFormDataAtom)
  const { mutateAsync } = useCreatePpmp()
  const queryClient = useQueryClient()

  const isDirty = Object.keys(formData).length > 0

  useEffect(() => {
    if (!open) {
      setShowDiscardWarning(false)
    }
  }, [open])

  const handleReset = () => {
    setFormData({})
  }

  const handleOpenChange = (next: boolean) => {
    if (!next && isDirty) {
      setShowDiscardWarning(true)
      return
    }
    if (!next) handleReset()
    onOpenChange(next)
  }

  const handleSubmit = async (data: CreatePpmpMetadataFormValues) => {
    const payload: CreatePPMPPayload = {
      ppmpNumber: data.ppmpNumber ?? undefined,
      isMaster: data.isMaster,
      officeId: data.officeId,
      fiscalYearId: data.fiscalYearId,
      fundSourceId: data.fundSourceId ?? undefined,
      libId: data.libId,
      parentId: data.parentId ?? undefined,
    }

    try {
      setIsSubmitting(true)
      await toast.promise(
        mutateAsync(
          { pathParams: {}, payload },
          {
            onSuccess: () => {
              handleReset()
              onOpenChange(false)
              void queryClient.invalidateQueries({
                predicate: (query) => {
                  const key = query.queryKey[0]
                  return typeof key === 'string' && key.startsWith('/ppmps')
                },
              })
            },
          },
        ),
        {
          loading: 'Creating PPMP...',
          error: (err) =>
            err instanceof Error ? err.message : 'Failed to create PPMP.',
        },
      )
    } catch {
      // toast.promise handles presentation
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDiscard = () => {
    handleReset()
    setShowDiscardWarning(false)
    onOpenChange(false)
  }

  return (
    <>
      <ResponsiveDialogDashtail
        open={open && !showDiscardWarning}
        onOpenChange={handleOpenChange}
        title={title}
        description={description}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <SubmitButton
              form={FORM_ID}
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create PPMP'}
            </SubmitButton>
          </div>
        }
      >
        <CreatePpmpMetadataForm
          formId={FORM_ID}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          defaultOfficeId={preSelectedOfficeId}
          defaultIsMaster={defaultIsMaster}
          initialValues={formData}
          onValuesChange={setFormData}
        />
      </ResponsiveDialogDashtail>

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
