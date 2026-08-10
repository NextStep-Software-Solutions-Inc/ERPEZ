import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import AssignKpiToOfficeForm, {
  type AssignKpiFormApi,
} from '../form/AssignKpiToOfficeForm'
import SubmitButton from '@/components/SubmitButton'

interface AssignKpiToOfficeDialogProps {
  kpiId: string
  kpiName: string
  kpiCode: string
  officeId: string
  officeName?: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onAssigned?: () => void
  agencyTargetAnnual?: number
  agencyTargetQ1?: number
  agencyTargetQ2?: number
  agencyTargetQ3?: number
  agencyTargetQ4?: number
}

export default function AssignKpiToOfficeDialog({
  kpiId,
  kpiName,
  kpiCode,
  officeId,
  officeName,
  isOpen,
  onOpenChange,
  onAssigned,
  agencyTargetAnnual,
  agencyTargetQ1,
  agencyTargetQ2,
  agencyTargetQ3,
  agencyTargetQ4,
}: AssignKpiToOfficeDialogProps) {
  const [form, setForm] = useState<AssignKpiFormApi | null>(null)

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleAssigned = () => {
    handleClose()
    onAssigned?.()
  }

  return (
    <ResponsiveDialogDashtail
      open={isOpen}
      onOpenChange={onOpenChange}
      title="Assign KPI to Office"
      description={`Assign performance targets for: ${kpiCode}`}
      size="md"
      trigger={null}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {form && (
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <SubmitButton
                  onClick={() => form.handleSubmit()}
                  loading={isSubmitting}
                  disabled={!canSubmit}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {isSubmitting ? 'Assigning...' : 'Assign KPI'}
                </SubmitButton>
              )}
            />
          )}
        </div>
      }
    >
      <div className="p-2">
        <AssignKpiToOfficeForm
          kpiId={kpiId}
          kpiName={kpiName}
          kpiCode={kpiCode}
          officeId={officeId}
          officeName={officeName}
          onClose={handleClose}
          onAssigned={handleAssigned}
          setForm={setForm}
          agencyTargetAnnual={agencyTargetAnnual}
          agencyTargetQ1={agencyTargetQ1}
          agencyTargetQ2={agencyTargetQ2}
          agencyTargetQ3={agencyTargetQ3}
          agencyTargetQ4={agencyTargetQ4}
        />
      </div>
    </ResponsiveDialogDashtail>
  )
}
