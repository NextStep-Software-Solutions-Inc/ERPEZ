import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'

import SubmitButton from '@/components/SubmitButton'
import ConsolidateOPCRForm, {
  ConsolidateOPCRFormApi,
} from './ConsolidateOPCRForm'
import type { OPCR } from '../types'

interface ConsolidateOPCRDialogProps {
  selectedOpcrs: OPCR[]
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onConsolidationComplete?: () => void
}

export function ConsolidateOPCRDialog({
  selectedOpcrs,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
  onConsolidationComplete,
}: ConsolidateOPCRDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsOpen = externalOnOpenChange || setInternalIsOpen
  const [form, setForm] = useState<ConsolidateOPCRFormApi | null>(null)

  const handleConsolidationComplete = () => {
    setIsOpen(false)
    onConsolidationComplete?.()
  }

  return (
    <ResponsiveDialogDashtail
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Master KPI Consolidation"
      description="Review and approve the consolidated KPI data from selected OPCRs"
      size="5xl"
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
        <ConsolidateOPCRForm
          selectedOpcrs={selectedOpcrs}
          onConsolidationComplete={handleConsolidationComplete}
          setForm={setForm}
        />
      </div>
    </ResponsiveDialogDashtail>
  )
}
