import { useToast } from '@/components/ui/use-toast'
import api from '@/services/api'
import CreateLIBActivityDialog from '../../line-item-budget/dialogs/CreateLIBActivityDialog'
import { OPCRDetails } from '@/features/planning/opcr'
import { WFPDetails } from '@/components/features/planning/wfp'

interface RealignmentAddActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeLibId: string
  sourceType: 'OPCR' | 'WFP'
  activeOpcrData?: OPCRDetails
  activeWfpData?: WFPDetails
  onSuccess: () => Promise<void>
}

export function RealignmentAddActivityDialog({
  open,
  onOpenChange,
  activeLibId,
  sourceType,
  activeOpcrData,
  activeWfpData,
  onSuccess,
}: RealignmentAddActivityDialogProps) {
  const { toast } = useToast()

  const handleSubmit = async (value: { opcrActivityId?: string; wfpObjectiveActivityId?: string; name: string }) => {
    try {
      const payload = sourceType === 'OPCR'
        ? {
          lineItemBudgetId: activeLibId,
          opcrActivityId: value.opcrActivityId,
          name: value.name,
        }
        : {
          lineItemBudgetId: activeLibId,
          wfpObjectiveActivityId: value.wfpObjectiveActivityId,
          name: value.name,
        }
      await api.post(`/lib-activities`, payload)
      toast({
        title: 'Activity Added',
        description: 'Activity successfully added to budget realignment.',
      })
      await onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to add activity:', err)
      toast({
        title: 'Error',
        description: 'Failed to add activity to database.',
        variant: 'destructive',
      })
    }
  }

  return (
    <CreateLIBActivityDialog
      libId={activeLibId}
      type={sourceType}
      scope="Activity"
      open={open}
      onOpenChange={onOpenChange}
      onSubmitOverride={handleSubmit}
      opcrData={activeOpcrData}
      wfpData={activeWfpData}
    />
  )
}
