import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import CreateOPCRForm, { type OPCRFormApi } from './CreateOPCRForm'
import SubmitButton from '@/components/SubmitButton'

interface CreateOPCRDialogProps {
  existingFiscalYears?: number[]
}

export default function CreateOPCRDialog({
  existingFiscalYears,
}: CreateOPCRDialogProps = {}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<OPCRFormApi | null>(null)

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={setOpen}
      title="Create New OPCR"
      description="Initialize a new Office Performance Commitment and Review record for a specific fiscal year."
      size="md"
      trigger={
        <Button className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all hover:scale-105 active:scale-95">
          <Plus className="w-4 h-4 mr-2" />
          Create OPCR
        </Button>
      }
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
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
                  {isSubmitting ? 'Creating...' : 'Create OPCR'}
                </SubmitButton>
              )}
            />
          )}
        </div>
      }
    >
      <div className="p-2">
        <CreateOPCRForm
          existingFiscalYears={existingFiscalYears}
          onClose={() => setOpen(false)}
          onCreated={() => setOpen(false)}
          setForm={setForm}
        />
      </div>
    </ResponsiveDialogDashtail>
  )
}
