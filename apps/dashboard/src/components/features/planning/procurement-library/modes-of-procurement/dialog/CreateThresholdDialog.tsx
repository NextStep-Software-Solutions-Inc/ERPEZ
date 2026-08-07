import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import PermissionCheck from '@/components/PermissionCheck'
import { useToast } from '@/components/ui/use-toast'
import { useQueryClient } from 'erpez-shared-lib'
import { useUpdateProcurementMode } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementModes'
import type {
  ProcurementThresholdFormData,
  ModeOfProcurement,
} from '../../types'
import type { MetaActions } from '@/types/global'

interface CreateThresholdDialogProps {
  mode: ModeOfProcurement
  actions: MetaActions
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCreateSuccess?: (data: ProcurementThresholdFormData) => void
}

export function CreateThresholdDialog({
  mode,
  actions,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onCreateSuccess,
}: CreateThresholdDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [internalOpen, setInternalOpen] = useState(false)

  // Use external open state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen
  const [isLoading, setIsLoading] = useState(false)
  const { mutateAsync: updateProcurementMode } = useUpdateProcurementMode()

  const [minThreshold, setMinThreshold] = useState('')
  const [maxThreshold, setMaxThreshold] = useState('')

  const resetForm = () => {
    setMinThreshold('')
    setMaxThreshold('')
  }

  useEffect(() => {
    if (!open) {
      setMinThreshold('')
      setMaxThreshold('')
    }
  }, [open])

  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      const formData: ProcurementThresholdFormData = {
        minAmount: parseFloat(minThreshold) || 0,
        maxAmount: maxThreshold.trim() ? parseFloat(maxThreshold) : 0,
      }

      await updateProcurementMode(
        {
          pathParams: { id: mode.id },
          payload: {
            minThreshold: formData.minAmount,
            maxThreshold: maxThreshold.trim() ? parseFloat(maxThreshold) : null,
          },
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              predicate: (query) =>
                query.queryKey.some(
                  (key) =>
                    typeof key === 'string' &&
                    key.includes('/procurement-modes'),
                ),
            })
          },
        },
      )

      onCreateSuccess?.(formData)
      setOpen(false)

      // Reset form
      resetForm()

      toast({
        title: 'Success',
        description: `Threshold for "${mode.modeName}" has been saved successfully.`,
        color: 'success',
      })
    } catch (error) {
      console.error('Error creating threshold:', error)
      toast({
        title: 'Error',
        description: 'Error saving threshold. Please try again.',
        color: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    // Reset form
    resetForm()
  }

  const isFormValid = minThreshold.trim() !== '' || maxThreshold.trim() !== ''

  return (
    <PermissionCheck action="write" actions={actions}>
      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title={`Create Threshold for ${mode.modeName}`}
        description="Set minimum and maximum threshold values"
        trigger={
          externalOpen === undefined ? (
            <Button
              size="sm"
              variant="ghost"
              className="gap-2 w-full justify-start"
            >
              <Plus className="w-4 h-4" />
              Create Threshold
            </Button>
          ) : undefined
        }
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !isFormValid}>
              {isLoading ? 'Creating...' : 'Create Threshold'}
            </Button>
          </div>
        }
        showCloseButton
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="minThreshold" className="text-sm font-medium">
              Minimum Threshold
            </Label>
            <Input
              id="minThreshold"
              type="number"
              min="0"
              step="0.01"
              value={minThreshold}
              onChange={(e) => setMinThreshold(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxThreshold" className="text-sm font-medium">
              Maximum Threshold
            </Label>
            <Input
              id="maxThreshold"
              type="number"
              min="0"
              step="0.01"
              value={maxThreshold}
              onChange={(e) => setMaxThreshold(e.target.value)}
              placeholder="Unlimited"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank if no upper threshold should be set.
            </p>
          </div>
        </div>
      </ResponsiveDialog>
    </PermissionCheck>
  )
}
