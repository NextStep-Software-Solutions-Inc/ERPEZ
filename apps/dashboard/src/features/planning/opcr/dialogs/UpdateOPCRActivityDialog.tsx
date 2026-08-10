import { useState } from 'react'
import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import UpdateOPCRActivityForm, {
  UpdateOPCRActivityFormValues,
  type OPCRActivityFormApi,
} from './UpdateOPCRActivityForm'
import SubmitButton from '@/components/SubmitButton'
import { OPCRActivity } from '@/features/planning/opcr/types'

interface UpdateOPCRActivityDialogProps {
  activity: OPCRActivity
  onActivityUpdated: (activity: UpdateOPCRActivityFormValues) => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  triggerClassName?: string
  triggerVariant?: 'outline' | 'ghost' | 'soft'
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon'
}

export function UpdateOPCRActivityDialog({
  activity,
  onActivityUpdated,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
  triggerClassName,
  triggerVariant = 'outline',
  triggerSize = 'default',
}: UpdateOPCRActivityDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsOpen = externalOnOpenChange || setInternalIsOpen
  const [form, setForm] = useState<OPCRActivityFormApi | null>(null)

  return (
    <ResponsiveDialogDashtail
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Edit Activity"
      description="Update activity information"
      size="lg"
      trigger={
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Activity
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
                  {isSubmitting ? 'Updating...' : 'Update Activity'}
                </SubmitButton>
              )}
            />
          )}
        </div>
      }
    >
      <div className="p-2">
        <UpdateOPCRActivityForm
          activity={activity}
          onActivityUpdated={onActivityUpdated}
          onClose={() => setIsOpen(false)}
          setForm={setForm}
        />
      </div>
    </ResponsiveDialogDashtail>
  )
}
