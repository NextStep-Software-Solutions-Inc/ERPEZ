import { useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { updatePPMPRequest } from '../handlers/updatePPMPRequest'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import SubmitButton from '@/components/SubmitButton'
import { Button } from '@/components/ui/button'
import {
  CreatePpmpMetadataForm,
  type CreatePpmpMetadataFormValues,
} from '../forms'
import {
  selectedPpmpForEditAtom,
  editPpmpDialogOpenAtom,
} from '../atoms/ppmpStateAtoms'

const useUpdatePpmp = createMutationHookFromTemplate(updatePPMPRequest)

export default function UpdatePpmpDialog() {
  const [open, setOpen] = useAtom(editPpmpDialogOpenAtom)
  const ppmp = useAtomValue(selectedPpmpForEditAtom)
  const clear = useSetAtom(selectedPpmpForEditAtom)
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useUpdatePpmp()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!ppmp) return null

  const initialValues: Partial<CreatePpmpMetadataFormValues> = {
    officeId: ppmp.officeId,
    fiscalYearId: ppmp.fiscalYearId,
    libId: ppmp.libId,
    fundSourceId: ppmp.fundSourceId ?? null,
    parentId: ppmp.parentPpmpId ?? null,
    ppmpNumber: ppmp.ppmpNumber ?? null,
    isMaster: ppmp.isMasterOffice ?? false,
  }

  const handleSubmit = async (values: CreatePpmpMetadataFormValues) => {
    if (!ppmp) return
    setIsSubmitting(true)
    const payload = {
      ppmpNumber: values.ppmpNumber ?? undefined,
      officeNumber: undefined,
      fiscalYearId: values.fiscalYearId,
      fundSourceId: values.fundSourceId ?? undefined,
      libId: values.libId,
    }

    try {
      await toast.promise(
        mutateAsync(
          { pathParams: { id: ppmp.id }, queryParams: {}, payload },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) => {
                  const key = query.queryKey[0]
                  return typeof key === 'string' && key.startsWith('/ppmps')
                },
              })
              clear(null)
              setOpen(false)
            },
          },
        ),
        {
          loading: 'Updating PPMP... ',
          success: 'PPMP updated successfully!',
          error: (err) =>
            err instanceof Error ? err.message : 'Failed to update PPMP.',
        },
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    clear(null)
    setOpen(false)
  }

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={(v) => {
        if (!v) handleCancel()
      }}
      title={`Edit PPMP: ${ppmp.documentName}`}
      description={`Update basic metadata for ${ppmp.documentName}`}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <SubmitButton
            form="update-ppmp-form"
            loading={isSubmitting || isPending}
            disabled={isSubmitting || isPending}
          >
            {isSubmitting || isPending ? 'Saving...' : 'Save changes'}
          </SubmitButton>
        </div>
      }
    >
      <CreatePpmpMetadataForm
        formId="update-ppmp-form"
        onSubmit={handleSubmit}
        isLoading={isSubmitting || isPending}
        initialValues={initialValues}
      />
    </ResponsiveDialogDashtail>
  )
}
