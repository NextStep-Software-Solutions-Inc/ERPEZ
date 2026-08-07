import { useState } from 'react'
import { Edit } from 'lucide-react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import UpdateLIBActivityForm, {
  UpdateLIBActivityFormValues,
  type UpdateLIBActivityFormApi,
} from './UpdateLIBActivityForm'
import SubmitButton from '@/components/SubmitButton'
import type { LIBActivity } from '@/features/planning/line-item-budgeting/line-item-budget/types'
import { Button } from '@/components/ui/button'

interface UpdateLIBActivityDialogProps {
  activity: LIBActivity
  onActivityUpdated: (activity: UpdateLIBActivityFormValues) => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  triggerClassName?: string
  triggerVariant?: 'outline' | 'ghost' | 'soft'
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon'
}

export function UpdateLIBActivityDialog({
  activity,
  onActivityUpdated,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
  triggerClassName,
  triggerVariant = 'outline',
  triggerSize = 'default',
}: UpdateLIBActivityDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsOpen = externalOnOpenChange || setInternalIsOpen
  const [form, setForm] = useState<UpdateLIBActivityFormApi | null>(null)

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
                <>
                  <SubmitButton
                    onClick={() => form.handleSubmit()}
                    loading={isSubmitting}
                    disabled={!canSubmit}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Activity'}
                  </SubmitButton>
                </>
              )}
            />
          )}
        </div>
      }
    >
      <div className="p-2">
        <UpdateLIBActivityForm
          activity={activity}
          onActivityUpdated={onActivityUpdated}
          onClose={() => setIsOpen(false)}
          setForm={setForm}
        />
      </div>
    </ResponsiveDialogDashtail>
  )
}
