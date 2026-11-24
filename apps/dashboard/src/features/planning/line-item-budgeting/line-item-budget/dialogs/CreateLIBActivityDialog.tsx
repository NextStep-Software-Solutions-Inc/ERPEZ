import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import CreateLIBActivityForm from './CreateLIBActivityForm'
import SubmitButton from '@/components/SubmitButton'
import { useForm } from '@tanstack/react-form'
import { LIBDetails } from '../types'
import { OPCRDetails } from '@/features/planning/opcr'
import { WFPDetails } from '@/components/features/planning/wfp'
import CreateWfpLineItemBudgetDetailsForm, {
  WfpLineItemBudgetDetailsFormApi,
} from '../../line-item-budget-details/components/CreateWfpLineItemBudgetDetailsForm'
import CreateLIBActivityWfpactForm from './CreateLIBActivityWFP-activityForm'

interface CreateLIBActivityDialogProps {
  libId: string
  libData?: LIBDetails
  onActivityAdded?: () => void
  type?: 'OPCR' | 'WFP'
  scope?: 'Activity' | 'Project' | 'ProjectLevel'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmitOverride?: (value: any) => void

  // 👇 replace opcr-only dependency
  opcrData?: OPCRDetails
  wfpData?: WFPDetails
  isOPCRLoading?: boolean
  isWFPLoading?: boolean
  existingOPCRActivityIds?: string[]
}

export default function CreateLIBActivityDialog({
  libId,
  onActivityAdded,
  type,
  scope,
  opcrData,
  wfpData,
  isOPCRLoading,
  isWFPLoading,
  existingOPCRActivityIds = [],
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSubmitOverride,
}: CreateLIBActivityDialogProps & { type?: string }) {
  const [localOpen, setLocalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : localOpen
  const setOpen =
    controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen

  const [form, setForm] = useState<ReturnType<typeof useForm> | null>(null)
  const [wfpForm, setWfpForm] =
    useState<WfpLineItemBudgetDetailsFormApi | null>(null)

  // Determine which form to use based on type and scope
  const isProjectScopeWFP = type === 'WFP' && scope === 'Project'
  const isActivityScopeWFP = type === 'WFP' && scope === 'Activity'

  // Determine current active form
  const currentForm = isProjectScopeWFP ? wfpForm : form

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={setOpen}
      title={
        isProjectScopeWFP
          ? 'Add Line Items'
          : type === 'OPCR'
            ? 'Add LIB Activity'
            : 'Add WFP Activity'
      }
      description={
        isProjectScopeWFP
          ? 'Add multiple expenditure line items to this Line Item Budget.'
          : 'Link an activity to this Line Item Budget for tracking and budgeting.'
      }
      size={isProjectScopeWFP ? '3xl' : 'md'}
      trigger={
        <Button className="bg-linear-to-r shadow-md transition-all hover:scale-105 active:scale-95">
          <Plus className="w-4 h-4 mr-2" />
          {isProjectScopeWFP
            ? 'Add Line Items'
            : type === 'OPCR'
              ? 'Add OPCR Activity'
              : 'Add WFP Activity'}
        </Button>
      }
      footer={
        isProjectScopeWFP ? null : (
          <div className="flex justify-end gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            {currentForm &&
              (() => {
                const FormSubscribe = currentForm.Subscribe
                return (
                  <FormSubscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                      <SubmitButton
                        onClick={() => currentForm.handleSubmit()}
                        loading={isSubmitting}
                        disabled={!canSubmit}
                        className="bg-primary-600 hover:bg-primary-700 text-white"
                      >
                        {isSubmitting ? 'Creating...' : 'Create Activity'}
                      </SubmitButton>
                    )}
                  />
                )
              })()}
          </div>
        )
      }
    >
      <div className="p-2">
        {type === 'OPCR' ? (
          <CreateLIBActivityForm
            libId={libId}
            isOPCRLoading={isOPCRLoading}
            opcrData={opcrData}
            existingOPCRActivityIds={existingOPCRActivityIds}
            onClose={() => setOpen(false)}
            onCreated={() => {
              setOpen(false)
              onActivityAdded?.()
            }}
            setForm={setForm}
            type={type}
            onSubmitOverride={onSubmitOverride}
          />
        ) : isProjectScopeWFP ? (
          <CreateWfpLineItemBudgetDetailsForm
            libId={libId}
            scope={scope}
            wfpData={wfpData}
            onClose={() => setOpen(false)}
            onCreated={() => {
              setOpen(false)
              onActivityAdded?.()
            }}
            setForm={setWfpForm}
            onSubmitOverride={onSubmitOverride}
          />
        ) : isActivityScopeWFP ? (
          <CreateLIBActivityWfpactForm
            libId={libId}
            isWFPLoading={isWFPLoading}
            wfpData={wfpData}
            onClose={() => setOpen(false)}
            onCreated={() => {
              setOpen(false)
              onActivityAdded?.()
            }}
            setForm={setForm}
            type={type}
            onSubmitOverride={onSubmitOverride}
          />
        ) : null}
      </div>
    </ResponsiveDialogDashtail>
  )
}
