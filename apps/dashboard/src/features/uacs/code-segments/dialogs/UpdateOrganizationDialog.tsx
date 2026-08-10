import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { UpdateOrganizationForm, type UpdateOrganizationFormValues } from '../forms/UpdateOrganizationForm'
import { toast } from 'sonner'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { updateOrganizationCodeRequest } from '../handlers/updateOrganizationCodeRequest'
import { getOrganizationCodesRequest } from '../handlers/getOrganizationCodesRequest'
import type { OrganizationCode } from '../types/organizationCodeTypes'

// Create mutation hook outside component to avoid recreation on each render
const useUpdateOrganizationCode = createMutationHookFromTemplate(updateOrganizationCodeRequest)

interface UpdateOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationCode?: OrganizationCode
  onSuccess?: (data: OrganizationCode) => void
}

export function UpdateOrganizationDialog({
  open,
  onOpenChange,
  organizationCode,
  onSuccess,
}: UpdateOrganizationDialogProps) {
  const [apiError, setApiError] = useState<string>('')
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useUpdateOrganizationCode()

  const handleSubmit = async (data: UpdateOrganizationFormValues) => {
    if (!organizationCode?.id) {
      toast.error('Organization code ID not found')
      return
    }

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
        pathParams: { id: organizationCode.id },
        payload,
      })

      toast.success(`Organization Code "${data.name}" updated successfully!`)
      
      // Invalidate the organization codes list query to trigger a refetch
      void queryClient.invalidateQueries({
        queryKey: [getOrganizationCodesRequest.endpoint]
      })
      
      onOpenChange(false)
      onSuccess?.(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update organization code'
      console.error('Update error:', err)
      setApiError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Organization Code"
      description="Update the details of the organization code."
      size="sm"
      showCloseButton
    >
      {apiError && (
        <Alert color="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      <UpdateOrganizationForm
        onSubmit={handleSubmit}
        onCancel={() => {
          onOpenChange(false)
          setApiError('')
        }}
        isLoading={isPending}
        initialData={organizationCode}
      />
    </ResponsiveDialog>
  )
}
