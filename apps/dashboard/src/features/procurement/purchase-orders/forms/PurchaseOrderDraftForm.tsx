import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export type PurchaseOrderDraftValues = {
  poNumber: string
  description: string
  date: string
  placeOfDelivery: string
  dateOfDelivery: string
  deliveryTerm: string
  deliveryTermCustom?: string
  paymentTerm: string
  paymentTermCustom?: string
  bidSupportingDocument: File | null
}

type PurchaseOrderDraftFormProps = {
  value: PurchaseOrderDraftValues
  onChange: (value: PurchaseOrderDraftValues) => void
  sourceSummary?: string
}

const DELIVERY_TERMS = [
  'FOB Destination',
  'FOB Shipping Point',
  'Pick-up by Agency',
  'Staggered Delivery',
  'Within 15 Calendar Days',
  'Within 30 Calendar Days',
  'Others',
]

const PAYMENT_TERMS = [
  'LDDAP-ADA',
  'Check Payment',
  '30 Calendar Days upon Full Delivery',
  'Progress Billing',
  'One-Time Payment',
  'Others',
]

export function PurchaseOrderDraftForm({
  value,
  onChange,
  sourceSummary,
}: PurchaseOrderDraftFormProps) {
  const handleChange = <K extends keyof PurchaseOrderDraftValues>(
    field: K,
    fieldValue: PurchaseOrderDraftValues[K],
  ) => {
    onChange({
      ...value,
      [field]: fieldValue,
    })
  }

  const hasCustomDeliveryTerm = value.deliveryTerm === 'Others'
  const hasCustomPaymentTerm = value.paymentTerm === 'Others'

  return (
    <div className="space-y-4">
      {sourceSummary ? (
        <div className="rounded-xl border border-dashed border-default-200 bg-default-50 p-4 text-sm text-default-600">
          {sourceSummary}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-default-700">Date</label>
          <Input
            type="date"
            value={value.date}
            onChange={(event) => handleChange('date', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-default-700">
            PO Number
          </label>
          <Input
            value={value.poNumber}
            onChange={(event) => handleChange('poNumber', event.target.value)}
            placeholder="PO-2026-001"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-default-700">
          Description
        </label>
        <Textarea
          value={value.description}
          onChange={(event) => handleChange('description', event.target.value)}
          placeholder="Short description of the purchase order"
          className="min-h-24"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-default-700">
          Place of Delivery
        </label>
        <Textarea
          value={value.placeOfDelivery}
          onChange={(event) =>
            handleChange('placeOfDelivery', event.target.value)
          }
          placeholder="Office, floor, or delivery location"
          className="min-h-20"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-default-700">
            Date of Delivery
          </label>
          <Input
            type="date"
            value={value.dateOfDelivery}
            onChange={(event) =>
              handleChange('dateOfDelivery', event.target.value)
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-default-700">
            Delivery Term
          </label>
          <select
            value={value.deliveryTerm}
            onChange={(event) =>
              handleChange('deliveryTerm', event.target.value)
            }
            className="h-10 w-full rounded-md border border-default-300 bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="">Select delivery term</option>
            {DELIVERY_TERMS.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasCustomDeliveryTerm ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-default-700">
            Custom Delivery Term
          </label>
          <Input
            value={value.deliveryTermCustom ?? ''}
            onChange={(event) =>
              handleChange('deliveryTermCustom', event.target.value)
            }
            placeholder="Within 45 calendar days"
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium text-default-700">
          Payment Term
        </label>
        <select
          value={value.paymentTerm}
          onChange={(event) => handleChange('paymentTerm', event.target.value)}
          className="h-10 w-full rounded-md border border-default-300 bg-background px-3 text-sm outline-none focus:border-primary"
        >
          <option value="">Select payment term</option>
          {PAYMENT_TERMS.map((term) => (
            <option key={term} value={term}>
              {term}
            </option>
          ))}
        </select>
      </div>

      {hasCustomPaymentTerm ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-default-700">
            Custom Payment Term
          </label>
          <Input
            value={value.paymentTermCustom ?? ''}
            onChange={(event) =>
              handleChange('paymentTermCustom', event.target.value)
            }
            placeholder="Net 45 upon acceptance"
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium text-default-700">
          BID Supporting Document
        </label>
        <Input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(event) =>
            handleChange(
              'bidSupportingDocument',
              event.target.files?.[0] ?? null,
            )
          }
        />
        <p className="text-xs text-default-500">
          {value.bidSupportingDocument
            ? `Selected file: ${value.bidSupportingDocument.name}`
            : 'Optional. Upload the BID PDF if it is available for this purchase order.'}
        </p>
      </div>
    </div>
  )
}
