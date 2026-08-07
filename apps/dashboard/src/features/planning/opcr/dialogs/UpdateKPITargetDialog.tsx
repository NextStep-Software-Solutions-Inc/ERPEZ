import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import UpdateKPITargetForm, {
  UpdateKPITargetFormValues,
  type KPITargetFormApi,
} from './UpdateKPITargetForm'
import SubmitButton from '@/components/SubmitButton'
import { OPCRItem } from '../types'

interface UpdateKPITargetDialogProps {
  opcrItem: OPCRItem
  onTargetsUpdated: (targets: UpdateKPITargetFormValues) => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  triggerClassName?: string
  triggerVariant?: 'outline' | 'ghost' | 'soft'
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon'
}

export function UpdateKPITargetDialog({
  opcrItem,
  onTargetsUpdated,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
  triggerClassName,
  triggerVariant = 'outline',
  triggerSize = 'default',
}: UpdateKPITargetDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsOpen = externalOnOpenChange || setInternalIsOpen
  const [form, setForm] = useState<KPITargetFormApi | null>(null)

  return (
    <ResponsiveDialogDashtail
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Edit KPI Target"
      description="Update quarterly and annual targets for this KPI"
      size="lg"
      trigger={
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Edit Target
        </Button>
      }
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
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
                  {isSubmitting ? 'Updating...' : 'Update Targets'}
                </SubmitButton>
              )}
            />
          )}
        </div>
      }
    >
      <div className="p-2">
        <UpdateKPITargetForm
          opcrItem={opcrItem}
          onTargetsUpdated={onTargetsUpdated}
          setForm={setForm}
        />
      </div>
    </ResponsiveDialogDashtail>
  )
}
