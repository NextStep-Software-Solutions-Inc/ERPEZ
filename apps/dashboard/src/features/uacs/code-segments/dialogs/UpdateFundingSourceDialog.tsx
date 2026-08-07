import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { UpdateFundingSourceForm, type UpdateFundingSourceFormValues } from '../forms/UpdateFundingSourceForm'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { updateFundingSourceRequest } from '../handlers/updateFundingSourceRequest'
import { getFundingSourcesRequest } from '../handlers/getFundingSourcesRequest'
import type { FundingSource } from '../types/fundingSourceTypes'
import { formatFundSourceTypeForBackend } from '@/utils/formatters'

// Create mutation hook outside component to avoid recreation on each render
const useUpdateFundingSource = createMutationHookFromTemplate(updateFundingSourceRequest)

interface UpdateFundingSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fundingSource?: FundingSource
  onSuccess?: (data: FundingSource) => void
}

export function UpdateFundingSourceDialog({
  open,
  onOpenChange,
  fundingSource,
  onSuccess,
}: UpdateFundingSourceDialogProps) {
  const [apiError, setApiError] = useState<string>('')
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useUpdateFundingSource()

  const handleSubmit = async (data: UpdateFundingSourceFormValues) => {
    if (!fundingSource?.id) {
      toast.error('Funding source ID not found')
      return
    }

    setApiError('')
    try {
      console.log('Updating funding source with payload:', {
        pathParams: { id: fundingSource.id },
        payload: {
          code: data.code,
          name: data.name,
          type: formatFundSourceTypeForBackend(data.type),
          ...(data.parentId ? { parentId: data.parentId } : {}),
          isActive: data.isActive,
        },
      })

      const response = await mutateAsync({
        pathParams: { id: fundingSource.id },
        payload: {
          code: data.code,
          name: data.name,
          type: formatFundSourceTypeForBackend(data.type),
          ...(data.parentId ? { parentId: data.parentId } : {}),
          isActive: data.isActive,
        },
      })

      console.log('Update response:', response)

      toast.success(`Funding Source "${data.name}" updated successfully!`)
      
      // Invalidate the funding sources list query to trigger a refetch
      void queryClient.invalidateQueries({
        queryKey: [getFundingSourcesRequest.endpoint]
      })
      
      onOpenChange(false)
      onSuccess?.(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update funding source'
      console.error('Update error:', err)
      setApiError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Funding Source"
      description="Update the details of the funding source."
      size="sm"
      showCloseButton
    >
      {apiError && (
        <Alert color="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      <UpdateFundingSourceForm
        onSubmit={handleSubmit}
        onCancel={() => {
          onOpenChange(false)
          setApiError('')
        }}
        isLoading={isPending}
        initialData={fundingSource}
      />
    </ResponsiveDialog>
  )
}
