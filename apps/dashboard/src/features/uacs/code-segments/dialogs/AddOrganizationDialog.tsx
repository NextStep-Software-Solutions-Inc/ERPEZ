import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { OrganizationForm, OrganizationFormValues } from '../forms/OrganizationForm'
import { toast } from 'sonner'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { createOrganizationCodeRequest } from '../handlers/createOrganizationCodeRequest'
import { getOrganizationCodesRequest } from '../handlers/getOrganizationCodesRequest'
import type { OrganizationCode } from '../types/organizationCodeTypes'

// Create mutation hook outside component to avoid recreation on each render
const useCreateOrganizationCode = createMutationHookFromTemplate(createOrganizationCodeRequest)

interface AddOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (data: OrganizationCode) => void
}

export function AddOrganizationDialog({ open, onOpenChange, onSuccess }: AddOrganizationDialogProps) {
  const [apiError, setApiError] = useState<string>('')
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useCreateOrganizationCode()

  const handleSubmit = async (data: OrganizationFormValues) => {
    setApiError('')
    try {
      const payload = {
        code: data.code,
        name: data.name,
        type: data.type,
        ...(data.parentId ? { parentId: data.parentId } : {}),
        isActive: data.isActive,
      }

      const response = await mutateAsync({
        pathParams: {},
        payload,
      })

      toast.success(`Organization Code "${data.name}" added successfully!`)
      
      // Invalidate the organization codes list query to trigger a refetch
      void queryClient.invalidateQueries({
        queryKey: [getOrganizationCodesRequest.endpoint]
      })
      
      onOpenChange(false)
      onSuccess?.(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add organization code'
      console.error('Create error:', err)
      setApiError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Organization Code"
      description="Enter the details for the new organization code."
      size="sm"
      showCloseButton
    >
      {apiError && (
        <Alert color="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      <OrganizationForm
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
