import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { LocationForm, type LocationFormValues } from '../forms/LocationForm'
import { toast } from 'sonner'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { updateLocationCodeRequest } from '../handlers/updateLocationCodeRequest'
import { getLocationCodesRequest } from '../handlers/getLocationCodesRequest'
import type { LocationCode } from '../types/locationCodeTypes'

// Create mutation hook outside component to avoid recreation on each render
const useUpdateLocationCode = createMutationHookFromTemplate(updateLocationCodeRequest)

interface UpdateLocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locationCode?: LocationCode
  onSuccess?: (data: LocationCode) => void
}

export function UpdateLocationDialog({
  open,
  onOpenChange,
  locationCode,
  onSuccess,
}: UpdateLocationDialogProps) {
  const [apiError, setApiError] = useState<string>('')
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useUpdateLocationCode()

  const handleSubmit = async (data: LocationFormValues) => {
    if (!locationCode?.id) {
      toast.error('Location code ID not found')
      return
    }

    setApiError('')
    try {
      const payload = {
        code: data.code,
        name: data.name,
        region: data.type === 'Region' ? data.name : undefined,
        province: data.type === 'Province' ? data.name : undefined,
        municipality: data.type === 'Municipality' ? data.name : undefined,
        isActive: data.isActive,
      }

      const response = await mutateAsync({
        pathParams: { id: locationCode.id },
        payload,
      })

      toast.success(`Location Code "${data.name}" updated successfully!`)
      
      // Invalidate the location codes list query to trigger a refetch
      void queryClient.invalidateQueries({
        queryKey: [getLocationCodesRequest.endpoint]
      })
      
      onOpenChange(false)
      onSuccess?.(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update location code'
      console.error('Update error:', err)
      setApiError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Location Code"
      description="Update the details of the location code."
      size="sm"
      showCloseButton
    >
      {apiError && (
        <Alert color="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      <LocationForm
        onSubmit={handleSubmit}
        onCancel={() => {
          onOpenChange(false)
          setApiError('')
        }}
        isLoading={isPending}
        initialData={locationCode}
      />
    </ResponsiveDialog>
  )
}
