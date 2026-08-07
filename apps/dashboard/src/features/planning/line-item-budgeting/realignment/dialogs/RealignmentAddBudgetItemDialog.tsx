import { useState } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import api from '@/services/api'
import CreateWfpLineItemBudgetDetailsForm, { type LineItemWithId, type WfpFormController } from '../../line-item-budget-details/components/CreateWfpLineItemBudgetDetailsForm'
import CreateLineItemBudgetDetailsForm, { type LineItemBudgetDetailsFormApi, type CreateLineItemBudgetDetailsFormValues } from '../../line-item-budget-details/components/CreateLineItemBudgetDetailsForm'
import { type PeriodDetails } from '../../line-item-budget-details/utils/periodAllocationHelpers'
import { Loader2, Check } from 'lucide-react'

interface RealignmentAddBudgetItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeLibId: string
  activityId: string
  wfpObjectiveActivityId?: string
  sourceType: 'OPCR' | 'WFP'
  onSuccess: () => Promise<void>
}

export function RealignmentAddBudgetItemDialog({
  open,
  onOpenChange,
  activeLibId,
  activityId,
  wfpObjectiveActivityId,
  sourceType,
  onSuccess,
}: RealignmentAddBudgetItemDialogProps) {
  const { toast } = useToast()
  const [opcrForm, setOpcrForm] = useState<LineItemBudgetDetailsFormApi | null>(null)

  // Local state to sync with WFP form controller
  const [wfpController, setWfpController] = useState<WfpFormController | null>(null)

  const handleWfpSubmit = async (lineItems: LineItemWithId[]) => {
    try {
      const promises = lineItems.map((item) =>
        api.post(`/line-item-budget-details`, {
          lineItemBudgetId: activeLibId,
          lineItemBudgetActivityId: activityId,
          objectId: item.objectId,
          description: item.description,
          unitQuantity: item.unitQuantity,
          unitCost: item.unitCost,
          startDate: item.startDate ? new Date(item.startDate).toISOString() : undefined,
          endDate: item.endDate ? new Date(item.endDate).toISOString() : undefined,
          timelineType: item.timelineType,
          budget: item.budget,
        })
      )
      await Promise.all(promises)
      toast({
        title: 'Line Items Added',
        description: 'Line items successfully added.',
      })
      await onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: 'Failed to add line items to database.',
        variant: 'destructive',
      })
    }
  }

  const handleOpcrSubmit = async (value: CreateLineItemBudgetDetailsFormValues, periods: PeriodDetails[]) => {
    try {
      const promises = periods.map((period) =>
        api.post(`/line-item-budget-details`, {
          lineItemBudgetId: activeLibId,
          lineItemBudgetActivityId: activityId,
          objectId: value.itemOfExpenditureId || value.objectId,
          description: value.description,
          timelineType: value.timelineType,
          startDate: period.startDate,
          endDate: period.endDate,
          budget: period.budget,
        })
      )
      await Promise.all(promises)
      toast({
        title: 'Line Items Added',
        description: 'Line items successfully added.',
      })
      await onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: 'Failed to add line items to database.',
        variant: 'destructive',
      })
    }
  }

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Add Line Items"
      description="Detail the timeline and budget distribution for this operational activity item."
      size={sourceType === 'WFP' ? '3xl' : 'xl'}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs h-9"
          >
            Cancel
          </Button>
          {sourceType === 'WFP' ? (
            <>
              {wfpController && wfpController.pendingItems.length > 0 && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => wfpController.clearAll()}
                    disabled={wfpController.isSubmitting}
                    className="text-xs h-9 border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear All
                  </Button>
                  <Button
                    type="button"
                    onClick={() => wfpController.submitAll()}
                    disabled={wfpController.isSubmitting || wfpController.pendingItems.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs h-9 gap-1.5"
                  >
                    {wfpController.isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Submit All Items ({wfpController.pendingItems.length})
                      </>
                    )}
                  </Button>
                </>
              )}
            </>
          ) : (
            opcrForm && (
              <opcrForm.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting] as const}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    onClick={() => opcrForm.handleSubmit()}
                    disabled={!canSubmit || isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs h-9"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Line Item'}
                  </Button>
                )}
              />
            )
          )}
        </div>
      }
    >
      <div className="p-2">
        {sourceType === 'WFP' ? (
          <CreateWfpLineItemBudgetDetailsForm
            libId={activeLibId}
            wfpObjectiveActivityId={wfpObjectiveActivityId}
            scope="Activity"
            onClose={() => onOpenChange(false)}
            onSubmitOverride={handleWfpSubmit}
            hideFooterButtons={true}
            setFormController={setWfpController}
          />
        ) : (
          <CreateLineItemBudgetDetailsForm
            libId={activeLibId}
            libActivityId={activityId}
            onClose={() => onOpenChange(false)}
            onCreated={async () => {
              await onSuccess()
              onOpenChange(false)
            }}
            setForm={setOpcrForm}
            onSubmitOverride={handleOpcrSubmit}
          />
        )}
      </div>
    </ResponsiveDialogDashtail>
  )
}
