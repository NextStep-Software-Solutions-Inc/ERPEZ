import { useMemo } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { useBacResolutions } from '@/features/procurement/bac-resolution/handlers/hooks'
import {
  useDirectContractingStore,
  type DirectContracting,
} from '../store/directContractingStore'
import {
  DirectContractingForm,
  type CreateDirectContractingFormValues,
} from './DirectContractingForm'



export interface CreateDirectContractingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
}

export function CreateDirectContractingDialog({
  open,
  onOpenChange,
  trigger,
}: CreateDirectContractingDialogProps) {





  // Submission handler in the Dialog (anonymous placeholder function for now)
  const handleSubmit = async (values: CreateDirectContractingFormValues) => {
    // Placeholder function for future submission logic
    console.log('Direct Contracting submit placeholder:', values)
  }

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Create Direct Contracting Request"
      description="Select an approved BAC Resolution and assign the single exclusive supplier for this proprietary procurement."
      size="lg"
      className="w-full max-h-[85vh]"
      trigger={trigger}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-direct-contracting-form"
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Initialize Request
          </Button>
        </div>
      }
    >
      {/* Component lifecycle mounting resets form state upon dialog open/close with zero useEffect */}
      {open && (
        <DirectContractingForm
          formId="create-direct-contracting-form"
          onSubmit={handleSubmit}
          autoDCNumber={'3'}
          resolutionOptions={[]}
          suppliersList={[]}
        />
      )}
    </ResponsiveDialogDashtail>
  )
}
