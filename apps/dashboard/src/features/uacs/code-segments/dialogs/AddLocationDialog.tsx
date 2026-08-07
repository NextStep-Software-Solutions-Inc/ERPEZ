import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { LocationForm, LocationFormValues } from '../forms/LocationForm'
import { toast } from 'sonner'
import { createMutationHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { createLocationCodeRequest } from '../handlers/createLocationCodeRequest'
import { getLocationCodesRequest } from '../handlers/getLocationCodesRequest'
import type { LocationCode } from '../types/locationCodeTypes'

// Create mutation hook outside component to avoid recreation on each render
const useCreateLocationCode = createMutationHookFromTemplate(createLocationCodeRequest)

interface AddLocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (data: LocationCode) => void
}

export function AddLocationDialog({ open, onOpenChange, onSuccess }: AddLocationDialogProps) {
  const [apiError, setApiError] = useState<string>('')
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useCreateLocationCode()

  const handleSubmit = async (data: LocationFormValues) => {
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
        pathParams: {},
        payload,
      })

      toast.success(`Location Code "${data.name}" added successfully!`)
      
      // Invalidate the location codes list query to trigger a refetch
      void queryClient.invalidateQueries({
        queryKey: [getLocationCodesRequest.endpoint]
      })
      
      onOpenChange(false)
      onSuccess?.(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add location code'
      console.error('Create error:', err)
      setApiError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Location Code"
      description="Enter the details for the new location code."
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
      />
    </ResponsiveDialog>
  )
}
