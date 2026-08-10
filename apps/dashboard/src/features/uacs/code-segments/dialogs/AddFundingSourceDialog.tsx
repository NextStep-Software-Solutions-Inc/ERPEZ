import { Alert, AlertDescription } from '@/components/ui/alert'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { FundingSourceForm, FundingSourceFormValues } from '../forms/FundingSourceForm'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { createFundingSourceRequest } from '../handlers/createFundingSourceRequest'
import { getFundingSourcesRequest } from '../handlers/getFundingSourcesRequest'
import type { FundingSource } from '../types/fundingSourceTypes'
import { useState } from 'react'
import { formatFundSourceTypeForBackend } from '@/utils/formatters'

// Create mutation hook outside component to avoid recreation on each render
const useCreateFundingSource = createMutationHookFromTemplate(createFundingSourceRequest)

interface AddFundingSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (data: FundingSource) => void
}

export function AddFundingSourceDialog({ open, onOpenChange, onSuccess }: AddFundingSourceDialogProps) {
  const [apiError, setApiError] = useState<string>('')
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useCreateFundingSource()

  const handleSubmit = async (data: FundingSourceFormValues) => {
    setApiError('')
    try {
      console.log('Creating funding source with payload:', {
        pathParams: {},
        payload: {
          code: data.code,
          name: data.name,
          type: formatFundSourceTypeForBackend(data.type),
          ...(data.parentId ? { parentId: data.parentId } : {}),
          isActive: data.isActive,
        },
      })

      const response = await mutateAsync({
        pathParams: {},
        payload: {
          code: data.code,
          name: data.name,
          type: formatFundSourceTypeForBackend(data.type),
          ...(data.parentId ? { parentId: data.parentId } : {}),
          isActive: data.isActive,
        },
      })

      console.log('Create response:', response)

      toast.success(`Funding Source "${data.name}" added successfully!`)
      
      // Invalidate the funding sources list query to trigger a refetch
      void queryClient.invalidateQueries({
        queryKey: [getFundingSourcesRequest.endpoint]
      })
      
      onOpenChange(false)
      onSuccess?.(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add funding source'
      console.error('Create error:', err)
      setApiError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Funding Source"
      description="Enter the details for the new funding source."
      size="sm"
      showCloseButton
    >
      {apiError && (
        <Alert color="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      <FundingSourceForm
        onSubmit={handleSubmit}
        onCancel={() => {
          onOpenChange(false)
          setApiError('')
        }}
        isLoading={isPending}
      />
    </ResponsiveDialog>
  )
}
