import { useMemo } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useBacResolutions } from '@/features/procurement/bac-resolution/handlers/hooks'
import { useSuppliers } from '@/components/features/planning/procurement-library'
import {
  useDirectContractingStore,
  type DirectContracting,
} from '../store/directContractingStore'
import {
  DirectContractingForm,
  type CreateDirectContractingFormValues,
} from './DirectContractingForm'

function genDCNumber(entries: DirectContracting[]): string {
  const year = new Date().getFullYear()
  let maxSeq = 0
  for (const ent of entries) {
    const dc = (ent?.dcNumber ?? '').toString()
    const m = dc.match(new RegExp(`^DC-${year}-(\\d+)$`))
    if (m) {
      const seq = parseInt(m[1], 10)
      if (!Number.isNaN(seq) && seq > maxSeq) maxSeq = seq
    }
  }
  return `DC-${year}-${String(maxSeq + 1).padStart(4, '0')}`
}

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
  const { entries } = useDirectContractingStore()

  const { data: bacResolutions } = useBacResolutions({
    pathParams: {},
    queryParams: { pageSize: 200 },
    enabled: open,
  })

  const { data: suppliers } = useSuppliers({
    pathParams: {},
    queryParams: {
      pageSize: 200,
      filters: 'Status==Approved,IsBlacklisted==false',
    },
    enabled: open,
  })

  const autoDCNumber = useMemo(() => genDCNumber(entries), [entries])

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
          autoDCNumber={autoDCNumber}
          resolutionOptions={bacResolutions?.data || []}
          suppliersList={suppliers?.data || []}
        />
      )}
    </ResponsiveDialogDashtail>
  )
}
