/**
 * Create AOB Dialog
 * Wraps CreateAOBForm in a ResponsiveDialog
 * Handles form submission and error handling
 */

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { CreateAOBForm, type CreateAOBFormValues } from '../forms/CreateAOBForm'
import {
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { createAOBRequest } from '../handlers/createAOBRequest'
import { getAOBListRequest } from '../handlers/getAOBListRequest'
import type { AOB, AwardCriterion } from '../types/aobTypes'

const useCreateAOB = createMutationHookFromTemplate(createAOBRequest)

interface CreateAOBDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (data: AOB) => void
}

export function CreateAOBDialog({ open, onOpenChange, onSuccess }: CreateAOBDialogProps) {
  const [apiError, setApiError] = useState<string>('')
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useCreateAOB()

  const handleSubmit = async (data: CreateAOBFormValues) => {
    setApiError('')

    try {
      const response = await mutateAsync({
        pathParams: {},
        payload: {
          aobNumber: data.aobNumber,
          description: data.description,
          date: data.date,
          openingDate: data.openingDate,
          awardCriterion: data.awardCriterion as AwardCriterion,
        },
      })

      toast.success(`AOB "${data.aobNumber}" created successfully!`)

      // Invalidate AOB list to trigger refetch
      void queryClient.invalidateQueries({
        queryKey: [getAOBListRequest.endpoint],
      })

      onOpenChange(false)
      onSuccess?.(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create AOB'
      setApiError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Abstract of Bids (AOB)"
      description="Create a new AOB to manage supplier bids and tabulation."
      size="xl"
      showCloseButton
    >
      <div className="space-y-4">
        {apiError && (
          <Alert variant="soft">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <CreateAOBForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isPending}
        />
      </div>
    </ResponsiveDialog>
  )
}
