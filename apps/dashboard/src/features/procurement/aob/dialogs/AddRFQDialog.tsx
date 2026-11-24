/**
 * Add RFQ to AOB Dialog
 * Wraps AddRFQForm in a ResponsiveDialog
 * Allows users to link a closed RFQ to an AOB
 */

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { AddRFQForm, type AddRFQFormValues } from '../forms/AddRFQForm'
import {
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { linkRFQRequest } from '../handlers/linkRFQRequest'
import { getAOBDetailRequest } from '../handlers/getAOBDetailRequest'
import type { AOB } from '../types/aobTypes'

const useLinkRFQ = createMutationHookFromTemplate(linkRFQRequest)

interface AddRFQDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  aobId?: string
  onSuccess?: (data: AOB) => void
}

export function AddRFQDialog({ open, onOpenChange, aobId, onSuccess }: AddRFQDialogProps) {
  const [apiError, setApiError] = useState<string>('')
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useLinkRFQ()

  const handleSubmit = async (data: AddRFQFormValues) => {
    setApiError('')

    if (!aobId) {
      setApiError('AOB ID is required')
      return
    }

    try {
      const response = await mutateAsync({
        pathParams: { id: aobId },
        queryParams: { id: aobId },
        payload: {
          rfqId: data.rfqId,
          selectedCategories: data.selectedCategories,
        },
      })

      toast.success('RFQ linked successfully!')

      // Invalidate AOB detail and matrix to trigger refetch
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.some(
            (k) => typeof k === 'string' && k.includes(aobId)
          ),
      })
      void queryClient.invalidateQueries({
        queryKey: [`/aobs/${aobId}`],
      })
      void queryClient.invalidateQueries({
        queryKey: [`/aobs/${aobId}/matrix`],
      })

      onOpenChange(false)
      onSuccess?.(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to link RFQ'
      setApiError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Link RFQ to AOB"
      description="Select a closed RFQ and the categories to include in this AOB."
      size="md"
      showCloseButton
    >
      <div className="space-y-4">
        {apiError && (
          <Alert variant="soft">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <AddRFQForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isPending}
        />
      </div>
    </ResponsiveDialog>
  )
}
