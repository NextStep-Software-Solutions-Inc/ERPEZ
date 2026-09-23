import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import CreateLineItemBudgetDetailsForm, {
  type LineItemBudgetDetailsFormApi,
} from './CreateLineItemBudgetDetailsForm'
import CreateWfpLineItemBudgetDetailsForm, {
  type WfpLineItemBudgetDetailsFormApi,
} from './CreateWfpLineItemBudgetDetailsForm'
import SubmitButton from '@/components/SubmitButton'

interface CreateLineItemBudgetDetailsDialogProps {
  libId: string
  libActivityId: string
  onCreated?: () => void
  sourceType?: 'OPCR' | 'WFP'
  scope?: 'Activity' | 'Project'
}

export default function CreateLineItemBudgetDetailsDialog({
  libId,
  libActivityId,
  onCreated,
  sourceType,
  scope,
}: CreateLineItemBudgetDetailsDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<LineItemBudgetDetailsFormApi | null>(null)
  const [, setWfpForm] = useState<WfpLineItemBudgetDetailsFormApi | null>(null)
  const [splitInfo, setSplitInfo] = useState<{
    isSplitMode: boolean
    count: number
  }>({
    isSplitMode: false,
    count: 0,
  })

  const isWFP = sourceType === 'WFP'

  // Handle closing with unsaved items
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSplitInfo({ isSplitMode: false, count: 0 })
    }
    setOpen(newOpen)
  }

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={handleOpenChange}
      title={isWFP ? 'Add Line Items' : 'Add Line Item'}
      description={
        isWFP
          ? 'Add multiple expenditure line items to this activity. Fill the form and click "Add to List", then click "Submit All Items" when done.'
          : 'Add a new expenditure line item to this activity.'
      }
      size="3xl"
      trigger={
        <Button className="bg-linear-to-r shadow-md transition-all hover:scale-105 active:scale-95">
          <Plus className="w-4 h-4 mr-2" />
          {isWFP ? 'Add Line Items' : 'Add Line Item'}
        </Button>
      }
      footer={
        isWFP ? null : (
          <div className="flex justify-end gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            {!isWFP && form ? (
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <SubmitButton
                    onClick={() => {
                      form.handleSubmit()
                    }}
                    loading={isSubmitting}
                    disabled={!canSubmit}
                    className={
                      splitInfo.isSplitMode
                        ? 'bg-amber-600 hover:bg-amber-700 text-white min-w-[140px]'
                        : 'bg-primary-600 hover:bg-primary-700 text-white min-w-[120px]'
                    }
                  >
                    {isSubmitting
                      ? splitInfo.isSplitMode
                        ? 'Splitting Line Item...'
                        : 'Adding...'
                      : splitInfo.isSplitMode
                        ? `Split into ${splitInfo.count} Quarters & Add`
                        : 'Add Line Item'}
                  </SubmitButton>
                )}
              />
            ) : null}
          </div>
        )
      }
    >
      <div className="p-2">
        {isWFP ? (
          scope === 'Project' ? (
            <></>
          ) : (
            <>
              <CreateWfpLineItemBudgetDetailsForm
                libId={libId}
                libActivityId={libActivityId}
                scope={scope}
                onClose={() => setOpen(false)}
                onCreated={() => {
                  onCreated?.()
                  setOpen(false)
                }}
                setForm={setWfpForm}
              />
            </>
          )
        ) : sourceType === 'OPCR' ? (
          <CreateLineItemBudgetDetailsForm
            libId={libId}
            libActivityId={libActivityId}
            onClose={() => setOpen(false)}
            onCreated={() => {
              onCreated?.()
              setOpen(false)
            }}
            setForm={setForm}
            onSplitInfoChange={setSplitInfo}
          />
        ) : null}
      </div>
    </ResponsiveDialogDashtail>
  )
}
