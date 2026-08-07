import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type PurchaseOrderReturnFormProps = {
  reason: string
  onReasonChange: (reason: string) => void
}

export function PurchaseOrderReturnForm({
  reason,
  onReasonChange,
}: PurchaseOrderReturnFormProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="purchase-order-return-reason">Return remarks</Label>
      <Textarea
        id="purchase-order-return-reason"
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
        placeholder="Explain what needs to be corrected before approval"
        className="min-h-28"
      />
    </div>
  )
}
