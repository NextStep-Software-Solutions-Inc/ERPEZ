import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import CreateOPCRActivityForm, {
  CreateOPCRActivityFormValues,
  type OPCRActivityFormApi,
} from './CreateOPCRActivityForm'
import SubmitButton from '@/components/SubmitButton'

interface CreateOPCRActivityDialogProps {
  onActivityCreated: (activity: CreateOPCRActivityFormValues) => void
  officeId?: string
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  triggerClassName?: string
  triggerVariant?: 'outline' | 'ghost' | 'soft'
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon'
  defaultKpi?: string
  defaultDimension?: string
  defaultSubKpiId?: string
}

export function CreateOPCRActivityDialog({
  onActivityCreated,
  officeId,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
  triggerClassName,
  triggerVariant = 'outline',
  triggerSize = 'default',
  defaultKpi = '',
  defaultDimension = '',
  defaultSubKpiId = '',
}: CreateOPCRActivityDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsOpen = externalOnOpenChange || setInternalIsOpen
  const [form, setForm] = useState<OPCRActivityFormApi | null>(null)

  return (
    <ResponsiveDialogDashtail
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Create New Activity"
      description="Add a new activity for this KPI"
      size="lg"
      trigger={
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Activity
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
                  {isSubmitting ? 'Creating...' : 'Create Activity'}
                </SubmitButton>
              )}
            />
          )}
        </div>
      }
    >
      <div className="p-2">
        <CreateOPCRActivityForm
          onActivityCreated={onActivityCreated}
          officeId={officeId}
          defaultKpi={defaultKpi}
          defaultDimension={defaultDimension}
          defaultSubKpiId={defaultSubKpiId}
          onClose={() => setIsOpen(false)}
          setForm={setForm}
        />
      </div>
    </ResponsiveDialogDashtail>
  )
}
